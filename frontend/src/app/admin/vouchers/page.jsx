'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  FiPlus, FiTrash2, FiTag, FiCalendar, FiUsers, 
  FiHash, FiCheck, FiX, FiInfo, FiChevronDown, FiBook 
} from 'react-icons/fi';

export default function AdminVoucherPage() {
  const [vouchers, setVouchers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form state
  const [form, setForm] = useState({
    code: '',
    type: 'percentage',
    value: '',
    usage_limit: '',
    user_limit: 1,
    expiry_date: '',
    course_ids: []
  });

  useEffect(() => {
    fetchVouchers();
    fetchCourses();
  }, []);

  const fetchVouchers = async () => {
    try {
      const { data } = await api.get('/admin/vouchers');
      setVouchers(data.data);
    } catch (err) {
      toast.error('Gagal mengambil data voucher.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/courses');
      setCourses(data.data);
    } catch (err) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.course_ids.length === 0) return toast.error('Pilih minimal satu kursus.');
    
    try {
      await api.post('/admin/vouchers', form);
      toast.success('Voucher berhasil dibuat!');
      setShowModal(false);
      setForm({ code: '', type: 'percentage', value: '', usage_limit: '', user_limit: 1, expiry_date: '', course_ids: [] });
      fetchVouchers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat voucher.');
    }
  };

  const toggleStatus = async (id) => {
    try {
      await api.put(`/admin/vouchers/${id}/toggle`);
      toast.success('Status voucher diperbarui.');
      fetchVouchers();
    } catch (err) {
      toast.error('Gagal mengubah status.');
    }
  };

  const deleteVoucher = async (id) => {
    if (!confirm('Hapus voucher ini?')) return;
    try {
      await api.delete(`/admin/vouchers/${id}`);
      toast.success('Voucher dihapus.');
      fetchVouchers();
    } catch (err) {
      toast.error('Gagal menghapus.');
    }
  };

  const toggleCourseSelection = (courseId) => {
    setForm(prev => {
      const exists = prev.course_ids.includes(courseId);
      if (exists) {
        return { ...prev, course_ids: prev.course_ids.filter(id => id !== courseId) };
      } else {
        return { ...prev, course_ids: [...prev.course_ids, courseId] };
      }
    });
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Manajemen Voucher</h1>
          <p className="text-slate-400 text-sm mt-1">Buat dan kelola kode promo untuk kursus kamu</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <FiPlus /> Tambah Voucher
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : vouchers.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FiTag size={48} className="text-slate-700 mx-auto mb-4" />
          <p className="text-white font-medium">Belum ada voucher</p>
          <p className="text-slate-500 text-sm mt-1">Klik tombol "Tambah Voucher" untuk memulai.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {vouchers.map((v) => (
            <div key={v.id} className={`glass-card p-5 border flex flex-col md:flex-row md:items-center gap-6 transition-all ${v.is_active ? 'border-white/5 bg-white/2' : 'border-red-500/10 bg-red-500/5 grayscale opacity-60'}`}>
              <div className="flex items-center gap-4 min-w-[200px]">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-400 text-xl">
                  <FiHash />
                </div>
                <div>
                  <div className="text-lg font-bold text-white tracking-widest">{v.code}</div>
                  <div className="text-xs text-slate-500 font-medium">ID: #{v.id}</div>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Potongan</span>
                  <span className="text-white font-semibold">
                    {v.type === 'percentage' ? `${v.value}%` : `Rp ${parseInt(v.value).toLocaleString()}`}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Pemakaian</span>
                  <span className="text-white font-semibold">
                    {v.used_count} / {v.usage_limit || '∞'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Berlaku Sampai</span>
                  <span className="text-white font-semibold flex items-center gap-1.5">
                    <FiCalendar size={14} className="text-slate-500" />
                    {new Date(v.expiry_date).toLocaleDateString('id-ID')}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Status</span>
                  <span className={v.is_active ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                    {v.is_active ? 'Aktif' : 'Non-aktif'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">
                <button 
                  onClick={() => toggleStatus(v.id)}
                  title={v.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  className={`p-2 rounded-lg transition-colors ${v.is_active ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'}`}
                >
                  {v.is_active ? <FiX size={18} /> : <FiCheck size={18} />}
                </button>
                <button 
                  onClick={() => deleteVoucher(v.id)}
                  className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah Voucher */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-xl max-h-[90vh] overflow-y-auto p-8 relative animate-fade-up">
            <h2 className="text-xl font-bold text-white mb-6">Tambah Voucher Baru</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Kode Promo</label>
                  <input 
                    type="text" 
                    placeholder="CONTOH: PROMO77"
                    value={form.code}
                    onChange={e => setForm({...form, code: e.target.value})}
                    className="input-field" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Tipe Diskon</label>
                  <select 
                    value={form.type}
                    onChange={e => setForm({...form, type: e.target.value})}
                    className="input-field"
                  >
                    <option value="percentage">Persentase (%)</option>
                    <option value="fixed">Nominal (Rp)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    {form.type === 'percentage' ? 'Persen' : 'Nominal Potongan'}
                  </label>
                  <input 
                    type="number" 
                    placeholder={form.type === 'percentage' ? 'Contoh: 50' : 'Contoh: 25000'}
                    value={form.value}
                    onChange={e => setForm({...form, value: e.target.value})}
                    className="input-field" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Total Kuota (Global)</label>
                  <input 
                    type="number" 
                    placeholder="Kosongkan jika tak terbatas"
                    value={form.usage_limit}
                    onChange={e => setForm({...form, usage_limit: e.target.value})}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Limit per User</label>
                  <input 
                    type="number" 
                    value={form.user_limit}
                    onChange={e => setForm({...form, user_limit: e.target.value})}
                    className="input-field" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Tanggal Kadaluarsa</label>
                  <input 
                    type="date" 
                    value={form.expiry_date}
                    onChange={e => setForm({...form, expiry_date: e.target.value})}
                    className="input-field" 
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2 font-bold flex items-center gap-2">
                  <FiBook className="text-brand-400" /> Berlaku Untuk Kursus:
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto p-3 rounded-xl bg-white/5 border border-white/10">
                  {courses.map(c => (
                    <label key={c.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors group">
                      <div 
                        onClick={() => toggleCourseSelection(c.id)}
                        className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${form.course_ids.includes(c.id) ? 'bg-brand-500 border-brand-500' : 'border-slate-500'}`}
                      >
                        {form.course_ids.includes(c.id) && <FiCheck className="text-white" size={12} />}
                      </div>
                      <span className="text-slate-300 text-sm group-hover:text-white">{c.title}</span>
                    </label>
                  ))}
                  {courses.length === 0 && <p className="text-slate-500 text-center text-xs p-4">Tidak ada kursus tersedia.</p>}
                </div>
                <p className="text-[10px] text-slate-500 mt-2 px-1 italic">Voucher hanya akan bisa digunakan pada kursus yang dipilih di atas.</p>
              </div>

              <div className="flex gap-4 pt-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="btn-outline flex-1 justify-center py-3"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn-primary flex-1 justify-center py-3"
                >
                  Buat Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
