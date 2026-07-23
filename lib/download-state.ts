export interface DownloadJob {
  id: string;
  url: string;
  type: 'video' | 'audio';
  title: string;
  thumbnail: string;
  status: 'preparing' | 'downloading' | 'merging' | 'completed' | 'error';
  progress: number;
  totalSize: string;
  speed: string;
  eta: string;
  filePath: string | null;
  filename: string;
  error: string | null;
  createdAt: number;
}

const downloadJobs = new Map<string, DownloadJob>();

export function getJob(id: string): DownloadJob | undefined {
  return downloadJobs.get(id);
}

export function setJob(job: DownloadJob): void {
  downloadJobs.set(job.id, job);
}

export function deleteJob(id: string): boolean {
  return downloadJobs.delete(id);
}

export function createJob(
  id: string,
  url: string,
  type: 'video' | 'audio',
  title: string,
  thumbnail: string
): DownloadJob {
  const job: DownloadJob = {
    id,
    url,
    type,
    title,
    thumbnail,
    status: 'preparing',
    progress: 0,
    totalSize: '',
    speed: '',
    eta: '',
    filePath: null,
    filename: `download.${type === 'audio' ? 'mp3' : 'mp4'}`,
    error: null,
    createdAt: Date.now(),
  };
  downloadJobs.set(id, job);
  return job;
}

export function parseYtDlpProgress(line: string): Partial<DownloadJob> | null {
  // Format: [download]  42.3% of  50.00MiB at  2.50MiB/s ETA 00:19
  // Or:     [download] 100% of  50.00MiB in 00:20
  const percentMatch = line.match(/\[download\]\s+([\d.]+)%/);
  if (!percentMatch) return null;

  const update: Partial<DownloadJob> = {
    progress: parseFloat(percentMatch[1]),
    status: 'downloading',
  };

  const sizeMatch = line.match(/of\s+([\d.]+\w+)/);
  if (sizeMatch) update.totalSize = sizeMatch[1];

  const speedMatch = line.match(/at\s+([\d.]+\w+\/s)/);
  if (speedMatch) update.speed = speedMatch[1];

  const etaMatch = line.match(/ETA\s+([\d:]+)/);
  if (etaMatch) update.eta = etaMatch[1];

  return update;
}

// Cleanup jobs older than 1 hour and their files
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const cutoff = Date.now() - 3600000;
    const { unlinkSync } = require('fs');
    const { join } = require('path');
    const { tmpdir } = require('os');

    for (const [id, job] of downloadJobs) {
      if (job.createdAt < cutoff) {
        // Try to delete the file
        if (job.filePath) {
          try { unlinkSync(job.filePath); } catch {}
        }
        downloadJobs.delete(id);
      }
    }
  }, 600000);
}
