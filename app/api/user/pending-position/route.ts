import { NextResponse } from 'next/server';
import { getPendingEnrollmentPosition } from '../../../../lib/store';

export async function GET() {
  const p = getPendingEnrollmentPosition();
  console.log("position", p)
  return NextResponse.json({ position: p });
}
