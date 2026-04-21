'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { FiBook, FiList, FiSettings, FiZap, FiChevronRight, FiAward } from 'react-icons/fi';

const QUICK_LINKS = [
  {
    href: '/dashboard/katalog-kursus',
    icon: FiBook,
    label: 'Katalog Kursus',
    desc: 'Jelajahi semua kursus yang tersedia',
    color: 'from-brand-500/20 to-brand-600/10 border-brand-500/25',
    iconColor: 'text-brand-400',
  },
  {
    href: '/dashboard/transaksi',
    icon: FiList,
    label: 'Riwayat Transaksi',
    desc: 'Lihat semua riwayat pembelian kamu',
    color: 'from-accent-500/20 to-accent-600/10 border-accent-500/25',
    iconColor: 'text-accent-400',
  },
  {
    href: '/dashboard/setting',
    icon: FiSettings,
    label: 'Pengaturan Profil',
    desc: 'Kelola akun dan keamanan kamu',
    color: 'from-slate-500/20 to-slate-600/10 border-slate-500/25',
    iconColor: 'text-slate-300',
  },
];

export default function DashboardOverviewPage() {
  const { user, refreshUser } = useAuth();
  const [courseCount, setCourseCount] = useState(null);

  useEffect(() => {
    // Handle discord callback
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
    api.get('/courses')
      .then(({ data }) => setCourseCount(data.data?.length ?? 0))
      .catch(() => {});
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Selamat Pagi' : hour < 17 ? 'Selamat Siang' : 'Selamat Malam';

  return (
    <div className="p-6 max-w-4xl">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">
          {greeting}, <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-slate-400 mt-1.5">
          {user?.is_active
            ? 'Kamu sudah punya akses premium. Selamat belajar!'
            : 'Tingkatkan pengalamanmu dengan akses premium kursus.'}
        </p>
      </div>

      {/* Status card */}
      <div className={`glass-card p-5 mb-8 flex items-center gap-4 border
        ${user?.is_active ? 'border-green-500/25 bg-green-500/5' : 'border-yellow-500/25 bg-yellow-500/5'}`}>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0
          ${user?.is_active ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
          {user?.is_active ? '🏆' : '⚡'}
        </div>
        <div className="flex-1">
          <p className={`font-semibold text-sm ${user?.is_active ? 'text-green-400' : 'text-yellow-400'}`}>
            {user?.is_active ? 'Member Premium Aktif' : 'Member Biasa'}
          </p>
          <p className="text-slate-400 text-xs mt-0.5">
            {user?.is_active
              ? 'Kamu bisa mengakses seluruh materi kursus.'
              : 'Beli kursus untuk membuka akses semua materi.'}
          </p>
        </div>
        {!user?.is_active && (
          <Link href="/dashboard/katalog-kursus" className="btn-primary py-2 px-4 text-sm shrink-0">
            <FiZap size={14} /> Upgrade
          </Link>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-white">
            {courseCount !== null ? courseCount : <span className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin inline-block" />}
          </div>
          <div className="text-slate-400 text-xs mt-1">Kursus Tersedia</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-white">{user?.is_active ? '∞' : '0'}</div>
          <div className="text-slate-400 text-xs mt-1">Akses Materi</div>
        </div>
        <div className="glass-card p-4 text-center col-span-2 sm:col-span-1">
          <FiAward className="text-brand-400 mx-auto mb-1" size={24} />
          <div className="text-slate-400 text-xs">{user?.role === 'admin' ? '👑 Admin' : 'Member'}</div>
        </div>
      </div>

      {/* Quick links */}
      <h2 className="text-white font-semibold mb-4">Akses Cepat</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {QUICK_LINKS.map(({ href, icon: Icon, label, desc, color, iconColor }) => (
          <Link
            key={href}
            href={href}
            className={`glass-card p-5 flex flex-col gap-3 border bg-gradient-to-br ${color}
              hover:scale-[1.02] hover:shadow-lg transition-all duration-200 group`}
          >
            <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${iconColor}`}>
              <Icon size={20} />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">{label}</div>
              <div className="text-slate-400 text-xs mt-0.5">{desc}</div>
            </div>
            <FiChevronRight size={16} className={`${iconColor} opacity-60 mt-auto self-end group-hover:translate-x-1 transition-transform`} />
          </Link>
        ))}
      </div>
    </div>
  );
}
