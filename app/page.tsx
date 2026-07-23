import Link from 'next/link';
import FaqSection from '@/components/FaqSection';

const tools = [
  { name: 'Video Downloader', desc: 'YouTube, TikTok, Instagram, Spotify', href: '/tools/video-downloader' },
  { name: 'Image Converter', desc: 'PNG, JPEG, WebP', href: '/tools/image-converter' },
  { name: 'Image to URL', desc: 'Upload & dapatkan link', href: '/tools/image-to-url' },
  { name: 'File to PDF', desc: 'Gambar, teks, HTML ke PDF', href: '/tools/file-to-pdf' },
  { name: 'QR Code', desc: 'Buat QR dari teks/URL', href: '/tools/qr-code' },
  { name: 'BG Remover', desc: 'Hapus latar gambar', href: '/tools/bg-remover' },
  { name: 'Image Compressor', desc: 'Kompres tanpa loss kualitas', href: '/tools/image-compressor' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Nav */}
      <nav className="border-b border-white/5 sticky top-0 z-10 bg-[#09090b]/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-5 h-12 flex items-center">
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

      {/* Hero — left-aligned, no gradient, no blobs */}
      <section className="max-w-3xl mx-auto px-5 pt-20 sm:pt-28 pb-16">
        <h1 className="text-white text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
          Download video.
          <br />
          Convert file.
          <br />
          <span className="text-zinc-500">Free.</span>
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg mt-5 max-w-lg leading-relaxed">
          YouTube, TikTok, Instagram, Spotify. Convert images, compress, create QR codes. All in your browser, no signup.
        </p>
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 mt-8 px-5 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-200 transition-colors"
        >
          Lihat Semua Tool
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </section>

      {/* Tools — simple list, no card grid */}
      <section className="max-w-3xl mx-auto px-5 pb-16">
        <div className="border-t border-white/5">
          {tools.map((tool, i) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="flex items-center justify-between py-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors -mx-5 px-5"
            >
              <div>
                <span className="text-white text-sm font-medium">{tool.name}</span>
                <span className="text-zinc-500 text-sm ml-3">{tool.desc}</span>
              </div>
              <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-5 pb-16">
        <h2 className="text-white text-sm font-medium mb-4">FAQ</h2>
        <FaqSection />
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
