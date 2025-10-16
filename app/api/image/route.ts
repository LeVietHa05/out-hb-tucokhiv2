import { NextResponse } from 'next/server';
import { setLatestImage, getLatestImage } from '../../../lib/store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Expected body: { url: string, timestamp: string, metadata: { detected_tools: [], confidence_scores: [], annotations: [] } }
    setLatestImage(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

export async function GET() {
  const image = getLatestImage();
  if (image) {
    return NextResponse.json(image);
  } else {
    // Return mock data for testing
    return NextResponse.json({
      url: 'https://via.placeholder.com/800x600?text=Tool+Cabinet+Image',
      timestamp: new Date().toISOString(),
      metadata: {
        detected_tools: ['Hammer', 'Screwdriver', 'Wrench'],
        confidence_scores: [0.95, 0.87, 0.92],
        annotations: []
      }
    });
  }
}
