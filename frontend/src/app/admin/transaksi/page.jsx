'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { FiRefreshCw, FiDollarSign } from 'react-icons/fi';

export default function AdminTransaksiPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/transactions');
      setTransactions(data.data || []);
    } catch {
      toast.error('Gagal memuat transaksi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const statusBadge = (status) => {
    const map = { 
      success: 'text-green-400 bg-green-500/10 border-green-500/20', 
      pending: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', 
      failed: 'text-red-400 bg-red-500/10 border-red-500/20', 
      cancelled: 'text-slate-400 bg-white/5 border-white/10', 
      refund: 'text-blue-400 bg-blue-500/10 border-blue-500/20' 
    };
    return (
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase border ${map[status] || 'text-slate-400 bg-white/5 border-white/10'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">Log Transaksi</h1>
          <p className="text-slate-500 mt-2">Daftar seluruh pembayaran yang masuk ke sistem.</p>
        </div>
        <button onClick={fetchTransactions} className="btn-outline p-2.5 flex items-center gap-2 text-sm">
          <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh Data
        </button>
      </div>

      <div className="glass-card overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/3 border-b border-white/10">
              <tr>
                {['ID Pesanan','Pembeli','Produk','Jumlah','Status','Waktu'].map(h => (
                  <th key={h} className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                 <tr><td colSpan={6} className="text-center py-20"><div className="w-8 h-8 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mx-auto" /></td></tr>
              ) : transactions.map(t => (
                <tr key={t.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-slate-500 font-mono text-[10px] uppercase">{t.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white font-semibold text-sm">{t.user_name}</div>
                    <div className="text-slate-500 text-[10px] mt-0.5">{t.user_email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-300 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{t.course_title || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white font-bold text-sm">Rp {Number(t.amount).toLocaleString('id')}</div>
                    <div className="text-[10px] text-slate-500 uppercase">{t.payment_type || 'snap'}</div>
                  </td>
                  <td className="px-6 py-4">{statusBadge(t.status)}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {new Date(t.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                </tr>
              ))}
              {!loading && transactions.length === 0 && (
                <tr><td colSpan={6} className="text-center py-20 text-slate-500">Belum ada transaksi terekam.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
