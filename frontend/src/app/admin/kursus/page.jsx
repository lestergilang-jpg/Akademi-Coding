'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  FiPlus, FiEdit, FiTrash2, FiVideo, FiArrowLeft, FiX, 
  FiCheckCircle, FiLock, FiPlay, FiClock, FiSearch, FiBook
} from 'react-icons/fi';

export default function AdminKursusPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Course Modal
  const [courseModal, setCourseModal] = useState({ open: false, isEdit: false, id: null });
  const [courseForm, setCourseForm] = useState({ title: '', description: '', thumbnail: '', price: '0', original_price: '0', is_active: true });

  // Lesson Management
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [lessonModal, setLessonModal] = useState({ open: false, isEdit: false, id: null });
  const [lessonForm, setLessonForm] = useState({ title: '', description: '', video_url: '', duration: '0', order_index: '1', is_locked: true, is_preview: false });

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/courses/admin/all');
      setCourses(data.data || []);
    } catch {
      toast.error('Gagal memuat kursus');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const submitCourse = async (e) => {
    e.preventDefault();
    try {
      if (courseModal.isEdit) {
        await api.put(`/courses/admin/${courseModal.id}`, courseForm);
        toast.success('Kursus diperbarui');
      } else {
        await api.post(`/courses/admin`, courseForm);
        toast.success('Kursus ditambahkan');
      }
      setCourseModal({ open: false, isEdit: false, id: null });
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan kursus');
    }
  };

  const deleteCourse = async (id) => {
    if(!confirm('Hapus kursus ini dan semua materinya?')) return;
    try {
      await api.delete(`/courses/admin/${id}`);
      toast.success('Kursus dihapus');
      fetchCourses();
    } catch {
      toast.error('Gagal menghapus kursus');
    }
  };

  const fetchLessons = async (cId) => {
    try {
      const { data } = await api.get(`/courses/${cId}`);
      setLessons(data.data.lessons || []);
    } catch {
      toast.error('Gagal memuat materi');
    }
  };

  const openLessonView = (course) => {
    setSelectedCourse(course);
    fetchLessons(course.id);
  };

  const submitLesson = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...lessonForm, course_id: selectedCourse.id, duration: parseInt(lessonForm.duration), order_index: parseInt(lessonForm.order_index) };
      if (lessonModal.isEdit) {
        await api.put(`/courses/admin/lesson/${lessonModal.id}`, payload);
        toast.success('Materi diperbarui');
      } else {
        await api.post(`/courses/admin/lesson`, payload);
        toast.success('Materi ditambahkan');
      }
      setLessonModal({ open: false, isEdit: false, id: null });
      fetchLessons(selectedCourse.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan materi');
    }
  };

  const openCourseEdit = (c) => {
    setCourseForm({ title: c.title, description: c.description || '', thumbnail: c.thumbnail || '', price: c.price, original_price: c.original_price || '0', is_active: c.is_active });
    setCourseModal({ open: true, isEdit: true, id: c.id });
  };

  const openLessonEdit = (l) => {
    setLessonForm({ title: l.title, description: l.description || '', video_url: l.video_url || '', duration: l.duration || '0', order_index: l.order_index || '1', is_locked: l.is_locked, is_preview: l.is_preview });
    setLessonModal({ open: true, isEdit: true, id: l.id });
  };

  if (selectedCourse) {
    return (
      <div className="animate-fade-in">
        <button onClick={() => setSelectedCourse(null)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
          <FiArrowLeft /> Kembali ke Daftar Kursus
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-brand-500/5 p-6 rounded-2xl border border-brand-500/10">
          <div>
            <h1 className="text-2xl font-black text-white">{selectedCourse.title}</h1>
            <p className="text-slate-500 text-sm mt-1">{lessons.length} Materi Video</p>
          </div>
          <button onClick={() => {
            const next = lessons.length > 0 ? Math.max(...lessons.map(l => l.order_index)) + 1 : 1;
            setLessonForm({ title: '', description: '', video_url: '', duration: '0', order_index: String(next), is_locked: true, is_preview: false });
            setLessonModal({ open: true, isEdit: false, id: null });
          }} className="btn-primary py-2.5 px-5 text-sm gap-2">
            <FiPlus /> Tambah Materi
          </button>
        </div>

        <div className="glass-card overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/3 border-b border-white/10">
              <tr>
                {['#','Judul Materi','Metadata','Status','Aksi'].map(h => <th key={h} className="px-6 py-4 text-xs font-bold uppercase text-slate-500">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {lessons.map((l, idx) => (
                <tr key={l.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-6 py-4"><span className="bg-white/5 px-2 py-1 rounded text-xs font-mono">{l.order_index}</span></td>
                  <td className="px-6 py-4">
                    <div className="text-white font-semibold">{l.title}</div>
                    <div className="text-slate-500 text-[10px] truncate max-w-xs mt-0.5">{l.video_url}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                      <FiClock size={12}/> {l.duration} mnt
                    </div>
                  </td>
                  <td className="px-6 py-4 space-y-1">
                    {l.is_preview && <span className="block w-max text-[9px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-black uppercase">Free Preview</span>}
                    {l.is_locked ? <span className="block w-max text-[9px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-black uppercase">Premium Only</span> : <span className="block w-max text-[9px] px-2 py-0.5 rounded bg-green-500/20 text-green-400 font-black uppercase">Public</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                       <button onClick={() => openLessonEdit(l)} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all"><FiEdit size={16}/></button>
                       <button onClick={async () => {
                         if(!confirm('Hapus materi?')) return;
                         await api.delete(`/courses/admin/lesson/${l.id}`);
                         toast.success('Dihapus');
                         fetchLessons(selectedCourse.id);
                       }} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"><FiTrash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Lesson Modal */}
        {lessonModal.open && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <div className="bg-[#13131f] border border-white/10 rounded-2xl w-full max-w-xl flex flex-col shadow-2xl animate-fade-in">
              <div className="p-5 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">{lessonModal.isEdit ? 'Edit Materi' : 'Tambah Materi'}</h2>
                <button onClick={() => setLessonModal({...lessonModal, open:false})} className="text-slate-400 hover:text-white"><FiX size={20}/></button>
              </div>
              <form onSubmit={submitLesson}>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-3"><label className="label">Judul Materi</label><input required value={lessonForm.title} onChange={e=>setLessonForm({...lessonForm, title: e.target.value})} className="input-field w-full" /></div>
                    <div><label className="label">Urutan</label><input required type="number" value={lessonForm.order_index} onChange={e=>setLessonForm({...lessonForm, order_index: e.target.value})} className="input-field w-full" /></div>
                  </div>
                  <div><label className="label">URL Embed Video</label><input required type="url" value={lessonForm.video_url} onChange={e=>setLessonForm({...lessonForm, video_url: e.target.value})} className="input-field w-full" placeholder="https://youtube.com/embed/..." /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="label">Durasi (Menit)</label><input required type="number" value={lessonForm.duration} onChange={e=>setLessonForm({...lessonForm, duration: e.target.value})} className="input-field w-full" /></div>
                    <div className="flex flex-col gap-2 justify-center pt-5">
                       <label className="flex items-center gap-2 cursor-pointer text-xs"><input type="checkbox" checked={lessonForm.is_preview} onChange={e=>setLessonForm({...lessonForm, is_preview: e.target.checked})} /> Preview Gratis</label>
                       <label className="flex items-center gap-2 cursor-pointer text-xs"><input type="checkbox" checked={lessonForm.is_locked} onChange={e=>setLessonForm({...lessonForm, is_locked: e.target.checked})} /> Terkunci (Premium)</label>
                    </div>
                  </div>
                </div>
                <div className="p-5 border-t border-white/5 flex justify-end gap-3 bg-white/2">
                  <button type="button" onClick={() => setLessonModal({...lessonModal, open:false})} className="btn-outline px-4 py-2">Batal</button>
                  <button type="submit" className="btn-primary px-6 py-2">Simpan Materi</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  const filtered = courses.filter(c => c.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">Katalog Kursus</h1>
          <p className="text-slate-500 mt-2">Atur produk digital dan kurikulum bootcamp Anda.</p>
        </div>
        <button onClick={() => {
          setCourseForm({ title: '', description: '', thumbnail: '', price: '0', original_price: '0', is_active: true });
          setCourseModal({ open: true, isEdit: false, id: null });
        }} className="btn-primary py-2.5 px-6 gap-2">
          <FiPlus /> Tambah Kursus
        </button>
      </div>

      <div className="mb-6 relative max-w-md">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input 
          type="text" 
          placeholder="Cari katalog..."
          className="input-field pl-10 py-2 w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
           <div className="col-span-full py-20 text-center"><div className="w-8 h-8 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mx-auto" /></div>
        ) : filtered.map(c => (
          <div key={c.id} className="glass-card hover:border-brand-500/30 transition-all flex flex-col h-full group">
            <div className="h-40 bg-slate-900 overflow-hidden relative border-b border-white/5">
              {c.thumbnail ? <img src={c.thumbnail} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-20"><FiBook size={48}/></div>}
              <div className="absolute top-2 right-2 flex gap-1">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${c.is_active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                  {c.is_active ? 'Aktif' : 'Draft'}
                </span>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-white font-bold text-lg mb-1">{c.title}</h3>
              <p className="text-slate-500 text-xs line-clamp-2 mb-4">{c.description}</p>
              
              <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                 <div className="text-green-400 font-black">Rp {Number(c.price).toLocaleString('id')}</div>
                 <div className="flex gap-2">
                    <button onClick={() => openLessonView(c)} className="p-2 bg-brand-500/10 text-brand-400 rounded-lg hover:bg-brand-500/20 transition-all" title="Kelola Materi"><FiVideo size={16}/></button>
                    <button onClick={() => openCourseEdit(c)} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all"><FiEdit size={16}/></button>
                    <button onClick={() => deleteCourse(c.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"><FiTrash2 size={16}/></button>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Course Modal */}
      {courseModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-[#13131f] border border-white/10 rounded-2xl w-full max-w-xl flex flex-col shadow-2xl animate-fade-in">
            <div className="p-5 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">{courseModal.isEdit ? 'Edit Kursus' : 'Buat Kursus Baru'}</h2>
              <button onClick={() => setCourseModal({...courseModal, open:false})} className="text-slate-400 hover:text-white"><FiX size={20}/></button>
            </div>
            <form onSubmit={submitCourse}>
              <div className="p-6 space-y-4">
                <div><label className="label">Judul Kursus</label><input required value={courseForm.title} onChange={e=>setCourseForm({...courseForm, title: e.target.value})} className="input-field w-full" /></div>
                <div><label className="label">Deskripsi Singkat</label><textarea required rows={3} value={courseForm.description} onChange={e=>setCourseForm({...courseForm, description: e.target.value})} className="input-field w-full" /></div>
                <div><label className="label">Link URL Thumbnail</label><input type="url" value={courseForm.thumbnail} onChange={e=>setCourseForm({...courseForm, thumbnail: e.target.value})} className="input-field w-full" placeholder="https://..." /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">Harga Jual (Rp)</label><input required type="number" value={courseForm.price} onChange={e=>setCourseForm({...courseForm, price: e.target.value})} className="input-field w-full" /></div>
                  <div><label className="label">Harga Coret (Rp)</label><input type="number" value={courseForm.original_price} onChange={e=>setCourseForm({...courseForm, original_price: e.target.value})} className="input-field w-full" /></div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                  <input type="checkbox" checked={courseForm.is_active} onChange={e=>setCourseForm({...courseForm, is_active: e.target.checked})} /> Aktif (Tampilkan di Katalog)
                </label>
              </div>
              <div className="p-5 border-t border-white/5 flex justify-end gap-3 bg-white/2">
                <button type="button" onClick={() => setCourseModal({...courseModal, open:false})} className="btn-outline px-4 py-2">Batal</button>
                <button type="submit" className="btn-primary px-6 py-2">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
