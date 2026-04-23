'use client';
import { useState } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiChevronDown } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

function AccordionItem({ title, children, isOpen, onClick }) {
  return (
    <div className="glass-card overflow-hidden mb-4">
      <button 
        onClick={onClick}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
      >
        <span className="text-xl font-bold text-white">{title}</span>
        <FiChevronDown className={`text-brand-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} size={24} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 pb-8 text-sm leading-relaxed border-t border-white/10 pt-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TermsPage() {
  const [openSection, setOpenSection] = useState('en'); // Default open English

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 mb-8 transition-colors">
          <FiArrowLeft /> Back to Home / Kembali ke Beranda
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white mb-4">Legal Information</h1>
          <p className="text-slate-400">Terms of Service and Privacy Policy for CumaNgeprompt</p>
        </div>
        
        {/* English Version */}
        <AccordionItem 
          title="Terms & Conditions (English)" 
          isOpen={openSection === 'en'} 
          onClick={() => toggleSection('en')}
        >
          <div className="space-y-8">
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">1. Non-Refundable Products</h3>
              <p>All sales of our products are final. Once a purchase is made, we do not offer refunds, returns, or exchanges. Please ensure you have thoroughly considered your decision before making a purchase.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-2">2. Cancellation Policy</h3>
              <p>Once a purchase has been completed, cancellations are not permitted. This policy applies to all products and services offered. It is the customer’s responsibility to ensure that the product or service meets their requirements before making a purchase.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-2">3. Lifetime Access to E-Course Modules</h3>
              <p>Only the e-course modules provided by us come with lifetime access. This means you will have permanent access to the e-course content since registered without any additional fees or charges for any update and service. Access does not extend to any other products or services we offer. If lifetime access is discontinued in the future, the CumaNgePrompt team reserves the right to place the videos on any platform, without continuing after-sales service.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-2">4. Regular Updates to Modules</h3>
              <p>We are committed to providing up-to-date content for our e-course modules. As part of this commitment, we will regularly update the modules to reflect the latest information, techniques, and industry practices. However, any application of the knowledge and skills learned from these modules is at your own risk.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-2">5. Policy on Facility, Product, and Service Adjustments</h3>
              <p>cumangeprompt reserves the right to modify, add, or remove facilities, products, and after-sales services at any time without prior notice and without requiring the consent of members.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-2">6. Limitation of Liability</h3>
              <p>The cumangeprompt team will not be responsible for any losses, damages, or negative outcomes incurred by members from applying the information and techniques learned in our e-course modules. The member releases the Founder and the CumaNgePrompt team, as well as Mudacumasekali, from any legal consequences and responsibilities arising from content created and posted by the member on social media.</p>
            </section>

            <section id="privacy">
              <h3 className="text-lg font-semibold text-white mb-2">7. Privacy Policy</h3>
              <p>Your data is fully secure and will not be sold to third parties. The data will only be used for marketing purposes by CumaNgePrompt, Mudacumasekali and its partners.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-2">8. Member Conduct</h3>
              <p>Members found engaging in piracy will be immediately removed and have their access terminated without a refund. Members found hacking or causing disruptions in the community will also have their access terminated without a refund.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-2">9. Amendments</h3>
              <p>By agreeing to the Terms and Conditions of CumaNgePrompt, members consent to any future modifications or additions to the Terms and Conditions without the need for further approval.</p>
            </section>

            <div className="pt-6 border-t border-white/10 italic text-slate-400">
              <h4 className="text-base font-semibold text-white mb-2 not-italic">Disclaimer</h4>
              <p>Any results stated are personal results. Results are not typical, and we are not implying you will achieve similar outcomes. Your results will vary and depend on many factors. Huge effort and action are required.</p>
            </div>
          </div>
        </AccordionItem>

        {/* Indonesian Version */}
        <AccordionItem 
          title="Syarat & Ketentuan (Bahasa Indonesia)" 
          isOpen={openSection === 'id'} 
          onClick={() => toggleSection('id')}
        >
          <div className="space-y-8">
            <section>
              <h3 className="text-lg font-semibold text-white mb-2">1. Produk Tidak Dapat Dikembalikan</h3>
              <p>Semua penjualan produk kami bersifat final. Setelah pembelian dilakukan, kami tidak menawarkan pengembalian dana, penggantian, atau penukaran. Harap pastikan Anda sudah mempertimbangkan dengan matang sebelum melakukan pembelian.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-2">2. Kebijakan Pembatalan</h3>
              <p>Setelah pembelian selesai, pembatalan tidak diperbolehkan. Kebijakan ini berlaku untuk semua produk dan layanan yang ditawarkan. Tanggung jawab pelanggan untuk memastikan produk memenuhi kebutuhan mereka.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-2">3. Akses Selamanya ke Modul E-Course</h3>
              <p>Modul e-course yang disediakan oleh kami menawarkan akses selamanya (lifetime access). Ini berarti Anda akan memiliki akses seumur hidup ke konten e-course sejak terdaftar tanpa biaya tambahan untuk pembaruan atau layanan apa pun. Akses ini tidak berlaku untuk produk atau layanan lain. Jika akses selamanya dihentikan, tim CumaNgePrompt berhak menempatkan video di platform mana pun tanpa layanan purna jual.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-2">4. Pembaruan Reguler Modul</h3>
              <p>Kami berkomitmen memberikan konten terbaru. Kami akan secara berkala memperbarui modul untuk mencerminkan informasi dan praktik industri terbaru. Namun, penerapan pengetahuan dari modul ini sepenuhnya menjadi tanggung jawab Anda sendiri.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-2">5. Penyesuaian Fasilitas & Layanan</h3>
              <p>CumaNgePrompt berhak mengubah, menambah, atau menghapus fasilitas, produk, dan layanan purna jual kapan saja tanpa pemberitahuan sebelumnya dan tanpa persetujuan anggota.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-2">6. Batasan Tanggung Jawab</h3>
              <p>Tim CumaNgePrompt tidak bertanggung jawab atas kerugian atau hasil negatif akibat penerapan informasi dari e-course. Anggota melepaskan Founder dan tim CumaNgePrompt dari segala konsekuensi hukum yang muncul dari konten yang dibuat oleh anggota di media sosial.</p>
            </section>

            <section id="kebijakan">
              <h3 className="text-lg font-semibold text-white mb-2">7. Kebijakan Privasi</h3>
              <p>Data Anda sepenuhnya aman dan tidak akan dijual kepada pihak ketiga. Data hanya akan digunakan untuk tujuan pemasaran oleh CumaNgePrompt, Mudacumasekali, dan mitra-mitranya.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-2">8. Perilaku Anggota</h3>
              <p>Anggota yang terbukti melakukan pembajakan, peretasan, atau gangguan komunitas akan segera dihapus aksesnya tanpa pengembalian dana. Segala bentuk penipuan akan mengakibatkan penghentian akses secara langsung.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-2">9. Perubahan S&K</h3>
              <p>Dengan menyetujui S&K CumaNgePrompt, anggota menyetujui setiap modifikasi atau penambahan S&K di masa depan tanpa memerlukan persetujuan lebih lanjut.</p>
            </section>

            <div className="pt-6 border-t border-white/10 italic text-slate-400">
              <h4 className="text-base font-semibold text-white mb-2 not-italic">Penafian (Disclaimer)</h4>
              <p>Hasil yang disebutkan adalah hasil pribadi kami. Hasil Anda akan bervariasi dan bergantung pada banyak faktor seperti latar belakang, pengalaman, dan komitmen. Diperlukan usaha dan tindakan nyata.</p>
            </div>
          </div>
        </AccordionItem>
      </div>
    </div>
  );
}
