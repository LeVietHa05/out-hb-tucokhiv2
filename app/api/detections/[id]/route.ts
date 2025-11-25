import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: { id: string };
  }
) {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "detections",
      params.id
    );

    const file = await fs.readFile(filePath);

    // Chuyển Buffer sang Uint8Array
    const uint8Array = new Uint8Array(file);

    return new NextResponse(uint8Array, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }
}
