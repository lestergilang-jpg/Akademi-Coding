'use client';
import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import Link from 'next/link';
import {
  FiUser, FiCamera, FiSave, FiLock,
  FiChevronRight, FiMail, FiShield, FiX, FiCheckCircle
} from 'react-icons/fi';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

// ─── Avatar Section ───────────────────────────────────────────────────────────
function AvatarSection({ user }) {
  const isDiscordConnected = !!user?.discord_id;

  return (
    <div className="flex items-center gap-5">
      <div className="shrink-0">
        {user?.avatar_url ? (
          <div className="w-20 h-20 rounded-2xl border-2 border-brand-500/50 overflow-hidden">
            <img 
              src={user.avatar_url.startsWith('http') ? user.avatar_url : `${API_BASE}${user.avatar_url}`} 
              alt="Avatar" 
              className="w-full h-full object-cover" 
            />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-3xl font-bold border-2 border-brand-500/50">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-white font-semibold">{user?.name}</h3>
        <p className="text-slate-400 text-sm">{user?.email}</p>
        <div className="mt-1.5">
          {isDiscordConnected ? (
            <span className="text-brand-400 text-xs flex items-center gap-1.5 font-medium">
              <FiCheckCircle size={14} /> Foto profil disinkronkan dengan Discord
            </span>
          ) : (
            <span className="text-slate-500 text-xs italic">
              Hubungkan Discord untuk menampilkan foto profil
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── OTP Input (6 kotak terpisah) ────────────────────────────────────────────
function OtpInput({ value, onChange }) {
  const inputs = useRef([]);
  const digits = (value + '      ').slice(0, 6).split('');

  const handleKey = (e, idx) => {
    const char = e.key;
    if (char === 'Backspace') {
      const next = [...digits];
      if (digits[idx] !== ' ') {
        next[idx] = ' ';
      } else if (idx > 0) {
        next[idx - 1] = ' ';
        inputs.current[idx - 1]?.focus();
      }
      onChange(next.join('').trimEnd());
      return;
    }
    if (/^\d$/.test(char)) {
      const next = [...digits];
      next[idx] = char;
      onChange(next.join('').trimEnd());
      if (idx < 5) inputs.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, 5);
    inputs.current[focusIdx]?.focus();
  };

  return (
    <div className="flex gap-3 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d.trim()}
          onChange={() => {}}
          onKeyDown={e => handleKey(e, i)}
          onPaste={handlePaste}
          className={`w-12 h-14 rounded-xl border text-center text-xl font-bold text-white bg-white/5
            focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-all
            ${d.trim() ? 'border-brand-500/60' : 'border-white/15'}`}
        />
      ))}
    </div>
  );
}

// ─── Email Change Modal ───────────────────────────────────────────────────────
function EmailChangeModal({ currentEmail, onClose, onSuccess }) {
  // step: 'input' → 'otp'
  const [step, setStep] = useState('input');
  const [newEmail, setNewEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Countdown timer resend OTP
  const startCooldown = (seconds = 60) => {
    setCooldown(seconds);
    const timer = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRequestOTP = async (e) => {
    e?.preventDefault();
    if (!newEmail.trim()) { toast.error('Email baru wajib diisi.'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/request-email-change', { newEmail });
      toast.success(data.message);
      setStep('otp');
      startCooldown(60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e?.preventDefault();
    if (otp.replace(/\s/g, '').length < 6) { toast.error('Masukkan 6 digit kode OTP.'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-email-change', { otp: otp.trim() });
      toast.success(data.message);
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Kode OTP tidak valid.');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative glass-card w-full max-w-md p-6 border border-white/15 z-10">
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <FiX size={20} />
        </button>

        {step === 'input' ? (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center"><FiMail className="text-brand-400" size={18} /></div>
              <div>
                <h3 className="text-white font-bold">Ganti Email</h3>
                <p className="text-slate-500 text-xs">Kode OTP akan dikirim ke email lama</p>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-3 mb-5 flex items-center gap-2 text-sm">
              <FiShield className="text-yellow-400 shrink-0" size={14} />
              <span className="text-slate-400">
                Kode OTP akan dikirim ke <strong className="text-white">{currentEmail}</strong> untuk keamanan akun kamu.
              </span>
            </div>

            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Email Baru</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                  <input
                    type="email"
                    placeholder="emailbaru@contoh.com"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="input-field pl-9"
                    required
                    autoFocus
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Mengirim...</>
                  : 'Kirim Kode OTP'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center"><FiShield className="text-green-400" size={18} /></div>
              <div>
                <h3 className="text-white font-bold">Masukkan Kode OTP</h3>
                <p className="text-slate-500 text-xs">Cek kotak masuk email lama kamu</p>
              </div>
            </div>

            <p className="text-slate-400 text-sm text-center mb-2">
              Kode 6-digit dikirim ke <strong className="text-white">{currentEmail}</strong>
            </p>
            <p className="text-slate-500 text-xs text-center mb-6">
              Perubahan ke: <span className="text-brand-400">{newEmail}</span>
            </p>

            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <OtpInput value={otp} onChange={setOtp} />

              <button
                type="submit"
                disabled={loading || otp.replace(/\s/g, '').length < 6}
                className="btn-primary w-full justify-center py-3 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Memverifikasi...</>
                  : <><FiCheckCircle size={15} /> Konfirmasi Perubahan</>}
              </button>

              {/* Resend OTP */}
              <div className="text-center">
                <p className="text-slate-500 text-xs mb-1">Tidak menerima kode?</p>
                {cooldown > 0 ? (
                  <span className="text-slate-500 text-xs">Kirim ulang dalam {cooldown} detik</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestOTP}
                    disabled={loading}
                    className="text-brand-400 hover:text-brand-300 text-xs transition-colors"
                  >
                    Kirim ulang kode OTP
                  </button>
                )}
              </div>

              <button type="button" onClick={() => { setStep('input'); setOtp(''); }} className="w-full text-center text-slate-500 hover:text-slate-300 text-xs transition-colors">
                ← Ubah email tujuan
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Setting Page ────────────────────────────────────────────────────────
export default function SettingPage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) { toast.error('Nama tidak boleh kosong.'); return; }
    setSavingProfile(true);
    try {
      const { data } = await api.put('/auth/profile', { name: profile.name, email: user?.email });
      toast.success(data.message);
      refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan profil.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDiscordLink = () => {
    const token = Cookies.get('token');
    if (!token) { toast.error('Silakan login ulang.'); return; }
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/discord/link?token=${token}`;
  };

  const handleEmailChangeSuccess = () => {
    setShowEmailModal(false);
    refreshUser();
    toast.success('Email berhasil diperbarui!');
  };

  return (
    <>
      {/* OTP Modal */}
      {showEmailModal && (
        <EmailChangeModal
          currentEmail={user?.email}
          onClose={() => setShowEmailModal(false)}
          onSuccess={handleEmailChangeSuccess}
        />
      )}

      <div className="p-6 max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Pengaturan Profil</h1>
          <p className="text-slate-400 text-sm mt-1">Kelola informasi akun dan keamanan kamu</p>
        </div>

        {/* ── Foto Profil ── */}
        <div className="glass-card p-6">
          <h2 className="text-slate-400 font-semibold mb-4 text-xs uppercase tracking-wider">Foto Profil</h2>
          <AvatarSection user={user} onRefresh={refreshUser} />
        </div>

        {/* ── Nama ── */}
        <div className="glass-card p-6">
          <h2 className="text-slate-400 font-semibold mb-4 text-xs uppercase tracking-wider">Informasi Dasar</h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Nama Lengkap</label>
              <input
                type="text"
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <button type="submit" disabled={savingProfile} className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed">
              {savingProfile
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</>
                : <><FiSave size={15} /> Simpan Nama</>}
            </button>
          </form>
        </div>

        {/* ── Email (dengan OTP flow) ── */}
        <div className="glass-card p-6">
          <h2 className="text-slate-400 font-semibold mb-4 text-xs uppercase tracking-wider">Alamat Email</h2>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-white font-medium">{user?.email}</p>
              <p className="text-slate-500 text-xs mt-0.5">Email aktif akun kamu</p>
            </div>
            <button
              onClick={() => setShowEmailModal(true)}
              className="flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300 border border-brand-500/30 hover:border-brand-400/50 px-4 py-2 rounded-xl transition-all"
            >
              <FiMail size={14} /> Ganti Email
            </button>
          </div>
          <div className="mt-4 flex items-start gap-2 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
            <FiShield className="text-yellow-400 shrink-0 mt-0.5" size={14} />
            <p className="text-slate-400 text-xs leading-relaxed">
              <strong className="text-yellow-400">Keamanan tinggi:</strong> Ganti email memerlukan verifikasi OTP ke email lama untuk mencegah pengambilalihan akun.
            </p>
          </div>
        </div>

        {/* ── Keamanan: Ganti Password ── */}
        <div className="glass-card p-6">
          <h2 className="text-slate-400 font-semibold mb-4 text-xs uppercase tracking-wider">Keamanan</h2>
          <Link
            href="/dashboard/setting/ganti-password"
            className="flex items-center justify-between p-4 rounded-xl border border-white/10 hover:border-brand-500/40 hover:bg-brand-500/5 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-500/10 flex items-center justify-center">
                <FiLock size={15} className="text-brand-400" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Ganti Password</p>
                <p className="text-slate-500 text-xs">Memerlukan password saat ini</p>
              </div>
            </div>
            <FiChevronRight size={16} className="text-slate-500 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* ── Discord ── */}
        <div className="glass-card p-6">
          <h2 className="text-slate-400 font-semibold mb-4 text-xs uppercase tracking-wider">Integrasi Discord</h2>
          <p className="text-slate-400 text-sm mb-4">
            Hubungkan akun Discord untuk bergabung ke komunitas eksklusif dan mendapatkan role Premium.
          </p>
          {user?.discord_id ? (
            <div className="space-y-4">
              <div className="bg-[#5865F2]/10 border border-[#5865F2]/30 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-[#5865F2]/50 overflow-hidden shrink-0">
                  {user.avatar_url ? (
                    <img 
                      src={user.avatar_url.startsWith('http') ? user.avatar_url : `${API_BASE}${user.avatar_url}`} 
                      alt="Discord Avatar" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full bg-[#5865F2] flex items-center justify-center text-white font-bold">
                      {user.discord_username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-bold text-sm truncate">{user.discord_username}</p>
                    <span className="badge bg-green-500/20 text-green-400 border-green-500/30 text-[10px] py-0 px-2">Terhubung</span>
                  </div>
                  <p className="text-[#7289da] text-xs mt-0.5">Akun Discord Anda telah sinkron</p>
                </div>
              </div>
              
              <button
                onClick={async () => {
                  if (confirm('Apakah Anda yakin ingin memutuskan sambungan Discord?')) {
                    try {
                      const { data } = await api.post('/auth/discord/unlink');
                      toast.success(data.message);
                      refreshUser();
                    } catch (err) {
                      toast.error('Gagal memutuskan sambungan.');
                    }
                  }
                }}
                className="flex items-center gap-2 text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/10 px-3 py-2 rounded-lg transition-all border border-red-500/10 hover:border-red-500/30"
              >
                <FiX size={14} /> Putus Sambungan Discord
              </button>
            </div>
          ) : (
            <button
              onClick={handleDiscordLink}
              className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.09.12 18.12.144 18.14a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" /></svg>
              Hubungkan Akun Discord
            </button>
          )}
        </div>
      </div>
    </>
  );
}
