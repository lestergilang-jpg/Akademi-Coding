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
  FiPlus, FiTrash2, FiEdit, FiBarChart2
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
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[#0d0d1a] border-r border-white/10 flex flex-col fixed h-full">
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
            <button key={t} onClick={() => setTab(t)}
              className={`w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${tab === t ? 'bg-brand-500/20 text-brand-300' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              {t === 'Dashboard' && <FiBarChart2 size={15} />}
              {t === 'Users' && <FiUsers size={15} />}
              {t === 'Kursus' && <FiBook size={15} />}
              {t === 'Transaksi' && <FiDollarSign size={15} />}
              {t}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm px-3 py-2">
            <FiHome size={14} /> User Dashboard
          </Link>
          <button onClick={() => { logout(); router.push('/'); }} className="flex items-center gap-2 text-slate-400 hover:text-red-400 text-sm px-3 py-2 w-full">
            <FiLogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-56 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">{tab}</h1>
          <button onClick={fetchData} className="btn-outline py-2 px-3 text-sm gap-1.5">
            <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
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
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 bg-white/3">
                <tr>{['ID','Nama','Email','Role','Status','Tgl Daftar','Aksi'].map(h => <th key={h} className="text-left px-4 py-3 text-slate-400 font-medium">{h}</th>)}</tr>
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
                      <button onClick={() => toggleUser(u.id)} className="text-slate-400 hover:text-white transition-colors">
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

        {/* ── Courses ── */}
        {tab === 'Kursus' && (
          <div>
            <div className="glass-card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-white/10 bg-white/3">
                  <tr>{['ID','Judul','Harga','Harga Asli','Status'].map(h => <th key={h} className="text-left px-4 py-3 text-slate-400 font-medium">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {courses.map(c => (
                    <tr key={c.id} className="hover:bg-white/3">
                      <td className="px-4 py-3 text-slate-500">#{c.id}</td>
                      <td className="px-4 py-3 text-white font-medium">{c.title}</td>
                      <td className="px-4 py-3 text-green-400 font-semibold">Rp {Number(c.price).toLocaleString('id')}</td>
                      <td className="px-4 py-3 text-slate-500 line-through">Rp {Number(c.original_price).toLocaleString('id')}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${c.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{c.is_active ? 'Aktif' : 'Nonaktif'}</span></td>
                    </tr>
                  ))}
                  {courses.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-slate-500">Tidak ada kursus</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Transactions ── */}
        {tab === 'Transaksi' && (
          <div className="glass-card overflow-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="border-b border-white/10 bg-white/3">
                <tr>{['Order ID','User','Kursus','Amount','Status','Tgl'].map(h => <th key={h} className="text-left px-4 py-3 text-slate-400 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-white/3">
                    <td className="px-4 py-3 text-slate-500 text-xs font-mono">{t.id.substring(0, 20)}...</td>
                    <td className="px-4 py-3"><div className="text-white">{t.user_name}</div><div className="text-slate-500 text-xs">{t.user_email}</div></td>
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
    </div>
  );
}
