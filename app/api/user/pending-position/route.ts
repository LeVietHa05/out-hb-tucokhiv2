import { NextResponse } from 'next/server';
import { getPendingEnrollmentPosition } from '../../../../lib/store';

export async function GET() {
  const position = getPendingEnrollmentPosition();
  return NextResponse.json({ position });
}
