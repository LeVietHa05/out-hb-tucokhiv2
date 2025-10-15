import { NextResponse } from 'next/server';
import { setCommand, getLatestCommand } from '../../../lib/store';

export async function GET() {
  const command = getLatestCommand();
  if (command) {
    return NextResponse.json({ command: command.command, timestamp: command.timestamp });
  } else {
    return NextResponse.json({ command: 'none' });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.command) {
      setCommand(body.command);
      return NextResponse.json({ ok: true });
    } else {
      return NextResponse.json({ error: 'Missing command' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}
