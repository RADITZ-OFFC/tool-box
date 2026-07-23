import Link from 'next/link';

const tools = [
  {
    name: 'Video Downloader',
    description: '20+ platform — YouTube, TikTok, Instagram, X, Facebook, Reddit & more. Download tanpa watermark.',
    href: '/tools/video-downloader',
    accentClass: 'tools-accent-video',
    iconClass: 'tools-icon-video',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: 'Image Converter',
    description: 'Konversi PNG, JPEG, WebP langsung di browser — cepat, tanpa upload ke server.',
    href: '/tools/image-converter',
    accentClass: 'tools-accent-image',
    iconClass: 'tools-icon-image',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    name: 'Image to URL',
    description: 'Upload gambar dan dapatkan link shareable langsung.',
    href: '/tools/image-to-url',
    accentClass: 'tools-accent-image',
    iconClass: 'tools-icon-image',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.813a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.34 8.374" />
      </svg>
    ),
  },
  {
    name: 'File to PDF',
    description: 'Convert gambar, teks, dan HTML ke PDF langsung di browser.',
    href: '/tools/file-to-pdf',
    accentClass: 'tools-accent-file',
    iconClass: 'tools-icon-file',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    name: 'QR Code Generator',
    description: 'Buat QR code dari teks atau URL secara instan.',
    href: '/tools/qr-code',
    accentClass: 'tools-accent-qr',
    iconClass: 'tools-icon-qr',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
      </svg>
    ),
  },
  {
    name: 'Background Remover',
    description: 'Hapus latar belakang gambar secara otomatis.',
    href: '/tools/bg-remover',
    accentClass: 'tools-accent-bg',
    iconClass: 'tools-icon-bg',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    name: 'Image Compressor',
    description: 'Kompres gambar tanpa mengurangi kualitas secara signifikan.',
    href: '/tools/image-compressor',
    accentClass: 'tools-accent-compress',
    iconClass: 'tools-icon-compress',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5-6L16.5 19m0 0L12 14.5m4.5 4.5V7.5" />
      </svg>
    ),
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-[rgba(255,255,255,0.06)] bg-[rgba(3,0,20,0.8)] backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <Link href="/" className="text-[#6b7280] hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <Link href="/" className="flex items-center gap-3">
            <img
              src="https://cdn.phototourl.com/free/2026-07-13-d218457a-17e3-4daf-ab30-053cd0059d1d.jpg"
              alt="Profile"
              className="logo-img"
            />
            <span className="text-white font-semibold text-sm tracking-tight">ToolBox</span>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="tools-hero relative overflow-hidden">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="grid-overlay" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8 sm:pb-10 relative text-center">
          <div className="feature-pill mb-4 mx-auto anim-fade-up">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.66-5.66a8 8 0 1111.31 0l-5.66 5.66z" />
            </svg>
            Gratis &bull; Tanpa Login
          </div>
          <h1 className="tools-hero-title anim-fade-up delay-1">Semua Tool</h1>
          <p className="tools-hero-subtitle anim-fade-up delay-2">Pilih tool yang kamu butuhkan. Semua gratis, tanpa login.</p>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-10 sm:pb-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tools.map((tool, i) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="card group block rounded-2xl p-5 sm:p-6 tools-card-hover anim-fade-up"
              style={{ animationDelay: `${0.1 + i * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200 ${tool.iconClass}`}>
                  {tool.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white text-sm font-semibold">{tool.name}</h3>
                  <p className="text-[#9ca3af] text-xs mt-1.5 leading-relaxed">{tool.description}</p>
                </div>
                <svg className="w-4 h-4 text-[rgba(255,255,255,0.2)] mt-1.5 flex-shrink-0 group-hover:text-[#818cf8] transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div className={`tools-card-accent ${tool.accentClass}`} />
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5">
          <p className="text-[#6b7280] text-xs text-center">ToolBox &mdash; Free tools for everyone</p>
        </div>
      </footer>
    </div>
  );
}
