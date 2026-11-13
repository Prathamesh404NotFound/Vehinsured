import React from 'react';
import { HelpCircle } from 'lucide-react';

export const FaqPage: React.FC = () => {
  const faqs = [
    {
      q: 'Does this app submit claims directly to my insurance company?',
      a: 'No. This application is an evidence preparation and documentation assistant. It generates structured reports and document checklists for you to present to your insurer or workshop surveyor.',
    },
    {
      q: 'How soon should I inform my motor insurer after an accident?',
      a: 'Most Indian motor insurers expect intimation within 24 to 48 hours of an accident or theft. Keep your policy number, driver licence details, and scene photographs ready before calling their helpline.',
    },
    {
      q: 'Should I claim insurance for a minor scratch or pay out of pocket?',
      a: 'Compare the repair estimate against your compulsory deductible (typically Rs. 1,000 for cars under 1500cc) and potential loss of your No Claim Bonus (NCB) on next year’s premium before filing an own-damage claim.',
    },
    {
      q: 'What is the difference between Zero-Depreciation and Standard Comprehensive cover?',
      a: 'A standard comprehensive policy deducts fixed depreciation on plastic, rubber, glass, and metal parts based on vehicle age (under Indian Motor Tariff rules). A Zero-Depreciation add-on waives part depreciation subject to policy terms.',
    },
    {
      q: 'Are the AI damage assessments 100% accurate?',
      a: 'No AI vision model can guarantee 100% detection or reveal hidden internal mechanical/chassis damage. The AI assessment is preliminary. You can edit, correct, or add manual damage observations at any time.',
    },
    {
      q: 'Are the estimated repair costs official quotations?',
      a: 'No. Repair estimates are indicative ranges calculated using standard regional baseline reference data. Final costs depend on your chosen workshop, OEM parts availability, and your insurer surveyor’s evaluation.',
    },
    {
      q: 'What happens if the policyholder is deceased in the accident?',
      a: 'Use the Nominee / Legal-Heir Assistance workflow. It helps organize the Municipal Death Certificate, Legal Heir / Succession proof, Personal Accident (PA) Owner-Driver claim notes (up to Rs. 15 Lakhs under IRDAI norms), and RTO transfer notes within 3 months.',
    },
    {
      q: 'Where are my original high-resolution photos and documents stored?',
      a: 'High-res original evidence files stay on your device in browser IndexedDB. Compact compressed previews (<200KB) synchronize to Firebase Realtime Database for cross-device case continuity.',
    },
    {
      q: 'Which languages are supported?',
      a: 'The full user interface supports English, Hindi (हिंदी), and Marathi (मराठी).',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Frequently Asked Questions</h1>
        <p className="text-sm text-slate-600">Clear answers on motor insurance claim documentation, AI limitations, and data storage.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{faq.q}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
