'use client';

interface VideoFormat {
  quality: string;
  url: string;
  mimeType: string;
  type: 'video' | 'audio';
  size?: string;
}

import { type Platform } from '@/lib/utils';

interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  platform: Platform;
  formats: VideoFormat[];
}

interface VideoPreviewProps {
  videoInfo: VideoInfo;
  onDownload: (format: VideoFormat) => void;
}

export default function VideoPreview({ videoInfo, onDownload }: VideoPreviewProps) {
  const videoFormats = videoInfo.formats.filter((f) => f.type === 'video');
  const audioFormats = videoInfo.formats.filter((f) => f.type === 'audio');

  return (
    <div className="w-full mt-6">
      <div className="card rounded-2xl overflow-hidden">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-[rgba(255,255,255,0.03)] overflow-hidden">
          {videoInfo.thumbnail ? (
            <img
              src={videoInfo.thumbnail}
              alt={videoInfo.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#6b7280]">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}

          {videoInfo.duration && videoInfo.duration !== 'Unknown' && (
            <span className="absolute bottom-2 right-2 px-1.5 py-0.5 text-[10px] font-medium bg-black/70 text-white rounded">
              {videoInfo.duration}
            </span>
          )}
        </div>

        {/* Info + Buttons */}
        <div className="p-3 sm:p-4">
          <h3 className="text-white text-sm font-medium line-clamp-2 mb-3 leading-relaxed">
            {videoInfo.title}
          </h3>

          {/* Video Formats */}
          {videoFormats.length > 0 && (
            <div className="mb-3">
              <p className="text-[#6b7280] text-[10px] uppercase tracking-wider mb-2 font-medium">Video</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {videoFormats.map((format, index) => (
                  <button
                    key={`video-${index}`}
                    onClick={() => onDownload(format)}
                    className="btn-primary px-3 py-2 text-xs font-medium rounded-xl flex flex-col items-center gap-0.5"
                  >
                    <span>{format.quality}</span>
                    {format.size && (
                      <span className="text-[10px] opacity-70">{format.size}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Audio Formats */}
          {audioFormats.length > 0 && (
            <div>
              <p className="text-[#6b7280] text-[10px] uppercase tracking-wider mb-2 font-medium">Audio</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {audioFormats.map((format, index) => (
                  <button
                    key={`audio-${index}`}
                    onClick={() => onDownload(format)}
                    className="px-3 py-2 text-xs font-medium rounded-xl flex flex-col items-center gap-0.5 bg-[rgba(255,255,255,0.05)] text-[#d1d5db] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.08)] transition-all"
                  >
                    <span>{format.quality}</span>
                    {format.size && (
                      <span className="text-[10px] opacity-70">{format.size}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
