import Link from 'next/link';
import FaqSection from '@/components/FaqSection';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-[rgba(255,255,255,0.06)] bg-[rgba(3,0,20,0.8)] backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center">
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
      <section className="relative overflow-hidden hero-gradient">
        {/* Background blobs */}
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        {/* Grid overlay */}
        <div className="grid-overlay" />

        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-10 sm:pb-14 relative text-center">
          <div className="feature-pill mb-4 mx-auto anim-fade-up">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
            </svg>
            Cepat &bull; Tanpa Ribet
          </div>

          <h1 className="hero-title-unique font-extrabold text-white anim-fade-up delay-1">
            Satu tempat untuk
            <br />
            semua alat digital Anda.
          </h1>
          <p className="hero-subtitle anim-fade-up delay-2">
            Unduh video, konversi gambar, dan kelola file dengan cepat &mdash; langsung di browser, tanpa iklan mengganggu.
          </p>

          <div className="mt-6 anim-fade-up delay-3">
            <Link href="/tools" className="btn-hero inline-flex items-center gap-2 text-sm">
              Coba Sekarang
              <svg className="w-4 h-4 cta-arrow" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <h2 className="text-white text-lg font-semibold mb-5">Pertanyaan Umum</h2>
        <FaqSection />
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
