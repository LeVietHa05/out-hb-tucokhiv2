import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

let currentImage = {
  time: "2025-11-06T11:18:26.993Z",
  predictions: {
    image: {
      width: 1280,
      height: 720,
    },
    predictions: [
      {
        width: 879.923828125,
        height: 416.7146544456482,
        x: 840.0380859375,
        y: 211.84070134162903,
        confidence: 0.4229481816291809,
        class_id: 5,
        class: "screwdriver",
        detection_id: "5fd9fb6f-584c-479f-a524-a0ad1367cb09",
        parent_id: "image",
      },
    ],
  },
  imagePath: "/detections/detect.jpg",
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No image uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");

    // Roboflow config
    const apiKey = process.env.ROBOFLOW_API_KEY!;
    const workspace = "workspace-lwoz7";
    const workflowId =
      "find-rubber-hammers-hammers-pliers-wire-cutter-pliers-pointy-pliers-scissors-screwdrivers-and-wrenches";

    const response = await fetch(
      `https://serverless.roboflow.com/${workspace}/workflows/${workflowId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          inputs: { image: { type: "base64", value: base64Image } },
        }),
      }
    );

    const result = await response.json();
    console.dir(result);
    console.dir(result.outputs[0].predictions);

    const outputDir = path.join(process.cwd(), "public", "detections");
    fs.mkdirSync(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, `${Date.now()}.jpg`);

    const vizBase64 = result.outputs?.[0]?.visualization.value;
    if (vizBase64) {
      fs.writeFileSync(outputPath, Buffer.from(vizBase64, "base64"));
    }

    // 🧹 XÓA ẢNH CŨ HƠN 24 GIỜ
    const DAY_MS = 24 * 60 * 60 * 1000;
    const now = Date.now();

    fs.readdirSync(outputDir).forEach((f) => {
      const filePath = path.join(outputDir, f);
      try {
        const stats = fs.statSync(filePath);
        const age = now - stats.mtime.getTime();
        if (age > DAY_MS) {
          fs.unlinkSync(filePath);
          console.log(`🗑️ Deleted old image: ${f}`);
        }
      } catch (err) {
        console.warn(`⚠️ Could not delete file ${f}:`, err);
      }
    });

    // ✅ Ghi log JSON kết quả
    const res = {
      time: new Date().toISOString(),
      predictions: result.outputs?.[0]?.predictions || [],
      imagePath: `/detections/${path.basename(outputPath)}`,
    };

    currentImage = res;

    const logFile = path.join(process.cwd(), "data", "detections.json");
    fs.mkdirSync(path.dirname(logFile), { recursive: true });
    let existing = fs.existsSync(logFile)
      ? JSON.parse(fs.readFileSync(logFile, "utf-8"))
      : [];
    existing = res;
    fs.writeFileSync(logFile, JSON.stringify(existing, null, 2));

    return NextResponse.json(res);
  } catch (error: any) {
    console.error("Error analyzing image:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(currentImage);
}
