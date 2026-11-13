import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Car,
  Calendar,
  Camera,
  Cpu,
  Calculator,
  FileCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Save,
  FileDown,
  HeartHandshake,
  AlertTriangle,
  HelpCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import {
  dbGetVehicles,
  dbGetPolicies,
  dbSaveClaim,
  dbGetClaimById,
  dbSaveAssessment,
  dbGetReferenceCosts,
  dbAddActivityLog
} from '../../services/database';
import {
  Vehicle,
  InsurancePolicy,
  ClaimAssistanceCase,
  EvidenceImage,
  DamagedRegion,
  DamageAssessment,
  CostEstimateResult,
  DocumentItem
} from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { VoiceInputButton } from '../../components/ui/VoiceInputButton';
import { compressImageForPreview } from '../../services/storage/imageCompressor';
import { storeLocalOriginalFile } from '../../services/storage/indexedDb';
import { runLocalONNXDamageInference } from '../../services/ai/onnxInference';
import { requestGeminiDamageAssessment } from '../../services/ai/geminiAssessment';
import { calculateRepairEstimate } from '../../services/cost-estimation/calculator';
import { runBrowserOCR } from '../../services/ocr/tesseractService';
import { generateAssessmentPdfReport, exportBundleAsJson } from '../../services/pdf/reportGenerator';
import { useTranslation } from '../../features/i18n/context';

export const ClaimWizardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const existingClaimId = searchParams.get('id');

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Data sources
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);

  // Step 1: Vehicle & Policy Selection
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>('');

  // Step 2: Incident Info
  const [incidentDate, setIncidentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [incidentTime, setIncidentTime] = useState<string>('14:30');
  const [location, setLocation] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [typeOfIncident, setTypeOfIncident] = useState<ClaimAssistanceCase['typeOfIncident']>('single_vehicle');
  const [otherVehicleInvolved, setOtherVehicleInvolved] = useState<boolean>(false);
  const [isDrivable, setIsDrivable] = useState<boolean>(true);
  const [policeFir, setPoliceFir] = useState<string>('');
  const [witnessNotes, setWitnessNotes] = useState<string>('');

  // Step 3: Evidence Images
  const [evidenceList, setEvidenceList] = useState<EvidenceImage[]>([]);

  // Step 4: Damage Assessment (AI or Manual)
  const [regions, setRegions] = useState<DamagedRegion[]>([]);
  const [inferenceMethod, setInferenceMethod] = useState<DamageAssessment['inferenceMethod']>('manual_user');
  const [modelIdentifier, setModelIdentifier] = useState<string>('Manual-Assessment');
  const [modelStatusMsg, setModelStatusMsg] = useState<string>('');
  const [aiRunning, setAiRunning] = useState<boolean>(false);

  // New manual damage entry fields
  const [newPartName, setNewPartName] = useState('Front Bumper');
  const [newDamageType, setNewDamageType] = useState<DamagedRegion['damageType']>('dent');
  const [newSeverity, setNewSeverity] = useState<DamagedRegion['severity']>('minor');

  // Step 5: Cost Estimates
  const [costEstimate, setCostEstimate] = useState<CostEstimateResult | null>(null);

  // Step 6: Nominee / Deceased Case
  const [isDeceasedCase, setIsDeceasedCase] = useState<boolean>(false);
  const [policyholderName, setPolicyholderName] = useState<string>('');
  const [relationship, setRelationship] = useState<string>('spouse');
  const [applicantName, setApplicantName] = useState<string>('');

  // Saved case reference
  const [caseReference, setCaseReference] = useState<string>(
    'CLAIM-' + new Date().toISOString().slice(0, 7).replace('-', '') + '-' + Math.floor(1000 + Math.random() * 9000)
  );

  useEffect(() => {
    if (!currentUser) return;
    async function init() {
      setLoading(true);
      const [vList, pList] = await Promise.all([
        dbGetVehicles(currentUser!.uid),
        dbGetPolicies(currentUser!.uid),
      ]);
      setVehicles(vList);
      setPolicies(pList);

      if (vList.length > 0) setSelectedVehicleId(vList[0].id);

      if (existingClaimId) {
        const existing = await dbGetClaimById(currentUser!.uid, existingClaimId);
        if (existing) {
          setCaseReference(existing.caseReference);
          setSelectedVehicleId(existing.vehicleId);
          setSelectedPolicyId(existing.policyId || '');
          setIncidentDate(existing.incidentDate);
          setIncidentTime(existing.incidentTime);
          setLocation(existing.location);
          setDescription(existing.description);
          setTypeOfIncident(existing.typeOfIncident);
          setOtherVehicleInvolved(existing.otherVehicleInvolved);
          setIsDrivable(existing.isDrivable);
          setPoliceFir(existing.policeFirReference || '');
          setWitnessNotes(existing.witnessNotes || '');
          setEvidenceList(existing.evidenceList || []);
          setIsDeceasedCase(existing.isDeceasedCase || false);
          setStep(existing.currentWizardStep || 1);
        }
      }
      setLoading(false);
    }
    init();
  }, [currentUser, existingClaimId]);

  // Recalculate cost estimate whenever regions or selected vehicle change
  useEffect(() => {
    const selVehicle = vehicles.find((v) => v.id === selectedVehicleId);
    const category = selVehicle ? selVehicle.category : 'hatchback';
    const est = calculateRepairEstimate(regions, category);
    setCostEstimate(est);
  }, [regions, selectedVehicleId, vehicles]);

  // Image Upload Handler (Compress preview for RTDB & store high-res in IndexedDB)
  const handleEvidenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    for (const file of files) {
      try {
        const comp = await compressImageForPreview(file, 800, 800, 0.7);
        const fileKey = `orig_evid_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

        // Store high-res original in browser IndexedDB
        await storeLocalOriginalFile(fileKey, file);

        const newEvid: EvidenceImage = {
          id: 'evid-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
          caption: file.name,
          previewBase64: comp.previewBase64,
          hasLocalOriginal: true,
          originalKey: fileKey,
          createdAt: Date.now(),
        };

        setEvidenceList((prev) => [...prev, newEvid]);
      } catch (err) {
        console.warn('Evidence compression error:', err);
      }
    }
  };

  const handleRemoveEvidence = (id: string) => {
    setEvidenceList(evidenceList.filter((e) => e.id !== id));
  };

  // Run AI Damage Analysis
  const handleRunAiAnalysis = async () => {
    if (evidenceList.length === 0) {
      alert('Please upload at least one accident photograph before running AI damage analysis.');
      return;
    }

    setAiRunning(true);
    setModelStatusMsg('Analyzing photographs using Gemini AI vision model...');

    const selVehicle = vehicles.find((v) => v.id === selectedVehicleId);
    const base64List = evidenceList.map((e) => e.previewBase64);

    const aiRes = await requestGeminiDamageAssessment(base64List, {
      make: selVehicle?.make,
      model: selVehicle?.model,
      category: selVehicle?.category,
    });

    if (aiRes.status === 'completed' && aiRes.regions.length > 0) {
      setRegions(aiRes.regions);
      setInferenceMethod('gemini_vision');
      setModelIdentifier(aiRes.modelIdentifier);
      setModelStatusMsg('AI vision model detected visible damaged parts successfully.');
      if (aiRes.isVehicleDrivableAccordingToAI !== undefined) {
        setIsDrivable(aiRes.isVehicleDrivableAccordingToAI);
      }
    } else {
      // Fallback to local ONNX status or honest message
      const onnxRes = await runLocalONNXDamageInference(base64List[0]);
      setModelStatusMsg(aiRes.statusMessage || onnxRes.statusMessage);
      setInferenceMethod('manual_user');
      setModelIdentifier('Manual-Assessment');
    }

    setAiRunning(false);
  };

  // Manual Damage Region Addition
  const handleAddManualRegion = () => {
    if (!newPartName) return;
    const newReg: DamagedRegion = {
      id: 'reg-' + Date.now(),
      partName: newPartName,
      damageType: newDamageType,
      severity: newSeverity,
      isUserAddedOrCorrected: true,
    };
    setRegions([...regions, newReg]);
  };

  const handleRemoveRegion = (id: string) => {
    setRegions(regions.filter((r) => r.id !== id));
  };

  // Save Claim Draft or Final Report
  const handleSaveClaimCase = async (status: ClaimAssistanceCase['status']) => {
    if (!currentUser) return;
    setSaving(true);

    const claimId = existingClaimId || 'claim-' + Date.now();
    const assessmentId = 'ass-' + Date.now();

    const assessmentObj: DamageAssessment = {
      id: assessmentId,
      claimId,
      uid: currentUser.uid,
      inferenceMethod,
      modelIdentifier,
      status: regions.length > 0 ? 'completed' : 'manual_only',
      regions,
      isVehicleDrivableAccordingToUser: isDrivable,
      safetyNoticeRequired: !isDrivable,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const claimObj: ClaimAssistanceCase = {
      id: claimId,
      uid: currentUser.uid,
      caseReference,
      vehicleId: selectedVehicleId,
      policyId: selectedPolicyId,
      incidentDate,
      incidentTime,
      location,
      description,
      typeOfIncident,
      otherVehicleInvolved,
      isDrivable,
      policeFirReference: policeFir,
      witnessNotes,
      evidenceList,
      isDeceasedCase,
      nomineeDetails: isDeceasedCase
        ? {
            policyholderName,
            relationshipToPolicyholder: relationship,
            applicantName: applicantName || currentUser.displayName,
            insurerContacted: true,
          }
        : undefined,
      status,
      assessmentId,
      documentIds: [],
      currentWizardStep: step,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      await dbSaveAssessment(currentUser.uid, assessmentObj);
      await dbSaveClaim(currentUser.uid, claimObj);
      await dbAddActivityLog(currentUser.uid, {
        title: status === 'submitted_for_review' ? 'Report Submitted' : 'Claim Draft Saved',
        description: `Reference: ${caseReference}`,
        type: 'claim',
      });

      if (status === 'submitted_for_review') {
        alert(`Claim report ${caseReference} saved and submitted for review.`);
        navigate('/dashboard');
      } else {
        alert(`Draft saved successfully (Reference: ${caseReference}). You can resume anytime.`);
      }
    } catch (err: any) {
      alert('Error saving claim report: ' + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  // Download PDF Report
  const handleDownloadPdf = () => {
    const selVehicle = vehicles.find((v) => v.id === selectedVehicleId);
    const selPolicy = policies.find((p) => p.id === selectedPolicyId);

    const mockClaim: ClaimAssistanceCase = {
      id: 'temp-id',
      uid: currentUser?.uid || 'temp',
      caseReference,
      vehicleId: selectedVehicleId,
      policyId: selectedPolicyId,
      incidentDate,
      incidentTime,
      location,
      description,
      typeOfIncident,
      otherVehicleInvolved,
      isDrivable,
      policeFirReference: policeFir,
      witnessNotes,
      evidenceList,
      isDeceasedCase,
      nomineeDetails: isDeceasedCase ? { policyholderName, relationshipToPolicyholder: relationship, applicantName, insurerContacted: true } : undefined,
      status: 'submitted_for_review',
      documentIds: [],
      currentWizardStep: step,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const doc = generateAssessmentPdfReport({
      claim: mockClaim,
      vehicle: selVehicle,
      policy: selPolicy,
      assessment: {
        id: 'a1',
        claimId: 'c1',
        uid: currentUser?.uid || '',
        inferenceMethod,
        modelIdentifier,
        status: 'completed',
        regions,
        isVehicleDrivableAccordingToUser: isDrivable,
        safetyNoticeRequired: !isDrivable,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      costEstimate,
    });

    doc.save(`${caseReference}_Damage_Report.pdf`);
  };

  if (loading) {
    return <div className="text-center py-12 text-sm text-slate-500">Initializing Claim Assistance Wizard...</div>;
  }

  const stepsList = [
    'Vehicle & Policy',
    'Accident Details',
    'Evidence Upload',
    'Damage Assessment',
    'Repair Estimates',
    'Nominee Guidance',
    'Review & Export',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header & Step Tracker */}
      <div className="space-y-4 border-b border-slate-200 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
              Case Ref: {caseReference}
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900">Claim Assistance Wizard</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSaveClaimCase('draft')}
            isLoading={saving}
            className="gap-1.5 self-start sm:self-auto"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </Button>
        </div>

        {/* Step Progress Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {stepsList.map((label, idx) => {
            const stepNum = idx + 1;
            const isActive = step === stepNum;
            const isDone = step > stepNum;

            return (
              <button
                key={stepNum}
                onClick={() => setStep(stepNum)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isDone
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{stepNum}.</span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1: VEHICLE & POLICY */}
      {step === 1 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Car className="w-5 h-5 text-blue-600" />
            <span>Step 1: Select Vehicle & Insurance Policy</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Select Vehicle
              </label>
              {vehicles.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
                  <p className="text-xs text-slate-600">No vehicles found under your account.</p>
                  <Button size="sm" onClick={() => navigate('/vehicles/add')}>Register Vehicle Now</Button>
                </div>
              ) : (
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm bg-white"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.make} {v.model} ({v.displayRegistrationNumber || v.registrationNumber})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Select Linked Policy (Optional)
              </label>
              <select
                value={selectedPolicyId}
                onChange={(e) => setSelectedPolicyId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm bg-white"
              >
                <option value="">-- No Policy Linked --</option>
                {policies.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.insurerName} - {p.policyNumber} (Exp: {p.expiryDate})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button onClick={() => setStep(2)}>
              <span>Next: Record Accident Details</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: ACCIDENT DETAILS */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Step 2: Record Accident Incident Details</span>
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Accident Date"
                type="date"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                required
              />
              <Input
                label="Approximate Time"
                type="time"
                value={incidentTime}
                onChange={(e) => setIncidentTime(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Input
                label="Accident Location / Locality"
                placeholder="e.g. Pune-Mumbai Expressway near Lonavala"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                rightElement={<VoiceInputButton onTranscript={(txt) => setLocation((prev) => prev + ' ' + txt)} />}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Incident Type</label>
                <select
                  value={typeOfIncident}
                  onChange={(e) => setTypeOfIncident(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm"
                >
                  <option value="single_vehicle">Single Vehicle Collision (Wall/Tree/Divider)</option>
                  <option value="multi_vehicle">Multi-Vehicle Collision</option>
                  <option value="hit_and_run">Hit and Run Incident</option>
                  <option value="parked_vandalism">Parked Vehicle Damage</option>
                  <option value="natural_calamity">Flood / Natural Calamity</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Vehicle Drivability</label>
                <select
                  value={isDrivable ? 'yes' : 'no'}
                  onChange={(e) => setIsDrivable(e.target.value === 'yes')}
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm"
                >
                  <option value="yes">Vehicle is currently Drivable</option>
                  <option value="no">Vehicle is NOT Drivable (Requires Towing)</option>
                </select>
              </div>
            </div>

            <div className="relative">
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                Accident Description
              </label>
              <textarea
                rows={3}
                placeholder="Describe how the accident occurred..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-blue-500"
              ></textarea>
              <div className="mt-1 flex justify-end">
                <VoiceInputButton onTranscript={(txt) => setDescription((prev) => prev + ' ' + txt)} />
              </div>
            </div>

            <Input
              label="Police FIR / Entry Reference (Optional)"
              placeholder="e.g. FIR-102/2026 Lonavala PS"
              value={policeFir}
              onChange={(e) => setPoliceFir(e.target.value)}
            />
          </div>

          <div className="pt-4 flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={() => setStep(3)}>Next: Upload Evidence</Button>
          </div>
        </div>
      )}

      {/* STEP 3: EVIDENCE PHOTOS */}
      {step === 3 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            <span>Step 3: Capture & Upload Evidence Photographs</span>
          </h2>

          <p className="text-xs text-slate-600 leading-relaxed">
            Upload clear photos from multiple angles: complete vehicle view, close-ups of damaged areas, registration plate, and surroundings. Previews are compressed for cloud synchronization, while full-res originals remain in your local browser storage.
          </p>

          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center space-y-3 bg-slate-50">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleEvidenceUpload}
              className="hidden"
              id="evidence-upload-input"
            />
            <label htmlFor="evidence-upload-input" className="cursor-pointer inline-flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <Camera className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-blue-700 hover:underline">Click to Upload Photos or Take Pictures</span>
            </label>
          </div>

          {evidenceList.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Uploaded Evidence Photos ({evidenceList.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {evidenceList.map((evid) => (
                  <div key={evid.id} className="relative bg-slate-100 rounded-xl overflow-hidden border border-slate-200 group">
                    <img src={evid.previewBase64} alt={evid.caption} className="w-full h-28 object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveEvidence(evid.id)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 cursor-pointer shadow-md"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="p-1.5 text-[10px] text-slate-600 truncate bg-white border-t border-slate-100">
                      {evid.caption}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
            <Button onClick={() => setStep(4)}>Next: Damage Assessment</Button>
          </div>
        </div>
      )}

      {/* STEP 4: DAMAGE ASSESSMENT */}
      {step === 4 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-600" />
            <span>Step 4: AI & Manual Vehicle Damage Assessment</span>
          </h2>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Automated AI Vision Analysis</h4>
                <p className="text-xs text-slate-600">{modelStatusMsg || 'Detect damaged components using AI vision or record manual observations.'}</p>
              </div>
              <Button size="sm" onClick={handleRunAiAnalysis} isLoading={aiRunning} className="shrink-0 gap-1.5">
                <Cpu className="w-4 h-4" />
                <span>Run AI Detection</span>
              </Button>
            </div>
          </div>

          {/* Damaged Components List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Recorded Damaged Parts ({regions.length})</h3>

            {regions.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No damaged parts recorded yet. Run AI or add manual entries below.</p>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {regions.map((reg) => (
                  <div key={reg.id} className="p-3 bg-white flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{reg.partName}</span>
                      <span className="text-slate-500 ml-2">({reg.damageType.toUpperCase()})</span>
                      <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold ${
                        reg.severity === 'severe' ? 'bg-red-100 text-red-800' :
                        reg.severity === 'moderate' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {reg.severity.toUpperCase()}
                      </span>
                    </div>
                    <button onClick={() => handleRemoveRegion(reg.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Manual Entry Form */}
          <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50/50">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Add / Correct Manual Observations</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Part Name</label>
                <select
                  value={newPartName}
                  onChange={(e) => setNewPartName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-1.5 text-xs bg-white"
                >
                  <option value="Front Bumper">Front Bumper</option>
                  <option value="Rear Bumper">Rear Bumper</option>
                  <option value="Bonnet">Bonnet / Hood</option>
                  <option value="Front Door">Front Door</option>
                  <option value="Rear Door">Rear Door</option>
                  <option value="Headlight">Headlight Assembly</option>
                  <option value="Tail Light">Tail Light Assembly</option>
                  <option value="Fender">Fender / Mudguard</option>
                  <option value="Windscreen">Windscreen Glass</option>
                  <option value="Side Mirror">Side Mirror</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Damage Type</label>
                <select
                  value={newDamageType}
                  onChange={(e) => setNewDamageType(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-300 p-1.5 text-xs bg-white"
                >
                  <option value="dent">Visible Dent</option>
                  <option value="scratch">Surface Scratch</option>
                  <option value="crack">Deep Crack</option>
                  <option value="broken">Broken / Detached</option>
                  <option value="alignment">Misaligned</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Severity</label>
                <select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-300 p-1.5 text-xs bg-white"
                >
                  <option value="minor">Minor</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
              </div>
            </div>
            <Button size="sm" variant="secondary" onClick={handleAddManualRegion} className="w-full">
              Add Manual Observation
            </Button>
          </div>

          <div className="pt-4 flex justify-between">
            <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
            <Button onClick={() => setStep(5)}>Next: Repair Estimates</Button>
          </div>
        </div>
      )}

      {/* STEP 5: REPAIR COST ESTIMATES */}
      {step === 5 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            <span>Step 5: Data-Driven Indicative Repair Estimates</span>
          </h2>

          {costEstimate && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Estimated Total Expense Range</span>
                  <p className="text-2xl font-black text-blue-900 mt-0.5">
                    Rs. {costEstimate.totalMin.toLocaleString('en-IN')} &mdash; Rs. {costEstimate.totalMax.toLocaleString('en-IN')}
                  </p>
                </div>
                <span className="text-xs font-medium text-blue-700 bg-white px-3 py-1 rounded-lg border border-blue-200 shrink-0">
                  {costEstimate.vehicleCategory.toUpperCase()} Baseline
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 font-semibold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="p-3">Component</th>
                      <th className="p-3">Suggested Action</th>
                      <th className="p-3">Parts Est.</th>
                      <th className="p-3">Labor Est.</th>
                      <th className="p-3 text-right">Subtotal Range</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {costEstimate.components.map((c, i) => (
                      <tr key={i}>
                        <td className="p-3 font-semibold text-slate-900">{c.partName}</td>
                        <td className="p-3 uppercase font-medium text-slate-600">{c.suggestedOperation}</td>
                        <td className="p-3 text-slate-600">Rs. {c.partsCostMin}-{c.partsCostMax}</td>
                        <td className="p-3 text-slate-600">Rs. {c.laborCostMin}-{c.laborCostMax}</td>
                        <td className="p-3 text-right font-bold text-slate-900">
                          Rs. {c.subtotalMin.toLocaleString('en-IN')} - {c.subtotalMax.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-between">
            <Button variant="outline" onClick={() => setStep(4)}>Back</Button>
            <Button onClick={() => setStep(6)}>Next: Nominee Assistance</Button>
          </div>
        </div>
      )}

      {/* STEP 6: NOMINEE / DECEASED WORKFLOW */}
      {step === 6 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-amber-600" />
            <span>Step 6: Nominee & Deceased Policyholder Workflow</span>
          </h2>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-900 text-sm">
              <input
                type="checkbox"
                checked={isDeceasedCase}
                onChange={(e) => setIsDeceasedCase(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
              />
              <span>Is this report being prepared for an incident involving a deceased policyholder?</span>
            </label>
          </div>

          {isDeceasedCase && (
            <div className="p-4 border border-slate-200 rounded-xl space-y-4 bg-slate-50/50">
              <Input
                label="Deceased Policyholder Name"
                value={policyholderName}
                onChange={(e) => setPolicyholderName(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Applicant Relationship</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm bg-white"
                  >
                    <option value="spouse">Spouse</option>
                    <option value="son">Son</option>
                    <option value="daughter">Daughter</option>
                    <option value="parent">Parent</option>
                    <option value="legal_heir">Legal Heir / Succession Certificate Holder</option>
                  </select>
                </div>
                <Input
                  label="Applicant / Nominee Name"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  required
                />
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1 text-slate-700">
                <p className="font-bold text-slate-900">Required Document Checklist for Nominee Claims:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Original Death Certificate issued by Municipal Corporation</li>
                  <li>Proof of Legal Heirship or Family Member Certificate</li>
                  <li>Nominee NEFT Bank Account Mandate & Cancelled Cheque</li>
                  <li>Original Registration Certificate and Insurance Policy</li>
                </ul>
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-between">
            <Button variant="outline" onClick={() => setStep(5)}>Back</Button>
            <Button onClick={() => setStep(7)}>Next: Review & Export Report</Button>
          </div>
        </div>
      )}

      {/* STEP 7: REVIEW & EXPORT */}
      {step === 7 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-600" />
            <span>Step 7: Final Review & Claim Report Bundle Export</span>
          </h2>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
            <p><strong>Case Reference:</strong> {caseReference}</p>
            <p><strong>Incident Date & Locality:</strong> {incidentDate} at {location || 'Not entered'}</p>
            <p><strong>Damaged Components Recorded:</strong> {regions.length} items</p>
            {costEstimate && (
              <p><strong>Estimated Cost Range:</strong> Rs. {costEstimate.totalMin.toLocaleString('en-IN')} - Rs. {costEstimate.totalMax.toLocaleString('en-IN')}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleDownloadPdf} variant="outline" className="w-full gap-2">
              <FileDown className="w-4 h-4 text-blue-600" />
              <span>Download PDF Report</span>
            </Button>
            <Button
              onClick={() => handleSaveClaimCase('submitted_for_review')}
              isLoading={saving}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              <span>Submit Case for Review</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
