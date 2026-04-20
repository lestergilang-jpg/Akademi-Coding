'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  FiCode, FiUsers, FiDollarSign, FiBook, FiHome,
  FiLogOut, FiRefreshCw, FiToggleLeft, FiToggleRight,
  FiPlus, FiTrash2, FiEdit, FiBarChart2, FiArrowLeft,
  FiVideo, FiX
} from 'react-icons/fi';

const TABS = ['Dashboard','Users','Kursus','Transaksi'];

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="glass-card p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="text-2xl font-bold text-white">{value ?? '...'}</div>
      <div className="text-slate-400 text-sm mt-1">{label}</div>
    </div>
  );
}

export default function AdminPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState('Dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // === Kursus Management State ===
  const [courseModal, setCourseModal] = useState({ open: false, isEdit: false, id: null });
  const [courseForm, setCourseForm] = useState({ title: '', description: '', thumbnail: '', price: '0', original_price: '0', is_active: true });

  // === Lessons Management State ===
  const [selectedCourse, setSelectedCourse] = useState(null); // When not null, view switches to Lesson Management
  const [lessons, setLessons] = useState([]);
  const [lessonModal, setLessonModal] = useState({ open: false, isEdit: false, id: null });
  const [lessonForm, setLessonForm] = useState({ title: '', description: '', video_url: '', duration: '0', order_index: '1', is_locked: true, is_preview: false });

  // Auth guard
  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push('/login');
      else if (user.role !== 'admin') router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'Dashboard') {
        const { data } = await api.get('/admin/stats');
        setStats(data.data);
      } else if (tab === 'Users') {
        const { data } = await api.get('/admin/users');
        setUsers(data.data);
      } else if (tab === 'Kursus') {
        const { data } = await api.get('/courses/admin/all');
        setCourses(data.data);
      } else if (tab === 'Transaksi') {
        const { data } = await api.get('/admin/transactions');
        setTransactions(data.data);
      }
    } catch { toast.error('Gagal memuat data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (user?.role === 'admin') fetchData(); }, [tab, user]);

  // Handle switching to a specific tab resets sub-views
  const changeTab = (t) => {
    setTab(t);
    setSelectedCourse(null);
  }

  // ============== KURSUS CRUD ==============
  const submitCourse = async (e) => {
    e.preventDefault();
    try {
      if (courseModal.isEdit) {
        await api.put(`/courses/admin/${courseModal.id}`, courseForm);
        toast.success('Kursus berhasil diedit');
      } else {
        await api.post(`/courses/admin`, courseForm);
        toast.success('Kursus baru ditambahkan');
      }
      setCourseModal({ open: false, isEdit: false, id: null });
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal menyimpan kursus'); }
  };

  const deleteCourse = async (id) => {
    if(!confirm('Yakin ingin menghapus kursus ini? Semua materinya akan ikut terhapus!')) return;
    try {
      await api.delete(`/courses/admin/${id}`);
      toast.success('Kursus dihapus');
      fetchData();
    } catch { toast.error('Gagal menghapus'); }
  };

  const openCourseEdit = (c) => {
    setCourseForm({ title: c.title, description: c.description || '', thumbnail: c.thumbnail || '', price: c.price, original_price: c.original_price || '0', is_active: c.is_active });
    setCourseModal({ open: true, isEdit: true, id: c.id });
  };

  const openCourseAdd = () => {
    setCourseForm({ title: '', description: '', thumbnail: '', price: '0', original_price: '0', is_active: true });
    setCourseModal({ open: true, isEdit: false, id: null });
  };

  // ============== MATERI CRUD ==============
  const fetchLessons = async (cId) => {
    try {
      const { data } = await api.get(`/courses/${cId}`);
      setLessons(data.data.lessons || []);
    } catch { toast.error('Gagal memuat materi'); }
  }

  const openLessonView = (course) => {
    setSelectedCourse(course);
    fetchLessons(course.id);
  };

  const submitLesson = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...lessonForm, course_id: selectedCourse.id, duration: parseInt(lessonForm.duration) || 0, order_index: parseInt(lessonForm.order_index) || 0 };
      if (lessonModal.isEdit) {
        await api.put(`/courses/admin/lesson/${lessonModal.id}`, payload);
        toast.success('Materi berhasil diedit');
      } else {
        await api.post(`/courses/admin/lesson`, payload);
        toast.success('Materi baru ditambahkan');
      }
      setLessonModal({ open: false, isEdit: false, id: null });
      fetchLessons(selectedCourse.id);
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal menyimpan materi'); }
  };

  const deleteLesson = async (id) => {
    if(!confirm('Yakin ingin menghapus materi ini?')) return;
    try {
      await api.delete(`/courses/admin/lesson/${id}`);
      toast.success('Materi dihapus');
      fetchLessons(selectedCourse.id);
    } catch { toast.error('Gagal menghapus'); }
  };

  const openLessonEdit = (l) => {
    setLessonForm({ title: l.title, description: l.description || '', video_url: l.video_url || '', duration: l.duration || '0', order_index: l.order_index || '1', is_locked: l.is_locked, is_preview: l.is_preview });
    setLessonModal({ open: true, isEdit: true, id: l.id });
  };

  const openLessonAdd = () => {
    const nextOrder = lessons.length > 0 ? Math.max(...lessons.map(l => l.order_index)) + 1 : 1;
    setLessonForm({ title: '', description: '', video_url: '', duration: '0', order_index: String(nextOrder), is_locked: true, is_preview: false });
    setLessonModal({ open: true, isEdit: false, id: null });
  };

  // ============== Users ===================
  const toggleUser = async (id) => {
    try {
      await api.put(`/admin/users/${id}/toggle-active`);
      toast.success('Status user diperbarui');
      fetchData();
    } catch { toast.error('Gagal update user'); }
  };

  const statusBadge = (status) => {
    const map = { success: 'text-green-400 bg-green-500/10', pending: 'text-yellow-400 bg-yellow-500/10', failed: 'text-red-400 bg-red-500/10', cancelled: 'text-slate-400 bg-white/5', refund: 'text-blue-400 bg-blue-500/10' };
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] || 'text-slate-400'}`}>{status}</span>;
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex text-sm">
      {/* Sidebar */}
      <aside className="w-56 bg-[#0d0d1a] border-r border-white/10 flex flex-col fixed h-full z-10">
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2 font-bold text-white">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <FiCode size={14} className="text-white" />
            </div>
            Admin Panel
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {TABS.map(t => (
            <button key={t} onClick={() => changeTab(t)}
              className={`w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all ${tab === t && !selectedCourse ? 'bg-brand-500/20 text-brand-300' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              {t === 'Dashboard' && <FiBarChart2 size={15} />}
              {t === 'Users' && <FiUsers size={15} />}
              {t === 'Kursus' && <FiBook size={15} />}
              {t === 'Transaksi' && <FiDollarSign size={15} />}
              {t}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white px-3 py-2">
            <FiHome size={14} /> User Dashboard
          </Link>
          <button onClick={() => { logout(); router.push('/'); }} className="flex items-center gap-2 text-slate-400 hover:text-red-400 px-3 py-2 w-full">
            <FiLogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-56 p-6 pb-20 relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {selectedCourse && (
               <button onClick={()=>setSelectedCourse(null)} className="p-1.5 hover:bg-white/10 rounded text-slate-400 hover:text-white">
                 <FiArrowLeft size={18} />
               </button>
            )}
            <h1 className="text-2xl font-bold text-white">
              {selectedCourse ? `Kelola Materi: ${selectedCourse.title}` : tab}
            </h1>
          </div>
          {!selectedCourse && (
            <button onClick={fetchData} className="btn-outline py-2 px-3 gap-1.5">
              <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          )}
        </div>

        {/* ── Dashboard Stats ── */}
        {tab === 'Dashboard' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={FiUsers} label="Total Users" value={stats?.total_users} color="bg-blue-500" />
            <StatCard icon={FiUsers} label="Member Aktif" value={stats?.active_users} color="bg-green-500" />
            <StatCard icon={FiDollarSign} label="Total Revenue" value={stats ? `Rp ${Number(stats.total_revenue).toLocaleString('id')}` : null} color="bg-brand-600" />
            <StatCard icon={FiBook} label="Total Transaksi" value={stats?.total_transactions} color="bg-accent-500" />
          </div>
        )}

        {/* ── Users ── */}
        {tab === 'Users' && (
          <div className="glass-card overflow-hidden">
            <table className="w-full text-left">
              <thead className="border-b border-white/10 bg-white/3">
                <tr>{['ID','Nama','Email','Role','Status','Tgl Daftar','Aksi'].map(h => <th key={h} className="px-4 py-3 text-slate-400 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3 text-slate-500">#{u.id}</td>
                    <td className="px-4 py-3 text-white font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-slate-400">{u.email}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-brand-500/20 text-brand-400' : 'bg-white/10 text-slate-400'}`}>{u.role}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${u.is_active ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{u.is_active ? 'Aktif' : 'Pending'}</span></td>
                    <td className="px-4 py-3 text-slate-500">{new Date(u.created_at).toLocaleDateString('id-ID')}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleUser(u.id)} className="text-slate-400 hover:text-white transition-colors" title="Toggle Akses Member">
                        {u.is_active ? <FiToggleRight size={20} className="text-green-400" /> : <FiToggleLeft size={20} />}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan={7} className="text-center py-10 text-slate-500">Tidak ada user</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Courses (List View) ── */}
        {tab === 'Kursus' && !selectedCourse && (
          <div>
            <div className="mb-4 flex justify-end">
              <button onClick={openCourseAdd} className="btn-primary py-2 px-4 gap-2 flex items-center">
                <FiPlus /> Tambah Kursus
              </button>
            </div>
            <div className="glass-card overflow-hidden">
              <table className="w-full text-left">
                <thead className="border-b border-white/10 bg-white/3">
                  <tr>{['ID','Judul','Harga','Harga Asli','Status','Aksi'].map(h => <th key={h} className="px-4 py-3 text-slate-400 font-medium">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {courses.map(c => (
                    <tr key={c.id} className="hover:bg-white/3">
                      <td className="px-4 py-3 text-slate-500">#{c.id}</td>
                      <td className="px-4 py-3 text-white font-medium">{c.title}</td>
                      <td className="px-4 py-3 text-green-400 font-semibold">Rp {Number(c.price).toLocaleString('id')}</td>
                      <td className="px-4 py-3 text-slate-500 line-through">Rp {Number(c.original_price).toLocaleString('id')}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${c.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{c.is_active ? 'Aktif' : 'Nonaktif'}</span></td>
                      <td className="px-4 py-3 flex items-center gap-2">
                        <button onClick={() => openLessonView(c)} className="bg-brand-500/20 text-brand-300 hover:bg-brand-500/40 p-1.5 rounded" title="Kelola Materi">
                          <FiVideo />
                        </button>
                        <button onClick={() => openCourseEdit(c)} className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/40 p-1.5 rounded" title="Edit">
                          <FiEdit />
                        </button>
                        <button onClick={() => deleteCourse(c.id)} className="bg-red-500/20 text-red-300 hover:bg-red-500/40 p-1.5 rounded" title="Hapus">
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {courses.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-slate-500">Tidak ada kursus</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Lessons (Sub View) ── */}
        {tab === 'Kursus' && selectedCourse && (
          <div className="animate-fade-in">
            <div className="mb-4 flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
              <div>
                <div className="text-white font-bold">{selectedCourse.title}</div>
                <div className="text-slate-400 text-xs mt-1">Total {lessons.length} Materi Video</div>
              </div>
              <button onClick={openLessonAdd} className="btn-primary py-2 px-4 gap-2 flex items-center text-xs">
                <FiPlus /> Tambah Materi
              </button>
            </div>
            
            <div className="glass-card overflow-hidden">
               <table className="w-full text-left">
                  <thead className="border-b border-white/10 bg-white/3">
                    <tr>{['Urutan','Judul','Durasi','Tipe Akses','Aksi'].map(h => <th key={h} className="px-4 py-3 text-slate-400 font-medium">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {lessons.map(l => (
                      <tr key={l.id} className="hover:bg-white/3">
                        <td className="px-4 py-3 text-slate-400">
                          <span className="bg-white/10 px-2 py-1 rounded text-xs">{l.order_index}</span>
                        </td>
                        <td className="px-4 py-3 text-white">
                          <div className="font-medium">{l.title}</div>
                          <div className="text-xs text-slate-500 truncate max-w-[200px]">{l.video_url || 'No URL'}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{l.duration} mnt</td>
                        <td className="px-4 py-3 space-y-1">
                          {l.is_preview ? <span className="block w-max text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">Preview (Gratis)</span> : null}
                          {l.is_locked ? <span className="block w-max text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-300">Terkunci (Hanya Premium)</span> : <span className="block w-max text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-300">Terbuka (Semua Member)</span>}
                        </td>
                        <td className="px-4 py-3 flex gap-2">
                           <button onClick={() => openLessonEdit(l)} className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/40 p-1.5 rounded"><FiEdit size={14}/></button>
                           <button onClick={() => deleteLesson(l.id)} className="bg-red-500/20 text-red-300 hover:bg-red-500/40 p-1.5 rounded"><FiTrash2 size={14}/></button>
                        </td>
                      </tr>
                    ))}
                    {lessons.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-slate-500">Materi belum ditambahkan.</td></tr>}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {/* ── Transactions ── */}
        {tab === 'Transaksi' && (
          <div className="glass-card overflow-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="border-b border-white/10 bg-white/3">
                <tr>{['Order ID','User','Kursus','Amount','Status','Tgl'].map(h => <th key={h} className="px-4 py-3 text-slate-400 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-white/3">
                    <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">{t.id}</td>
                    <td className="px-4 py-3"><div className="text-white font-medium">{t.user_name}</div><div className="text-slate-500 text-xs">{t.user_email}</div></td>
                    <td className="px-4 py-3 text-slate-400">{t.course_title || '-'}</td>
                    <td className="px-4 py-3 text-white font-semibold">Rp {Number(t.amount).toLocaleString('id')}</td>
                    <td className="px-4 py-3">{statusBadge(t.status)}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{new Date(t.created_at).toLocaleDateString('id-ID')}</td>
                  </tr>
                ))}
                {transactions.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-slate-500">Tidak ada transaksi</td></tr>}
              </tbody>
            </table>
          </div>
        )}

      </main>

      {/* ================= MODALS ================= */}

      {/* Course Modal */}
      {courseModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#13131f] border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl animate-fade-in">
            <div className="p-5 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">{courseModal.isEdit ? 'Edit Kursus' : 'Tambah Kursus Baru'}</h2>
              <button onClick={() => setCourseModal({...courseModal, open:false})} className="text-slate-400 hover:text-white"><FiX size={20}/></button>
            </div>
            <div className="p-5 overflow-y-auto">
              <form id="courseForm" onSubmit={submitCourse} className="space-y-4">
                <div><label className="block text-slate-400 text-xs mb-1">Judul Kursus</label><input required value={courseForm.title} onChange={e=>setCourseForm({...courseForm, title: e.target.value})} className="input-field w-full" /></div>
                <div><label className="block text-slate-400 text-xs mb-1">Deskripsi</label><textarea required rows={3} value={courseForm.description} onChange={e=>setCourseForm({...courseForm, description: e.target.value})} className="input-field w-full" /></div>
                <div><label className="block text-slate-400 text-xs mb-1">URL Thumbnail (Opsional)</label><input type="url" value={courseForm.thumbnail} onChange={e=>setCourseForm({...courseForm, thumbnail: e.target.value})} className="input-field w-full" placeholder="https://..." /></div>
                <div className="grid grid-cols-2 gap-4">
                   <div><label className="block text-slate-400 text-xs mb-1">Harga Jual (Rp)</label><input required type="number" value={courseForm.price} onChange={e=>setCourseForm({...courseForm, price: e.target.value})} className="input-field w-full" /></div>
                   <div><label className="block text-slate-400 text-xs mb-1">Harga Asli/Coret (Rp - Opsional)</label><input type="number" value={courseForm.original_price} onChange={e=>setCourseForm({...courseForm, original_price: e.target.value})} className="input-field w-full" /></div>
                </div>
                <div className="flex items-center gap-2 mt-4 bg-white/5 p-3 rounded-lg border border-white/10">
                  <input type="checkbox" id="c_active" checked={courseForm.is_active} onChange={e=>setCourseForm({...courseForm, is_active: e.target.checked})} className="w-4 h-4 rounded text-brand-500 bg-black/50 border-white/20 focus:ring-brand-500 focus:ring-offset-gray-900" />
                  <label htmlFor="c_active" className="text-white text-sm cursor-pointer select-none">Tampilkan kursus ini (Aktif)</label>
                </div>
              </form>
            </div>
            <div className="p-4 border-t border-white/10 flex justify-end gap-3 bg-black/20">
              <button onClick={() => setCourseModal({...courseModal, open:false})} className="btn-outline py-2 px-4">Batal</button>
              <button form="courseForm" type="submit" className="btn-primary py-2 px-6">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {lessonModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#13131f] border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl animate-fade-in">
            <div className="p-5 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">{lessonModal.isEdit ? 'Edit Materi' : 'Tambah Materi Baru'}</h2>
              <button onClick={() => setLessonModal({...lessonModal, open:false})} className="text-slate-400 hover:text-white"><FiX size={20}/></button>
            </div>
            <div className="p-5 overflow-y-auto">
              <form id="lessonForm" onSubmit={submitLesson} className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-3"><label className="block text-slate-400 text-xs mb-1">Judul Materi</label><input required value={lessonForm.title} onChange={e=>setLessonForm({...lessonForm, title: e.target.value})} className="input-field w-full" /></div>
                  <div className="col-span-1"><label className="block text-slate-400 text-xs mb-1">Urutan (1,2..)</label><input required type="number" min="1" value={lessonForm.order_index} onChange={e=>setLessonForm({...lessonForm, order_index: e.target.value})} className="input-field w-full" /></div>
                </div>
                <div><label className="block text-slate-400 text-xs mb-1">Deskripsi Pendek (Opsional)</label><textarea rows={2} value={lessonForm.description} onChange={e=>setLessonForm({...lessonForm, description: e.target.value})} className="input-field w-full" /></div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-3"><label className="block text-slate-400 text-xs mb-1">URL Video (Youtube/MP4)</label><input required type="url" value={lessonForm.video_url} onChange={e=>setLessonForm({...lessonForm, video_url: e.target.value})} className="input-field w-full" placeholder="https://youtube.com/embed/..." /></div>
                  <div className="col-span-1"><label className="block text-slate-400 text-xs mb-1">Durasi (Mnt)</label><input required type="number" min="0" value={lessonForm.duration} onChange={e=>setLessonForm({...lessonForm, duration: e.target.value})} className="input-field w-full" /></div>
                </div>

                <div className="flex flex-col gap-3 mt-4 bg-white/5 p-4 rounded-lg border border-white/10">
                  <p className="text-xs font-bold text-slate-500 uppercase">Pengaturan Akses</p>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={lessonForm.is_preview} onChange={e=>setLessonForm({...lessonForm, is_preview: e.target.checked})} className="w-4 h-4 rounded text-blue-500 bg-black/50 border-white/20 focus:ring-blue-500 focus:ring-offset-gray-900" />
                    <div className="text-white text-sm select-none">Materi Preview Gratis <span className="text-slate-400 block text-xs">(Jika dicentang, materi ini bisa ditonton user yang belum bayar)</span></div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={lessonForm.is_locked} onChange={e=>setLessonForm({...lessonForm, is_locked: e.target.checked})} className="w-4 h-4 rounded text-red-500 bg-black/50 border-white/20 focus:ring-red-500 focus:ring-offset-gray-900" />
                    <div className="text-white text-sm select-none">Materi Terkunci <span className="text-slate-400 block text-xs">(Aktifkan ini agar materi disembunyikan/digembok kecuali untuk Member Premium)</span></div>
                  </label>
                </div>
              </form>
            </div>
            <div className="p-4 border-t border-white/10 flex justify-end gap-3 bg-black/20">
              <button onClick={() => setLessonModal({...lessonModal, open:false})} className="btn-outline py-2 px-4">Batal</button>
              <button form="lessonForm" type="submit" className="btn-primary py-2 px-6">Simpan</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
