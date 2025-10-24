import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.scaleway.ai/2d6e7638-f7f5-41f4-b61c-79209c1785be/v1",
  apiKey: process.env.SCALEWAY_API_KEY,
});

export async function POST(request: NextRequest) {
  console.log("🎤 [Whisper API] Received transcription request");

  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const language = formData.get("language") as string;

    if (!audioFile) {
      console.error("❌ [Whisper API] No audio file provided");
      return NextResponse.json(
        { error: "No audio file provided", success: false },
        { status: 400 }
      );
    }

    console.log("📁 [Whisper API] Audio file received:", {
      name: audioFile.name,
      type: audioFile.type,
      size: `${(audioFile.size / 1024).toFixed(2)} KB`,
    });

    // Convert File to buffer for streaming
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`🔄 [Whisper API] Converted to buffer: ${buffer.length} bytes`);
    console.log(`🌍 [Whisper API] Language: ${language || "auto-detect"}`);

    // Create a Blob that can be streamed (similar to fs.createReadStream)
    const audioBlob = new Blob([buffer], {
      type: audioFile.type || "audio/wav",
    });

    // Convert Blob to File for OpenAI SDK
    const file = new File(
      [audioBlob],
      audioFile.name || `audio_${Date.now()}.wav`,
      { type: audioFile.type || "audio/wav" }
    );

    console.log("🚀 [Whisper API] Sending to Scaleway Whisper API...");
    const startTime = Date.now();

    // Prepare transcription options exactly as per Scaleway docs
    const transcriptionOptions: {
      model: string;
      file: File;
      prompt: string;
      language?: string;
    } = {
      model: "whisper-large-v3",
      file: file,
      prompt: "", // Empty prompt is required per Scaleway docs
    };

    // Add language only if provided (Scaleway supports auto-detect without language param)
    if (language && language !== "auto") {
      transcriptionOptions.language = language;
    }

    console.log("📋 [Whisper API] Transcription options:", {
      model: transcriptionOptions.model,
      language: transcriptionOptions.language || "auto-detect",
      fileSize: file.size,
      fileName: file.name,
    });

    const transcript = await client.audio.transcriptions.create(
      transcriptionOptions
    );

    const duration = Date.now() - startTime;
    console.log(`✅ [Whisper API] Transcription successful! (${duration}ms)`);
    console.log(`📝 [Whisper API] Transcribed text: "${transcript.text}"`);

    return NextResponse.json({
      text: transcript.text,
      success: true,
    });
  } catch (error) {
    console.error("❌ [Whisper API] Error during transcription:");
    console.error("Error details:", error);

    // Log more details about the error
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to transcribe audio";

    return NextResponse.json(
      {
        error: errorMessage,
        success: false,
        details: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 }
    );
  }
}
