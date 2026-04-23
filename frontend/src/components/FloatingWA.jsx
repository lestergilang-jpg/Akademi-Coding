import { FaWhatsapp } from 'react-icons/fa';

export default function FloatingWA() {
  return (
    <a
      href="https://wa.me/6285189307255"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:scale-110 transition-transform duration-300 group"
      aria-label="Chat with us on WhatsApp"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 group-hover:opacity-0 transition-opacity"></span>
      <FaWhatsapp size={32} className="relative z-10" />
      
      {/* Tooltip */}
      <span className="absolute right-16 bg-white text-slate-900 px-3 py-1.5 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-slate-100">
        Chat with us!
      </span>
    </a>
  );
}
