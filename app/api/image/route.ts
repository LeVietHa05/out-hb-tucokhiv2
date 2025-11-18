import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Initialize currentImage by reading from detections.json
let currentImage: any = {};
try {
  const detectionsPath = path.join(process.cwd(), "data", "detections.json");
  if (fs.existsSync(detectionsPath)) {
    currentImage = JSON.parse(fs.readFileSync(detectionsPath, "utf-8"));
  } else {
    currentImage = {
      time: "2025-11-06T11:18:26.993Z",
      predictions: {
        image: {
          width: 1280,
          height: 720,
        },
        predictions: [],
      },
      imagePath: "/detections/detect.jpg",
    };
  }
} catch (error) {
  console.error("Error loading detections.json:", error);
  currentImage = {
    time: "2025-11-06T11:18:26.993Z",
    predictions: {
      image: {
        width: 1280,
        height: 720,
      },
      predictions: [],
    },
    imagePath: "/detections/detect.jpg",
  };
}

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
      "find-wrenches-rubber-hammers-screwdrivers-wire-cutters-scissors-pointy-pliers-hammers-and-pliers";

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
    // console.dir(result);
    // console.dir(result.outputs[0].predictions);

    const outputDir = path.join(process.cwd(), "public", "detections");
    fs.mkdirSync(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, `${Date.now()}.jpg`);

    const vizBase64 = result.outputs?.[0]?.label_visualization.value;
    if (vizBase64) {
      fs.writeFileSync(outputPath, Buffer.from(vizBase64, "base64"));
    }

    // const outputPath2 = path.join(outputDir, `b_${Date.now()}.jpg`);
    // fs.writeFileSync(outputPath2, Buffer.from(base64Image, "base64"));
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
