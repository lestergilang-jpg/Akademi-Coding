'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  FiCode, FiPlay, FiLock, FiCheckCircle, FiZap,
  FiLogOut, FiShoppingCart, FiBook, FiAward, FiClock,
  FiUser, FiList, FiSettings
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
  
  // Views: 'courses', 'course_detail', 'transactions', 'settings'
  const [currentView, setCurrentView] = useState('courses');
  
  const [allCourses, setAllCourses] = useState([]);
  const [course, setCourse] = useState(null); // specific course for detail view
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [transactions, setTransactions] = useState([]);
  
  const [paying, setPaying] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Settings form
  const [profileData, setProfileData] = useState({ name: '', email: '', currentPassword: '', password: '' });

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    if (user) setProfileData({ name: user.name, email: user.email, currentPassword: '', password: '' });
  }, [user, authLoading, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('discord') === 'success') {
        toast.success('Berhasil menghubungkan akun Discord!');
        refreshUser();
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (urlParams.get('discord') === 'error') {
        toast.error('Gagal menghubungkan Discord.');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  useEffect(() => {
    if (user && currentView === 'courses') {
      setPageLoading(true);
      api.get('/courses')
        .then(({ data }) => setAllCourses(data.data))
        .catch(() => toast.error('Gagal memuat katalog kursus'))
        .finally(() => setPageLoading(false));
    }
  }, [user, currentView]);

  useEffect(() => {
    if (user && currentView === 'transactions') {
      setPageLoading(true);
      api.get('/transactions/my')
        .then(({ data }) => setTransactions(data.data))
        .catch(() => toast.error('Gagal memuat riwayat transaksi'))
        .finally(() => setPageLoading(false));
    }
  }, [user, currentView]);

  const loadCourseDetail = (courseId) => {
    setPageLoading(true);
    api.get(`/courses/${courseId}`)
      .then(({ data }) => {
        setCourse(data.data);
        const firstUnlocked = data.data.lessons?.find(l => !l.is_locked || l.is_preview);
        if (firstUnlocked) setSelectedLesson(firstUnlocked);
        setCurrentView('course_detail');
      })
      .catch(() => toast.error('Gagal memuat detail kursus'))
      .finally(() => setPageLoading(false));
  };

  const handleBuy = async (courseIdToBuy) => {
    setPaying(true);
    try {
      const { data } = await api.post('/transactions/create', { course_id: courseIdToBuy || 1 });
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

  const handleAvatarSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error('Ukuran maksimal foto adalah 2MB.');
    
    const formData = new FormData();
    formData.append('avatar', file);
    
    setUploadingAvatar(true);
    try {
      const { data } = await api.put('/auth/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(data.message);
      refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengunggah foto profil.');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
       const { data } = await api.put('/auth/profile', profileData);
       toast.success(data.message);
       refreshUser();
       setProfileData({ ...profileData, currentPassword: '', password: '' });
    } catch (err) {
       toast.error(err.response?.data?.message || 'Update profil gagal');
    }
  };

  const handleDiscordLink = () => {
    const token = Cookies.get('token');
    if (!token) {
      toast.error('Gagal mengambil token. Silakan login ulang.');
      return;
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    window.location.href = `${apiUrl}/auth/discord/link?token=${token}`;
  };

  if (authLoading || (pageLoading && currentView === 'courses' && allCourses.length===0)) return <LoadingSpinner />;
  if (!user) return null;

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
              {user.avatar_url ? (
                <div className="w-10 h-10 rounded-full border border-brand-500 overflow-hidden">
                   <img src={`http://localhost:5000${user.avatar_url}`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold text-sm truncate">{user.name}</div>
                <div className={`text-xs ${user.is_active ? 'text-green-400' : 'text-yellow-400'}`}>
                  {user.is_active ? '✓ Member Premium' : '⚡ Member Biasa'}
                </div>
              </div>
            </div>
          </div>

          {/* Menu list */}
          <div className="flex-1 overflow-y-auto p-3">
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-3 px-2">Menu Utama</p>
            <div className="space-y-1">
              <button onClick={() => setCurrentView('courses')} className={`w-full text-left flex items-center gap-2 p-2.5 rounded-lg text-sm transition-all ${currentView === 'courses' ? 'bg-brand-500/20 text-brand-300' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                <FiBook /> Katalog Kursus
              </button>
              {course && currentView === 'course_detail' && (
                <button className="w-full text-left flex items-center gap-2 p-2.5 rounded-lg text-sm transition-all bg-brand-500/20 text-brand-300">
                  <FiPlay /> Sedang Belajar: {course.title.substring(0,15)}...
                </button>
              )}
              <button onClick={() => setCurrentView('transactions')} className={`w-full text-left flex items-center gap-2 p-2.5 rounded-lg text-sm transition-all ${currentView === 'transactions' ? 'bg-brand-500/20 text-brand-300' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                <FiList /> Riwayat Transaksi
              </button>
              <button onClick={() => setCurrentView('settings')} className={`w-full text-left flex items-center gap-2 p-2.5 rounded-lg text-sm transition-all ${currentView === 'settings' ? 'bg-brand-500/20 text-brand-300' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                <FiSettings /> Pengaturan Profil
              </button>
            </div>
            
            {currentView === 'course_detail' && course && (
               <div className="mt-6">
                 <p className="text-slate-500 text-xs uppercase tracking-wider mb-3 px-2">Materi</p>
                 <div className="space-y-1">
                   {course.lessons?.map(lesson => {
                     const isAccessible = !lesson.is_locked || lesson.is_preview || user.is_active;
                     const isSelected = selectedLesson?.id === lesson.id;
                     return (
                       <button
                         key={lesson.id}
                         onClick={() => isAccessible ? setSelectedLesson(lesson) : toast.error('Beli akses untuk membuka materi ini!')}
                         className={`w-full text-left flex items-center gap-2 p-2.5 rounded-lg text-sm transition-all
                           ${isSelected ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                           ${!isAccessible ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                         `}
                       >
                         {isAccessible ? <FiPlay size={12} className="flex-shrink-0 text-brand-400"/> : <FiLock size={12} className="flex-shrink-0 text-slate-600"/>}
                         <span className="truncate">{lesson.title}</span>
                       </button>
                     );
                   })}
                 </div>
               </div>
            )}
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
              <h1 className="text-white font-bold text-lg">
                {currentView === 'courses' ? 'Katalog Kursus' : currentView === 'course_detail' ? course?.title : currentView === 'transactions' ? 'Riwayat Transaksi' : 'Pengaturan Profil'}
              </h1>
            </div>
          </div>

          <div className="p-6">
            
            {/* VIEW: CATALOG COURSES */}
            {currentView === 'courses' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {allCourses.map(c => (
                   <div key={c.id} className="glass-card flex flex-col overflow-hidden">
                     <div className="h-40 bg-gradient-to-br from-brand-600/40 to-accent-600/40 flex items-center justify-center">
                        <FiBook size={48} className="text-white/50" />
                     </div>
                     <div className="p-5 flex-1 flex flex-col">
                        <h3 className="text-white font-bold text-lg mb-2">{c.title}</h3>
                        <p className="text-slate-400 text-sm mb-4 line-clamp-3">{c.description}</p>
                        <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
                           <span className="text-brand-400 font-bold">Rp {parseInt(c.price).toLocaleString('id-ID')}</span>
                           <button onClick={() => loadCourseDetail(c.id)} className="btn-primary py-1.5 px-4 text-sm">Lihat Detail</button>
                        </div>
                     </div>
                   </div>
                 ))}
              </div>
            )}

            {/* VIEW: TRANSACTIONS */}
            {currentView === 'transactions' && (
              <div className="glass-card overflow-hidden">
                <table className="w-full text-left text-sm text-slate-400">
                  <thead className="bg-white/5 text-slate-300 uppercase">
                    <tr>
                      <th className="px-6 py-4">ID Transaksi</th>
                      <th className="px-6 py-4">Kursus</th>
                      <th className="px-6 py-4">Nominal</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length === 0 && (
                      <tr><td colSpan="5" className="text-center py-8">Belum ada transaksi.</td></tr>
                    )}
                    {transactions.map(t => (
                      <tr key={t.id} className="border-t border-white/10 hover:bg-white/5">
                        <td className="px-6 py-4">{t.id}</td>
                        <td className="px-6 py-4">{t.course_title || 'Unknown Course'}</td>
                        <td className="px-6 py-4">Rp {parseFloat(t.amount).toLocaleString('id-ID')}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs
                             ${t.status==='success'?'bg-green-500/20 text-green-400' :
                               t.status==='pending'?'bg-yellow-500/20 text-yellow-400' :
                               'bg-red-500/20 text-red-400'}`}>
                             {t.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {(t.status === 'failed' || t.status === 'cancel' || t.status === 'expire') && (
                            <button onClick={() => handleBuy(t.course_id)} className="text-brand-400 hover:text-brand-300 text-xs flex items-center gap-1">
                              <FiShoppingCart /> Bayar Ulang
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* VIEW: SETTINGS */}
            {currentView === 'settings' && (
              <div className="glass-card max-w-lg p-6">
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative group cursor-pointer" onClick={() => !uploadingAvatar && fileInputRef.current?.click()}>
                    {user.avatar_url ? (
                      <div className="w-20 h-20 rounded-full border-2 border-brand-500 overflow-hidden relative">
                         <img src={`http://localhost:5000${user.avatar_url}`} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold border-2 border-brand-500">
                         {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <FiUser className="text-white" size={24} />
                    </div>
                    {uploadingAvatar && (
                       <div className="absolute inset-0 bg-black/80 rounded-full flex items-center justify-center">
                          <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleAvatarSelect} accept="image/*" className="hidden" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Foto Profil</h3>
                    <p className="text-slate-400 text-xs">Rekomendasi ukuran: 200x200px (Max 2MB)</p>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                   <div>
                     <label className="block text-sm text-slate-400 mb-1">Nama Lengkap</label>
                     <input type="text" value={profileData.name} onChange={e=>setProfileData({...profileData, name: e.target.value})} className="input-field w-full" required />
                   </div>
                   <div>
                     <label className="block text-sm text-slate-400 mb-1">Email</label>
                     <input type="email" value={profileData.email} onChange={e=>setProfileData({...profileData, email: e.target.value})} className="input-field w-full" required />
                   </div>
                   <div className="pt-4 mt-4 border-t border-white/10">
                     <p className="text-white text-sm font-semibold mb-3">Keamanan (Ganti Password)</p>
                     <div className="space-y-4">
                       <div>
                         <label className="block text-sm text-slate-400 mb-1">Password Saat Ini</label>
                         <input type="password" value={profileData.currentPassword} onChange={e=>setProfileData({...profileData, currentPassword: e.target.value})} className="input-field w-full" placeholder="Wajib diisi jika ingin mengubah profil/password" />
                       </div>
                       <div>
                         <label className="block text-sm text-slate-400 mb-1">Password Baru (kosongkan jika tidak diubah)</label>
                         <input type="password" value={profileData.password} onChange={e=>setProfileData({...profileData, password: e.target.value})} className="input-field w-full" />
                       </div>
                     </div>
                   </div>
                   <button type="submit" className="btn-primary w-full py-2.5">Simpan Perubahan</button>
                 </form>
                 
                 {/* Discord Integration Section */}
                 <div className="mt-8 pt-6 border-t border-white/10">
                   <h3 className="text-white font-bold mb-2">Integrasi Discord</h3>
                   <p className="text-slate-400 text-sm mb-4">
                     Hubungkan akun Discord kamu untuk bergabung secara otomatis ke komunitas eksklusif dan mendapatkan role Premium (jika sudah berlangganan).
                   </p>
                   {user.discord_id ? (
                     <div className="bg-[#5865F2]/20 border border-[#5865F2]/30 rounded-lg p-4 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center text-white font-bold">
                           {user.discord_username?.charAt(0).toUpperCase()}
                         </div>
                         <div>
                           <p className="text-white font-medium text-sm">Terhubung dengan Discord</p>
                           <p className="text-[#5865F2] text-xs">@{user.discord_username}</p>
                         </div>
                       </div>
                       <div className="badge bg-green-500/20 text-green-400 border-none">Terkoneksi</div>
                     </div>
                   ) : (
                     <button onClick={handleDiscordLink} className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors">
                       Hubungkan akun Discord
                     </button>
                   )}
                 </div>
              </div>
            )}

            {/* VIEW: COURSE DETAIL (VIDEO PLAYER) */}
            {currentView === 'course_detail' && (
              <div>
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
                        <p className="text-sm mt-1">Upgrade / Beli kursus ini untuk akses materi</p>
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
                  </div>
                )}

                {/* Paywall banner */}
                {!user.is_active && (
                  <div className="glass-card p-6 border-brand-500/30 bg-gradient-to-r from-brand-500/10 to-accent-500/10 mt-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg">🔒 Buka Semua Materi</h3>
                        <p className="text-slate-400 text-sm mt-1">Kamu baru bisa akses materi preview. Beli sekarang untuk buka seluruh modul.</p>
                      </div>
                      <button onClick={()=>handleBuy(course.id)} disabled={paying} className="btn-primary flex-shrink-0">
                        {paying ? 'Loading...' : <><FiShoppingCart /> Beli Sekarang — Rp {parseInt(course.price).toLocaleString('id-ID')}</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
