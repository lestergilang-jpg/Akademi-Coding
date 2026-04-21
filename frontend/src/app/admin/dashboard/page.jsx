'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { FiUsers, FiDollarSign, FiBook, FiBarChart2 } from 'react-icons/fi';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="glass-card p-6 border border-white/5 bg-white/2">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div className="text-3xl font-black text-white">{value ?? '...'}</div>
      <div className="text-slate-500 text-sm mt-1 uppercase tracking-wider font-semibold">{label}</div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data.data);
    } catch {
      toast.error('Gagal memuat statistik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Ringkasan Sistem</h1>
        <p className="text-slate-500 mt-2">Pantau performa platform AkademiCoding Anda.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={FiUsers} 
          label="Total Member" 
          value={stats?.total_users} 
          color="bg-blue-600/40 border border-blue-500/30 shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]" 
        />
        <StatCard 
          icon={FiUsers} 
          label="Siswa Aktif" 
          value={stats?.active_users} 
          color="bg-green-600/40 border border-green-500/30 shadow-[0_0_20px_-5px_rgba(34,197,94,0.3)]" 
        />
        <StatCard 
          icon={FiDollarSign} 
          label="Pendapatan (Rp)" 
          value={stats ? Number(stats.total_revenue).toLocaleString('id') : null} 
          color="bg-brand-600/40 border border-brand-500/30 shadow-[0_0_20px_-5px_rgba(139,92,246,0.3)]" 
        />
        <StatCard 
          icon={FiBarChart2} 
          label="Total Transaksi" 
          value={stats?.total_transactions} 
          color="bg-orange-600/40 border border-orange-500/30 shadow-[0_0_20px_-5px_rgba(249,115,22,0.3)]" 
        />
      </div>
    </div>
  );
}
