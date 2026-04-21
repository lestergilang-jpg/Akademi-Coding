'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  FiLock, FiEye, FiEyeOff, FiChevronLeft,
  FiCheckCircle, FiAlertCircle, FiSave
} from 'react-icons/fi';

// ─── Password strength checker ────────────────────────────────────────────────
function getStrength(pwd) {
  if (!pwd) return { level: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8)  score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 1) return { level: 1, label: 'Sangat Lemah', color: 'bg-red-500' };
  if (score === 2) return { level: 2, label: 'Lemah',        color: 'bg-orange-500' };
  if (score === 3) return { level: 3, label: 'Sedang',       color: 'bg-yellow-500' };
  if (score === 4) return { level: 4, label: 'Kuat',         color: 'bg-green-400' };
  return              { level: 5, label: 'Sangat Kuat',  color: 'bg-green-500' };
}

function StrengthBar({ password }) {
  const { level, label, color } = getStrength(password);
  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= level ? color : 'bg-white/10'}`}
          />
        ))}
      </div>
      <p className={`text-xs ${level <= 2 ? 'text-red-400' : level === 3 ? 'text-yellow-400' : 'text-green-400'}`}>
        Kekuatan password: {label}
      </p>
    </div>
  );
}

function PasswordInput({ id, label, value, onChange, placeholder = '••••••••', hint }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-sm text-slate-400 mb-1.5">{label}</label>
      <div className="relative">
        <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="input-field pl-9 pr-10"
          required
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
          tabIndex={-1}
        >
          {show ? <FiEyeOff size={16} /> : <FiEye size={16} />}
        </button>
      </div>
      {hint && <p className="text-slate-600 text-xs mt-1.5">{hint}</p>}
    </div>
  );
}

export default function GantiPasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Validasi konfirmasi password
  const confirmMatch = !form.confirmPassword || form.newPassword === form.confirmPassword;
  const strength = getStrength(form.newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      toast.error('Konfirmasi password tidak cocok.');
      return;
    }
    if (strength.level < 2) {
      toast.error('Password baru terlalu lemah. Gunakan minimal 8 karakter.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      toast.success(data.message);
      setSuccess(true);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg">
      {/* Back button */}
      <Link
        href="/dashboard/setting"
        className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors mb-6"
      >
        <FiChevronLeft size={16} /> Kembali ke Pengaturan
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Ganti Password</h1>
        <p className="text-slate-400 text-sm mt-1">
          Pastikan password baru kamu kuat dan belum pernah digunakan sebelumnya.
        </p>
      </div>

      {/* Success state */}
      {success && (
        <div className="glass-card p-6 border border-green-500/25 bg-green-500/5 mb-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
            <FiCheckCircle className="text-green-400" size={20} />
          </div>
          <div>
            <p className="text-green-400 font-semibold">Password Berhasil Diubah!</p>
            <p className="text-slate-400 text-sm mt-0.5">
              Password akun kamu sudah diperbarui. Gunakan password baru saat login berikutnya.
            </p>
            <Link href="/dashboard/setting" className="text-brand-400 hover:text-brand-300 text-sm mt-2 inline-block">
              ← Kembali ke Pengaturan
            </Link>
          </div>
        </div>
      )}

      <div className="glass-card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Password saat ini */}
          <div>
            <PasswordInput
              id="current-password"
              label="Password Saat Ini"
              value={form.currentPassword}
              onChange={e => setForm({ ...form, currentPassword: e.target.value })}
              placeholder="Masukkan password saat ini"
            />
            <div className="mt-2 flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
              >
                Lupa password saat ini?
              </Link>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 pt-5">
            {/* Password baru */}
            <div className="space-y-5">
              <div>
                <PasswordInput
                  id="new-password"
                  label="Password Baru"
                  value={form.newPassword}
                  onChange={e => setForm({ ...form, newPassword: e.target.value })}
                  placeholder="Minimal 8 karakter"
                  hint="Gunakan kombinasi huruf besar, angka, dan simbol untuk password yang lebih kuat."
                />
                <StrengthBar password={form.newPassword} />
              </div>

              {/* Konfirmasi password baru */}
              <div>
                <PasswordInput
                  id="confirm-password"
                  label="Konfirmasi Password Baru"
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Ulangi password baru"
                />
                {/* Match indicator */}
                {form.confirmPassword && (
                  <div className={`flex items-center gap-1.5 mt-1.5 text-xs ${confirmMatch ? 'text-green-400' : 'text-red-400'}`}>
                    {confirmMatch
                      ? <><FiCheckCircle size={12} /> Password cocok</>
                      : <><FiAlertCircle size={12} /> Password tidak cocok</>
                    }
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            id="change-password-submit"
            disabled={loading || !confirmMatch || !form.currentPassword || !form.newPassword}
            className="btn-primary w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</>
            ) : (
              <><FiSave size={15} /> Simpan Password Baru</>
            )}
          </button>
        </form>
      </div>

      {/* Tips keamanan */}
      <div className="glass-card p-5 mt-4 border-yellow-500/20 bg-yellow-500/5">
        <p className="text-yellow-400 text-xs font-semibold mb-2">💡 Tips Keamanan Password</p>
        <ul className="text-slate-400 text-xs space-y-1.5 list-disc list-inside">
          <li>Gunakan minimal 12 karakter</li>
          <li>Kombinasikan huruf besar, huruf kecil, angka, dan simbol</li>
          <li>Jangan gunakan informasi pribadi (tanggal lahir, nama, dll)</li>
          <li>Gunakan password yang berbeda di setiap platform</li>
        </ul>
      </div>
    </div>
  );
}
