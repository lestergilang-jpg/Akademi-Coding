'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { 
  FiBarChart2, FiUsers, FiBook, FiDollarSign, 
  FiHome, FiLogOut, FiMenu, FiX, FiCode, FiLayout, FiTag, FiMessageSquare
} from 'react-icons/fi';

const MENU_ITEMS = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: FiBarChart2 },
  { label: 'Users', href: '/admin/users', icon: FiUsers },
  { label: 'Kursus', href: '/admin/kursus', icon: FiBook },
  { label: 'Transaksi', href: '/admin/transaksi', icon: FiDollarSign },
  { label: 'Vouchers', href: '/admin/vouchers', icon: FiTag },
  { label: 'Testimoni', href: '/admin/testimoni', icon: FiMessageSquare },
  { label: 'Landing Page', href: '/admin/settings', icon: FiLayout },
];

export default function AdminLayout({ children }) {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push('/login');
      else if (user.role !== 'admin') router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-300">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#0d0d1a] border-r border-white/5 
        transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-white">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <FiCode size={16} className="text-white" />
            </div>
            <span>Admin Central</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400">
            <FiX size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive ? 'bg-brand-500/10 text-brand-400 font-semibold' : 'hover:bg-white/5 text-slate-400 hover:text-white'}
                `}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-500 hover:text-white transition-colors">
            <FiHome size={16} /> Kembali ke User View
          </Link>
          <button 
            onClick={() => { logout(); router.push('/'); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all"
          >
            <FiLogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Top Navbar Mobile */}
        <header className="lg:hidden h-16 bg-[#0d0d1a] border-b border-white/5 flex items-center gap-4 px-6 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-400">
            <FiMenu size={24} />
          </button>
          <div className="flex items-center gap-2 font-bold text-white">
             Admin Central
          </div>
        </header>

        <main className="p-6 md:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
