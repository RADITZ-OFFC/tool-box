'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';

export default function ImageCompressorPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('image/jpeg');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    setFileName(file.name.replace(/\.[^.]+$/, ''));
    setFileType(file.type);
    setOriginalSize(file.size);
    setResult(null);
    setCompressedSize(0);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const compress = async () => {
    if (!preview) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.src = preview;
      await new Promise(r => { img.onload = r; });

      const canvas = document.createElement('canvas');
      let w = img.naturalWidth;
      let h = img.naturalHeight;

      if (w > maxWidth) {
        h = Math.round((h * maxWidth) / w);
        w = maxWidth;
      }

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);

      const dataUrl = canvas.toDataURL(fileType, quality / 100);
      setResult(dataUrl);

      // Calculate compressed size
      const base64 = dataUrl.split(',')[1];
      const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
      const bytes = Math.ceil((base64.length * 3) / 4) - padding;
      setCompressedSize(bytes);
    } catch {
      alert('Gagal kompres gambar');
    } finally {
      setIsProcessing(false);
    }
  };

  const download = () => {
    if (!result) return;
    const ext = fileType.split('/')[1] || 'jpg';
    const a = document.createElement('a');
    a.href = result;
    a.download = `${fileName}-compressed.${ext}`;
    a.click();
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const savings = originalSize > 0 && compressedSize > 0
    ? Math.round((1 - compressedSize / originalSize) * 100)
    : 0;

  return (
    <div className="min-h-screen">
      <nav className="border-b border-[rgba(255,255,255,0.06)] bg-[rgba(3,0,20,0.8)] backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <Link href="/tools" className="text-[#6b7280] hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-white text-sm font-semibold">Image Compressor</h1>
            <p className="text-[#6b7280] text-[10px]">Kompres gambar tanpa loss quality</p>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <main className="space-y-4">
          {!preview ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="card rounded-2xl p-8 text-center cursor-pointer border-dashed border-2 border-[rgba(255,255,255,0.1)] hover:border-[#6366f1]/30 transition-colors"
            >
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              <svg className="w-10 h-10 mx-auto text-[#6b7280] mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-[#d1d5db] text-sm">Drop gambar di sini atau klik untuk upload</p>
              <p className="text-[#6b7280] text-xs mt-1">JPG, PNG, WEBP</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="card rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white text-sm font-medium">{fileName}</p>
                  <button onClick={() => { setPreview(null); setResult(null); setOriginalSize(0); setCompressedSize(0); }}
                    className="text-xs text-[#f87171] hover:underline">Ganti gambar</button>
                </div>
                <img src={result || preview} alt="Preview" className="w-full rounded-xl" />
                <p className="text-[#6b7280] text-xs mt-2">Original: {formatSize(originalSize)}</p>
              </div>

              <div className="card rounded-2xl p-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[#9ca3af] text-xs font-medium">Quality</label>
                    <span className="text-white text-xs font-mono">{quality}%</span>
                  </div>
                  <input type="range" min="10" max="100" value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full h-1 bg-[rgba(255,255,255,0.1)] rounded-full appearance-none cursor-pointer accent-[#6366f1]" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[#9ca3af] text-xs font-medium">Max Width</label>
                    <span className="text-white text-xs font-mono">{maxWidth}px</span>
                  </div>
                  <input type="range" min="320" max="3840" step="320" value={maxWidth}
                    onChange={(e) => setMaxWidth(Number(e.target.value))}
                    className="w-full h-1 bg-[rgba(255,255,255,0.1)] rounded-full appearance-none cursor-pointer accent-[#6366f1]" />
                </div>

                <button onClick={compress} disabled={isProcessing}
                  className="btn-primary w-full py-2.5 text-sm font-medium rounded-xl disabled:opacity-40">
                  {isProcessing ? 'Processing...' : 'Kompres Gambar'}
                </button>
              </div>

              {result && (
                <div className="card rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#9ca3af] text-xs">Compressed</span>
                    <span className="text-white text-xs font-mono">{formatSize(compressedSize)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#9ca3af] text-xs">Savings</span>
                    <span className={`text-xs font-bold ${savings > 0 ? 'text-[#4ade80]' : 'text-[#f87171]'}`}>
                      {savings > 0 ? `-${savings}%` : `${Math.abs(savings)}%`}
                    </span>
                  </div>
                  <button onClick={download}
                    className="btn-primary w-full py-2.5 text-sm font-medium rounded-xl">
                    Download Compressed
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
