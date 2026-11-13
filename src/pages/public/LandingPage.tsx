import React from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  ShieldCheck,
  FileText,
  Calculator,
  Scan,
  Users,
  ArrowRight,
  Globe,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { useTranslation } from '../../features/i18n/context';
import { Button } from '../../components/ui/Button';
import heroVehicleImg from '../../assets/images/hero_vehicle_1794529321661.jpg';
import { INDIAN_MOTOR_INSURERS, IRDAI_CLAIM_ADVISORIES } from '../../data/onlineReferenceData';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-16 py-8 md:py-12">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-md text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{t('hero.badge')}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {t('hero.title')}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 pt-2">
              <Link to="/claim-wizard" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto px-7 py-3 text-base font-semibold shadow-sm">
                  <span>{t('hero.ctaStart')}</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/how-it-works" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-6 py-3 text-base">
                  {t('hero.ctaHowItWorks')}
                </Button>
              </Link>
            </div>

            <p className="text-xs text-slate-500 max-w-2xl mx-auto lg:mx-0 pt-1 italic leading-relaxed">
              {t('hero.disclaimer')}
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-md space-y-3">
              <img
                src={heroVehicleImg}
                alt="Passenger sedan photographed outdoors for clear claim documentation"
                className="w-full h-56 sm:h-64 object-cover rounded-xl"
              />
              <div className="px-2 pb-1 flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold text-slate-800">4-Angle Evidence Capture Ready</span>
                <span className="text-emerald-700 font-semibold">EN / HI / MR</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Process Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t('landing.stepsTitle')}</h2>
          <p className="text-sm text-slate-600">{t('landing.stepsSubtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-700 font-bold rounded-lg flex items-center justify-center text-lg">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base">{t('step.1.title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t('step.1.desc')}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-700 font-bold rounded-lg flex items-center justify-center text-lg">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base">{t('step.2.title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t('step.2.desc')}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-700 font-bold rounded-lg flex items-center justify-center text-lg">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base">{t('step.3.title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t('step.3.desc')}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
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
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t('landing.featuresTitle')}</h2>
            <p className="text-sm text-slate-600">{t('landing.featuresSubtitle')}</p>
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
              <p className="text-xs text-slate-600 leading-relaxed">Full application translation in English, Hindi, and Marathi for accessible claim preparation.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Local PDF, Print & JSON Export</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Generates formatted PDF claim bundles locally with evidence thumbnails and IRDAI compliance notes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Online Indian Motor Insurer Helplines & IRDAI Advisories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Phone className="w-5 h-5 text-blue-600" />
            <span>{t('landing.helplinesTitle')}</span>
          </h2>
          <p className="text-xs text-slate-600">
            Inform your insurance company promptly after an accident. Reference helplines below are public toll-free customer numbers.
          </p>
          <div className="divide-y divide-slate-100">
            {INDIAN_MOTOR_INSURERS.map((ins) => (
              <div key={ins.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <div>
                  <span className="font-bold text-slate-900">{ins.name}</span>
                  <span className="block text-[11px] text-slate-500">{ins.claimPortalNote}</span>
                </div>
                <span className="font-mono font-bold text-blue-700 shrink-0">{ins.tollFree}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{t('landing.advisoriesTitle')}</span>
          </h2>
          <p className="text-xs text-slate-600">
            Standard steps recommended across motor claim guidelines before workshop disassembly.
          </p>
          <ul className="space-y-3">
            {IRDAI_CLAIM_ADVISORIES.map((adv, i) => (
              <li key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed">
                {adv}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-4xl mx-auto px-4 text-center bg-slate-900 text-white rounded-2xl p-8 sm:p-12 space-y-6 shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-bold">{t('landing.ctaTitle')}</h2>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          {t('landing.ctaSubtitle')}
        </p>
        <Link to="/claim-wizard">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3">
            {t('landing.ctaButton')}
          </Button>
        </Link>
      </section>
    </div>
  );
};
