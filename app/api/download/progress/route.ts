import { NextRequest, NextResponse } from 'next/server';
import { getJob } from '@/lib/download-state';

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  const job = getJob(id);
  if (!job) {
    return NextResponse.json({ error: 'Download not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: job.id,
    title: job.title,
    thumbnail: job.thumbnail,
    type: job.type,
    status: job.status,
    progress: job.progress,
    totalSize: job.totalSize,
    speed: job.speed,
    eta: job.eta,
    filename: job.filename,
    error: job.error,
  });
}
