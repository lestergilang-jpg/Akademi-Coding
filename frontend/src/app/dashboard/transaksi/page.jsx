'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { FiShoppingCart, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';

const STATUS_CONFIG = {
  success: { label: 'Berhasil', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: FiCheckCircle },
  pending: { label: 'Pending',  color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: FiClock },
  failed:  { label: 'Gagal',    color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: FiXCircle },
  cancel:  { label: 'Dibatalkan', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: FiXCircle },
  expire:  { label: 'Kedaluwarsa', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: FiAlertCircle },
};

function SkeletonRow() {
  return (
    <tr className="border-t border-white/10 animate-pulse">
      {[1,2,3,4,5].map(i => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-white/10 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export default function TransaksiPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null); // transaction id yang sedang diproses

  useEffect(() => {
    api.get('/transactions/my')
      .then(({ data }) => setTransactions(data.data || []))
      .catch(() => toast.error('Gagal memuat riwayat transaksi.'))
      .finally(() => setLoading(false));
  }, []);

  const handleRetryPayment = async (courseId, txId) => {
    setPaying(txId);
    try {
      const { data } = await api.post('/transactions/create', { course_id: courseId });
      const script = document.createElement('script');
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY);
      script.onload = () => {
        window.snap.pay(data.data.snap_token, {
          onSuccess: () => {
            toast.success('Pembayaran berhasil! 🎉');
            window.location.reload();
          },
          onPending: () => toast('Pembayaran pending.', { icon: '⏳' }),
          onError: () => toast.error('Pembayaran gagal.'),
          onClose: () => toast('Pembayaran dibatalkan.', { icon: 'ℹ️' }),
        });
      };
      document.body.appendChild(script);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memproses pembayaran.');
    } finally {
      setPaying(null);
    }
  };

  const formatDate = (str) => str
    ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(str))
    : '-';

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Riwayat Transaksi</h1>
        <p className="text-slate-400 text-sm mt-1">
          {loading ? 'Memuat...' : `${transactions.length} transaksi ditemukan`}
        </p>
      </div>

      <div className="glass-card overflow-hidden">
        {/* Mobile: card layout */}
        <div className="block md:hidden">
          {loading && (
            <div className="p-6 space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="animate-pulse space-y-2 p-4 border border-white/10 rounded-xl">
                  <div className="h-4 bg-white/10 rounded w-1/2" />
                  <div className="h-3 bg-white/5 rounded w-3/4" />
                </div>
              ))}
            </div>
          )}
          {!loading && transactions.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              Belum ada transaksi.
            </div>
          )}
          {!loading && transactions.map(t => {
            const cfg = STATUS_CONFIG[t.status] || STATUS_CONFIG.failed;
            const StatusIcon = cfg.icon;
            const canRetry = ['failed', 'cancel', 'expire', 'pending'].includes(t.status);
            return (
              <div key={t.id} className="p-4 border-b border-white/10 last:border-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-white font-medium text-sm">{t.course_title || 'Kursus'}</p>
                    <p className="text-slate-500 text-xs mt-0.5">ID: {t.id?.slice(0, 8)}...</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border font-medium ${cfg.color}`}>
                    <StatusIcon size={11} /> {cfg.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-400 font-bold">Rp {parseFloat(t.amount).toLocaleString('id-ID')}</p>
                    <p className="text-slate-600 text-xs mt-0.5">{formatDate(t.created_at)}</p>
                  </div>
                  {canRetry && (
                    <button
                      onClick={() => handleRetryPayment(t.course_id, t.id)}
                      disabled={paying === t.id}
                      className="flex items-center gap-1 text-brand-400 hover:text-brand-300 text-xs border border-brand-500/30 hover:border-brand-400/50 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                    >
                      {paying === t.id ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> : <FiShoppingCart size={12} />}
                      {t.status === 'pending' ? 'Lanjutkan' : 'Bayar Ulang'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop: table layout */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">ID Transaksi</th>
                <th className="px-6 py-4 font-semibold">Kursus</th>
                <th className="px-6 py-4 font-semibold">Nominal</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Tanggal</th>
                <th className="px-6 py-4 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && <><SkeletonRow /><SkeletonRow /></>}
              {!loading && transactions.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500">
                    Belum ada transaksi.
                  </td>
                </tr>
              )}
              {!loading && transactions.map(t => {
                const cfg = STATUS_CONFIG[t.status] || STATUS_CONFIG.failed;
                const StatusIcon = cfg.icon;
                const canRetry = ['failed', 'cancel', 'expire', 'pending'].includes(t.status);
                return (
                  <tr key={t.id} className="border-t border-white/10 hover:bg-white/3 transition-colors">
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{t.id?.slice(0, 12)}...</td>
                    <td className="px-6 py-4 text-slate-300 font-medium">{t.course_title || 'Unknown Course'}</td>
                    <td className="px-6 py-4 text-brand-400 font-bold">Rp {parseFloat(t.amount).toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
                        <StatusIcon size={11} /> {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(t.created_at)}</td>
                    <td className="px-6 py-4">
                      {canRetry && (
                        <button
                          onClick={() => handleRetryPayment(t.course_id, t.id)}
                          disabled={paying === t.id}
                          className="flex items-center gap-1.5 text-brand-400 hover:text-brand-300 text-xs border border-brand-500/30 hover:border-brand-400/50 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                        >
                          {paying === t.id ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> : <FiShoppingCart size={12} />}
                          {t.status === 'pending' ? 'Lanjutkan' : 'Bayar Ulang'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
