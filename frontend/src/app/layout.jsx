import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import FloatingWA from '@/components/FloatingWA';

export const metadata = {
  title: 'CumaNgeprompt – Belajar AI Deskripsi dari Nol Sampai Expert',
  description: 'Bootcamp JavaScript online terbaik. Kuasai HTML, CSS, JavaScript, React, Node.js dan buat project nyata. Cocok untuk pemula, siap kerja & freelance.',
  keywords: 'belajar coding, javascript, web developer, bootcamp online, kursus programming',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#1e1e2e', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' },
              success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
            }}
          />
          {children}
          <FloatingWA />
        </AuthProvider>
      </body>
    </html>
  );
}
