import { NextResponse } from 'next/server';
import { addEnrollResult, getEnrollResults } from '../../../lib/store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    addEnrollResult(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ results: getEnrollResults() });
}
