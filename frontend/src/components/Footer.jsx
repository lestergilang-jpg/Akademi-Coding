import Link from 'next/link';
import { FiCode } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/50 backdrop-blur-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                <FiCode className="text-white text-sm" />
              </div>
              Cuma<span className="text-gradient">Ngeprompt</span>
            </Link>
            <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
              Platform belajar coding terbaik untuk kamu yang ingin jadi web developer profesional dari nol.
            </p>
            <div className="mt-4">
              <a 
                href="https://wa.me/6285189307255" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 text-slate-400 hover:text-[#25D366] transition-colors"
              >
                <FaWhatsapp size={20} />
                <span className="text-sm font-medium">Contact us 085189307255 (WA Only)</span>
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Navigasi</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              {['Beranda','Kurikulum','Testimoni','Harga','FAQ'].map(item => (
                <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Akun</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              {[['Daftar','/register'],['Masuk','/login'],['Dashboard','/dashboard']].map(([label, href]) => (
                <li key={label}><Link href={href} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-6 text-center text-xs sm:text-sm text-slate-500">
          <p className="mb-2">
            © 2026 CumaNgeprompt. All rights reserved. Made with love in Indonesia.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/terms" className="hover:text-white transition-colors underline underline-offset-4">Terms & Conditions</Link>
            <Link href="/terms#privacy" className="hover:text-white transition-colors underline underline-offset-4">Kebijakan Privasi</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
