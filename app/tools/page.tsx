import Link from 'next/link';

const tools = [
  { name: 'Video Downloader', desc: 'YouTube, TikTok, Instagram, Spotify', href: '/tools/video-downloader', color: '#22c55e' },
  { name: 'Image Converter', desc: 'PNG, JPEG, WebP', href: '/tools/image-converter', color: '#a855f7' },
  { name: 'Image to URL', desc: 'Upload & dapatkan link', href: '/tools/image-to-url', color: '#a855f7' },
  { name: 'File to PDF', desc: 'Gambar, teks, HTML ke PDF', href: '/tools/file-to-pdf', color: '#3b82f6' },
  { name: 'QR Code', desc: 'Buat QR dari teks/URL', href: '/tools/qr-code', color: '#22c55e' },
  { name: 'BG Remover', desc: 'Hapus latar gambar', href: '/tools/bg-remover', color: '#f43f5e' },
  { name: 'Image Compressor', desc: 'Kompres tanpa loss kualitas', href: '/tools/image-compressor', color: '#fb923c' },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Nav */}
      <nav className="border-b border-white/5 sticky top-0 z-10 bg-[#09090b]/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-5 h-12 flex items-center gap-4">
          <Link href="/" className="text-zinc-500 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6v6m4.5-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-white font-medium text-sm">ToolBox</span>
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-3xl mx-auto px-5 pt-10 pb-6">
        <h1 className="text-white text-2xl font-bold tracking-tight">Semua Tool</h1>
        <p className="text-zinc-500 text-sm mt-1">Gratis, tanpa login.</p>
      </div>

      {/* Tools List */}
      <section className="max-w-3xl mx-auto px-5 pb-16">
        <div className="border-t border-white/5">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="flex items-center gap-4 py-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors -mx-5 px-5"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${tool.color}15`, color: tool.color }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6v6m4.5-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-white text-sm font-medium">{tool.name}</span>
                <span className="text-zinc-500 text-sm ml-2">{tool.desc}</span>
              </div>
              <svg className="w-4 h-4 text-zinc-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="max-w-3xl mx-auto px-5 py-6">
          <p className="text-zinc-600 text-xs">ToolBox — Built with Next.js</p>
        </div>
      </footer>
    </div>
  );
}
