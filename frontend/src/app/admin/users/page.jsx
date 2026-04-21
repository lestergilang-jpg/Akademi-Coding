'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { FiToggleLeft, FiToggleRight, FiSearch, FiRefreshCw } from 'react-icons/fi';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data.data || []);
    } catch {
      toast.error('Gagal memuat daftar user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUser = async (id) => {
    try {
      await api.put(`/admin/users/${id}/toggle-active`);
      toast.success('Status user diperbarui');
      fetchUsers();
    } catch {
      toast.error('Gagal update user');
    }
  };

  const filtered = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">Manajemen User</h1>
          <p className="text-slate-500 mt-2">Kelola akses dan aktivitas member platform.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Cari user..."
              className="input-field pl-10 py-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button onClick={fetchUsers} className="btn-outline p-2.5">
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/3 border-b border-white/10">
              <tr>
                {['Info User','Role','Akses','Tgl Daftar','Aksi'].map(h => (
                  <th key={h} className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-20"><div className="w-8 h-8 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mx-auto" /></td></tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-6 py-4 text-white">
                    <div className="font-semibold">{u.name}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{u.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${u.role === 'admin' ? 'bg-brand-500/20 text-brand-400' : 'bg-white/10 text-slate-400'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${u.is_active ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-500'}`}>
                      {u.is_active ? 'Premium' : 'Biasa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {new Date(u.created_at).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleUser(u.id)} 
                      className="text-slate-400 hover:text-white transition-all transform hover:scale-110"
                      title={u.is_active ? 'Nonaktifkan Premium' : 'Aktifkan Premium'}
                    >
                      {u.is_active ? <FiToggleRight size={24} className="text-green-400" /> : <FiToggleLeft size={24} />}
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-20 text-slate-500">Tidak ada user ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
