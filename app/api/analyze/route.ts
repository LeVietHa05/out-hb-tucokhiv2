import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

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
    console.log(result)
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error analyzing image:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
