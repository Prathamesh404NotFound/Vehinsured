import React, { useState, useEffect } from 'react';
import { Cpu, Camera, Plus, Trash2, ShieldAlert, Save, CheckCircle2, Info } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ToastBanner } from '../../components/ui/ToastBanner';
import { DamagedRegion, ClaimAssistanceCase, DamageAssessment } from '../../types';
import { requestGeminiDamageAssessment } from '../../services/ai/geminiAssessment';
import { checkLocalModelAvailability, runLocalONNXDamageInference } from '../../services/ai/onnxInference';
import { compressImageForPreview } from '../../services/storage/imageCompressor';
import { dbGetClaims, dbSaveAssessment, dbSaveClaim } from '../../services/database';
import { useAuth } from '../../features/auth/AuthContext';
import { validateEvidenceFile } from '../../utils/validation';
import { useTranslation } from '../../features/i18n/context';

const VEHICLE_PARTS = [
  'Front Bumper',
  'Rear Bumper',
  'Bonnet',
  'Headlight',
  'Tail Light',
  'Front Door',
  'Rear Door',
  'Fender',
  'Windscreen',
  'Rear Windshield',
  'Side Mirror',
  'Radiator Grille',
  'Roof Panel',
  'Wheel / Alloy Rim',
];

export const DamageAssessmentPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  const [images, setImages] = useState<string[]>([]);
  const [regions, setRegions] = useState<DamagedRegion[]>([]);
  const [loading, setLoading] = useState(false);
  const [localOnnxAvailable, setLocalOnnxAvailable] = useState<boolean>(false);
  const [inferenceMethod, setInferenceMethod] = useState<DamageAssessment['inferenceMethod']>('manual_user');
  const [modelIdentifier, setModelIdentifier] = useState('Manual-Assessment');
  const [statusMsg, setStatusMsg] = useState('');
  const [isDrivable, setIsDrivable] = useState(true);

  // Manual entry controls
  const [newPartName, setNewPartName] = useState('Front Bumper');
  const [newDamageType, setNewDamageType] = useState<DamagedRegion['damageType']>('dent');
  const [newSeverity, setNewSeverity] = useState<DamagedRegion['severity']>('moderate');
  const [newNotes, setNewNotes] = useState('');

  // Optional attach to claim
  const [claims, setClaims] = useState<ClaimAssistanceCase[]>([]);
  const [selectedClaimId, setSelectedClaimId] = useState('');
  const [banner, setBanner] = useState<{ type: 'success' | 'error' | 'info' | 'warning'; message: string } | null>(null);

  useEffect(() => {
    checkLocalModelAvailability().then(setLocalOnnxAvailable);
    if (currentUser) {
      dbGetClaims(currentUser.uid).then((list) => {
        setClaims(list);
        if (list.length > 0) setSelectedClaimId(list[0].id);
      });
    }
  }, [currentUser]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    for (const f of files) {
      const check = validateEvidenceFile(f);
      if (!check.valid) {
        setBanner({ type: 'error', message: check.error || 'Unsupported image file.' });
        continue;
      }
      const comp = await compressImageForPreview(f, 800, 800, 0.72);
      setImages((prev) => [...prev, comp.previewBase64]);
    }
  };

  const handleRunAi = async () => {
    if (images.length === 0) {
      setBanner({ type: 'warning', message: 'Upload at least one accident photograph first.' });
      return;
    }
    setLoading(true);
    setStatusMsg('Running server-side AI Vision inspection...');

    const res = await requestGeminiDamageAssessment(images);
    if (res.status === 'completed' && res.regions.length > 0) {
      setRegions(res.regions);
      setInferenceMethod('gemini_vision');
      setModelIdentifier(res.modelIdentifier);
      if (res.isVehicleDrivableAccordingToAI !== undefined) {
        setIsDrivable(res.isVehicleDrivableAccordingToAI);
      }
      setStatusMsg(res.summaryAnalysis || 'AI vision detected preliminary damage components. Review or correct items below.');
    } else {
      const onnx = await runLocalONNXDamageInference(images[0]);
      setStatusMsg(res.statusMessage || onnx.statusMessage);
      setInferenceMethod('manual_user');
      setModelIdentifier('Manual-Assessment');
    }
    setLoading(false);
  };

  const handleAddManual = () => {
    const newReg: DamagedRegion = {
      id: 'reg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
      partName: newPartName,
      damageType: newDamageType,
      severity: newSeverity,
      userDescription: newNotes.trim() || undefined,
      isUserAddedOrCorrected: true,
    };
    setRegions((prev) => [...prev, newReg]);
    setNewNotes('');
  };

  const handleSaveToClaim = async () => {
    if (!currentUser || !selectedClaimId) {
      setBanner({ type: 'warning', message: 'Select an existing claim case to save this assessment.' });
      return;
    }
    const targetClaim = claims.find((c) => c.id === selectedClaimId);
    if (!targetClaim) return;

    const assId = targetClaim.assessmentId || 'ass-' + Date.now();
    const assessment: DamageAssessment = {
      id: assId,
      claimId: targetClaim.id,
      uid: currentUser.uid,
      inferenceMethod,
      modelIdentifier,
      status: regions.length > 0 ? 'completed' : 'manual_only',
      statusMessage: statusMsg || 'Saved via Damage Assessment Workbench.',
      regions,
      isVehicleDrivableAccordingToUser: isDrivable,
      safetyNoticeRequired: !isDrivable,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await dbSaveAssessment(currentUser.uid, assessment);
    await dbSaveClaim(currentUser.uid, {
      ...targetClaim,
      assessmentId: assId,
      isDrivable,
      updatedAt: Date.now(),
    });
    setBanner({ type: 'success', message: `Saved ${regions.length} damaged components to ${targetClaim.caseReference}.` });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">{t('assessment.title')}</h1>
        <p className="text-xs text-slate-600">{t('assessment.subtitle')}</p>
      </div>

      {banner && <ToastBanner type={banner.type} message={banner.message} onClose={() => setBanner(null)} />}

      {/* Honest AI Status Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900">AI Runtime Status:</span>{' '}
            <span className="text-slate-600">
              {localOnnxAvailable
                ? 'Local ONNX model available + Server Gemini Vision route active (requires GEMINI_API_KEY).'
                : 'Local ONNX model file not installed (/models/vehicle_damage_yolo.onnx). Server Gemini Vision route available when configured; Manual Assessment is always available.'}
            </span>
          </div>
        </div>
      </div>

      {!isDrivable && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-900">
          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
          <div>
            <p className="font-bold">Safety Notice: Vehicle Marked Not Safe to Drive</p>
            <p className="mt-0.5">
              Do not drive a vehicle with fluid leaks, suspension misalignment, broken headlights/tail lights, or airbag deployment. Arrange roadside towing to an authorized workshop.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center space-y-2 bg-slate-50">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleUpload}
            className="hidden"
            id="standalone-photo-upload"
          />
          <label htmlFor="standalone-photo-upload" className="cursor-pointer inline-flex flex-col items-center gap-2">
            <Camera className="w-8 h-8 text-blue-600" />
            <span className="text-xs font-bold text-blue-700">Upload Accident Photographs (JPEG / PNG / WEBP)</span>
          </label>
        </div>

        {images.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-700">{images.length} Photos Uploaded</span>
              <Button size="sm" onClick={handleRunAi} isLoading={loading} className="gap-1.5">
                <Cpu className="w-4 h-4" />
                <span>Run AI Vision Inspection</span>
              </Button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {images.map((img, i) => (
                <img key={i} src={img} alt={`Accident evidence ${i + 1}`} className="h-24 w-full object-cover rounded-lg border border-slate-200" />
              ))}
            </div>
          </div>
        )}

        {statusMsg && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-medium">
            {statusMsg}
          </div>
        )}

        {/* Drivability Check */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <input
            type="checkbox"
            id="drivable-toggle"
            checked={isDrivable}
            onChange={(e) => setIsDrivable(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600"
          />
          <label htmlFor="drivable-toggle" className="font-semibold text-slate-800 cursor-pointer">
            Vehicle appears safe and legally drivable (uncheck if headlights/tail lights are shattered or wheels/steering are affected)
          </label>
        </div>

        {/* Recorded Parts */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Detected / Recorded Components ({regions.length})
          </h3>
          {regions.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No damaged components added yet. Run AI or add manual entries below.</p>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {regions.map((r) => (
                <div key={r.id} className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{r.partName}</span>
                    <span className="text-slate-500 ml-2">({r.damageType.toUpperCase()})</span>
                    <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      {r.confidence !== undefined
                        ? `AI Detected (${Math.round(r.confidence * 100)}%)`
                        : 'User Observation'}
                    </span>
                    {r.userDescription && <p className="text-[11px] text-slate-500 mt-0.5">{r.userDescription}</p>}
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[10px]">
                      {r.severity.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <button
                      type="button"
                      onClick={() => setRegions(regions.filter((item) => item.id !== r.id))}
                      className="text-red-600 hover:bg-red-50 p-1 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Manual Observation */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Add / Correct Damaged Component</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={newPartName}
              onChange={(e) => setNewPartName(e.target.value)}
              className="rounded-lg border border-slate-300 p-2 text-xs bg-white"
            >
              {VEHICLE_PARTS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <select
              value={newDamageType}
              onChange={(e) => setNewDamageType(e.target.value as DamagedRegion['damageType'])}
              className="rounded-lg border border-slate-300 p-2 text-xs bg-white"
            >
              <option value="dent">Dent</option>
              <option value="scratch">Scratch</option>
              <option value="crack">Crack</option>
              <option value="broken">Broken / Shattered</option>
              <option value="alignment">Alignment Shift</option>
              <option value="other">Other</option>
            </select>
            <select
              value={newSeverity}
              onChange={(e) => setNewSeverity(e.target.value as DamagedRegion['severity'])}
              className="rounded-lg border border-slate-300 p-2 text-xs bg-white"
            >
              <option value="minor">Minor</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
              <option value="unable_to_determine">Unable to Determine</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Optional observation note..."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs bg-white"
            />
            <Button type="button" size="sm" variant="secondary" onClick={handleAddManual} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Add Part</span>
            </Button>
          </div>
        </div>

        {/* Save Assessment to Claim */}
        {claims.length > 0 && (
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <select
              value={selectedClaimId}
              onChange={(e) => setSelectedClaimId(e.target.value)}
              className="rounded-lg border border-slate-300 p-2 text-xs bg-white"
            >
              {claims.map((c) => (
                <option key={c.id} value={c.id}>
                  Attach to {c.caseReference} ({c.incidentDate})
                </option>
              ))}
            </select>
            <Button type="button" onClick={handleSaveToClaim} className="gap-1.5">
              <Save className="w-4 h-4" />
              <span>Save Assessment to Claim</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
