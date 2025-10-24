import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as Blob;
    const timestamp = formData.get("timestamp") as string;

    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Create audio-to-transcript directory if it doesn't exist
    const audioDir = path.join(process.cwd(), "audio-to-transcript");
    await mkdir(audioDir, { recursive: true });

    // Generate filename with timestamp
    const filename = `recording_${timestamp}.webm`;
    const filepath = path.join(audioDir, filename);

    // Convert blob to buffer and save
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    console.log(`Saved audio chunk: ${filename}`);

    return NextResponse.json({
      success: true,
      filename,
      message: "Audio chunk saved successfully",
    });
  } catch (error) {
    console.error("Error saving audio:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save audio file" },
      { status: 500 }
    );
  }
}
