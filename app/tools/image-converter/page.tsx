'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';

type OutputFormat = 'jpeg' | 'png' | 'webp';

interface ConvertedFile {
  name: string;
  url: string;
  size: string;
}

export default function ImageConverterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpeg');
  const [quality, setQuality] = useState(92);
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<ConvertedFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    setFile(f);
    setResult(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleConvert = async () => {
    if (!file) return;
    setIsConverting(true);
    setError(null);

    try {
      const img = new Image();
      img.src = preview!;
      await new Promise((resolve) => { img.onload = resolve; });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const mimeType = `image/${outputFormat}`;
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('Conversion failed'));
        }, mimeType, quality / 100);
      });

      const url = URL.createObjectURL(blob);
      const sizeKB = (blob.size / 1024).toFixed(1);
      const sizeStr = blob.size > 1024 * 1024
        ? `${(blob.size / (1024 * 1024)).toFixed(1)} MB`
        : `${sizeKB} KB`;

      const ext = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
      const baseName = file.name.replace(/\.[^.]+$/, '');

      setResult({
        name: `${baseName}.${ext}`,
        url,
        size: sizeStr,
      });
    } catch {
      setError('Conversion failed. Try a different format.');
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.url;
    a.download = result.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatOptions: { value: OutputFormat; label: string }[] = [
    { value: 'jpeg', label: 'JPEG' },
    { value: 'png', label: 'PNG' },
    { value: 'webp', label: 'WebP' },
  ];

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
            <h1 className="text-white text-sm font-semibold">Image Converter</h1>
            <p className="text-[#6b7280] text-[10px]">PNG, JPEG, WebP</p>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <main className="space-y-4">
          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className={`card rounded-2xl p-8 text-center cursor-pointer ${
              preview ? 'border-[#6366f1]/30' : 'hover:border-[rgba(255,255,255,0.15)]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />

            {preview ? (
              <div className="space-y-3">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-48 mx-auto rounded-xl object-contain"
                />
                <p className="text-white text-sm font-medium">{file?.name}</p>
                <p className="text-[#6b7280] text-xs">
                  {file ? `${(file.size / 1024).toFixed(1)} KB` : ''}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setPreview(null);
                    setResult(null);
                  }}
                  className="text-xs text-[#f87171] hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <svg className="w-8 h-8 mx-auto text-[#6b7280]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-[#d1d5db] text-sm">Drop image here or click to upload</p>
                <p className="text-[#6b7280] text-xs">PNG, JPEG, WebP</p>
              </div>
            )}
          </div>

          {/* Format Selection */}
          {preview && (
            <div className="card rounded-2xl p-4 space-y-4">
              <div>
                <label className="text-[#9ca3af] text-xs font-medium block mb-2">
                  Output Format
                </label>
                <div className="flex gap-2">
                  {formatOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setOutputFormat(opt.value)}
                      className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                        outputFormat === opt.value
                          ? 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                          : 'bg-[rgba(255,255,255,0.05)] text-[#d1d5db] hover:bg-[rgba(255,255,255,0.08)]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {outputFormat !== 'png' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[#9ca3af] text-xs font-medium">Quality</label>
                    <span className="text-white text-xs font-mono">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full h-1 bg-[rgba(255,255,255,0.1)] rounded-full appearance-none cursor-pointer accent-[#6366f1]"
                  />
                </div>
              )}

              <button
                onClick={handleConvert}
                disabled={isConverting}
                className="btn-primary w-full py-2.5 text-sm font-medium rounded-xl disabled:opacity-40"
              >
                {isConverting ? 'Converting...' : 'Convert'}
              </button>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="card rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">{result.name}</p>
                  <p className="text-[#6b7280] text-xs">{result.size}</p>
                </div>
                <button
                  onClick={handleDownload}
                  className="btn-primary px-4 py-2 text-sm font-medium rounded-xl"
                >
                  Download
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="px-3 py-2 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-xl text-[#f87171] text-xs">
              {error}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
