import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Camera, Cpu, FileCheck, ArrowRight, Shield } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold text-slate-900">How ClaimAssist AI Works</h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
          A step-by-step breakdown of how the application guides vehicle owners from incident recording to complete report bundle preparation.
        </p>
      </div>

      <div className="space-y-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-6 items-start">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0 font-bold text-xl">
            1
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900">Register Vehicle & Policy Details</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Add your vehicle registration number, category (hatchback, sedan, SUV, luxury, etc.), make, and model. Link your existing insurance policy manually or use the built-in OCR document scanner to extract details directly from your policy document.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-6 items-start">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0 font-bold text-xl">
            2
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900">Record Incident & Capture Photographs</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Record the accident date, approximate time, locality, and whether the vehicle is currently drivable. Upload multiple photographs showing the complete vehicle, close-ups of damaged parts, registration plate, and surroundings.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-6 items-start">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0 font-bold text-xl">
            3
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900">Automated or Guided Damage Assessment</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              When a computer-vision ONNX model or server-side Gemini AI model is available, the system detects visible damaged components (bumpers, bonnet, doors, headlights) and preliminary severity (minor, moderate, severe). You can review, correct, or manually record observations at any time.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-6 items-start">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0 font-bold text-xl">
            4
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900">Calculate Indicative Expenses & Export Bundle</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              The deterministic cost engine calculates low and high repair cost ranges using regional baseline reference tables. Complete the document compliance checklist, and generate a downloadable PDF report bundle for your personal records.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link to="/claim-wizard">
          <Button size="lg" className="px-8">
            Start Your First Report <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
