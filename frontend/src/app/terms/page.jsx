import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export const metadata = {
  title: 'Terms & Conditions - CumaNgeprompt',
  description: 'Terms, conditions, and privacy policy of CumaNgeprompt.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 mb-8 transition-colors">
          <FiArrowLeft /> Back to Home
        </Link>
        
        <div className="glass-card p-8 md:p-10">
          <h1 className="text-3xl font-bold text-white mb-8 border-b border-white/10 pb-4">Terms & Conditions</h1>

          <div className="space-y-8 text-sm leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Non-Refundable Products</h2>
              <p>All sales of our products are final. Once a purchase is made, we do not offer refunds, returns, or exchanges. Please ensure you have thoroughly considered your decision before making a purchase.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. Cancellation Policy</h2>
              <p>Once a purchase has been completed, cancellations are not permitted. This policy applies to all products and services offered. It is the customer’s responsibility to ensure that the product or service meets their requirements before making a purchase.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. Subscription Annual Access to E-Course Modules</h2>
              <p>Only the e-course modules provided by us come with yearly subscription access. This means you will have annual subscription access to the e-course content for the duration of 1 year (12 month) since registered without any additional fees or charges for any update and service. Access does not extend to any other products or services we offer. If subscription access is discontinued in the future, the CumaNgePrompt team reserves the right to place the videos on any platform, without continuing after-sales service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. Regular Updates to Modules</h2>
              <p>We are committed to providing up-to-date content for our e-course modules. As part of this commitment, we will regularly update the modules to reflect the latest information, techniques, and industry practices. However, any application of the knowledge and skills learned from these modules is at your own risk.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. Policy on Facility, Product, and Service Adjustments</h2>
              <p>cumangeprompt reserves the right to modify, add, or remove facilities, products, and after-sales services at any time without prior notice and without requiring the consent of members.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">6. Limitation of Liability</h2>
              <p>The cumangeprompt team will not be responsible for any losses, damages, or negative outcomes incurred by members from applying the information and techniques learned in our e-course modules. The member releases the Founder and the CumaNgePrompt team, as well as Mudacumasekali, from any legal consequences and responsibilities arising from content created and posted by the member on social media. All such consequences shall be the sole responsibility of the member.</p>
            </section>

            <section id="privacy">
              <h2 className="text-xl font-semibold text-white mb-3">7. Privacy Policy</h2>
              <p>Your data is fully secure and will not be sold to third parties. The data will only be used for marketing purposes by CumaNgePrompt, Mudacumasekali and its partners.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">8. Member Conduct</h2>
              <p>Members found engaging in piracy will be immediately removed and have their access terminated without a refund. Members found hacking will be immediately removed and have their access terminated without a refund. Members causing disruptions in the community will be immediately removed and have their access terminated without a refund. Any form of fraud or other misconduct will result in immediate removal and termination of access without a refund.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">9. Amendments to the Terms and Conditions</h2>
              <p>By agreeing to the Terms and Conditions of CumaNgePrompt, members consent to any future modifications or additions to the Terms and Conditions without the need for further approval.</p>
            </section>

            <div className="pt-8 border-t border-white/10 italic text-slate-400">
              <h3 className="text-lg font-semibold text-white mb-2 not-italic">Disclaimer</h3>
              <p>Any results stated in the webinar and online course are our personal results. Please understand that our results are not typical, and we are not implying you will achieve similar outcomes, or even create any result for yourself. We are using these references for example purposes only. Your results will vary and depend on many deciding factors, such as (but not limited to) your background, experience, and commitment. Huge effort and action are required. If you’re not willing to accept that, please DO NOT JOIN THIS PROGRAM.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

