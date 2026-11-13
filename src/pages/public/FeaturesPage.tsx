import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Scan, Calculator, HeartHandshake, Globe, Shield, Mic, FileDown } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const FeaturesPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold text-slate-900">Application Capabilities & Tech Stack</h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
          A high-level technical overview of the computer vision, OCR, cost estimation, and accessibility modules.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3 shadow-xs">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Computer Vision Damage Detection</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Integrates local ONNX Runtime Web and server-side Gemini 4 Argon vision processing. Identifies vehicle parts (bumpers, bonnet, doors, headlights, mirrors) and maps preliminary severity (minor, moderate, severe) with honest confidence scores and manual override options.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3 shadow-xs">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">
            <Scan className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">In-Browser OCR Document Processor</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Runs client-side Tesseract.js to scan Registration Certificates (RC), Insurance Policies, Driving Licences, and Death Certificates. Extracts structured text into editable form fields with user verification before saving.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3 shadow-xs">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">
            <Calculator className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Data-Driven Cost Estimation Engine</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Uses configurable regional baseline reference tables (labor rates, parts cost ranges, surface painting allowances) adjusted by vehicle category multipliers (Hatchback, Sedan, SUV, Luxury) to produce transparent low-to-high cost estimates.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3 shadow-xs">
          <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center font-bold">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Deceased Policyholder Assistance</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Dedicated workflow for legal heirs and nominees when the policyholder has passed away. Provides sensitive document checklists (death certificate, relationship proof, insurer mandate) and step-by-step guidance.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3 shadow-xs">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Multilingual Accessibility (EN / HI / MR)</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Centralized type-safe translation system supporting English, Hindi, and Marathi across navigation, form fields, checklists, buttons, and reports.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3 shadow-xs">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">
            <Mic className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Voice-Assisted Speech-to-Text Input</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Integrates the Web Speech API to allow user-initiated speech entry in English, Hindi, and Marathi for description fields, with text editing fallback.
          </p>
        </div>
      </div>

      <div className="text-center">
        <Link to="/claim-wizard">
          <Button size="lg">Create Accident Claim Report</Button>
        </Link>
      </div>
    </div>
  );
};
