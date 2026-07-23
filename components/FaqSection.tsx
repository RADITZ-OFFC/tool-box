"use client";

import { useState } from 'react';

const faqData = [
  {
    q: 'Apa itu ToolBox?',
    a: 'ToolBox adalah kumpulan alat kecil (video downloader, image converter, dll) yang berjalan di browser atau server lokal untuk menjaga privasi dan kecepatan.',
  },
  {
    q: 'Apakah data saya diupload ke server pihak ketiga?',
    a: 'Tidak, sebagian besar proses dilakukan di browser. Untuk fitur yang memerlukan server, kami menggunakan server internal dan tidak membagikan file ke pihak ketiga.',
  },
  {
    q: 'Apakah saya perlu login?',
    a: 'Tidak. Anda bisa menggunakan alat tanpa mendaftar atau membuat akun.',
  },
  {
    q: 'Apakah penggunaan ini legal?',
    a: 'Gunakan alat sesuai hukum setempat dan kebijakan platform. Kami tidak mendorong pelanggaran hak cipta.',
  },
  {
    q: 'Bagaimana cara pakai ToolBox?',
    a: 'Pilih tool yang diinginkan, masukkan data (file atau URL), lalu hasilnya siap digunakan. Tidak perlu login atau instalasi.',
  },
];

export default function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="faq">
      {faqData.map((f, i) => (
        <div key={i} className={`faq-item ${openFaq === i ? 'faq-open' : ''}`}>
          <div className="faq-question">
            <div className="faq-qtext">{f.q}</div>
            <button
              aria-expanded={openFaq === i}
              aria-controls={`faq-${i}`}
              className="faq-toggle"
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <svg className="faq-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
          <div id={`faq-${i}`} className="faq-answer" role="region">
            <div style={{ padding: '0 16px' }}>{f.a}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
