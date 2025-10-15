import { NextResponse } from 'next/server';
import { setState } from '../../../lib/store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    setState(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

export async function GET() {
  const { getState } = await import('../../../lib/store');
  return NextResponse.json({ state: getState() });
}
