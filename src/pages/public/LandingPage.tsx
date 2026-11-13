import React from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  ShieldCheck,
  FileText,
  Calculator,
  Scan,
  Users,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  Globe
} from 'lucide-react';
import { useTranslation } from '../../features/i18n/context';
import { Button } from '../../components/ui/Button';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-16 py-8 md:py-12">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-full text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Academic Engineering Project &bull; Claim Assistance & AI Damage Assessment</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {t('hero.title')}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
          {t('hero.subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/claim-wizard">
            <Button size="lg" className="w-full sm:w-auto px-8 py-3 text-base font-semibold shadow-md">
              <span>{t('hero.ctaStart')}</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link to="/how-it-works">
            <Button variant="outline" size="lg" className="w-full sm:w-auto px-6 py-3 text-base">
              {t('hero.ctaHowItWorks')}
            </Button>
          </Link>
        </div>

        <p className="text-xs text-slate-500 max-w-2xl mx-auto pt-2 italic">
          {t('hero.disclaimer')}
        </p>
      </section>

      {/* 4-Step Process Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Structured 4-Step Claim Preparation</h2>
          <p className="text-sm text-slate-600">A clear, step-by-step workflow designed to reduce anxiety after a vehicle incident.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3 relative">
            <div className="w-10 h-10 bg-blue-100 text-blue-700 font-bold rounded-lg flex items-center justify-center text-lg">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base">{t('step.1.title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t('step.1.desc')}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3 relative">
            <div className="w-10 h-10 bg-blue-100 text-blue-700 font-bold rounded-lg flex items-center justify-center text-lg">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base">{t('step.2.title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t('step.2.desc')}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3 relative">
            <div className="w-10 h-10 bg-blue-100 text-blue-700 font-bold rounded-lg flex items-center justify-center text-lg">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base">{t('step.3.title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t('step.3.desc')}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3 relative">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 font-bold rounded-lg flex items-center justify-center text-lg">
              4
            </div>
            <h3 className="font-bold text-slate-900 text-base">{t('step.4.title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t('step.4.desc')}</p>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="bg-slate-100 py-12 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Comprehensive Engineering Features</h2>
            <p className="text-sm text-slate-600">Built using browser-side AI, OCR, data-driven cost estimation, and multilingual accessibility.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">{t('feature.ai.title')}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t('feature.ai.desc')}</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <Scan className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">{t('feature.ocr.title')}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t('feature.ocr.desc')}</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">{t('feature.cost.title')}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t('feature.cost.desc')}</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 bg-amber-50 text-amber-700 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">{t('feature.nominee.title')}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t('feature.nominee.desc')}</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Multilingual EN / HI / MR</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Complete UI translation in English, Hindi, and Marathi to ensure accessibility across regions.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Local PDF & JSON Generation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Generates formatted PDF claim bundles locally in the browser with thumbnails and compliance notes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-4xl mx-auto px-4 text-center bg-slate-900 text-white rounded-2xl p-8 sm:p-12 space-y-6 shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-bold">Ready to Prepare Your Accident Report?</h2>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Add your vehicle details, record evidence photos, and generate your claim assistance report in minutes.
        </p>
        <Link to="/claim-wizard">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3">
            Get Started Now
          </Button>
        </Link>
      </section>
    </div>
  );
};
