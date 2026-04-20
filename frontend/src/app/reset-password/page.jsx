'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { FiLock, FiCode, FiEye, FiEyeOff } from 'react-icons/fi';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Token tidak valid atau tidak ditemukan.');
      return;
    }
    if (password.length < 8) {
      toast.error('Password minimal 8 karakter');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password', { token, newPassword: password });
      toast.success(data.message);
      router.push('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Password Baru</label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Min. 8 karakter"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-field pl-10 pr-10"
              required
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              {showPass ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
          {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-600/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent-500/15 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl text-white">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <FiCode className="text-white" />
            </div>
            Akademi<span className="text-gradient">Coding</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-6">Buat Password Baru 🛡️</h1>
          <p className="text-slate-400 mt-2">Buat password baru yang kuat untuk keamanan akunmu.</p>
        </div>

        <Suspense fallback={<div className="text-center text-white">Memuat formulir...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
