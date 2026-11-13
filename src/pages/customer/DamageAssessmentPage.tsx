import React, { useState } from 'react';
import { Cpu, Camera, Plus, Trash2, ShieldAlert } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { DamagedRegion } from '../../types';
import { requestGeminiDamageAssessment } from '../../services/ai/geminiAssessment';
import { compressImageForPreview } from '../../services/storage/imageCompressor';

export const DamageAssessmentPage: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);
  const [regions, setRegions] = useState<DamagedRegion[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    for (const f of files) {
      const comp = await compressImageForPreview(f, 800, 800, 0.7);
      setImages((prev) => [...prev, comp.previewBase64]);
    }
  };

  const handleRunAi = async () => {
    if (images.length === 0) return;
    setLoading(true);
    setStatusMsg('Running AI Vision Analysis on uploaded photographs...');

    const res = await requestGeminiDamageAssessment(images);
    if (res.status === 'completed' && res.regions.length > 0) {
      setRegions(res.regions);
      setStatusMsg('AI damage detection completed successfully.');
    } else {
      setStatusMsg(res.statusMessage || 'AI model not configured. Please use manual assessment mode.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">AI & Manual Vehicle Damage Assessment</h1>
        <p className="text-xs text-slate-600">Inspect vehicle photographs using computer vision or record manual component observations.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center space-y-3 bg-slate-50">
          <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" id="standalone-photo-upload" />
          <label htmlFor="standalone-photo-upload" className="cursor-pointer inline-flex flex-col items-center gap-2">
            <Camera className="w-8 h-8 text-blue-600" />
            <span className="text-xs font-bold text-blue-700">Upload Accident Photographs</span>
          </label>
        </div>

        {images.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">{images.length} Photos Uploaded</span>
              <Button size="sm" onClick={handleRunAi} isLoading={loading} className="gap-1.5">
                <Cpu className="w-4 h-4" />
                <span>Run AI Vision Inspection</span>
              </Button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {images.map((img, i) => (
                <img key={i} src={img} alt="Vehicle damage" className="h-24 w-full object-cover rounded-lg border border-slate-200" />
              ))}
            </div>
          </div>
        )}

        {statusMsg && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 font-medium">
            {statusMsg}
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Detected / Recorded Parts ({regions.length})</h3>
          {regions.map((r) => (
            <div key={r.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-slate-900">{r.partName}</span>
                <span className="text-slate-500 ml-2">({r.damageType})</span>
              </div>
              <span className="font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-[10px]">
                {r.severity.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
