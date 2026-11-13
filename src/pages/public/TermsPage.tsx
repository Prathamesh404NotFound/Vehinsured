import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900">Terms of Use & Legal Disclaimer</h1>
        <p className="text-sm text-slate-600">Please read these terms carefully before using ClaimAssist AI.</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-amber-900 text-xs sm:text-sm space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>IMPORTANT DISCLAIMER</span>
        </div>
        <p className="leading-relaxed">
          This system is an academic engineering capstone project designed to assist vehicle owners with post-accident evidence organization and preliminary estimation. It does not replace an official insurance surveyor, authorized motor vehicle inspector, legal representative, or workshop repair quotation.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6 text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Preliminary Nature of Reports</h2>
          <p className="text-xs sm:text-sm">
            All AI vision predictions, manual damage entries, OCR extracted fields, and repair cost ranges are preliminary and indicative only.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Insurer Final Authority</h2>
          <p className="text-xs sm:text-sm">
            Final claim approval, liability determination, depreciation calculations, and claim settlements remain strictly under the authority of your licensed insurance company.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. User Responsibility</h2>
          <p className="text-xs sm:text-sm">
            Users are responsible for ensuring that all information, photographs, and document fields submitted are truthful and accurate.
          </p>
        </section>
      </div>
    </div>
  );
};
