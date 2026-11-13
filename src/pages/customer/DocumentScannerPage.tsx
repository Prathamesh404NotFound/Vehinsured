import React, { useState } from 'react';
import { Scan, FileText, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { runBrowserOCR } from '../../services/ocr/tesseractService';
import { DocumentItem } from '../../types';

export const DocumentScannerPage: React.FC = () => {
  const [category, setCategory] = useState<DocumentItem['category']>('rc');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [progressPct, setProgressPct] = useState(0);

  const [extractedFields, setExtractedFields] = useState<Record<string, string>>({});
  const [rawText, setRawText] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setExtractedFields({});
      setRawText('');
    }
  };

  const handleRunOcr = async () => {
    if (!file) return;
    setScanning(true);
    setProgressMsg('Initializing Tesseract OCR worker...');

    const res = await runBrowserOCR(file, category, (pct, status) => {
      setProgressPct(pct);
      setProgressMsg(status);
    });

    setRawText(res.rawText);
    setExtractedFields(res.extractedFields);
    setScanning(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">In-Browser OCR Document Scanner</h1>
        <p className="text-xs text-slate-600">Scan RC, Insurance Policies, Driving Licences, and Death Certificates locally using Tesseract.js.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Document Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full rounded-lg border border-slate-300 p-2 text-sm bg-white"
            >
              <option value="rc">Vehicle Registration Certificate (RC)</option>
              <option value="insurance_policy">Insurance Policy Schedule</option>
              <option value="driving_licence">Driving Licence (DL)</option>
              <option value="fir">Police Report / FIR</option>
              <option value="death_certificate">Death Certificate (Nominee Claims)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Upload Document Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="text-xs text-slate-600 block w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700"
            />
          </div>
        </div>

        {previewUrl && (
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <img src={previewUrl} alt="Document" className="h-40 rounded-lg border border-slate-200 object-contain bg-slate-50" />
            <Button onClick={handleRunOcr} isLoading={scanning} className="gap-2">
              <Scan className="w-4 h-4" />
              <span>Run Local Tesseract OCR</span>
            </Button>
          </div>
        )}

        {scanning && (
          <div className="space-y-2 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
              <span>{progressMsg}</span>
              <span>{progressPct}%</span>
            </div>
            <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-2 transition-all duration-300" style={{ width: `${progressPct}%` }}></div>
            </div>
          </div>
        )}

        {Object.keys(extractedFields).length > 0 && (
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Extracted & Editable Structured Fields</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(extractedFields).map(([key, val]) => (
                <Input
                  key={key}
                  label={key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                  value={val}
                  onChange={(e) => setExtractedFields({ ...extractedFields, [key]: e.target.value })}
                />
              ))}
            </div>

            {rawText && (
              <details className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <summary className="cursor-pointer font-bold text-slate-700">View Raw OCR Extracted Text</summary>
                <pre className="mt-2 whitespace-pre-wrap font-mono text-[11px] text-slate-600">{rawText}</pre>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
