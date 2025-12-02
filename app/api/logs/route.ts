import { NextResponse } from 'next/server';
import { getLogs } from '../../../lib/store';

export async function GET() {
  const logs = getLogs();
  return NextResponse.json({ logs: logs });
}
