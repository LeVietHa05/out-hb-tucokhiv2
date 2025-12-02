import { NextResponse } from "next/server";
import { getPendingEnrollmentPosition } from "../../../../lib/store";

export async function GET() {
  const position =await getPendingEnrollmentPosition();
  console.log("position", position);
  return NextResponse.json({ position });
}
