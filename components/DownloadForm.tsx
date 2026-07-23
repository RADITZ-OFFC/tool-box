'use client';

import { useState } from 'react';
import { detectPlatform, getPlatformColor } from '@/lib/utils';

interface DownloadFormProps {
  onVideoInfo: (info: Record<string, unknown>) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export default function DownloadForm({ onVideoInfo, isLoading, setIsLoading, error, setError }: DownloadFormProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    const platform = detectPlatform(url);
    if (platform === 'other') {
      setError('Platform not recognized. Supported: YouTube, TikTok, Instagram, Twitter/X, Facebook, Reddit, and 15+ more platforms.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
        signal: controller.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch video info');
      }

      onVideoInfo(data.data);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setError('Request timed out. Platform might be slow or unavailable.');
      } else {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
    } finally {
      clearTimeout(timeout);
      setIsLoading(false);
    }
  };

  const detected = url ? detectPlatform(url) : null;

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste URL from any platform..."
          className="input-clean flex-1 px-3 sm:px-4 py-2.5 text-sm disabled:opacity-50"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="btn-primary px-5 py-2.5 text-sm font-medium disabled:opacity-40 whitespace-nowrap w-full sm:w-auto"
        >
          {isLoading ? 'Loading...' : 'Get Video'}
        </button>
      </div>

      {detected && detected !== 'other' && (
        <p className="mt-2 text-xs text-[#6b7280]">
          Detected:{' '}
          <span className="font-medium" style={{ color: getPlatformColor(detected) }}>
            {detected}
          </span>
        </p>
      )}

      {error && (
        <div className="mt-3 px-3 py-2 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-xl text-[#f87171] text-xs">
          {error}
        </div>
      )}
    </form>
  );
}
