import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileCheck, Info } from 'lucide-react';
import { useTranslation } from '../features/i18n/context';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Project Info */}
          <div className="space-y-2.5 md:col-span-1">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span>ClaimAssist AI</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Final-Year B.Tech Computer Science Engineering Capstone Project.
              AI-driven damage assessment, document scanning, and insurance claim preparation assistance.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-slate-200 font-semibold uppercase text-[10px] tracking-wider">Quick Navigation</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><Link to="/" className="hover:text-white transition-colors">{t('nav.home')}</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">{t('nav.howItWorks')}</Link></li>
              <li><Link to="/features" className="hover:text-white transition-colors">{t('nav.features')}</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">{t('nav.faq')}</Link></li>
            </ul>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <h4 className="text-slate-200 font-semibold uppercase text-[10px] tracking-wider">Core Tools</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><Link to="/claim-wizard" className="hover:text-white transition-colors">{t('nav.newReport')}</Link></li>
              <li><Link to="/document-scanner" className="hover:text-white transition-colors">{t('nav.documentScanner')}</Link></li>
              <li><Link to="/cost-estimator" className="hover:text-white transition-colors">{t('nav.costEstimate')}</Link></li>
              <li><Link to="/nominee-assistance" className="hover:text-white transition-colors">{t('nav.nomineeAssistance')}</Link></li>
            </ul>
          </div>

          {/* Compliance & Privacy */}
          <div className="space-y-2">
            <h4 className="text-slate-200 font-semibold uppercase text-[10px] tracking-wider">Legal & Compliance</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy & Data Handling</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms & Disclaimer</Link></li>
              <li><Link to="/privacy-export" className="hover:text-white transition-colors">Data Export & Deletion</Link></li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg p-3 text-[11px] text-slate-300 leading-normal flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong>Academic Project Notice & Insurance Disclaimer:</strong> This application helps vehicle owners organize post-accident documentation and preliminary damage findings. It does not replace an official insurance surveyor, legal advisor, medical professional, or workshop quote. Final claim approval and payout decisions remain exclusively with the authorized insurance company.
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-2">
          <span>&copy; {new Date().getFullYear()} ClaimAssist AI Engineering Project. All rights reserved.</span>
          <span className="text-slate-400">Built with React, Vite, TypeScript & Firebase RTDB</span>
        </div>
      </div>
    </footer>
  );
};
