import { NextRequest, NextResponse } from 'next/server';
import { createJob, getJob, setJob } from '@/lib/download-state';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, type, title, thumbnail } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    }
    if (type !== 'video' && type !== 'audio') {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const id = `dl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const filename = `${title || 'download'}.${type === 'audio' ? 'mp3' : 'mp4'}`;
    createJob(id, url, type, title || 'Download', thumbnail || '');

    // Start download in background (don't await)
    downloadFile(id, url, type, filename).catch((err) => {
      console.error(`[download] Background error for ${id}:`, err);
      const job = getJob(id);
      if (job) setJob({ ...job, status: 'error', error: err.message || 'Download failed' });
    });

    return NextResponse.json({ success: true, id, filename });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to start download';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

async function downloadFile(jobId: string, url: string, type: 'video' | 'audio', filename: string) {
  const ext = type === 'audio' ? 'mp3' : 'mp4';
  const filePath = join(tmpdir(), `${jobId}.${ext}`);

  const job = getJob(jobId);
  if (!job) throw new Error('Job not found');

  setJob({ ...job, status: 'downloading', progress: 0 });

  const headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  };

  // Add referer based on URL
  if (url.includes('tiktok.com')) headers['Referer'] = 'https://www.tiktok.com/';
  else if (url.includes('instagram.com')) headers['Referer'] = 'https://www.instagram.com/';
  else if (url.includes('youtube.com') || url.includes('youtu.be')) headers['Referer'] = 'https://www.youtube.com/';

  console.log(`[download] Starting download for ${jobId}: ${url.substring(0, 100)}...`);

  const response = await fetch(url, {
    headers,
    redirect: 'follow',
  });

  console.log(`[download] Response status: ${response.status}, content-length: ${response.headers.get('content-length')}`);

  if (!response.ok) throw new Error(`Failed to download: ${response.status} ${response.statusText}`);

  const totalSize = parseInt(response.headers.get('content-length') || '0', 10);
  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const chunks: Uint8Array[] = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
    received += value.length;

    const progress = totalSize > 0 ? (received / totalSize) * 100 : 0;
    const currentJob = getJob(jobId);
    if (currentJob) {
      setJob({
        ...currentJob,
        progress,
        totalSize: totalSize > 0 ? `${(totalSize / 1024 / 1024).toFixed(1)}MB` : '',
      });
    }
  }

  console.log(`[download] Download complete for ${jobId}: ${received} bytes`);

  const buffer = Buffer.concat(chunks);
  writeFileSync(filePath, buffer);

  const finalJob = getJob(jobId);
  if (finalJob) {
    setJob({ ...finalJob, status: 'completed', progress: 100, filePath, filename });
  }
}
