import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { dbGetPolicies, dbSavePolicy, dbGetVehicles } from '../../services/database';
import { InsurancePolicy, Vehicle } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const MyPoliciesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

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
        dbGetVehicles(currentUser!.uid)
      ]);
      setPolicies(pList);
      setVehicles(vList);
      if (vList.length > 0) setVehicleId(vList[0].id);
      setLoading(false);
    }
    load();
  }, [currentUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !insurerName || !policyNumber || !expiryDate) return;

    const newPolicy: InsurancePolicy = {
      id: 'pol-' + Date.now(),
      uid: currentUser.uid,
      insurerName,
      policyNumber,
      policyType,
      startDate: startDate || new Date().toISOString().split('T')[0],
      expiryDate,
      vehicleId,
      policyholderName: policyholderName || currentUser.displayName,
      coverageNotes,
      updatedAt: Date.now()
    };

    await dbSavePolicy(currentUser.uid, newPolicy);
    setPolicies([...policies, newPolicy]);
    setShowAddModal(false);
  };

  const isPolicyExpiringSoon = (expiry: string) => {
    if (!expiry) return false;
    const diff = new Date(expiry).getTime() - Date.now();
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000; // Under 30 days
  };

  const isPolicyExpired = (expiry: string) => {
    if (!expiry) return false;
    return new Date(expiry).getTime() < Date.now();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Insurance Policies</h1>
          <p className="text-xs text-slate-600">Store and review your motor insurance coverage and policy expiry schedules.</p>
        </div>

        <Button size="md" onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          <span>Add Policy</span>
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-xs text-slate-500">Loading insurance policies...</div>
      ) : policies.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
          <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-900">No Insurance Policies Linked</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Add your insurance policy schedule or use the OCR scanner to prefill policy details.
          </p>
          <Button size="sm" onClick={() => setShowAddModal(true)}>Add Policy Schedule</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policies.map((policy) => {
            const expiringSoon = isPolicyExpiringSoon(policy.expiryDate);
            const expired = isPolicyExpired(policy.expiryDate);
            const linkedVehicle = vehicles.find((v) => v.id === policy.vehicleId);

            return (
              <div key={policy.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-base">{policy.insurerName}</span>
                    <span className="text-xs text-slate-500 block font-mono">Policy: {policy.policyNumber}</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    expired ? 'bg-red-100 text-red-800' :
                    expiringSoon ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {expired ? 'Expired' : expiringSoon ? 'Expiring Soon' : 'Active Coverage'}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1 border-t border-slate-100 pt-3">
                  <p><strong>Policyholder:</strong> {policy.policyholderName}</p>
                  <p><strong>Policy Type:</strong> {policy.policyType.replace('_', ' ').toUpperCase()}</p>
                  <p><strong>Insured Vehicle:</strong> {linkedVehicle ? `${linkedVehicle.make} ${linkedVehicle.model} (${linkedVehicle.displayRegistrationNumber})` : 'Unlinked'}</p>
                  <p><strong>Expiry Date:</strong> {policy.expiryDate}</p>
                  {policy.isExtractedByOcr && (
                    <span className="inline-block mt-1 text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-medium">
                      Prefilled via Document OCR
                    </span>
                  )}
                </div>

                {expiringSoon && (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Renewal Notice: Policy expires in less than 30 days. Contact your insurer.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Policy Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">Add Insurance Policy Schedule</h3>
            <form onSubmit={handleSave} className="space-y-3">
              <Input
                label="Insurer Name"
                placeholder="e.g. ICICI Lombard, HDFC ERGO, Bajaj Allianz"
                value={insurerName}
                onChange={(e) => setInsurerName(e.target.value)}
                required
              />
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
                  onChange={(e) => setPolicyType(e.target.value as any)}
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
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.make} {v.model} ({v.displayRegistrationNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <Input
                  label="Expiry Date"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="w-full">Save Policy</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="w-full">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
