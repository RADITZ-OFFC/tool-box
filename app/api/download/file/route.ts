import { NextRequest, NextResponse } from 'next/server';
import { createReadStream } from 'fs';
import { stat, unlink } from 'fs/promises';
import { getJob, deleteJob } from '@/lib/download-state';

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  const job = getJob(id);
  if (!job) {
    return NextResponse.json({ error: 'Download not found' }, { status: 404 });
  }

  if (job.status !== 'completed') {
    return NextResponse.json({ error: 'Download not ready' }, { status: 400 });
  }

  if (!job.filePath) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  try {
    const fileStat = await stat(job.filePath);
    const contentType = job.type === 'audio' ? 'audio/mpeg' : 'video/mp4';
    const fileToDelete = job.filePath;

    const nodeStream = createReadStream(job.filePath);
    const webStream = new ReadableStream({
      start(controller) {
        nodeStream.on('data', (chunk: string | Buffer) => {
          const buf = typeof chunk === 'string' ? Buffer.from(chunk) : chunk;
          controller.enqueue(new Uint8Array(buf));
        });
        nodeStream.on('end', () => {
          controller.close();
          unlink(fileToDelete).catch(() => {});
          deleteJob(id);
        });
        nodeStream.on('error', (err) => {
          controller.error(err);
          unlink(fileToDelete).catch(() => {});
          deleteJob(id);
        });
      },
      cancel() {
        nodeStream.destroy();
        unlink(fileToDelete).catch(() => {});
      },
    });

    return new Response(webStream, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(job.filename)}`,
        'Content-Length': fileStat.size.toString(),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
  }
}
