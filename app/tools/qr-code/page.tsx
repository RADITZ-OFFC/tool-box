'use client';

import { useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';

export default function QrCodePage() {
  const [text, setText] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQR = async () => {
    if (!text.trim()) return;
    setIsGenerating(true);
    try {
      const dataUrl = await QRCode.toDataURL(text, {
        width: 256,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      });
      setQrUrl(dataUrl);
    } catch {
      alert('Gagal generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = 'qrcode.png';
    a.click();
  };

  const copyQR = async () => {
    if (!qrUrl) return;
    try {
      const res = await fetch(qrUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
    } catch {
      // Clipboard API not available or denied
    }
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
            <h1 className="text-white text-sm font-semibold">QR Code Generator</h1>
            <p className="text-[#6b7280] text-[10px]">Text/URL → QR Code</p>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <main className="space-y-4">
          <div className="card rounded-2xl p-4 space-y-4">
            <label className="text-[#9ca3af] text-xs font-medium">Masukkan teks atau URL</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="https://example.com atau teks apa saja..."
              className="input-clean w-full h-24 p-4 text-sm rounded-xl resize-none"
            />
            <button
              onClick={generateQR}
              disabled={!text.trim() || isGenerating}
              className="btn-primary w-full py-2.5 text-sm font-medium rounded-xl disabled:opacity-40"
            >
              {isGenerating ? 'Generating...' : 'Generate QR Code'}
            </button>
          </div>

          {qrUrl && (
            <div className="card rounded-2xl p-4 space-y-4">
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-xl">
                  <img src={qrUrl} alt="QR Code" className="w-48 h-48" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={downloadQR} className="btn-primary flex-1 py-2.5 text-sm font-medium rounded-xl">
                  Download PNG
                </button>
                <button onClick={copyQR} className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-[rgba(255,255,255,0.05)] text-[#9ca3af] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.08)] transition-colors">
                  Copy Image
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
