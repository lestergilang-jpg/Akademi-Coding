import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export const metadata = {
  title: 'Terms & Conditions - CumaNgeprompt',
  description: 'Terms, conditions, and privacy policy of CumaNgeprompt.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 mb-8 transition-colors">
          <FiArrowLeft /> Back to Home / Kembali ke Beranda
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* English Version */}
          <div className="glass-card p-8">
            <h1 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Terms & Conditions</h1>
            <div className="space-y-6 text-xs sm:text-sm leading-relaxed">
              <section>
                <h2 className="text-lg font-semibold text-white mb-2">1. Non-Refundable Products</h2>
                <p>All sales of our products are final. Once a purchase is made, we do not offer refunds, returns, or exchanges. Please ensure you have thoroughly considered your decision before making a purchase.</p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-white mb-2">2. Cancellation Policy</h2>
                <p>Once a purchase has been completed, cancellations are not permitted. This policy applies to all products and services offered. It is the customer’s responsibility to ensure that the product or service meets their requirements before making a purchase.</p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-white mb-2">3. Lifetime Access to E-Course Modules</h2>
                <p>Only the e-course modules provided by us come with lifetime access. This means you will have permanent access to the e-course content since registered without any additional fees or charges for any update and service. Access does not extend to any other products or services we offer. If lifetime access is discontinued in the future, the CumaNgePrompt team reserves the right to place the videos on any platform, without continuing after-sales service.</p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-white mb-2">4. Regular Updates to Modules</h2>
                <p>We are committed to providing up-to-date content for our e-course modules. As part of this commitment, we will regularly update the modules to reflect the latest information, techniques, and industry practices. However, any application of the knowledge and skills learned from these modules is at your own risk.</p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-white mb-2">5. Policy on Facility, Product, and Service Adjustments</h2>
                <p>cumangeprompt reserves the right to modify, add, or remove facilities, products, and after-sales services at any time without prior notice and without requiring the consent of members.</p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-white mb-2">6. Limitation of Liability</h2>
                <p>The cumangeprompt team will not be responsible for any losses, damages, or negative outcomes incurred by members from applying the information and techniques learned in our e-course modules. The member releases the Founder and the CumaNgePrompt team, as well as Mudacumasekali, from any legal consequences and responsibilities arising from content created and posted by the member on social media. All such consequences shall be the sole responsibility of the member.</p>
              </section>

              <section id="privacy">
                <h2 className="text-lg font-semibold text-white mb-2">7. Privacy Policy</h2>
                <p>Your data is fully secure and will not be sold to third parties. The data will only be used for marketing purposes by CumaNgePrompt, Mudacumasekali and its partners.</p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-white mb-2">8. Member Conduct</h2>
                <p>Members found engaging in piracy will be immediately removed and have their access terminated without a refund. Members found hacking will be immediately removed and have their access terminated without a refund. Members causing disruptions in the community will be immediately removed and have their access terminated without a refund. Any form of fraud or other misconduct will result in immediate removal and termination of access without a refund.</p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-white mb-2">9. Amendments</h2>
                <p>By agreeing to the Terms and Conditions of CumaNgePrompt, members consent to any future modifications or additions to the Terms and Conditions without the need for further approval.</p>
              </section>

              <div className="pt-6 border-t border-white/10 italic text-slate-400">
                <h3 className="text-base font-semibold text-white mb-2 not-italic">Disclaimer</h3>
                <p>Any results stated in the webinar and online course are our personal results. Please understand that our results are not typical, and we are not implying you will achieve similar outcomes. Your results will vary and depend on many deciding factors. Huge effort and action are required.</p>
              </div>
            </div>
          </div>

          {/* Indonesian Version */}
          <div className="glass-card p-8">
            <h1 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Syarat & Ketentuan</h1>
            <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-slate-300">
              <section>
                <h2 className="text-lg font-semibold text-white mb-2">1. Produk Tidak Dapat Dikembalikan</h2>
                <p>Semua penjualan produk kami bersifat final. Setelah pembelian dilakukan, kami tidak menawarkan pengembalian dana, penggantian, atau penukaran. Harap pastikan Anda sudah mempertimbangkan dengan matang sebelum melakukan pembelian.</p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-white mb-2">2. Kebijakan Pembatalan</h2>
                <p>Setelah pembelian selesai, pembatalan tidak diperbolehkan. Kebijakan ini berlaku untuk semua produk dan layanan yang ditawarkan. Tanggung jawab pelanggan untuk memastikan produk memenuhi kebutuhan mereka.</p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-white mb-2">3. Akses Selamanya ke Modul E-Course</h2>
                <p>Modul e-course yang disediakan oleh kami menawarkan akses selamanya (lifetime access). Ini berarti Anda akan memiliki akses seumur hidup ke konten e-course sejak terdaftar tanpa biaya tambahan untuk pembaruan atau layanan apa pun. Akses ini tidak berlaku untuk produk atau layanan lain. Jika akses selamanya dihentikan, tim CumaNgePrompt berhak menempatkan video di platform mana pun tanpa layanan purna jual.</p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-white mb-2">4. Pembaruan Reguler Modul</h2>
                <p>Kami berkomitmen memberikan konten terbaru. Kami akan secara berkala memperbarui modul untuk mencerminkan informasi dan praktik industri terbaru. Namun, penerapan pengetahuan dari modul ini sepenuhnya menjadi tanggung jawab Anda sendiri.</p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-white mb-2">5. Penyesuaian Fasilitas & Layanan</h2>
                <p>CumaNgePrompt berhak mengubah, menambah, atau menghapus fasilitas, produk, dan layanan purna jual kapan saja tanpa pemberitahuan sebelumnya dan tanpa persetujuan anggota.</p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-white mb-2">6. Batasan Tanggung Jawab</h2>
                <p>Tim CumaNgePrompt tidak bertanggung jawab atas kerugian atau hasil negatif akibat penerapan informasi dari e-course. Anggota melepaskan Founder dan tim CumaNgePrompt dari segala konsekuensi hukum yang muncul dari konten yang dibuat oleh anggota di media sosial.</p>
              </section>

              <section id="privacy-id">
                <h2 className="text-lg font-semibold text-white mb-2">7. Kebijakan Privasi</h2>
                <p>Data Anda sepenuhnya aman dan tidak akan dijual kepada pihak ketiga. Data hanya akan digunakan untuk tujuan pemasaran oleh CumaNgePrompt, Mudacumasekali, dan mitra-mitranya.</p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-white mb-2">8. Perilaku Anggota</h2>
                <p>Anggota yang terbukti melakukan pembajakan, peretasan, atau gangguan komunitas akan segera dihapus aksesnya tanpa pengembalian dana. Segala bentuk penipuan akan mengakibatkan penghentian akses secara langsung.</p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-white mb-2">9. Perubahan S&K</h2>
                <p>Dengan menyetujui S&K CumaNgePrompt, anggota menyetujui setiap modifikasi atau penambahan S&K di masa depan tanpa memerlukan persetujuan lebih lanjut.</p>
              </section>

              <div className="pt-6 border-t border-white/10 italic text-slate-400">
                <h3 className="text-base font-semibold text-white mb-2 not-italic">Penafian (Disclaimer)</h3>
                <p>Hasil yang disebutkan adalah hasil pribadi kami. Hasil Anda akan bervariasi dan bergantung pada banyak faktor seperti latar belakang, pengalaman, dan komitmen. Diperlukan usaha dan tindakan nyata.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
