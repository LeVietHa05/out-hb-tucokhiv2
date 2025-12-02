import { NextResponse, NextRequest } from "next/server";
import { getPendingEnrollmentPosition } from "../../../../lib/store";
// Thêm export dynamic = 'force-dynamic'
export const dynamic = 'force-dynamic'; // ← Quan trọng!
export const revalidate = 0; // Không cache

export async function GET(request: NextRequest) {
  const position = await getPendingEnrollmentPosition();
  // Thêm cache control headers nếu cần
  const response = NextResponse.json({ position: position.newEnrollPosition });

  // Chống cache (optional)
  response.headers.set('Cache-Control', 'no-store, max-age=0');

  return response;
}
