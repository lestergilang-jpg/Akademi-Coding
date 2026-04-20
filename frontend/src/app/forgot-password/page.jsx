'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { FiMail, FiCode, FiArrowLeft, FiSend } from 'react-icons/fi';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      toast.success(data.message);
      setSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim email reset.');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-white mt-6">Lupa Password? 🔐</h1>
          <p className="text-slate-400 mt-2">Masukkan email kamu dan kami akan kirimkan link untuk membuat password baru.</p>
        </div>

        <div className="glass-card p-8">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-brand-500/20 text-brand-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiSend size={32} />
              </div>
              <h3 className="text-xl font-bold text-white">Cek Inbox Kamu!</h3>
              <p className="text-slate-400 text-sm">
                Link reset password telah dikirim ke <strong>{email}</strong>. Link ini hanya berlaku selama 15 menit.
              </p>
              <Link href="/login" className="btn-primary w-full justify-center inline-flex py-3 text-sm mt-4">
                Kembali ke Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email Akun</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    placeholder="kamu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
                {loading ? 'Mengirim...' : 'Kirim Link Reset'}
              </button>
            </form>
          )}

          {!success && (
            <div className="mt-6 text-center">
              <Link href="/login" className="text-slate-400 hover:text-white text-sm inline-flex items-center gap-2">
                <FiArrowLeft /> Kembali ke Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
