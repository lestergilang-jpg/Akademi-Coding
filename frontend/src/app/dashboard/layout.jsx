'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  FiCode, FiBook, FiList, FiSettings, FiLogOut,
  FiMenu, FiX, FiHome, FiChevronRight
} from 'react-icons/fi';

// ─── Sidebar nav items ────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { href: '/dashboard',                label: 'Overview',          icon: FiHome },
  { href: '/dashboard/katalog-kursus', label: 'Katalog Kursus',   icon: FiBook },
  { href: '/dashboard/transaksi',      label: 'Riwayat Transaksi', icon: FiList },
  { href: '/dashboard/setting',        label: 'Pengaturan Profil', icon: FiSettings },
];

// ─── Avatar helper ────────────────────────────────────────────────────────────
function UserAvatar({ user, size = 10 }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const cls = `w-${size} h-${size} rounded-full border border-brand-500/60 overflow-hidden`;
  if (user?.avatar_url) {
    return (
      <div className={cls}>
        <img src={`${API_URL}${user.avatar_url}`} alt="Avatar" className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div className={`${cls} bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-bold`}
         style={{ fontSize: size * 1.6 + 'px' }}>
      {user?.name?.charAt(0).toUpperCase()}
    </div>
  );
}

// ─── Sidebar content (shared between desktop & mobile) ────────────────────────
function SidebarContent({ user, pathname, onClose, onLogout }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white" onClick={onClose}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shrink-0">
            <FiCode className="text-white text-sm" />
          </div>
          AkademiCoding
        </Link>
        {/* Close button — mobile only */}
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <FiX size={20} />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <UserAvatar user={user} size={10} />
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-sm truncate">{user?.name}</div>
            <div className={`text-xs mt-0.5 ${user?.is_active ? 'text-green-400' : 'text-yellow-400'}`}>
              {user?.is_active ? '✓ Member Premium' : '⚡ Member Biasa'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <p className="text-slate-500 text-xs uppercase tracking-wider mb-3 px-2">Menu Utama</p>
        <div className="space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            // Active check: exact for /dashboard, startsWith for others
            const isActive = href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                  ${isActive
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/25'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <Icon size={16} className={isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'} />
                {label}
                {isActive && <FiChevronRight size={14} className="ml-auto text-brand-400 opacity-60" />}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 w-full transition-all duration-200"
        >
          <FiLogOut size={16} />
          Keluar
        </button>
      </div>
    </div>
  );
}

// ─── Dashboard Layout ─────────────────────────────────────────────────────────
export default function DashboardLayout({ children }) {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex overflow-hidden">

      {/* ── DESKTOP SIDEBAR (fixed, always visible) ── */}
      <aside className="hidden lg:flex w-64 shrink-0 h-screen sticky top-0 bg-[#0d0d1a] border-r border-white/10 flex-col">
        <SidebarContent
          user={user}
          pathname={pathname}
          onClose={null}
          onLogout={handleLogout}
        />
      </aside>

      {/* ── MOBILE SIDEBAR (off-canvas) ── */}
      {/* Backdrop */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300
          ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />
      {/* Drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 z-50 w-72 h-screen bg-[#0d0d1a] border-r border-white/10 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <SidebarContent
          user={user}
          pathname={pathname}
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
        />
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-[#0d0d1a]/80 backdrop-blur-md border-b border-white/10 px-4 lg:px-6 py-3 flex items-center gap-4">
          {/* Hamburger — mobile only */}
          <button
            id="hamburger-menu"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Buka menu navigasi"
          >
            <FiMenu size={20} />
          </button>

          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2 font-bold text-white">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <FiCode className="text-white text-xs" />
            </div>
            <span className="text-sm">AkademiCoding</span>
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right: Avatar */}
          <Link href="/dashboard/setting" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <UserAvatar user={user} size={8} />
            <span className="hidden sm:block text-sm text-slate-300 font-medium">{user?.name}</span>
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
