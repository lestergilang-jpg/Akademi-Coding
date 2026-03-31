'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  FiCode, FiPlay, FiLock, FiCheckCircle, FiZap,
  FiLogOut, FiShoppingCart, FiBook, FiAward, FiClock,
} from 'react-icons/fi';

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
    </div>
  );
}

export default function DashboardPage() {
  const { user, logout, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [paying, setPaying] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      api.get('/courses/1')
        .then(({ data }) => {
          setCourse(data.data);
          const firstUnlocked = data.data.lessons?.find(l => !l.is_locked || l.is_preview);
          if (firstUnlocked) setSelectedLesson(firstUnlocked);
        })
        .catch(() => toast.error('Gagal memuat kursus'))
        .finally(() => setPageLoading(false));
    }
  }, [user]);

  const handleBuy = async () => {
    setPaying(true);
    try {
      const { data } = await api.post('/transactions/create', { course_id: 1 });
      // Load Midtrans Snap
      const script = document.createElement('script');
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY);
      script.onload = () => {
        window.snap.pay(data.data.snap_token, {
          onSuccess: async () => {
            toast.success('Pembayaran berhasil! 🎉 Mengaktifkan akses...');
            await refreshUser();
            window.location.reload();
          },
          onPending: () => toast('Pembayaran pending. Cek email kamu.', { icon: '⏳' }),
          onError: () => toast.error('Pembayaran gagal. Coba lagi.'),
          onClose: () => toast('Pembayaran dibatalkan.', { icon: 'ℹ️' }),
        });
      };
      document.body.appendChild(script);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat transaksi');
    } finally {
      setPaying(false);
    }
  };

  if (authLoading || pageLoading) return <LoadingSpinner />;
  if (!user) return null;

  const completedLessons = 0;
  const totalLessons = course?.lessons?.length || 0;
  const progress = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Sidebar + Main layout */}
      <div className="flex h-screen overflow-hidden">

        {/* ── Sidebar ── */}
        <aside className="w-64 bg-[#0d0d1a] border-r border-white/10 flex flex-col hidden lg:flex">
          <div className="p-5 border-b border-white/10">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                <FiCode className="text-white text-sm" />
              </div>
              AkademiCoding
            </Link>
          </div>

          {/* User info */}
          <div className="p-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold text-sm truncate">{user.name}</div>
                <div className={`text-xs ${user.is_active ? 'text-green-400' : 'text-yellow-400'}`}>
                  {user.is_active ? '✓ Member Aktif' : '⚡ Belum Premium'}
                </div>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Progress</span><span>{progress}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          {/* Lesson list */}
          <div className="flex-1 overflow-y-auto p-3">
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-3 px-2">Materi Kursus</p>
            <div className="space-y-1">
              {course?.lessons?.map(lesson => {
                const isAccessible = !lesson.is_locked || lesson.is_preview || user.is_active;
                const isSelected = selectedLesson?.id === lesson.id;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => isAccessible ? setSelectedLesson(lesson) : toast.error('Beli akses premium untuk membuka materi ini!')}
                    className={`w-full text-left flex items-center gap-2 p-2.5 rounded-lg text-sm transition-all
                      ${isSelected ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                      ${!isAccessible ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {isAccessible
                      ? <FiPlay size={12} className="flex-shrink-0 text-brand-400" />
                      : <FiLock size={12} className="flex-shrink-0 text-slate-600" />
                    }
                    <span className="truncate">{lesson.title}</span>
                    {lesson.is_preview && <span className="ml-auto text-xs text-green-400 flex-shrink-0">FREE</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Logout */}
          <div className="p-4 border-t border-white/10">
            <button onClick={() => { logout(); router.push('/'); }} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm w-full">
              <FiLogOut /> Keluar
            </button>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 overflow-y-auto">
          {/* Top bar */}
          <div className="bg-[#0d0d1a] border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            <div>
              <h1 className="text-white font-bold">Dashboard Belajar</h1>
              <p className="text-slate-400 text-sm">{selectedLesson?.title || 'Pilih materi untuk mulai'}</p>
            </div>
            {!user.is_active && (
              <button onClick={handleBuy} disabled={paying} className="btn-primary py-2 px-4 text-sm">
                {paying ? <span className="flex items-center gap-2"><span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />Loading...</span> : <><FiZap size={14} />Upgrade Premium</>}
              </button>
            )}
          </div>

          <div className="p-6">
            {/* Stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Materi', value: totalLessons, icon: FiBook, color: 'text-brand-400' },
                { label: 'Progress', value: `${progress}%`, icon: FiCheckCircle, color: 'text-green-400' },
                { label: 'Status', value: user.is_active ? 'Premium' : 'Free', icon: FiAward, color: user.is_active ? 'text-yellow-400' : 'text-slate-400' },
                { label: 'Durasi', value: '100+ Jam', icon: FiClock, color: 'text-accent-400' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="glass-card p-4">
                  <Icon size={18} className={`${color} mb-2`} />
                  <div className={`text-xl font-bold ${color}`}>{value}</div>
                  <div className="text-slate-500 text-xs mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {/* Video Player */}
            {selectedLesson ? (
              <div className="glass-card overflow-hidden mb-6">
                {selectedLesson.video_url ? (
                  <div className="aspect-video w-full bg-black">
                    <iframe
                      src={selectedLesson.video_url}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-[#13131f] flex flex-col items-center justify-center text-slate-500">
                    <FiLock size={40} className="mb-3" />
                    <p className="font-semibold text-white">Materi Terkunci</p>
                    <p className="text-sm mt-1">Upgrade ke premium untuk akses materi ini</p>
                  </div>
                )}
                <div className="p-5">
                  <h2 className="text-white font-bold text-xl">{selectedLesson.title}</h2>
                  {selectedLesson.description && <p className="text-slate-400 mt-2 text-sm">{selectedLesson.description}</p>}
                  <div className="flex gap-2 mt-3">
                    {selectedLesson.is_preview && <span className="badge">Preview Gratis</span>}
                    {selectedLesson.duration > 0 && <span className="text-slate-500 text-xs flex items-center gap-1"><FiClock size={10} /> {selectedLesson.duration} menit</span>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <FiPlay size={48} className="text-brand-400 mx-auto mb-4" />
                <h2 className="text-white font-bold text-xl mb-2">Pilih Materi untuk Mulai</h2>
                <p className="text-slate-400">Klik materi di sidebar kiri untuk mulai belajar</p>
              </div>
            )}

            {/* Paywall banner */}
            {!user.is_active && (
              <div className="glass-card p-6 border-brand-500/30 bg-gradient-to-r from-brand-500/10 to-accent-500/10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg">🔒 Buka Semua Materi</h3>
                    <p className="text-slate-400 text-sm mt-1">Kamu hanya bisa akses 2 materi preview. Upgrade untuk buka semua 16 modul + project nyata.</p>
                  </div>
                  <button onClick={handleBuy} disabled={paying} className="btn-primary flex-shrink-0">
                    <FiShoppingCart /> Beli Sekarang — Rp 299.000
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
