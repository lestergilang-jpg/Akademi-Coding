'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { FiCode, FiMenu, FiX } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handle);
    return () => window.removeEventListener('scroll', handle);
  }, []);

  const navLinks = [
    { label: 'Kurikulum', href: '#curriculum' },
    { label: 'Testimoni', href: '#testimonials' },
    { label: 'Harga', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
            <FiCode className="text-white text-sm" />
          </div>
          <span>Cuma<span className="text-gradient">Ngeprompt</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(l => (
            <a key={l.href} href={l.href} className="nav-link">{l.label}</a>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link href={user.role === 'admin' ? '/admin' : '/dashboard'} className="nav-link">
                {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
              </Link>
              <button onClick={logout} className="btn-outline py-2 px-4 text-sm">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link">Masuk</Link>
              <Link href="/register" className="btn-primary py-2 px-5 text-sm">Daftar Gratis</Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-white text-2xl">
          {open ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10 px-4 py-4 flex flex-col gap-4">
          {navLinks.map(l => (
            <a key={l.href} href={l.href} className="nav-link text-lg" onClick={() => setOpen(false)}>{l.label}</a>
          ))}
          <hr className="border-white/10" />
          {user ? (
            <>
              <Link href="/dashboard" className="nav-link">Dashboard</Link>
              <button onClick={logout} className="btn-outline w-full">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link">Masuk</Link>
              <Link href="/register" className="btn-primary text-center">Daftar Gratis</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
