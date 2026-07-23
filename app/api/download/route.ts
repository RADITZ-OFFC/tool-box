import { NextRequest, NextResponse } from 'next/server';
import { getVideoInfo } from '@/lib/cobalt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    }

    const data = await getVideoInfo(url);
    return NextResponse.json({ data });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch video info';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
