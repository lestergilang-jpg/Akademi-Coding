'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api from '@/lib/api';
import {
  FiArrowRight, FiStar, FiCheck, FiLock, FiPlay,
  FiZap, FiBriefcase, FiUsers, FiAward, FiChevronDown,
  FiCode, FiGlobe, FiTrendingUp, FiGift,
} from 'react-icons/fi';

// ─── DATA ─────────────────────────────────────────────────────────────────────

const testimonials = [
  { name: 'Aldi Firmansyah', role: 'Fresh Graduate → Frontend Dev', avatar: 'AF', stars: 5, text: 'Gila banget, dari ga tau HTML sama sekali, sekarang udah kerja di startup Jaksel dengan gaji 8jt. Kurikulum di sini beneran step by step, ga loncat-loncat.' },
  { name: 'Sari Dewi', role: 'Ibu Rumah Tangga → Freelancer', avatar: 'SD', stars: 5, text: 'Belajar sambil ngurusin anak, alhamdulillah bisa. Sekarang freelance develop website UMKM, per project 3-5 jt. Worth banget investasinya!' },
  { name: 'Rizky Pratama', role: 'Karyawan Pabrik → Web Dev', avatar: 'RP', stars: 5, text: 'Gue kerja shift, belajar malam hari 1-2 jam. 6 bulan kemudian resign dan dapet kerja remote. Income naik 3x lipat dari sebelumnya.' },
  { name: 'Maya Sari', role: 'Mahasiswa → Freelancer', avatar: 'MS', stars: 5, text: 'Semester 3 udah bisa dapet side income dari freelance. Temen-temen heran kok bisa. Rahasianya ya belajar di AkademiCoding!' },
  { name: 'Budi Santoso', role: 'Guru → Full Stack Dev', avatar: 'BS', stars: 5, text: 'Usia 35 belajar coding, banyak yang bilang udah telat. Buktinya sekarang jadi full stack developer. Umur bukan alasan!' },
  { name: 'Tika Amalia', role: 'Admin Toko → UI Developer', avatar: 'TA', stars: 5, text: 'Mentor supportnya TOP BGT. Tiap ada yang ga ngerti langsung dibantu. Ga pernah ngerasa sendirian belajarnya.' },
];

const curriculum = [
  { phase: '01', title: 'HTML & CSS Fundamentals', duration: '2 Minggu', topics: ['Struktur HTML5', 'CSS Styling & Selectors', 'Flexbox & Grid Layout', 'Responsive Design', 'CSS Animations'], color: 'from-blue-500 to-cyan-500' },
  { phase: '02', title: 'JavaScript Core', duration: '3 Minggu', topics: ['Variables, Types & Operators', 'Functions & Scope', 'DOM Manipulation', 'Events & Async JS', 'ES6+ Modern Syntax'], color: 'from-yellow-500 to-orange-500' },
  { phase: '03', title: 'React.js', duration: '3 Minggu', topics: ['Components & JSX', 'Props & State', 'Hooks (useState, useEffect)', 'React Router', 'API Integration'], color: 'from-cyan-500 to-blue-500' },
  { phase: '04', title: 'Backend Node.js', duration: '3 Minggu', topics: ['Node.js & Express', 'REST API Design', 'MySQL Database', 'Authentication JWT', 'File Upload & Security'], color: 'from-green-500 to-emerald-500' },
  { phase: '05', title: 'Project Real-World', duration: '2 Minggu', topics: ['Full-Stack E-Commerce', 'Deploy ke VPS/Vercel', 'Git & Collaboration', 'Portfolio Building', 'Job Interview Tips'], color: 'from-brand-500 to-accent-500' },
];

const benefits = [
  { icon: FiGlobe, title: 'Bisa Bikin Website Sendiri', desc: 'Dari landing page, toko online, sampai web app kompleks — semua bisa kamu buat sendiri.' },
  { icon: FiBriefcase, title: 'Peluang Freelance', desc: 'Rate freelance web developer mulai 2-15 juta per project. Modal laptop + skill = duit.' },
  { icon: FiTrendingUp, title: 'Siap Kerja Remote', desc: 'Demand developer di Indonesia terus naik. Kerja dari mana aja, bayaran kompetitif.' },
  { icon: FiAward, title: 'Sertifikat Kompetensi', desc: 'Sertifikat resmi yang bisa kamu cantumkan di LinkedIn dan portofolio profesional.' },
  { icon: FiUsers, title: 'Komunitas Alumni', desc: 'Bergabung dengan 2000+ alumni yang saling support, sharing job, dan project bareng.' },
  { icon: FiZap, title: 'Update Kurikulum', desc: 'Kurikulum selalu update mengikuti tren industri. Beli sekali, belajar seumur hidup.' },
];

const bonuses = [
  { icon: FiCode, title: '10+ Template Project', desc: 'Template siap pakai untuk portfolio dan client. Hemat waktu, langsung cuan.', value: 'Nilai: Rp 500.000' },
  { icon: FiUsers, title: 'Grup Komunitas Eksklusif', desc: 'Discord & WhatsApp group dengan mentor dan alumni aktif. Tanya apa aja, pasti dibantu.', value: 'Nilai: Gratis selamanya' },
  { icon: FiAward, title: '1-on-1 Mentor Session', desc: '2 sesi konsultasi langsung dengan mentor berpengalaman via Google Meet.', value: 'Nilai: Rp 300.000' },
];

const faqs = [
  { q: 'Apakah cocok untuk pemula banget?', a: 'Sangat cocok! Kita mulai dari nol. Bahkan kalo kamu belum pernah nulis satu baris kode pun, kamu akan bisa mengikuti materi ini dengan baik.' },
  { q: 'Berapa lama waktu belajarnya?', a: 'Kurikulum dirancang untuk 3-4 bulan jika belajar 1-2 jam per hari. Tapi kamu punya akses seumur hidup, jadi tidak ada deadline.' },
  { q: 'Ada sertifikat setelah selesai?', a: 'Ya! Kamu akan mendapatkan sertifikat penyelesaian yang bisa digunakan untuk melamar kerja atau menunjukkan skill kamu ke klien.' },
  { q: 'Bisa belajar sambil kerja atau kuliah?', a: 'Bisa banget. Semua materi bisa diakses kapan saja dan dimana saja. Banyak alumni kami yang belajar sambil kerja atau kuliah.' },
  { q: 'Bagaimana jika tidak mengerti materi?', a: 'Kamu bisa tanya di grup komunitas, sesi Q&A mingguan, atau manfaatkan 2 sesi 1-on-1 mentor yang sudah termasuk dalam paket.' },
  { q: 'Metode pembayaran apa saja?', a: 'Transfer bank (BCA, Mandiri, BNI, BRI), QRIS, GoPay, OVO, ShopeePay, dan kartu kredit. Semua aman via Midtrans.' },
];

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function StarRating({ count = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <FiStar key={i} className="text-yellow-400 fill-yellow-400" size={14} />
      ))}
    </div>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left">
        <span className="font-semibold text-white">{q}</span>
        <FiChevronDown className={`text-brand-400 transition-transform duration-300 flex-shrink-0 ml-4 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-5 pb-5 text-slate-400 leading-relaxed border-t border-white/5 pt-4">{a}</div>}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [landingData, setLandingData] = useState(null);

  useEffect(() => {
    api.get('/settings/landing_page')
      .then(({ data }) => {
        if (data.data) setLandingData(data.data);
      })
      .catch(() => console.log('Using default landing page data'));
  }, []);

  const heroData = landingData?.hero || {
    title: 'Dari Nol Jadi Web Developer Dalam 4 Bulan',
    subtitle: 'Kuasai JavaScript Full-Stack dan dapatkan skill yang dicari perusahaan tech. Cocok untuk pemula, siap kerja & freelance. Belajar sambil praktek project nyata.',
    video_url: '',
    image_url: ''
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] overflow-x-hidden">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/20 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-900/30 rounded-full blur-[160px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-sm font-medium mb-8 animate-fade-in">
            <FiZap className="text-yellow-400" size={14} />
            🔥 {landingData?.registration_status || 'Pendaftaran Batch 7 — Slot terbatas 50 orang!'}
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-tight mb-6 animate-fade-up">
            {heroData.title.split('Web Developer').length > 1 ? (
              <>
                {heroData.title.split('Web Developer')[0]}
                <span className="text-gradient">Web Developer</span>
                {heroData.title.split('Web Developer')[1]}
              </>
            ) : heroData.title}
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Kuasai JavaScript Full-Stack dan dapatkan skill yang dicari perusahaan tech.
            Cocok untuk pemula, siap kerja & freelance. Belajar sambil praktek project nyata.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <Link href="/register" className="btn-primary text-lg px-8 py-4 glow">
              Daftar Sekarang <FiArrowRight />
            </Link>
            <a href="#curriculum" className="btn-outline text-lg px-8 py-4">
              <FiPlay size={16} /> Lihat Kurikulum
            </a>
          </div>

          {/* Social proof mini */}
          <div className="flex flex-wrap gap-6 justify-center mt-12 text-sm text-slate-400 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            {[['2.000+','Alumni'],['4.9/5','Rating'],['95%','Lulus & Kerja']].map(([num, label]) => (
              <div key={label} className="flex flex-col items-center">
                <span className="text-2xl font-bold text-white">{num}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* Hero Media (Video / Image / Mockup) */}
          <div className="mt-16 relative max-w-4xl mx-auto animate-float">
            <div className="glass-card p-4 rounded-2xl glow bg-white/5 border border-white/10">
              <div className="bg-[#13131f] rounded-xl overflow-hidden shadow-2xl">
                {heroData.video_url ? (
                  <div className="aspect-video w-full">
                    <iframe 
                      src={heroData.video_url} 
                      className="w-full h-full border-0" 
                      allowFullScreen 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                ) : heroData.image_url ? (
                  <img src={heroData.image_url} alt="Hero" className="w-full h-auto object-cover max-h-[500px]" />
                ) : (
                  <>
                    <div className="bg-[#1a1a2e] px-4 py-3 flex items-center gap-2 border-b border-white/5">
                      <div className="flex gap-1.5">{['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />)}</div>
                      <span className="text-slate-500 text-xs ml-2">dashboard.akademicoding.com</span>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        {[['Materi Selesai','8/16','text-brand-400'],['Streak Belajar','12 Hari','text-yellow-400'],['Progress','50%','text-green-400']].map(([l,v,c]) => (
                          <div key={l} className="bg-white/5 rounded-xl p-4 text-center">
                            <div className={`text-2xl font-bold ${c}`}>{v}</div>
                            <div className="text-slate-500 text-xs mt-1">{l}</div>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2 text-left">
                        {['HTML & CSS Fundamentals ✅','JavaScript Core ✅','React.js 🔓','Backend Node.js 🔒','Project Real-World 🔒'].map((item, i) => (
                          <div key={i} className={`flex items-center gap-3 p-3 rounded-lg text-sm ${i < 2 ? 'bg-brand-500/10 text-brand-300' : i === 2 ? 'bg-white/5 text-white' : 'bg-white/3 text-slate-600'}`}>
                            <FiPlay size={12} /> {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ──────────────────────────────────────────── */}
      <section className="py-16 border-y border-white/5 bg-white/2" id="testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="badge mb-4">❤️ Disukai Alumni</span>
            <h2 className="section-title">Mereka yang Sudah Berhasil</h2>
            <p className="section-subtitle">2.000+ alumni telah membuktikan. Sekarang giliran kamu.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="glass-card p-6 hover:border-brand-500/40 transition-all duration-300 hover:-translate-y-1">
                <StarRating count={t.stars} />
                <p className="text-slate-300 mt-3 mb-4 leading-relaxed text-sm">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">{t.avatar}</div>
                  <div>
                    <div className="text-white font-semibold text-sm">{t.name}</div>
                    <div className="text-slate-500 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM ───────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="badge mb-4">😩 Masalah Yang Sering Dialami</span>
          <h2 className="section-title mb-4">Pernah Ngerasain Ini?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10 text-left">
            {[
              'Nonton tutorial YouTube tapi tetap bingung',
              'Beli buku tapi males baca, akhirnya numpuk',
              'Kursus online yang loncat-loncat, ga ada urutan jelas',
              'Ga ada yang bisa ditanya kalau stuck',
              'Sudah coba belajar sendiri tapi cepat menyerah',
              'Takut dianggap terlambat untuk mulai coding',
            ].map((problem, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                <span className="text-red-400 mt-0.5 flex-shrink-0">✗</span>
                <span className="text-slate-300">{problem}</span>
              </div>
            ))}
          </div>
          <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-brand-500/10 to-accent-500/10 border border-brand-500/20">
            <p className="text-xl text-white font-semibold">Kalau kamu relate dengan salah satu di atas... kamu datang ke tempat yang tepat. 🎯</p>
          </div>
        </div>
      </section>

      {/* ── SOLUTION ──────────────────────────────────────────────── */}
      <section className="py-24 bg-white/2">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="badge mb-4">💡 Solusi Kami</span>
              <h2 className="section-title mb-4">Belajar yang Beneran Bikin Bisa</h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                AkademiCoding bukan sekedar kursus biasa. Kami merancang <strong className="text-white">learning path yang terstruktur</strong> dari nol sampai bisa kerja, dengan pendekatan <strong className="text-white">project-based learning</strong> yang langsung praktek.
              </p>
              <div className="space-y-4">
                {[
                  ['Kurikulum Terstruktur', 'Materi diurutkan dari yang paling dasar, ga ada yang kelewat'],
                  ['Project Nyata', 'Setiap modul diakhiri dengan project yang masuk portfolio'],
                  ['Mentor Support', 'Ada mentor yang siap membantu kapanpun kamu stuck'],
                  ['Komunitas Aktif', 'Belajar bareng ribuan teman sekelas yang saling support'],
                ].map(([title, desc]) => (
                  <div key={title} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FiCheck size={12} className="text-white" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">{title}</div>
                      <div className="text-slate-400 text-sm">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="glass-card p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                    <FiCode size={24} className="text-white" />
                  </div>
                  <div>
                    <div className="text-white font-bold">JavaScript Full-Stack Bootcamp</div>
                    <div className="text-slate-400 text-sm">4 Bulan · 16 Modul · 100+ Jam Konten</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[['16','Modul Belajar'],['100+','Jam Konten'],['10+','Project Nyata'],['Lifetime','Akses']].map(([v, l]) => (
                    <div key={l} className="bg-white/5 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-gradient">{v}</div>
                      <div className="text-slate-400 text-xs mt-1">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-brand-500/20 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ── CURRICULUM ────────────────────────────────────────────── */}
      <section className="py-24" id="curriculum">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="badge mb-4">📚 Kurikulum</span>
            <h2 className="section-title">Roadmap Belajar Kamu</h2>
            <p className="section-subtitle">Dari HTML pertama sampai deploy project real. Step by step, no skip.</p>
          </div>
          <div className="space-y-4">
            {curriculum.map((phase, i) => (
              <div key={i} className="glass-card p-6 hover:border-brand-500/30 transition-all duration-300 group">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${phase.color} flex items-center justify-center text-white font-black text-sm flex-shrink-0`}>
                    {phase.phase}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h3 className="text-white font-bold text-lg">{phase.title}</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-slate-400">{phase.duration}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {phase.topics.map(topic => (
                        <span key={topic} className="flex items-center gap-1 text-sm text-slate-400 bg-white/5 px-3 py-1 rounded-full">
                          <FiCheck size={10} className="text-green-400" /> {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS ──────────────────────────────────────────────── */}
      <section className="py-24 bg-white/2">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="badge mb-4">🚀 Yang Kamu Dapat</span>
            <h2 className="section-title">Investasi yang Mengubah Hidupmu</h2>
            <p className="section-subtitle">Skill yang kamu pelajari langsung bisa dimonetisasi.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <div key={i} className="glass-card p-6 hover:border-brand-500/30 transition-all duration-300 hover:-translate-y-1 group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500/20 to-accent-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <b.icon size={22} className="text-brand-400" />
                </div>
                <h3 className="text-white font-bold mb-2">{b.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BONUS ─────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="badge mb-4"><FiGift size={12} /> Bonus Eksklusif</span>
            <h2 className="section-title">Bonus Senilai Rp 800.000+</h2>
            <p className="section-subtitle">Gratis kalau daftar sekarang!</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bonuses.map((b, i) => (
              <div key={i} className="glass-card p-6 text-center border-brand-500/20 hover:border-brand-500/50 transition-all duration-300">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center mb-4">
                  <b.icon size={24} className="text-white" />
                </div>
                <h3 className="text-white font-bold mb-2">{b.title}</h3>
                <p className="text-slate-400 text-sm mb-3 leading-relaxed">{b.desc}</p>
                <span className="text-brand-400 text-xs font-semibold">{b.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────── */}
      <section className="py-24 bg-white/2" id="pricing">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="badge mb-4">💰 Harga</span>
            <h2 className="section-title">Investasi Karier Kamu</h2>
            <p className="section-subtitle">Satu kali bayar, akses seumur hidup.</p>
          </div>
          <div className="glass-card p-8 border-brand-500/40 glow relative overflow-hidden">
            {/* Popular badge */}
            <div className="absolute -right-8 top-6 bg-gradient-to-r from-brand-500 to-accent-500 text-white text-xs font-bold px-10 py-1 rotate-45">
              TERLARIS
            </div>
            <div className="text-center mb-8">
              <div className="text-slate-500 line-through text-lg mb-1">Rp 999.000</div>
              <div className="text-5xl font-black text-white">Rp 299.000</div>
              <div className="mt-2 inline-block px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">Hemat 70% 🔥</div>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                '✅ Akses semua 16 modul (lifetime)',
                '✅ 100+ jam video berkualitas HD',
                '✅ 10+ project portfolio nyata',
                '✅ Sertifikat penyelesaian resmi',
                '✅ Bonus 10+ template project',
                '✅ Akses grup komunitas eksklusif',
                '✅ 2x sesi 1-on-1 mentor',
                '✅ Kurikulum update selamanya',
              ].map(item => (
                <li key={item} className="text-slate-300 text-sm">{item}</li>
              ))}
            </ul>
            <Link href="/register" className="btn-primary w-full justify-center text-lg py-4">
              Daftar & Bayar Sekarang <FiArrowRight />
            </Link>
            <p className="text-center text-slate-500 text-xs mt-4">🔒 Pembayaran aman via Midtrans · Semua metode payment tersedia</p>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section className="py-24" id="faq">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="badge mb-4">❓ FAQ</span>
            <h2 className="section-title">Pertanyaan Umum</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f, i) => <FAQItem key={i} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-900/40 via-black to-brand-900/40" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-brand-600/20 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="text-4xl mb-4">⏰</div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Jangan Tunda Lagi
          </h2>
          <p className="text-slate-400 text-lg mb-3">
            Setiap hari yang kamu tunda = satu hari lebih lama jadi programmer.
          </p>
          <div className="inline-block px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-semibold mb-8">
            🚨 Hanya tersisa <strong>23 slot</strong> dengan harga ini!
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary text-xl px-10 py-5 glow">
              Mulai Belajar Sekarang! <FiArrowRight size={20} />
            </Link>
          </div>
          <p className="text-slate-600 text-sm mt-6">Tidak ada risiko. Jika dalam 7 hari tidak puas, refund 100%.</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
