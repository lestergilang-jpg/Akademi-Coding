import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export const metadata = {
  title: 'Syarat & Ketentuan - Cuma Ngeprompt',
  description: 'Syarat, ketentuan, dan kebijakan privasi Cuma Ngeprompt.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 mb-8 transition-colors">
          <FiArrowLeft /> Kembali ke Beranda
        </Link>
        
        <div className="glass-card p-8 md:p-10">
          <h1 className="text-3xl font-bold text-white mb-8 border-b border-white/10 pb-4">Syarat & Ketentuan dan Kebijakan Privasi</h1>

          <div className="space-y-6 text-sm leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-white mb-2">1. Produk Tidak Dapat Dikembalikan</h2>
              <p>Semua penjualan produk kami bersifat final. Setelah pembelian dilakukan, kami tidak menawarkan pengembalian dana, penggantian, atau penukaran. Harap pastikan Anda sudah mempertimbangkan dengan matang sebelum melakukan pembelian.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">2. Kebijakan Pembatalan</h2>
              <p>Setelah pembelian selesai, pembatalan tidak diperbolehkan. Kebijakan ini berlaku untuk semua produk dan layanan yang ditawarkan. Tanggung jawab pelanggan untuk memastikan bahwa produk atau layanan memenuhi kebutuhan mereka sebelum melakukan pembelian.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">3. Akses Subscription tahunan ke Modul E-Course</h2>
              <p>Modul e-course yang disediakan oleh kami menawarkan akses subscription tahunan. Ini berarti Anda akan memiliki akses selama 1 tahun (12 bulan) ke konten e-course selama masa ketersediaan kursus beserta dengan update serta fasilitas terbaru, tanpa biaya tambahan. Akses ini tidak berlaku untuk produk atau layanan lainnya yang kami tawarkan. Jika akses subscription dihentikan di masa depan, tim Cuma Ngeprompt berhak menempatkan video di platform mana pun tanpa melanjutkan layanan purna jual.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">4. Pembaruan Reguler untuk Modul</h2>
              <p>Kami berkomitmen untuk memberikan konten terbaru untuk modul e-course kami. Sebagai bagian dari komitmen ini, kami akan secara berkala memperbarui modul untuk mencerminkan informasi, teknik, dan praktik industri terbaru. Namun, penerapan pengetahuan dan keterampilan yang dipelajari dari modul-modul ini sepenuhnya menjadi tanggung jawab Anda sendiri.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">5. Kebijakan Penyesuaian Fasilitas, Produk, dan Layanan</h2>
              <p>Cuma Ngeprompt berhak untuk mengubah, menambah, atau menghapus fasilitas, produk, dan layanan purna jual kapan saja tanpa pemberitahuan sebelumnya dan tanpa memerlukan persetujuan dari anggota.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">6. Batasan Tanggung Jawab</h2>
              <p>Tim Cuma Ngeprompt tidak bertanggung jawab atas kerugian, kerusakan, atau hasil negatif yang dialami member akibat tindakan melanggar hukum setelah mendapat informasi dan teknik di modul e-course kami. Anggota melepaskan pendiri dan tim Cuma Ngeprompt, serta Mudacumasekali, dari segala konsekuensi hukum dan tanggung jawab yang muncul dari konten yang dibuat dan diposting oleh anggota di media sosial. Semua konsekuensi tersebut sepenuhnya menjadi tanggung jawab anggota.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">7. Kebijakan Privasi</h2>
              <p>Data Anda sepenuhnya aman dan tidak akan dijual kepada pihak ketiga. Data hanya akan digunakan untuk tujuan pemasaran oleh Cuma Ngeprompt, Mudacumasekali, dan mitra-mitranya.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">8. Perilaku Anggota</h2>
              <p>Anggota yang terbukti melakukan pembajakan akan segera dihapus dan aksesnya akan dihentikan tanpa pengembalian dana. Anggota yang terbukti meretas akan segera dihapus dan aksesnya dihentikan tanpa pengembalian dana. Anggota yang menyebabkan gangguan dalam komunitas akan segera dihapus dan aksesnya dihentikan tanpa pengembalian dana. Segala bentuk penipuan atau pelanggaran lainnya akan mengakibatkan penghapusan dan penghentian akses secara langsung tanpa pengembalian dana.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">9. Perubahan pada Syarat dan Ketentuan</h2>
              <p>Dengan menyetujui Syarat dan Ketentuan Cuma Ngeprompt, anggota menyetujui setiap modifikasi atau penambahan pada Syarat dan Ketentuan di masa depan tanpa memerlukan persetujuan lebih lanjut.</p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}

