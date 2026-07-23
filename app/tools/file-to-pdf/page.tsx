'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type TabMode = 'images' | 'text' | 'html';

interface ImageItem {
  file: File;
  preview: string;
}

export default function FileToPdfPage() {
  const [activeTab, setActiveTab] = useState<TabMode>('images');
  const [isConverting, setIsConverting] = useState(false);

  // Images state
  const [imageFiles, setImageFiles] = useState<ImageItem[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Text state
  const [textContent, setTextContent] = useState('');
  const [textFontSize, setTextFontSize] = useState(12);
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
  const fontDropdownRef = useRef<HTMLDivElement>(null);

  // HTML state
  const [htmlContent, setHtmlContent] = useState('');
  const htmlPreviewRef = useRef<HTMLDivElement>(null);

  // Click outside to close font dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(e.target as Node)) {
        setFontDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Images handlers
  const MAX_IMAGES = 50;

  const addImageFiles = useCallback((files: File[]) => {
    const newItems = files.slice(0, MAX_IMAGES).map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImageFiles(prev => [...prev, ...newItems].slice(0, MAX_IMAGES));
  }, []);

  const handleImageDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    addImageFiles(files);
  }, [addImageFiles]);

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addImageFiles(files);
  }, [addImageFiles]);

  const removeImage = (index: number) => {
    setImageFiles(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });

  const loadImageToCanvas = (src: string): Promise<{ canvas: HTMLCanvasElement; width: number; height: number }> =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        resolve({ canvas, width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = src;
    });

  // Convert handlers
  const handleImagesToPDF = async () => {
    if (imageFiles.length === 0) return;
    setIsConverting(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      for (let i = 0; i < imageFiles.length; i++) {
        const dataUrl = await readFileAsDataUrl(imageFiles[i].file);
        const { canvas, width, height } = await loadImageToCanvas(dataUrl);

        // Create custom page matching image aspect ratio
        const pxToMm = 0.264583;
        const imgWmm = width * pxToMm;
        const imgHmm = height * pxToMm;

        // Scale to fit A4 if larger
        const maxW = 210;
        const maxH = 297;
        const scale = Math.min(maxW / imgWmm, maxH / imgHmm, 1);
        const finalW = imgWmm * scale;
        const finalH = imgHmm * scale;

        // Create new page with correct dimensions
        if (i > 0) {
          pdf.addPage([finalW, finalH], 'portrait');
        } else {
          pdf.internal.pageSize.width = finalW;
          pdf.internal.pageSize.height = finalH;
        }

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, 0, finalW, finalH, undefined, 'FAST');
      }
      const pdfName = imageFiles.length > 0 ? imageFiles[0].file.name.replace(/\.[^.]+$/, '') : 'images';
      pdf.save(`${pdfName}.pdf`);
    } catch {
      alert('Gagal convert gambar ke PDF');
    } finally {
      setIsConverting(false);
    }
  };

  const handleTextToPDF = () => {
    if (!textContent.trim()) return;
    setIsConverting(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(textFontSize);
      const lines = pdf.splitTextToSize(textContent, 180);
      let y = 20;
      for (const line of lines) {
        if (y > 270) { pdf.addPage(); y = 20; }
        pdf.text(line, 15, y);
        y += textFontSize * 0.38;
      }
      const textName = textContent.slice(0, 20).replace(/[<>:"/\\|?*]/g, '_').trim() || 'text';
      pdf.save(`${textName}.pdf`);
    } catch {
      alert('Gagal convert teks ke PDF');
    } finally {
      setIsConverting(false);
    }
  };

  const handleHTMLToPDF = async () => {
    if (!htmlContent.trim() || !htmlPreviewRef.current) return;
    setIsConverting(true);
    try {
      const canvas = await html2canvas(htmlPreviewRef.current, { backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`html.pdf`);
    } catch {
      alert('Gagal convert HTML ke PDF');
    } finally {
      setIsConverting(false);
    }
  };

  const tabs: { key: TabMode; label: string; icon: React.ReactNode }[] = [
    {
      key: 'images',
      label: 'Images',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      key: 'text',
      label: 'Text',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      ),
    },
    {
      key: 'html',
      label: 'HTML',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
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
            <h1 className="text-white text-sm font-semibold">File to PDF</h1>
            <p className="text-[#6b7280] text-[10px]">Convert files to PDF</p>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <main className="space-y-4">
          {/* Tab Buttons */}
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                    : 'bg-[rgba(255,255,255,0.05)] text-[#9ca3af] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.08)]'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Images Tab */}
          {activeTab === 'images' && (
            <div className="space-y-4">
              {/* Drop Zone */}
              <div
                onDrop={handleImageDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => imageInputRef.current?.click()}
                className="card rounded-2xl p-8 text-center cursor-pointer border-dashed border-2 border-[rgba(255,255,255,0.1)] hover:border-[#6366f1]/30 transition-colors"
              >
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageSelect}
                />
                <svg className="w-10 h-10 mx-auto text-[#6b7280] mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-[#d1d5db] text-sm">Drop gambar di sini atau klik untuk upload</p>
                <p className="text-[#6b7280] text-xs mt-1">JPG, PNG, WEBP, BMP — bisa multiple</p>
              </div>

              {/* Image Preview Grid */}
              {imageFiles.length > 0 && (
                <div className="card rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white text-sm font-medium">{imageFiles.length} gambar dipilih</p>
                    <button
                      onClick={() => { imageFiles.forEach(i => URL.revokeObjectURL(i.preview)); setImageFiles([]); }}
                      className="text-xs text-[#f87171] hover:underline"
                    >
                      Hapus semua
                    </button>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {imageFiles.map((item, i) => (
                      <div key={i} className="relative group">
                        <img src={item.preview} alt="" className="w-full h-20 object-cover rounded-lg" />
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          ×
                        </button>
                        <p className="text-[10px] text-[#6b7280] truncate mt-1">{item.file.name}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleImagesToPDF}
                    disabled={isConverting}
                    className="btn-primary w-full mt-4 py-2.5 text-sm font-medium rounded-xl disabled:opacity-40"
                  >
                    {isConverting ? 'Converting...' : 'Convert to PDF'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Text Tab */}
          {activeTab === 'text' && (
            <div className="space-y-4">
              <div className="card rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[#9ca3af] text-xs font-medium">Font Size</label>
                  <div className="relative" ref={fontDropdownRef}>
                    <button
                      onClick={() => setFontDropdownOpen(!fontDropdownOpen)}
                      className="flex items-center gap-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white text-sm font-medium px-4 py-2 rounded-xl hover:border-[rgba(255,255,255,0.2)] transition-colors"
                    >
                      {textFontSize}px
                      <svg className={`w-3.5 h-3.5 text-[#6b7280] transition-transform ${fontDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {fontDropdownOpen && (
                      <div className="absolute right-0 top-full mt-1 w-20 bg-[#1a1a2e] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-lg overflow-hidden z-50">
                        {[10, 12, 14, 16, 18, 20].map(s => (
                          <button
                            key={s}
                            onClick={() => { setTextFontSize(s); setFontDropdownOpen(false); }}
                            className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                              textFontSize === s
                                ? 'bg-[#6366f1] text-white'
                                : 'text-[#d1d5db] hover:bg-[rgba(255,255,255,0.05)]'
                            }`}
                          >
                            {s}px
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Ketik atau paste teks di sini..."
                  className="input-clean w-full h-48 p-4 text-sm rounded-xl resize-none"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[#6b7280] text-xs">{textContent.length} karakter</span>
                  <button
                    onClick={handleTextToPDF}
                    disabled={!textContent.trim() || isConverting}
                    className="btn-primary px-6 py-2.5 text-sm font-medium rounded-xl disabled:opacity-40"
                  >
                    {isConverting ? 'Converting...' : 'Convert to PDF'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* HTML Tab */}
          {activeTab === 'html' && (
            <div className="space-y-4">
              <div className="card rounded-2xl p-4 space-y-4">
                <label className="text-[#9ca3af] text-xs font-medium">HTML Code</label>
                <textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  placeholder='<h1>Hello World</h1>&#10;<p>This is a paragraph.</p>'
                  className="input-clean w-full h-40 p-4 text-sm rounded-xl resize-none font-mono"
                />
                <button
                  onClick={handleHTMLToPDF}
                  disabled={!htmlContent.trim() || isConverting}
                  className="btn-primary w-full py-2.5 text-sm font-medium rounded-xl disabled:opacity-40"
                >
                  {isConverting ? 'Converting...' : 'Convert to PDF'}
                </button>
              </div>

              {/* Live Preview */}
              {htmlContent.trim() && (
                <div className="card rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[#9ca3af] text-xs font-medium">Preview</p>
                    <span className="text-[10px] text-[#f87171]">HTML langsung dirender — jangan paste kode berbahaya</span>
                  </div>
                  <div
                    ref={htmlPreviewRef}
                    className="bg-white text-black p-4 rounded-xl text-sm"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                  />
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
