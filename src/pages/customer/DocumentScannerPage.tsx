import React, { useState, useEffect } from 'react';
import { Scan, FileText, CheckCircle2, RefreshCw, Save, Trash2, AlertTriangle, ShieldPlus, Car } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ToastBanner } from '../../components/ui/ToastBanner';
import { runBrowserOCR } from '../../services/ocr/tesseractService';
import { compressImageForPreview } from '../../services/storage/imageCompressor';
import { storeLocalOriginalFile } from '../../services/storage/indexedDb';
import {
  dbGetDocuments,
  dbSaveDocument,
  dbDeleteDocument,
  dbSavePolicy,
  dbSaveVehicle,
  dbAddActivityLog,
} from '../../services/database';
import { DocumentItem, InsurancePolicy, Vehicle } from '../../types';
import { useAuth } from '../../features/auth/AuthContext';
import { validateDocumentFile, normalizeRegistrationNumber, formatRegistrationNumber } from '../../utils/validation';
import { useTranslation } from '../../features/i18n/context';

export const DocumentScannerPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  const [category, setCategory] = useState<DocumentItem['category']>('rc');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [progressPct, setProgressPct] = useState(0);
  const [confidenceScore, setConfidenceScore] = useState<number | undefined>(undefined);
  const [ocrError, setOcrError] = useState<string | null>(null);

  const [extractedFields, setExtractedFields] = useState<Record<string, string>>({});
  const [rawText, setRawText] = useState('');
  const [savedDocs, setSavedDocs] = useState<DocumentItem[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<DocumentItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error' | 'info' | 'warning'; message: string } | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    dbGetDocuments(currentUser.uid).then((list) => setSavedDocs(list.sort((a, b) => b.uploadedAt - a.uploadedAt)));
  }, [currentUser]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const check = validateDocumentFile(selected);
      if (!check.valid) {
        setBanner({ type: 'error', message: check.error || 'Invalid document file.' });
        return;
      }
      setFile(selected);
      setPreviewUrl(selected.type === 'application/pdf' ? null : URL.createObjectURL(selected));
      setExtractedFields({});
      setRawText('');
      setOcrError(null);
      setBanner(null);
    }
  };

  const handleRunOcr = async () => {
    if (!file) return;
    setScanning(true);
    setOcrError(null);
    setProgressMsg('Initializing local OCR worker...');

    const res = await runBrowserOCR(file, category, (pct, status) => {
      setProgressPct(pct);
      setProgressMsg(status);
    });

    setRawText(res.rawText);
    setExtractedFields(res.extractedFields);
    setConfidenceScore(res.confidenceScore);
    if (res.ocrError) {
      setOcrError(res.ocrError);
      setBanner({
        type: 'warning',
        message: 'OCR encountered low legibility or an error. Review and edit the structured fields below manually.',
      });
    }
    setScanning(false);
  };

  const handleSaveDocument = async () => {
    if (!currentUser || !file) return;
    setSaving(true);
    try {
      let previewBase64: string | undefined;
      if (file.type.startsWith('image/')) {
        const comp = await compressImageForPreview(file, 700, 700, 0.7);
        previewBase64 = comp.previewBase64;
      }
      const origKey = `orig_doc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      await storeLocalOriginalFile(origKey, file);

      const newDoc: DocumentItem = {
        id: 'doc-' + Date.now(),
        uid: currentUser.uid,
        category,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        previewBase64,
        rawText,
        extractedFields,
        isConfirmedByUser: true,
        confidenceScore,
        hasLocalOriginal: true,
        originalKey: origKey,
        uploadedAt: Date.now(),
      };

      await dbSaveDocument(currentUser.uid, newDoc);
      await dbAddActivityLog(currentUser.uid, {
        title: 'Document Confirmed & Saved',
        description: `${newDoc.category.toUpperCase()}: ${newDoc.fileName}`,
        type: 'document',
      });
      setSavedDocs([newDoc, ...savedDocs]);
      setBanner({ type: 'success', message: `Saved confirmed document "${file.name}" to your records.` });
    } catch (err: any) {
      setBanner({ type: 'error', message: err?.message || 'Failed to save document.' });
    } finally {
      setSaving(false);
    }
  };

  const handleApplyToPolicy = async () => {
    if (!currentUser) return;
    const polNum = extractedFields.policyNumber?.trim();
    const insurer = extractedFields.insurerName?.trim() || 'Extracted Insurer';
    if (!polNum) {
      setBanner({ type: 'warning', message: 'Enter or verify Policy Number before creating a policy record.' });
      return;
    }

    const pol: InsurancePolicy = {
      id: 'pol-' + Date.now(),
      uid: currentUser.uid,
      insurerName: insurer,
      policyNumber: polNum,
      policyType: 'comprehensive',
      startDate: new Date().toISOString().split('T')[0],
      expiryDate: extractedFields.expiryDate || new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      vehicleId: '',
      policyholderName: extractedFields.policyholderName || currentUser.displayName,
      isExtractedByOcr: true,
      updatedAt: Date.now(),
    };
    await dbSavePolicy(currentUser.uid, pol);
    setBanner({ type: 'success', message: `Created Policy ${pol.policyNumber} from confirmed OCR fields.` });
  };

  const handleApplyToVehicle = async () => {
    if (!currentUser) return;
    const regRaw = extractedFields.registrationNumber?.trim();
    if (!regRaw) {
      setBanner({ type: 'warning', message: 'Enter or verify Registration Number before creating a vehicle record.' });
      return;
    }

    const parts = (extractedFields.makeModel || 'Vehicle Model').split(' ');
    const veh: Vehicle = {
      id: 'veh-' + Date.now(),
      uid: currentUser.uid,
      registrationNumber: normalizeRegistrationNumber(regRaw),
      displayRegistrationNumber: formatRegistrationNumber(regRaw),
      make: parts[0] || 'Unknown',
      model: parts.slice(1).join(' ') || 'Standard',
      manufacturingYear: new Date().getFullYear(),
      category: 'hatchback',
      ownerRelationship: 'self',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await dbSaveVehicle(currentUser.uid, veh);
    setBanner({ type: 'success', message: `Registered Vehicle ${veh.displayRegistrationNumber} from OCR fields.` });
  };

  const confirmDeleteDoc = async () => {
    if (!currentUser || !deleteTarget) return;
    await dbDeleteDocument(currentUser.uid, deleteTarget.id);
    setSavedDocs(savedDocs.filter((d) => d.id !== deleteTarget.id));
    setDeleteTarget(null);
    setBanner({ type: 'success', message: 'Document record removed.' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">{t('scanner.title')}</h1>
        <p className="text-xs text-slate-600">{t('scanner.subtitle')}</p>
      </div>

      {banner && <ToastBanner type={banner.type} message={banner.message} onClose={() => setBanner(null)} />}

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Document Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as DocumentItem['category'])}
              className="w-full rounded-lg border border-slate-300 p-2 text-sm bg-white"
            >
              <option value="rc">Vehicle Registration Certificate (RC)</option>
              <option value="insurance_policy">Insurance Policy Schedule</option>
              <option value="driving_licence">Driving Licence (DL)</option>
              <option value="fir">Police Report / FIR</option>
              <option value="repair_estimate">Repair Workshop Estimate</option>
              <option value="death_certificate">Death Certificate (Nominee Claims)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Upload Image or PDF (Max 20MB)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={handleFileChange}
              className="text-xs text-slate-600 block w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700"
            />
          </div>
        </div>

        {file && (
          <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
            {previewUrl ? (
              <img src={previewUrl} alt="Document preview" className="h-36 rounded-lg border border-slate-200 object-contain bg-white" />
            ) : (
              <div className="h-28 w-44 rounded-lg border border-slate-300 bg-white flex flex-col items-center justify-center p-3 text-center">
                <FileText className="w-7 h-7 text-blue-600 mb-1" />
                <span className="text-[11px] font-semibold text-slate-700 truncate w-full">{file.name}</span>
                <span className="text-[10px] text-slate-400">PDF Document</span>
              </div>
            )}
            <div className="space-y-2">
              <p className="text-xs text-slate-600">
                Runs 100% locally in your browser using Tesseract.js & PDF.js. Originals are retained in local IndexedDB.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleRunOcr} isLoading={scanning} className="gap-2">
                  <Scan className="w-4 h-4" />
                  <span>{t('btn.scanDocument')}</span>
                </Button>
                {ocrError && (
                  <Button type="button" variant="outline" onClick={handleRunOcr} className="gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{t('btn.retry')}</span>
                  </Button>
                )}
              </div>
            </div>
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
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Extracted & Editable Structured Fields</span>
              </h3>
              {confidenceScore !== undefined && (
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                  OCR Confidence: {confidenceScore}% (Verify highlighted missing fields)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(extractedFields).map(([key, val]) => {
                const isMissing = !val || val.trim() === '';
                return (
                  <div key={key} className={isMissing ? 'ring-1 ring-amber-300 rounded-lg p-2 bg-amber-50/40' : ''}>
                    <Input
                      label={key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                      value={val}
                      onChange={(e) => setExtractedFields({ ...extractedFields, [key]: e.target.value })}
                      helperText={isMissing ? 'Uncertain or blank — please verify manually' : undefined}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={handleSaveDocument} isLoading={saving} className="gap-1.5">
                <Save className="w-4 h-4" />
                <span>Confirm & Save Document</span>
              </Button>
              {category === 'insurance_policy' && (
                <Button type="button" variant="outline" onClick={handleApplyToPolicy} className="gap-1.5">
                  <ShieldPlus className="w-4 h-4 text-blue-600" />
                  <span>Apply to New Policy</span>
                </Button>
              )}
              {category === 'rc' && (
                <Button type="button" variant="outline" onClick={handleApplyToVehicle} className="gap-1.5">
                  <Car className="w-4 h-4 text-blue-600" />
                  <span>Apply to New Vehicle</span>
                </Button>
              )}
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

      {/* Saved Confirmed Documents */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">Saved Confirmed Documents ({savedDocs.length})</h2>
        {savedDocs.length === 0 ? (
          <p className="text-xs text-slate-500">No documents saved yet. Scan or upload a document above to save it.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {savedDocs.map((d) => (
              <div key={d.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{d.fileName}</span>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-800">
                      {d.category.replace(/_/g, ' ')}
                    </span>
                    {d.hasLocalOriginal && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        Device-Local Original
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 mt-0.5">
                    {Object.entries(d.extractedFields)
                      .filter(([, v]) => Boolean(v))
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(' • ') || 'No metadata fields'}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeleteTarget(d)}
                  className="text-red-600 hover:bg-red-50 self-end sm:self-center"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Saved Document"
        message={`Remove "${deleteTarget?.fileName}" from your confirmed documents list?`}
        confirmLabel={t('btn.delete')}
        cancelLabel={t('btn.cancel')}
        onConfirm={confirmDeleteDoc}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
