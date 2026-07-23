'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';

export default function ImageToUrlPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; delete_url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    if (file.size > 32 * 1024 * 1024) {
      setError('File size must be less than 32MB');
      return;
    }

    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    uploadImage(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setResult({
        url: data.url,
        delete_url: data.delete_url,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setResult(null);
    setError(null);
    setCopied(false);
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
            <h1 className="text-white text-sm font-semibold">Image to URL</h1>
            <p className="text-[#6b7280] text-[10px]">Upload gambar, dapat link</p>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <main className="space-y-4">
          {/* Drop Zone */}
          {!result && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="card rounded-2xl p-8 text-center cursor-pointer border-dashed border-2 border-[rgba(255,255,255,0.1)] hover:border-[#6366f1]/30 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />

              {isUploading ? (
                <div className="space-y-3">
                  <div className="w-10 h-10 mx-auto border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
                  <p className="text-[#d1d5db] text-sm">Uploading...</p>
                </div>
              ) : preview ? (
                <div className="space-y-3">
                  <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-xl object-contain" />
                  <p className="text-[#6b7280] text-xs">Uploading in progress...</p>
                </div>
              ) : (
                <>
                  <svg className="w-10 h-10 mx-auto text-[#6b7280] mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-[#d1d5db] text-sm">Drop gambar di sini atau klik untuk upload</p>
                  <p className="text-[#6b7280] text-xs mt-1">JPG, PNG, WEBP, GIF — max 32MB</p>
                </>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="px-3 py-2 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-xl text-[#f87171] text-xs">
              {error}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="card rounded-2xl p-4 space-y-4">
              {/* Preview */}
              {preview && (
                <div className="rounded-xl overflow-hidden">
                  <img src={preview} alt="Uploaded" className="w-full max-h-64 object-contain" />
                </div>
              )}

              {/* URL Display */}
              <div className="space-y-2">
                <label className="text-[#9ca3af] text-xs font-medium">Direct URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={result.url}
                    readOnly
                    className="input-clean flex-1 px-3 py-2.5 text-sm font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(result.url)}
                    className={`btn-primary px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
                      copied ? 'bg-[#22c55e]' : ''
                    }`}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={reset}
                  className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-[rgba(255,255,255,0.05)] text-[#9ca3af] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.08)] transition-colors"
                >
                  Upload Again
                </button>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-[rgba(255,255,255,0.05)] text-[#9ca3af] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.08)] transition-colors text-center"
                >
                  Open URL
                </a>
              </div>

              {/* Delete URL */}
              <div className="space-y-1">
                <label className="text-[#6b7280] text-[10px] font-medium">Delete URL (save this to delete later)</label>
                <p className="text-[#6b7280] text-[10px] font-mono break-all">{result.delete_url}</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
