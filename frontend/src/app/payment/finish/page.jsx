'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { FiCheckCircle, FiXCircle, FiClock, FiHome, FiBook } from 'react-icons/fi';

function PaymentContent() {
  const params = useSearchParams();
  const status = params.get('transaction_status') || 'pending';
  const orderId = params.get('order_id');

  const config = {
    settlement: { icon: FiCheckCircle, color: 'text-green-400', title: 'Pembayaran Berhasil! 🎉', desc: 'Terima kasih! Akses premium kamu sudah aktif. Selamat belajar!', bg: 'bg-green-500/10 border-green-500/30' },
    capture: { icon: FiCheckCircle, color: 'text-green-400', title: 'Pembayaran Berhasil! 🎉', desc: 'Terima kasih! Akses premium kamu sudah aktif. Selamat belajar!', bg: 'bg-green-500/10 border-green-500/30' },
    pending: { icon: FiClock, color: 'text-yellow-400', title: 'Pembayaran Pending ⏳', desc: 'Pembayaran kamu sedang diproses. Akses akan aktif otomatis dalam beberapa menit setelah konfirmasi.', bg: 'bg-yellow-500/10 border-yellow-500/30' },
    expire: { icon: FiXCircle, color: 'text-red-400', title: 'Pembayaran Expired ❌', desc: 'Waktu pembayaran sudah habis. Silakan coba lagi.', bg: 'bg-red-500/10 border-red-500/30' },
    cancel: { icon: FiXCircle, color: 'text-red-400', title: 'Pembayaran Dibatalkan', desc: 'Pembayaran kamu dibatalkan. Kamu bisa coba lagi kapanpun.', bg: 'bg-red-500/10 border-red-500/30' },
  };

  const c = config[status] || config.pending;
  const Icon = c.icon;

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className={`glass-card p-10 border ${c.bg}`}>
          <Icon size={64} className={`${c.color} mx-auto mb-6`} />
          <h1 className="text-2xl font-bold text-white mb-3">{c.title}</h1>
          <p className="text-slate-400 mb-6 leading-relaxed">{c.desc}</p>
          {orderId && <p className="text-slate-600 text-xs mb-6">Order ID: {orderId}</p>}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {(status === 'settlement' || status === 'capture') && (
              <Link href="/dashboard" className="btn-primary justify-center">
                <FiBook /> Mulai Belajar
              </Link>
            )}
            <Link href="/" className="btn-outline justify-center">
              <FiHome /> Kembali ke Beranda
            </Link>
            {(status === 'expire' || status === 'cancel') && (
              <Link href="/dashboard" className="btn-primary justify-center">
                Coba Lagi
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFinishPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>}><PaymentContent /></Suspense>;
}
