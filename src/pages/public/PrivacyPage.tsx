import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Data Handling & Privacy Transparency</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Privacy Policy & Storage Limitations</h1>
        <p className="text-sm text-slate-600">
          Last updated: October 2026. Academic B.Tech Computer Science Engineering Project.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6 text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Information We Collect</h2>
          <p className="text-xs sm:text-sm">
            We collect user profile information (email, name), vehicle information (registration number, make, model, category), policy details, incident descriptions, and uploaded accident photos.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Free-Tier Cloud vs Device-Local Storage</h2>
          <p className="text-xs sm:text-sm">
            To run on the free Firebase Spark plan without paid cloud storage costs:
          </p>
          <ul className="list-disc pl-5 text-xs sm:text-sm space-y-1">
            <li>Structured case details, policies, and compressed low-res image previews (&lt;200 KB) are synchronized to Firebase Realtime Database.</li>
            <li>High-resolution original accident photos and uploaded document PDFs are stored locally on your device in browser IndexedDB.</li>
            <li>If you access the application on a different device, local original files will show as "Device-Local Original Needed".</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Local OCR and AI Vision Inference</h2>
          <p className="text-xs sm:text-sm">
            Document scanning via Tesseract.js runs 100% locally in your browser. ONNX vision models run locally on WebAssembly. Server-side Gemini AI processing is used only when explicitly requested for damage reasoning.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">4. Data Export and Account Deletion</h2>
          <p className="text-xs sm:text-sm">
            You can export all your personal records as JSON or PDF at any time from the Privacy & Export page. You can also trigger complete account deletion, which removes your RTDB records and local browser state.
          </p>
        </section>
      </div>
    </div>
  );
};
