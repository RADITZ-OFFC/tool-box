'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';

export default function BgRemoverPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [tolerance, setTolerance] = useState(30);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    setFileName(file.name.replace(/\.[^.]+$/, ''));
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const removeBackground = async () => {
    if (!preview) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.src = preview;
      await new Promise(r => { img.onload = r; });

      const canvas = canvasRef.current!;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Sample corner pixels to detect background color
      const corners = [
        [0, 0], [canvas.width - 1, 0],
        [0, canvas.height - 1], [canvas.width - 1, canvas.height - 1]
      ];
      let bgR = 0, bgG = 0, bgB = 0;
      for (const [x, y] of corners) {
        const i = (y * canvas.width + x) * 4;
        bgR += data[i]; bgG += data[i + 1]; bgB += data[i + 2];
      }
      bgR = Math.round(bgR / 4);
      bgG = Math.round(bgG / 4);
      bgB = Math.round(bgB / 4);

      // Remove pixels matching background color
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
        if (dist < tolerance * 2.55) {
          data[i + 3] = 0; // Set alpha to 0 (transparent)
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setResult(canvas.toDataURL('image/png'));
    } catch {
      alert('Gagal memproses gambar');
    } finally {
      setIsProcessing(false);
    }
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result;
    a.download = `${fileName || 'no-bg'}.png`;
    a.click();
  };

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
            <h1 className="text-white text-sm font-semibold">Background Remover</h1>
            <p className="text-[#6b7280] text-[10px]">Hapus latar belakang gambar</p>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <main className="space-y-4">
          <canvas ref={canvasRef} className="hidden" />

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
                  <p className="text-white text-sm font-medium">Preview</p>
                  <button onClick={() => { setPreview(null); setResult(null); }}
                    className="text-xs text-[#f87171] hover:underline">Ganti gambar</button>
                </div>
                <div className="rounded-xl overflow-hidden bg-[rgba(255,255,255,0.03)] p-2">
                  <img src={result || preview} alt="Preview" className="w-full rounded-lg"
                    style={result ? { background: 'repeating-conic-gradient(rgba(255,255,255,0.1) 0% 25%, transparent 0% 50%) 50% / 16px 16px' } : {}} />
                </div>
              </div>

              <div className="card rounded-2xl p-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[#9ca3af] text-xs font-medium">Tolerance</label>
                    <span className="text-white text-xs font-mono">{tolerance}%</span>
                  </div>
                  <input type="range" min="5" max="80" value={tolerance}
                    onChange={(e) => setTolerance(Number(e.target.value))}
                    className="w-full h-1 bg-[rgba(255,255,255,0.1)] rounded-full appearance-none cursor-pointer accent-[#6366f1]" />
                  <p className="text-[#6b7280] text-[10px] mt-1">Semakin tinggi = semakin banyak warna yang dihapus</p>
                </div>
                <button onClick={removeBackground} disabled={isProcessing}
                  className="btn-primary w-full py-2.5 text-sm font-medium rounded-xl disabled:opacity-40">
                  {isProcessing ? 'Processing...' : 'Hapus Background'}
                </button>
              </div>

              {result && (
                <div className="card rounded-2xl p-4">
                  <button onClick={download}
                    className="btn-primary w-full py-2.5 text-sm font-medium rounded-xl">
                    Download PNG (Transparent)
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
