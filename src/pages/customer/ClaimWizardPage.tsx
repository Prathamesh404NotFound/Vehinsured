import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Car,
  Calendar,
  Camera,
  Cpu,
  Calculator,
  FileCheck,
  CheckCircle2,
  ArrowRight,
  Save,
  FileDown,
  HeartHandshake,
  AlertTriangle,
  Trash2,
  ArrowUp,
  ArrowDown,
  Download,
  Printer,
  CheckSquare,
  FileJson,
  Scan,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import {
  dbGetVehicles,
  dbGetPolicies,
  dbSaveClaim,
  dbGetClaimById,
  dbSaveAssessment,
  dbGetAssessmentById,
  dbGetReferenceCosts,
  dbGetDocuments,
  dbAddActivityLog,
} from '../../services/database';
import {
  Vehicle,
  InsurancePolicy,
  ClaimAssistanceCase,
  EvidenceImage,
  DamagedRegion,
  DamageAssessment,
  CostEstimateResult,
  CostReferenceItem,
  DocumentItem,
  ClaimChecklistProgress,
} from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { VoiceInputButton } from '../../components/ui/VoiceInputButton';
import { ToastBanner } from '../../components/ui/ToastBanner';
import { compressImageForPreview } from '../../services/storage/imageCompressor';
import { storeLocalOriginalFile, getLocalOriginalFile } from '../../services/storage/indexedDb';
import { checkLocalModelAvailability, runLocalONNXDamageInference } from '../../services/ai/onnxInference';
import { requestGeminiDamageAssessment } from '../../services/ai/geminiAssessment';
import { calculateRepairEstimate, DEFAULT_COST_REFERENCES } from '../../services/cost-estimation/calculator';
import { generateAssessmentPdfReport, exportBundleAsJson } from '../../services/pdf/reportGenerator';
import { useTranslation } from '../../features/i18n/context';
import { IRDAI_DOCUMENT_CHECKLIST } from '../../data/onlineReferenceData';
import { validateEvidenceFile, MAX_EVIDENCE_PER_CASE } from '../../utils/validation';

const PART_OPTIONS = [
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

export const ClaimWizardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const existingClaimId = searchParams.get('id');
  const startDeceased = searchParams.get('deceased') === 'true';

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error' | 'info' | 'warning'; message: string } | null>(null);

  // Data sources
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [refCosts, setRefCosts] = useState<CostReferenceItem[]>(DEFAULT_COST_REFERENCES);
  const [userDocs, setUserDocs] = useState<DocumentItem[]>([]);
  const [localOnnxReady, setLocalOnnxReady] = useState(false);

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

  // Manual damage entry fields
  const [newPartName, setNewPartName] = useState('Front Bumper');
  const [newDamageType, setNewDamageType] = useState<DamagedRegion['damageType']>('dent');
  const [newSeverity, setNewSeverity] = useState<DamagedRegion['severity']>('minor');

  // Step 5: Cost Estimates
  const [costEstimate, setCostEstimate] = useState<CostEstimateResult | null>(null);

  // Step 6: Documents & Contextual Checklist
  const [checklistProgress, setChecklistProgress] = useState<ClaimChecklistProgress>({
    'doc-claim-form': 'pending',
    'doc-rc': 'available',
    'doc-policy': 'available',
    'doc-dl': 'available',
    'doc-garage-est': 'pending',
  });
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  // Step 7: Nominee / Deceased Case
  const [isDeceasedCase, setIsDeceasedCase] = useState<boolean>(startDeceased);
  const [policyholderName, setPolicyholderName] = useState<string>('');
  const [relationship, setRelationship] = useState<string>('spouse');
  const [applicantName, setApplicantName] = useState<string>('');
  const [insurerContacted, setInsurerContacted] = useState<boolean>(false);

  const [savedClaimId, setSavedClaimId] = useState<string>(existingClaimId || '');
  const [caseReference, setCaseReference] = useState<string>(
    'CLAIM-' + new Date().toISOString().slice(0, 7).replace('-', '') + '-' + Math.floor(1000 + Math.random() * 9000)
  );

  useEffect(() => {
    checkLocalModelAvailability().then(setLocalOnnxReady);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    async function init() {
      setLoading(true);
      const [vList, pList, rCosts, docs] = await Promise.all([
        dbGetVehicles(currentUser!.uid),
        dbGetPolicies(currentUser!.uid),
        dbGetReferenceCosts(),
        dbGetDocuments(currentUser!.uid),
      ]);
      setVehicles(vList);
      setPolicies(pList);
      setRefCosts(rCosts);
      setUserDocs(docs);

      if (vList.length > 0) setSelectedVehicleId(vList[0].id);
      if (pList.length > 0) setSelectedPolicyId(pList[0].id);

      if (existingClaimId) {
        const existing = await dbGetClaimById(currentUser!.uid, existingClaimId);
        if (existing) {
          setSavedClaimId(existing.id);
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
          if (existing.nomineeDetails) {
            setPolicyholderName(existing.nomineeDetails.policyholderName);
            setRelationship(existing.nomineeDetails.relationshipToPolicyholder);
            setApplicantName(existing.nomineeDetails.applicantName);
            setInsurerContacted(existing.nomineeDetails.insurerContacted);
          }
          if (existing.checklistProgress) setChecklistProgress(existing.checklistProgress);
          if (existing.documentIds) setSelectedDocIds(existing.documentIds);
          setStep(existing.currentWizardStep || 1);

          if (existing.assessmentId) {
            const ass = await dbGetAssessmentById(currentUser!.uid, existing.assessmentId);
            if (ass) {
              setRegions(ass.regions || []);
              setInferenceMethod(ass.inferenceMethod);
              setModelIdentifier(ass.modelIdentifier);
            }
          }
        }
      }
      setLoading(false);
    }
    init();
  }, [currentUser, existingClaimId]);

  useEffect(() => {
    const selVehicle = vehicles.find((v) => v.id === selectedVehicleId);
    const category = selVehicle ? selVehicle.category : 'hatchback';
    const est = calculateRepairEstimate(regions, category, refCosts);
    setCostEstimate(est);
  }, [regions, selectedVehicleId, vehicles, refCosts]);

  const handleEvidenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (evidenceList.length + files.length > MAX_EVIDENCE_PER_CASE) {
      setBanner({
        type: 'warning',
        message: `Maximum ${MAX_EVIDENCE_PER_CASE} evidence photos per case allowed.`,
      });
      return;
    }

    for (const file of files) {
      const check = validateEvidenceFile(file);
      if (!check.valid) {
        setBanner({ type: 'error', message: check.error || 'Unsupported file.' });
        continue;
      }
      try {
        const comp = await compressImageForPreview(file, 800, 800, 0.72);
        const fileKey = `orig_evid_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        await storeLocalOriginalFile(fileKey, file);

        const newEvid: EvidenceImage = {
          id: 'evid-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
          caption: file.name.replace(/\.[^/.]+$/, ''),
          previewBase64: comp.previewBase64,
          sizeKb: comp.sizeKb,
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

  const handleMoveEvidence = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= evidenceList.length) return;
    const copy = [...evidenceList];
    const [moved] = copy.splice(idx, 1);
    copy.splice(target, 0, moved);
    setEvidenceList(copy);
  };

  const handleDownloadOriginal = async (evid: EvidenceImage) => {
    if (!evid.originalKey) return;
    const data = await getLocalOriginalFile(evid.originalKey);
    if (!data) {
      setBanner({ type: 'info', message: 'High-res original is only stored on the device that uploaded it.' });
      return;
    }
    const url = typeof data === 'string' ? data : URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${evid.caption || 'evidence'}.jpg`;
    a.click();
    if (typeof data !== 'string') URL.revokeObjectURL(url);
  };

  const handleRunAiAnalysis = async () => {
    if (evidenceList.length === 0) {
      setBanner({ type: 'warning', message: 'Upload at least one accident photograph before running AI analysis.' });
      return;
    }

    setAiRunning(true);
    setModelStatusMsg('Analyzing photographs using server-side Gemini AI vision model...');

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
      setModelStatusMsg(aiRes.summaryAnalysis || 'AI vision detected visible damaged parts successfully.');
      if (aiRes.isVehicleDrivableAccordingToAI !== undefined) {
        setIsDrivable(aiRes.isVehicleDrivableAccordingToAI);
      }
    } else {
      const onnxRes = await runLocalONNXDamageInference(base64List[0]);
      setModelStatusMsg(aiRes.statusMessage || onnxRes.statusMessage);
      setInferenceMethod('manual_user');
      setModelIdentifier('Manual-Assessment');
    }

    setAiRunning(false);
  };

  const handleAddManualRegion = () => {
    if (!newPartName) return;
    const newReg: DamagedRegion = {
      id: 'reg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
      partName: newPartName,
      damageType: newDamageType,
      severity: newSeverity,
      isUserAddedOrCorrected: true,
    };
    setRegions([...regions, newReg]);
  };

  const buildClaimBundle = (status: ClaimAssistanceCase['status']) => {
    const claimId = savedClaimId || 'claim-' + Date.now();
    const assessmentId = 'ass-' + Date.now();

    const assessmentObj: DamageAssessment = {
      id: assessmentId,
      claimId,
      uid: currentUser?.uid || '',
      inferenceMethod,
      modelIdentifier,
      status: regions.length > 0 ? 'completed' : 'manual_only',
      statusMessage: modelStatusMsg || undefined,
      regions,
      isVehicleDrivableAccordingToUser: isDrivable,
      safetyNoticeRequired: !isDrivable,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const claimObj: ClaimAssistanceCase = {
      id: claimId,
      uid: currentUser?.uid || '',
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
            applicantName: applicantName || currentUser?.displayName || '',
            insurerContacted,
          }
        : undefined,
      checklistProgress,
      status,
      assessmentId,
      documentIds: selectedDocIds,
      currentWizardStep: step,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    return { claimObj, assessmentObj };
  };

  const handleSaveClaimCase = async (status: ClaimAssistanceCase['status']) => {
    if (!currentUser) return;
    setSaving(true);
    const { claimObj, assessmentObj } = buildClaimBundle(status);

    try {
      await dbSaveAssessment(currentUser.uid, assessmentObj);
      await dbSaveClaim(currentUser.uid, claimObj);
      setSavedClaimId(claimObj.id);
      await dbAddActivityLog(currentUser.uid, {
        title: status === 'submitted_for_review' ? 'Report Submitted' : 'Claim Draft Saved',
        description: `Reference: ${caseReference}`,
        type: 'claim',
      });

      if (status === 'submitted_for_review') {
        navigate(`/report-preview?id=${claimObj.id}`);
      } else {
        setBanner({
          type: 'success',
          message: `Draft saved (${caseReference}). You can safely resume from Dashboard or My Reports anytime.`,
        });
      }
    } catch (err: any) {
      setBanner({ type: 'error', message: 'Error saving claim report: ' + (err.message || err) });
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPdf = () => {
    const selVehicle = vehicles.find((v) => v.id === selectedVehicleId);
    const selPolicy = policies.find((p) => p.id === selectedPolicyId);
    const { claimObj, assessmentObj } = buildClaimBundle('ready_for_submission');
    const confirmedDocuments = userDocs.filter((d) => selectedDocIds.includes(d.id));

    const doc = generateAssessmentPdfReport({
      claim: claimObj,
      vehicle: selVehicle,
      policy: selPolicy,
      assessment: assessmentObj,
      costEstimate,
      confirmedDocuments,
    });
    doc.save(`${caseReference}_Damage_Report.pdf`);
  };

  const handleExportJson = () => {
    const selVehicle = vehicles.find((v) => v.id === selectedVehicleId);
    const selPolicy = policies.find((p) => p.id === selectedPolicyId);
    const { claimObj, assessmentObj } = buildClaimBundle('ready_for_submission');
    const jsonStr = exportBundleAsJson({
      claim: claimObj,
      vehicle: selVehicle,
      policy: selPolicy,
      assessment: assessmentObj,
      costEstimate,
    });
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${caseReference}_Bundle.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="text-center py-12 text-sm text-slate-500">Initializing Claim Assistance Wizard...</div>;
  }

  const stepsList = [
    t('wizard.step1'),
    t('wizard.step2'),
    t('wizard.step3'),
    t('wizard.step4'),
    t('wizard.step5'),
    t('wizard.step6'),
    t('wizard.step7'),
    t('wizard.step8'),
  ];

  // Missing-items advisory for Step 8 (non-blocking)
  const missingItems: string[] = [];
  if (!selectedVehicleId) missingItems.push('Linked vehicle not selected');
  if (!location.trim()) missingItems.push('Accident locality not entered');
  if (evidenceList.length === 0) missingItems.push('No accident photographs uploaded');
  if (regions.length === 0) missingItems.push('No damaged components recorded');
  if (isDeceasedCase && !policyholderName.trim()) missingItems.push('Deceased policyholder name not entered');

  // Contextual checklist items
  const contextualChecklist = IRDAI_DOCUMENT_CHECKLIST.filter((item) => {
    if (item.category === 'own_damage') return true;
    if (item.category === 'third_party') return otherVehicleInvolved || typeOfIncident === 'multi_vehicle' || typeOfIncident === 'hit_and_run';
    if (item.category === 'deceased_nominee') return isDeceasedCase;
    return false;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header & Step Tracker */}
      <div className="space-y-4 border-b border-slate-200 pb-4 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Case Ref: {caseReference}</span>
            <h1 className="text-2xl font-extrabold text-slate-900">{t('wizard.title')}</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSaveClaimCase('draft')}
            isLoading={saving}
            className="gap-1.5 self-start sm:self-auto"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{t('wizard.saveDraft')}</span>
          </Button>
        </div>

        {/* Step Progress Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
          {stepsList.map((label, idx) => {
            const stepNum = idx + 1;
            const isActive = step === stepNum;
            const isDone = step > stepNum;

            return (
              <button
                key={stepNum}
                type="button"
                onClick={() => setStep(stepNum)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{stepNum}.</span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {banner && <ToastBanner type={banner.type} message={banner.message} onClose={() => setBanner(null)} />}

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
                  <p className="text-xs text-slate-600">No vehicles found under your account yet.</p>
                  <Button size="sm" onClick={() => navigate('/vehicles/add')}>
                    Register Vehicle Now
                  </Button>
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
              <span>Next: {t('wizard.step2')}</span>
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

            <Input
              label="Accident Location / Locality"
              placeholder="e.g. Pune-Mumbai Expressway near Lonavala"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              rightElement={<VoiceInputButton onTranscript={(txt) => setLocation((prev) => `${prev} ${txt}`.trim())} />}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Incident Type</label>
                <select
                  value={typeOfIncident}
                  onChange={(e) => setTypeOfIncident(e.target.value as ClaimAssistanceCase['typeOfIncident'])}
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm bg-white"
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
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm bg-white"
                >
                  <option value="yes">Vehicle is currently Drivable</option>
                  <option value="no">Vehicle is NOT Drivable (Requires Towing)</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={otherVehicleInvolved}
                onChange={(e) => setOtherVehicleInvolved(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600"
              />
              <span>Was another vehicle, person, or third-party property involved?</span>
            </label>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Accident Description</label>
              <textarea
                rows={3}
                placeholder="Describe how the accident occurred..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-blue-500"
              ></textarea>
              <div className="mt-1 flex justify-end">
                <VoiceInputButton onTranscript={(txt) => setDescription((prev) => `${prev} ${txt}`.trim())} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Police FIR / Station Diary Ref (Optional)"
                placeholder="e.g. FIR-102/2026 Lonavala PS"
                value={policeFir}
                onChange={(e) => setPoliceFir(e.target.value)}
              />
              <Input
                label="Witness / Additional Notes (Optional)"
                placeholder="e.g. Security guard noted incident time"
                value={witnessNotes}
                onChange={(e) => setWitnessNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              {t('btn.back')}
            </Button>
            <Button onClick={() => setStep(3)}>Next: {t('wizard.step3')}</Button>
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

          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
            <p className="font-bold">Recommended 4-Angle Evidence Capture Guide:</p>
            <p>
              (1) Full vehicle with number plate visible, (2) Wide scene context, (3) Close-up of each damaged panel, (4) Odometer/dashboard warning lights if visible. High-res originals stay on your device (IndexedDB); previews (&lt;200KB) sync to the case.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center bg-slate-50">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleEvidenceUpload}
                className="hidden"
                id="evidence-upload-input"
              />
              <label htmlFor="evidence-upload-input" className="cursor-pointer inline-flex flex-col items-center gap-1.5">
                <Camera className="w-7 h-7 text-blue-600" />
                <span className="text-xs font-bold text-blue-700 hover:underline">Upload from Gallery / Files</span>
              </label>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center bg-slate-50">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                onChange={handleEvidenceUpload}
                className="hidden"
                id="evidence-camera-input"
              />
              <label htmlFor="evidence-camera-input" className="cursor-pointer inline-flex flex-col items-center gap-1.5">
                <Camera className="w-7 h-7 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700 hover:underline">Capture via Device Camera</span>
              </label>
            </div>
          </div>

          {evidenceList.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Uploaded Evidence Photos ({evidenceList.length} / {MAX_EVIDENCE_PER_CASE})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {evidenceList.map((evid, idx) => (
                  <div key={evid.id} className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200 p-2 space-y-2">
                    <div className="relative">
                      <img src={evid.previewBase64} alt={evid.caption} className="w-full h-36 object-cover rounded-lg" />
                      <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded font-semibold">
                        #{idx + 1} {evid.sizeKb ? `• ${evid.sizeKb} KB preview` : ''}
                      </span>
                    </div>

                    <input
                      type="text"
                      value={evid.caption}
                      onChange={(e) =>
                        setEvidenceList(evidenceList.map((item) => (item.id === evid.id ? { ...item, caption: e.target.value } : item)))
                      }
                      placeholder="Photo caption (e.g. Front-left bumper)"
                      className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                    />

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveEvidence(idx, -1)}
                          disabled={idx === 0}
                          className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveEvidence(idx, 1)}
                          disabled={idx === evidenceList.length - 1}
                          className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        {evid.hasLocalOriginal && (
                          <button
                            type="button"
                            onClick={() => handleDownloadOriginal(evid)}
                            className="p-1 rounded text-blue-700 hover:bg-blue-50 flex items-center gap-1 cursor-pointer"
                            title="Download original high-res from IndexedDB"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-semibold">Original</span>
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setEvidenceList(evidenceList.filter((item) => item.id !== evid.id))}
                        className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              {t('btn.back')}
            </Button>
            <Button onClick={() => setStep(4)}>Next: {t('wizard.step4')}</Button>
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

          {!isDrivable && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                <strong>Safety Notice:</strong> You indicated the vehicle may not be drivable. Arrange workshop towing rather than driving with damaged safety systems.
              </span>
            </div>
          )}

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Automated AI Vision Analysis</h4>
                <p className="text-xs text-slate-600">
                  {modelStatusMsg ||
                    (localOnnxReady
                      ? 'Local ONNX model + server Gemini AI ready.'
                      : 'Runs server-side Gemini Vision when configured, or record manual observations below.')}
                </p>
              </div>
              <Button size="sm" onClick={handleRunAiAnalysis} isLoading={aiRunning} className="shrink-0 gap-1.5">
                <Cpu className="w-4 h-4" />
                <span>Run AI Detection</span>
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Recorded Damaged Parts ({regions.length})
            </h3>

            {regions.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">
                No damaged parts recorded yet. Run AI detection or add manual observations below.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {regions.map((reg) => (
                  <div key={reg.id} className="p-3 bg-white flex items-center justify-between text-xs gap-2">
                    <div>
                      <span className="font-bold text-slate-900">{reg.partName}</span>
                      <span className="text-slate-500 ml-2">({reg.damageType.toUpperCase()})</span>
                      <span
                        className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold ${
                          reg.severity === 'severe'
                            ? 'bg-red-100 text-red-800'
                            : reg.severity === 'moderate'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {reg.severity.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {reg.confidence !== undefined ? `AI ${Math.round(reg.confidence * 100)}%` : 'User Recorded'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRegions(regions.filter((r) => r.id !== reg.id))}
                      className="text-red-600 hover:bg-red-50 p-1 rounded cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

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
                  {PART_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Damage Type</label>
                <select
                  value={newDamageType}
                  onChange={(e) => setNewDamageType(e.target.value as DamagedRegion['damageType'])}
                  className="w-full rounded-lg border border-slate-300 p-1.5 text-xs bg-white"
                >
                  <option value="dent">Visible Dent</option>
                  <option value="scratch">Surface Scratch</option>
                  <option value="crack">Deep Crack</option>
                  <option value="broken">Broken / Shattered</option>
                  <option value="alignment">Misaligned</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Severity</label>
                <select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value as DamagedRegion['severity'])}
                  className="w-full rounded-lg border border-slate-300 p-1.5 text-xs bg-white"
                >
                  <option value="minor">Minor</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                  <option value="unable_to_determine">Unable to Determine</option>
                </select>
              </div>
            </div>
            <Button type="button" size="sm" variant="secondary" onClick={handleAddManualRegion} className="w-full">
              Add Manual Observation
            </Button>
          </div>

          <div className="pt-4 flex justify-between">
            <Button variant="outline" onClick={() => setStep(3)}>
              {t('btn.back')}
            </Button>
            <Button onClick={() => setStep(5)}>Next: {t('wizard.step5')}</Button>
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
                  <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
                    Estimated Total Expense Range
                  </span>
                  <p className="text-2xl font-black text-blue-900 mt-0.5">
                    Rs. {costEstimate.totalMin.toLocaleString('en-IN')} &mdash; Rs.{' '}
                    {costEstimate.totalMax.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-blue-800 mt-1">{costEstimate.disclaimer}</p>
                </div>
                <span className="text-xs font-medium text-blue-700 bg-white px-3 py-1 rounded-lg border border-blue-200 shrink-0">
                  {costEstimate.vehicleCategory.toUpperCase()} Baseline
                </span>
              </div>

              {costEstimate.components.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-x-auto">
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
                          <td className="p-3 text-slate-600">
                            Rs. {c.partsCostMin}-{c.partsCostMax}
                          </td>
                          <td className="p-3 text-slate-600">
                            Rs. {c.laborCostMin}-{c.laborCostMax}
                          </td>
                          <td className="p-3 text-right font-bold text-slate-900">
                            Rs. {c.subtotalMin.toLocaleString('en-IN')} - {c.subtotalMax.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          <div className="pt-4 flex justify-between">
            <Button variant="outline" onClick={() => setStep(4)}>
              {t('btn.back')}
            </Button>
            <Button onClick={() => setStep(6)}>Next: {t('wizard.step6')}</Button>
          </div>
        </div>
      )}

      {/* STEP 6: DOCUMENTS & CHECKLIST */}
      {step === 6 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-blue-600" />
              <span>Step 6: Supporting Documents & IRDAI Checklist</span>
            </h2>
            <Link to="/document-scanner" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              <Scan className="w-3.5 h-3.5" />
              <span>Open OCR Document Scanner</span>
            </Link>
          </div>

          {userDocs.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase text-slate-700">Attach Confirmed OCR Documents ({userDocs.length})</h3>
              <div className="space-y-1.5">
                {userDocs.map((doc) => {
                  const isAttached = selectedDocIds.includes(doc.id);
                  return (
                    <label
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isAttached}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedDocIds([...selectedDocIds, doc.id]);
                            else setSelectedDocIds(selectedDocIds.filter((id) => id !== doc.id));
                          }}
                          className="w-4 h-4 rounded text-blue-600"
                        />
                        <span className="font-semibold text-slate-900">{doc.fileName}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                        {doc.category.replace(/_/g, ' ')}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase text-slate-700">Contextual Document Readiness</h3>
            {contextualChecklist.map((item) => {
              const status = checklistProgress[item.id] || 'pending';
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    const next = status === 'available' ? 'pending' : status === 'pending' ? 'not_applicable' : 'available';
                    setChecklistProgress({ ...checklistProgress, [item.id]: next });
                  }}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">{item.title}</p>
                    <p className="text-[11px] text-slate-500">{item.requirementNote}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded shrink-0 ${
                      status === 'available'
                        ? 'bg-emerald-100 text-emerald-800'
                        : status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {status.replace(/_/g, ' ')}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex justify-between">
            <Button variant="outline" onClick={() => setStep(5)}>
              {t('btn.back')}
            </Button>
            <Button onClick={() => setStep(7)}>Next: {t('wizard.step7')}</Button>
          </div>
        </div>
      )}

      {/* STEP 7: NOMINEE / DECEASED WORKFLOW */}
      {step === 7 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-amber-600" />
            <span>Step 7: Nominee & Deceased Policyholder Workflow</span>
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
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    Applicant Relationship
                  </label>
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

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={insurerContacted}
                  onChange={(e) => setInsurerContacted(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <span>Insurance company has been notified about the policyholder’s demise</span>
              </label>

              <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1 text-slate-700">
                <p className="font-bold text-slate-900">Nominee Documentation Reminder:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Certified Municipal Death Certificate & Police FIR / Inquest Report</li>
                  <li>Nomination / Legal Heirship / Succession Certificate proof</li>
                  <li>Check PA Owner-Driver Cover eligibility & RTO ownership transfer within 3 months</li>
                </ul>
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-between">
            <Button variant="outline" onClick={() => setStep(6)}>
              {t('btn.back')}
            </Button>
            <Button onClick={() => setStep(8)}>Next: {t('wizard.step8')}</Button>
          </div>
        </div>
      )}

      {/* STEP 8: REVIEW & EXPORT */}
      {step === 8 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-600" />
            <span>Step 8: Final Review & Claim Report Bundle Export</span>
          </h2>

          {missingItems.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-xs text-amber-900">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Recommended Items Still Missing (Draft saving remains allowed):</span>
              </p>
              <ul className="list-disc pl-5 space-y-0.5">
                {missingItems.map((m, idx) => (
                  <li key={idx}>{m}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
            <p>
              <strong>Case Reference:</strong> {caseReference}
            </p>
            <p>
              <strong>Incident Date & Locality:</strong> {incidentDate} at {location || 'Not entered'}
            </p>
            <p>
              <strong>Evidence Uploaded:</strong> {evidenceList.length} photos &bull;{' '}
              <strong>Damaged Parts:</strong> {regions.length} items &bull;{' '}
              <strong>Documents Linked:</strong> {selectedDocIds.length}
            </p>
            {costEstimate && (
              <p>
                <strong>Indicative Repair Range:</strong> Rs. {costEstimate.totalMin.toLocaleString('en-IN')} - Rs.{' '}
                {costEstimate.totalMax.toLocaleString('en-IN')}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button onClick={handleDownloadPdf} variant="outline" className="gap-1.5">
              <FileDown className="w-4 h-4 text-blue-600" />
              <span>{t('btn.downloadPdf')}</span>
            </Button>
            <Button onClick={() => window.print()} variant="outline" className="gap-1.5">
              <Printer className="w-4 h-4" />
              <span>{t('btn.printView')}</span>
            </Button>
            <Button onClick={handleExportJson} variant="outline" className="gap-1.5">
              <FileJson className="w-4 h-4" />
              <span>{t('btn.downloadJson')}</span>
            </Button>
            <Button
              onClick={() => handleSaveClaimCase('submitted_for_review')}
              isLoading={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              <span>{t('btn.submit')}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
