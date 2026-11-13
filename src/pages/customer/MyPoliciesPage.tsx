import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Plus, AlertTriangle, Edit, Trash2, Phone, Scan } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { dbGetPolicies, dbSavePolicy, dbDeletePolicy, dbGetVehicles, dbAddActivityLog } from '../../services/database';
import { InsurancePolicy, Vehicle } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ToastBanner } from '../../components/ui/ToastBanner';
import { INDIAN_MOTOR_INSURERS } from '../../data/onlineReferenceData';
import { isValidDateRange } from '../../utils/validation';
import { useTranslation } from '../../features/i18n/context';

export const MyPoliciesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InsurancePolicy | null>(null);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states
  const [insurerName, setInsurerName] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [policyType, setPolicyType] = useState<InsurancePolicy['policyType']>('comprehensive');
  const [startDate, setStartDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [policyholderName, setPolicyholderName] = useState('');
  const [coverageNotes, setCoverageNotes] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    async function load() {
      setLoading(true);
      const [pList, vList] = await Promise.all([
        dbGetPolicies(currentUser!.uid),
        dbGetVehicles(currentUser!.uid),
      ]);
      setPolicies(pList);
      setVehicles(vList);
      if (vList.length > 0) setVehicleId(vList[0].id);
      setLoading(false);
    }
    load();
  }, [currentUser]);

  const openNewModal = () => {
    setEditingId(null);
    setInsurerName('');
    setPolicyNumber('');
    setPolicyType('comprehensive');
    setStartDate(new Date().toISOString().split('T')[0]);
    setExpiryDate('');
    setVehicleId(vehicles[0]?.id || '');
    setPolicyholderName(currentUser?.displayName || '');
    setCoverageNotes('');
    setShowModal(true);
  };

  const openEditModal = (policy: InsurancePolicy) => {
    setEditingId(policy.id);
    setInsurerName(policy.insurerName);
    setPolicyNumber(policy.policyNumber);
    setPolicyType(policy.policyType);
    setStartDate(policy.startDate);
    setExpiryDate(policy.expiryDate);
    setVehicleId(policy.vehicleId);
    setPolicyholderName(policy.policyholderName);
    setCoverageNotes(policy.coverageNotes || '');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !insurerName.trim() || !policyNumber.trim() || !expiryDate) return;

    if (!isValidDateRange(startDate, expiryDate)) {
      setBanner({ type: 'error', message: 'Policy expiry date must be on or after the policy start date.' });
      return;
    }

    const existing = editingId ? policies.find((p) => p.id === editingId) : undefined;
    const savedPolicy: InsurancePolicy = {
      id: editingId || 'pol-' + Date.now(),
      uid: currentUser.uid,
      insurerName: insurerName.trim(),
      policyNumber: policyNumber.trim(),
      policyType,
      startDate: startDate || new Date().toISOString().split('T')[0],
      expiryDate,
      vehicleId,
      policyholderName: policyholderName.trim() || currentUser.displayName,
      coverageNotes: coverageNotes.trim(),
      isExtractedByOcr: existing?.isExtractedByOcr || false,
      isVerifiedByAdmin: existing?.isVerifiedByAdmin || false,
      updatedAt: Date.now(),
    };

    await dbSavePolicy(currentUser.uid, savedPolicy);
    await dbAddActivityLog(currentUser.uid, {
      title: editingId ? 'Insurance Policy Updated' : 'Insurance Policy Added',
      description: `${savedPolicy.insurerName} (${savedPolicy.policyNumber})`,
      type: 'document',
    });

    if (editingId) {
      setPolicies(policies.map((p) => (p.id === editingId ? savedPolicy : p)));
    } else {
      setPolicies([...policies, savedPolicy]);
    }
    setShowModal(false);
    setBanner({ type: 'success', message: `Saved policy ${savedPolicy.policyNumber}.` });
  };

  const confirmDelete = async () => {
    if (!currentUser || !deleteTarget) return;
    await dbDeletePolicy(currentUser.uid, deleteTarget.id);
    setPolicies(policies.filter((p) => p.id !== deleteTarget.id));
    setBanner({ type: 'success', message: `Removed policy ${deleteTarget.policyNumber}.` });
    setDeleteTarget(null);
  };

  const isPolicyExpiringSoon = (expiry: string) => {
    if (!expiry) return false;
    const diff = new Date(expiry).getTime() - Date.now();
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
  };

  const isPolicyExpired = (expiry: string) => {
    if (!expiry) return false;
    return new Date(expiry).getTime() < Date.now();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{t('policies.title')}</h1>
          <p className="text-xs text-slate-600">{t('policies.subtitle')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to="/document-scanner">
            <Button size="md" variant="outline" className="gap-1.5">
              <Scan className="w-4 h-4 text-blue-600" />
              <span>Scan via OCR</span>
            </Button>
          </Link>
          <Button size="md" onClick={openNewModal} className="gap-2">
            <Plus className="w-4 h-4" />
            <span>{t('policies.add')}</span>
          </Button>
        </div>
      </div>

      {banner && <ToastBanner type={banner.type} message={banner.message} onClose={() => setBanner(null)} />}

      {loading ? (
        <div className="text-center py-10 text-xs text-slate-500">Loading insurance policies...</div>
      ) : policies.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
          <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-900">No Insurance Policies Linked</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Add your insurance policy schedule manually or scan it locally with the Document OCR tool.
          </p>
          <Button size="sm" onClick={openNewModal}>
            Add Policy Schedule
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policies.map((policy) => {
            const expiringSoon = isPolicyExpiringSoon(policy.expiryDate);
            const expired = isPolicyExpired(policy.expiryDate);
            const linkedVehicle = vehicles.find((v) => v.id === policy.vehicleId);

            return (
              <div key={policy.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900 text-base">{policy.insurerName}</span>
                    <span className="text-xs text-slate-500 block font-mono">Policy: {policy.policyNumber}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded shrink-0 ${
                      expired
                        ? 'bg-red-100 text-red-800'
                        : expiringSoon
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {expired ? 'Expired' : expiringSoon ? 'Expiring Soon' : 'Active Coverage'}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1 border-t border-slate-100 pt-3">
                  <p>
                    <strong>Policyholder:</strong> {policy.policyholderName}
                  </p>
                  <p>
                    <strong>Policy Type:</strong> {policy.policyType.replace(/_/g, ' ').toUpperCase()}
                  </p>
                  <p>
                    <strong>Insured Vehicle:</strong>{' '}
                    {linkedVehicle ? `${linkedVehicle.make} ${linkedVehicle.model} (${linkedVehicle.displayRegistrationNumber})` : 'Unlinked'}
                  </p>
                  <p>
                    <strong>Validity:</strong> {policy.startDate || 'N/A'} to {policy.expiryDate}
                  </p>
                  {policy.coverageNotes && <p className="text-slate-500">{policy.coverageNotes}</p>}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      {policy.isExtractedByOcr ? 'OCR Prefilled (User Confirmed)' : 'User Entered'}
                    </span>
                    {policy.isVerifiedByAdmin && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                        Reviewer Checked
                      </span>
                    )}
                  </div>
                </div>

                {expiringSoon && (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Renewal Notice: Policy expires in less than 30 days. Contact your insurer.</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-2">
                  <Button size="sm" variant="outline" onClick={() => openEditModal(policy)} className="gap-1">
                    <Edit className="w-3.5 h-3.5" />
                    <span>{t('btn.edit')}</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteTarget(policy)}
                    className="text-red-600 hover:bg-red-50"
                    aria-label={`Delete policy ${policy.policyNumber}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Indian Motor Insurer Helpline Reference */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Phone className="w-4 h-4 text-blue-600" />
          <span>Indian Motor Insurer Claim Intimation Helplines (Reference)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {INDIAN_MOTOR_INSURERS.map((ins) => (
            <div key={ins.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="font-bold text-slate-900">{ins.name}</p>
              <p className="font-mono text-blue-700 font-semibold">Toll-Free: {ins.tollFree}</p>
              {ins.whatsapp && <p className="text-slate-600">WhatsApp: {ins.whatsapp}</p>}
              <p className="text-[11px] text-slate-500">{ins.claimPortalNote}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Policy Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">
              {editingId ? t('policies.edit') : t('policies.add')}
            </h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <Input
                  label="Insurer Name"
                  placeholder="e.g. ICICI Lombard, HDFC ERGO, Bajaj Allianz"
                  value={insurerName}
                  onChange={(e) => setInsurerName(e.target.value)}
                  required
                />
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) setInsurerName(e.target.value);
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-xs text-slate-700"
                >
                  <option value="">-- Quick pick Indian motor insurer --</option>
                  {INDIAN_MOTOR_INSURERS.map((ins) => (
                    <option key={ins.id} value={ins.name}>
                      {ins.name}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Policy Number"
                placeholder="e.g. POL-982341234"
                value={policyNumber}
                onChange={(e) => setPolicyNumber(e.target.value)}
                required
              />
              <Input
                label="Policyholder Name"
                placeholder="Name on policy"
                value={policyholderName}
                onChange={(e) => setPolicyholderName(e.target.value)}
              />

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Policy Type</label>
                <select
                  value={policyType}
                  onChange={(e) => setPolicyType(e.target.value as InsurancePolicy['policyType'])}
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm"
                >
                  <option value="comprehensive">Comprehensive Package</option>
                  <option value="zero_depreciation">Zero Depreciation (Bumper to Bumper)</option>
                  <option value="third_party">Third Party Liability Only</option>
                  <option value="pay_as_you_drive">Pay As You Drive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Insured Vehicle</label>
                <select
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm"
                >
                  <option value="">-- Unlinked --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.make} {v.model} ({v.displayRegistrationNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <Input
                  label="Expiry Date"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Coverage Notes (Optional)"
                placeholder="e.g. IDV, Zero-Dep add-on, deductible notes"
                value={coverageNotes}
                onChange={(e) => setCoverageNotes(e.target.value)}
              />

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="w-full">
                  {t('btn.save')}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="w-full">
                  {t('btn.cancel')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Policy Record"
        message={`Remove policy ${deleteTarget?.policyNumber} (${deleteTarget?.insurerName}) from your profile?`}
        confirmLabel={t('btn.delete')}
        cancelLabel={t('btn.cancel')}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
