import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";

const openai = new OpenAI({
  baseURL: "https://api.scaleway.ai/2d6e7638-f7f5-41f4-b61c-79209c1785be/v1",
  apiKey: process.env.SCW_SECRET_KEY,
});

// Helper function to wait for file to be ready and stable
const waitForFile = (filePath: string, maxRetries = 20): Promise<void> => {
  return new Promise((resolve, reject) => {
    let retries = 0;
    let lastSize = 0;
    let stableCount = 0;

    const checkFile = () => {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        // Check if file has size
        if (stats.size > 0) {
          // Check if file size is stable (not changing)
          if (stats.size === lastSize) {
            stableCount++;
            // File size hasn't changed for 3 checks = file is stable
            if (stableCount >= 3) {
              console.log(
                `File ready and stable: ${filePath} (${stats.size} bytes)`
              );
              resolve();
              return;
            }
          } else {
            stableCount = 0;
            lastSize = stats.size;
          }
        }
      }

      retries++;
      if (retries >= maxRetries) {
        reject(
          new Error(`File not ready after ${maxRetries} attempts: ${filePath}`)
        );
        return;
      }

      // Wait 100ms and try again
      setTimeout(checkFile, 100);
    };

    checkFile();
  });
};

// Helper function to validate webm file
const validateWebmFile = (filePath: string): Promise<boolean> => {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        console.error(`File validation failed for ${filePath}:`, err.message);
        resolve(false);
      } else {
        // Check if file has audio streams
        const hasAudio = metadata.streams?.some(
          (stream) => stream.codec_type === "audio"
        );
        const duration = metadata.format?.duration || 0;
        console.log(
          `File validation: ${filePath} - Valid: ${hasAudio}, Duration: ${duration}s`
        );
        resolve(hasAudio || false);
      }
    });
  });
};

// Helper function to convert webm to wav using ffmpeg
const convertToWav = (inputPath: string, outputPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat("wav")
      .audioCodec("pcm_s16le")
      .audioChannels(1)
      .audioFrequency(16000)
      .on("end", () => {
        console.log(`Converted ${inputPath} to ${outputPath}`);
        resolve();
      })
      .on("error", (err) => {
        console.error("FFmpeg conversion error:", err);
        reject(err);
      })
      .save(outputPath);
  });
};

export async function POST(request: NextRequest) {
  try {
    const { filename } = await request.json();

    if (!filename) {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 }
      );
    }

    // Construct the file path
    const audioDirectory = path.join(process.cwd(), "audio-to-transcript");
    const filePath = path.join(audioDirectory, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `File not found: ${filename}` },
        { status: 404 }
      );
    }

    // Check if the file is a .webm or .mp3 file
    if (!filename.endsWith(".webm") && !filename.endsWith(".mp3")) {
      return NextResponse.json(
        { error: "Only .webm and .mp3 files are supported" },
        { status: 400 }
      );
    }

    // Wait for file to be fully written
    console.log(`Waiting for file to be ready: ${filename}`);
    await waitForFile(filePath);

    let fileToTranscribe = filePath;
    let wavFilePath: string | null = null;

    // Convert webm to wav if needed
    if (filename.endsWith(".webm")) {
      // Validate the webm file before attempting conversion
      console.log(`Validating ${filename}...`);
      const isValid = await validateWebmFile(filePath);

      if (!isValid) {
        console.error(`Invalid or corrupted webm file: ${filename}`);
        // Delete the invalid file
        try {
          fs.unlinkSync(filePath);
          console.log(`Deleted invalid webm file: ${filename}`);
        } catch (deleteError) {
          console.error(
            `Error deleting invalid file ${filename}:`,
            deleteError
          );
        }
        return NextResponse.json(
          {
            success: false,
            error: "Invalid or corrupted audio file",
            details: "The audio file could not be processed",
          },
          { status: 400 }
        );
      }

      const wavFilename = filename.replace(".webm", ".wav");
      wavFilePath = path.join(audioDirectory, wavFilename);

      console.log(`Converting ${filename} to WAV format...`);
      await convertToWav(filePath, wavFilePath);
      fileToTranscribe = wavFilePath;

      // Delete the webm file immediately after conversion
      try {
        fs.unlinkSync(filePath);
        console.log(`Successfully deleted webm file: ${filename}`);
      } catch (deleteError) {
        console.error(`Error deleting webm file ${filename}:`, deleteError);
      }
    }

    // Read the audio file (wav or mp3)
    const audioFile = fs.createReadStream(fileToTranscribe);

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-large-v3",
      language: "pl",
    });

    console.log("Whisper transcription response:", transcription);

    // Delete the audio file after successful transcription
    try {
      // Only delete if it's not a webm file (already deleted after conversion)
      if (!filename.endsWith(".webm") && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Successfully deleted file: ${filename}`);
      }
    } catch (deleteError) {
      console.error(`Error deleting file ${filename}:`, deleteError);
    }

    // Delete the converted WAV file if it exists
    if (wavFilePath && fs.existsSync(wavFilePath)) {
      try {
        fs.unlinkSync(wavFilePath);
        console.log(`Successfully deleted converted WAV file`);
      } catch (deleteError) {
        console.error(`Error deleting WAV file:`, deleteError);
      }
    }

    // Return the transcription
    return NextResponse.json({
      success: true,
      transcription: transcription.text,
      filename: filename,
    });
  } catch (error) {
    console.error("Error transcribing audio:", error);
    return NextResponse.json(
      {
        error: "Failed to transcribe audio",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return NextResponse.json(
        { error: "Filename parameter is required" },
        { status: 400 }
      );
    }

    // Construct the file path
    const audioDirectory = path.join(process.cwd(), "audio-to-transcript");
    const filePath = path.join(audioDirectory, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `File not found: ${filename}` },
        { status: 404 }
      );
    }

    // Check if the file is a .webm or .mp3 file
    if (!filename.endsWith(".webm") && !filename.endsWith(".mp3")) {
      return NextResponse.json(
        { error: "Only .webm and .mp3 files are supported" },
        { status: 400 }
      );
    }

    // Wait for file to be fully written
    console.log(`Waiting for file to be ready: ${filename}`);
    await waitForFile(filePath);

    let fileToTranscribe = filePath;
    let wavFilePath: string | null = null;

    // Convert webm to wav if needed
    if (filename.endsWith(".webm")) {
      // Validate the webm file before attempting conversion
      console.log(`Validating ${filename}...`);
      const isValid = await validateWebmFile(filePath);

      if (!isValid) {
        console.error(`Invalid or corrupted webm file: ${filename}`);
        // Delete the invalid file
        try {
          fs.unlinkSync(filePath);
          console.log(`Deleted invalid webm file: ${filename}`);
        } catch (deleteError) {
          console.error(
            `Error deleting invalid file ${filename}:`,
            deleteError
          );
        }
        return NextResponse.json(
          {
            success: false,
            error: "Invalid or corrupted audio file",
            details: "The audio file could not be processed",
          },
          { status: 400 }
        );
      }

      const wavFilename = filename.replace(".webm", ".wav");
      wavFilePath = path.join(audioDirectory, wavFilename);

      console.log(`Converting ${filename} to WAV format...`);
      await convertToWav(filePath, wavFilePath);
      fileToTranscribe = wavFilePath;

      // Delete the webm file immediately after conversion
      try {
        fs.unlinkSync(filePath);
        console.log(`Successfully deleted webm file: ${filename}`);
      } catch (deleteError) {
        console.error(`Error deleting webm file ${filename}:`, deleteError);
      }
    }

    // Read the audio file (wav or mp3)
    const audioFile = fs.createReadStream(fileToTranscribe);

    // Send to Whisper API for transcription
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-large-v3",
      language: "pl",
    });

    console.log("Whisper transcription response:", transcription);

    // Delete the audio file after successful transcription
    try {
      // Only delete if it's not a webm file (already deleted after conversion)
      if (!filename.endsWith(".webm") && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Successfully deleted file: ${filename}`);
      }
    } catch (deleteError) {
      console.error(`Error deleting file ${filename}:`, deleteError);
    }

    // Delete the converted WAV file if it exists
    if (wavFilePath && fs.existsSync(wavFilePath)) {
      try {
        fs.unlinkSync(wavFilePath);
        console.log(`Successfully deleted converted WAV file`);
      } catch (deleteError) {
        console.error(`Error deleting WAV file:`, deleteError);
      }
    }

    // Return the transcription
    return NextResponse.json({
      success: true,
      transcription: transcription.text,
      filename: filename,
    });
  } catch (error) {
    console.error("Error transcribing audio:", error);
    return NextResponse.json(
      {
        error: "Failed to transcribe audio",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
