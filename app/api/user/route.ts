import { NextResponse } from 'next/server';
import { setCurrentUser, getCurrentUser, addUser, getAllUsers, logoutUser, clearPendingEnrollmentPosition } from '../../../lib/store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Expected body: { id: string, name: string, role: string, last_access: string, fingerprint_status: string }
    await addUser(body);
    await clearPendingEnrollmentPosition();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

export async function GET() {
  const user = getCurrentUser();
  if (user) {
    return NextResponse.json(user);
  } else {
    // Return mock data for testing
    return NextResponse.json({
      id: 'user001',
      name: 'John Doe',
      role: 'Technician',
      last_access: new Date().toISOString(),
      fingerprint_status: 'enrolled'
    });
  }
}

export async function DELETE() {
  try {
    await logoutUser();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
