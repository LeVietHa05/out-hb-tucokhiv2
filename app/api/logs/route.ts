import { NextResponse } from 'next/server';
import { getLogs } from '../../../lib/store';

export async function GET() {
  return NextResponse.json({ logs: getLogs() });
}
