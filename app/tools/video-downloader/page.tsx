'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import DownloadForm from '@/components/DownloadForm';
import VideoPreview from '@/components/VideoPreview';

export default function VideoDownloaderPage() {
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRefs = useRef<HTMLIFrameElement[]>([]);

  // Cleanup iframes on unmount
  useEffect(() => {
    return () => {
      iframeRefs.current.forEach(iframe => {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      });
    };
  }, []);

  const handleDownload = async (format: { url: string; quality: string; type: 'video' | 'audio' }) => {
    setError(null);
    const ext = format.type === 'audio' ? 'mp3' : 'mp4';
    const filename = `${videoInfo?.title?.replace(/[^a-zA-Z0-9 ]/g, '') || 'download'}.${ext}`;

    // Server-side routes: use hidden iframe
    if (format.url.startsWith('/api/')) {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = format.url;
      document.body.appendChild(iframe);
      iframeRefs.current.push(iframe);
      setTimeout(() => {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      }, 60000);
      return;
    }

    // Direct download: fetch blob, then trigger browser download
    try {
      const response = await fetch(format.url);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    } catch {
      // Fallback: proxy route
      const proxyUrl = `/api/download/proxy?url=${encodeURIComponent(format.url)}&filename=${encodeURIComponent(filename)}`;
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = proxyUrl;
      document.body.appendChild(iframe);
      iframeRefs.current.push(iframe);
      setTimeout(() => {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      }, 60000);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Top Nav */}
      <nav className="border-b border-[rgba(255,255,255,0.06)] bg-[rgba(3,0,20,0.8)] backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <Link href="/tools" className="text-[#6b7280] hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-white text-sm font-semibold">Video Downloader</h1>
            <p className="text-[#6b7280] text-[10px]">20+ platforms — YouTube, TikTok, Instagram, X & more</p>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <main>
          <DownloadForm
            onVideoInfo={setVideoInfo}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            error={error}
            setError={setError}
          />

          {videoInfo && (
            <VideoPreview
              videoInfo={videoInfo}
              onDownload={handleDownload}
            />
          )}

          {/* Feature Highlights */}
          {!videoInfo && (
            <div className="mt-8 grid grid-cols-3 gap-3">
              <div className="card rounded-xl p-3 text-center">
                <svg className="w-4 h-4 mx-auto text-[#818cf8] mb-1.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-white text-[10px] sm:text-xs font-medium">No Watermark</p>
              </div>
              <div className="card rounded-xl p-3 text-center">
                <svg className="w-4 h-4 mx-auto text-[#818cf8] mb-1.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="text-white text-[10px] sm:text-xs font-medium">Fast Download</p>
              </div>
              <div className="card rounded-xl p-3 text-center">
                <svg className="w-4 h-4 mx-auto text-[#818cf8] mb-1.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <p className="text-white text-[10px] sm:text-xs font-medium">Free to Use</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
