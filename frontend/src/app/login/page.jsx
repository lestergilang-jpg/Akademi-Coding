'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiCode, FiEye, FiEyeOff, FiArrowRight, FiAlertCircle, FiCheckCircle, FiClock } from 'react-icons/fi';

// ─── Helper: format countdown "MM:SS" ────────────────────────────────────────
function formatCountdown(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ─── Inline Alert Component ───────────────────────────────────────────────────
function Alert({ type, message }) {
  if (!message) return null;
  const styles = {
    error:   'bg-red-500/10 border-red-500/40 text-red-300',
    success: 'bg-green-500/10 border-green-500/40 text-green-300',
    warning: 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300',
  };
  const Icon = type === 'success' ? FiCheckCircle : type === 'warning' ? FiClock : FiAlertCircle;
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${styles[type]}`}>
      <Icon className="shrink-0 mt-0.5 text-base" />
      <span>{message}</span>
    </div>
  );
}

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Inline alert (lebih persisten dari toast)
  const [alert, setAlert] = useState(null); // { type: 'error'|'success'|'warning', message: '' }

  // Rate-limit cooldown countdown
  const [cooldown, setCooldown] = useState(0); // dalam detik

  // ─── Handle verify= param dari redirect email verifikasi ─────────────────
  useEffect(() => {
    const verify = searchParams.get('verify');
    if (verify === 'success') {
      setAlert({ type: 'success', message: 'Email berhasil diverifikasi! Silakan login sekarang.' });
    } else if (verify === 'invalid') {
      setAlert({ type: 'error', message: 'Link verifikasi tidak valid atau sudah pernah digunakan.' });
    } else if (verify === 'error') {
      setAlert({ type: 'error', message: 'Terjadi kesalahan saat memverifikasi email. Silakan coba lagi.' });
    }
  }, [searchParams]);

  // ─── Countdown timer untuk rate limit ────────────────────────────────────
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setAlert(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // ─── Map HTTP status → pesan error yang spesifik ─────────────────────────
  function getErrorMessage(err) {
    const status = err.response?.status;
    const serverMsg = err.response?.data?.message;
    const retryAfter = err.response?.data?.retryAfter;

    if (status === 429) {
      // Rate limit kena
      const seconds = (retryAfter || 15) * 60;
      setCooldown(seconds);
      return {
        type: 'warning',
        message: serverMsg || `Terlalu banyak percobaan login. Coba lagi dalam ${formatCountdown(seconds)}.`,
      };
    }
    if (status === 401) {
      // Password salah atau akun belum terverifikasi
      if (serverMsg?.toLowerCase().includes('verifikasi') || serverMsg?.toLowerCase().includes('verified')) {
        return {
          type: 'warning',
          message: 'Akun Anda belum terverifikasi. Silakan cek kotak masuk atau folder spam email Anda.',
        };
      }
      return { type: 'error', message: serverMsg || 'Password yang Anda masukkan salah.' };
    }
    if (status === 404) {
      return { type: 'error', message: serverMsg || 'Email ini belum terdaftar. Apakah Anda sudah punya akun?' };
    }
    if (status === 400) {
      return { type: 'error', message: serverMsg || 'Email dan password wajib diisi.' };
    }

    // Fallback: Error jaringan atau server 500
    return { type: 'error', message: serverMsg || 'Gagal terhubung ke server. Periksa koneksi internet Anda dan coba lagi.' };
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cooldown > 0) return; // Blokir submit saat cooldown aktif

    setLoading(true);
    setAlert(null);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Selamat datang, ${user.name}! 🎉`);
      router.push(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      const alertData = getErrorMessage(err);
      setAlert(alertData);
      
      // Trigger shake animation for errors
      if (alertData.type === 'error') {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      }
    } finally {
      setLoading(false);
    }
  };

  const isBlocked = cooldown > 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-600/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent-500/15 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl text-white">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <FiCode className="text-white" />
            </div>
            Cuma<span className="text-gradient">Ngeprompt</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-6">Selamat Datang Kembali 👋</h1>
          <p className="text-slate-400 mt-2">Masuk ke akun kamu untuk lanjut belajar</p>
        </div>

        {/* Card */}
        <div className={`glass-card p-8 ${isShaking ? 'animate-shake' : ''}`}>
          {/* Alert area — muncul di atas form */}
          {alert && (
            <div className="mb-5">
              <Alert type={alert.type} message={alert.message} />
              {/* Countdown khusus rate-limit */}
              {isBlocked && (
                <div className="mt-2 flex items-center justify-center gap-2 text-yellow-400 text-sm font-mono">
                  <FiClock className="animate-pulse" />
                  <span>Coba lagi dalam: <strong>{formatCountdown(cooldown)}</strong></span>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="kamu@email.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className={`input-field pl-10 ${alert?.type === 'error' ? 'border-red-500/50 focus:border-red-500' : ''}`}
                  disabled={isBlocked}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className={`input-field pl-10 pr-10 ${alert?.type === 'error' ? 'border-red-500/50 focus:border-red-500' : ''}`}
                  disabled={isBlocked}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <Link href="/forgot-password" className="text-sm text-brand-400 hover:text-brand-300 transition-colors">
                  Lupa Password?
                </Link>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading || isBlocked}
              className="btn-primary w-full justify-center py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Masuk...
                </span>
              ) : isBlocked ? (
                <span className="flex items-center gap-2">
                  <FiClock />
                  Dikunci sementara ({formatCountdown(cooldown)})
                </span>
              ) : (
                <>
                  <FiArrowRight />
                  Masuk ke Dashboard
                </>
              )}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Belum punya akun?{' '}
            <Link href="/register" className="text-brand-400 hover:text-brand-300 font-semibold">Daftar gratis</Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 p-4 rounded-xl bg-white/3 border border-white/10 text-center">
          <p className="text-slate-500 text-xs">Demo Admin: <span className="text-slate-400">admin@cumangeprompt.com</span> / <span className="text-slate-400">admin123</span></p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
         <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
       </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
