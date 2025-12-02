import { NextResponse } from 'next/server';
import { getLogs } from '../../../lib/store';

export const dynamic = 'force-dynamic'; // ← Quan trọng!
export const revalidate = 0; // Không cache
export async function GET() {
  const logs = getLogs();
  return NextResponse.json({ logs: logs });
}
