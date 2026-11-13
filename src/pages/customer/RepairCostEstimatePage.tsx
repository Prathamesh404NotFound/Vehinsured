import React, { useState, useEffect } from 'react';
import { Calculator, Plus, Trash2, Info } from 'lucide-react';
import { VehicleCategory, DamagedRegion, CostReferenceItem, ClaimAssistanceCase } from '../../types';
import { calculateRepairEstimate, DEFAULT_COST_REFERENCES } from '../../services/cost-estimation/calculator';
import { dbGetReferenceCosts, dbGetClaims, dbGetAssessmentById, dbGetVehicles } from '../../services/database';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../features/auth/AuthContext';
import { useTranslation } from '../../features/i18n/context';

export const RepairCostEstimatePage: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  const [referenceItems, setReferenceItems] = useState<CostReferenceItem[]>(DEFAULT_COST_REFERENCES);
  const [claims, setClaims] = useState<ClaimAssistanceCase[]>([]);
  const [selectedClaimId, setSelectedClaimId] = useState<string>('');
  const [category, setCategory] = useState<VehicleCategory>('hatchback');
  const [parts, setParts] = useState<Array<{ name: string; damage: DamagedRegion['damageType']; severity: DamagedRegion['severity'] }>>([
    { name: 'Front Bumper', damage: 'dent', severity: 'moderate' },
    { name: 'Headlight', damage: 'broken', severity: 'severe' },
  ]);

  const [newPart, setNewPart] = useState('Bonnet');
  const [newDamage, setNewDamage] = useState<DamagedRegion['damageType']>('dent');
  const [newSeverity, setNewSeverity] = useState<DamagedRegion['severity']>('moderate');

  useEffect(() => {
    dbGetReferenceCosts().then(setReferenceItems);
    if (currentUser) {
      dbGetClaims(currentUser.uid).then(setClaims);
    }
  }, [currentUser]);

  const handleLoadFromClaim = async (claimId: string) => {
    setSelectedClaimId(claimId);
    if (!currentUser || !claimId) return;
    const claim = claims.find((c) => c.id === claimId);
    if (!claim) return;

    const [vList, ass] = await Promise.all([
      dbGetVehicles(currentUser.uid),
      claim.assessmentId ? dbGetAssessmentById(currentUser.uid, claim.assessmentId) : Promise.resolve(null),
    ]);
    const veh = vList.find((v) => v.id === claim.vehicleId);
    if (veh) setCategory(veh.category);
    if (ass && ass.regions.length > 0) {
      setParts(
        ass.regions.map((r) => ({
          name: r.partName,
          damage: r.damageType,
          severity: r.severity,
        }))
      );
    }
  };

  const handleAddPart = () => {
    setParts([...parts, { name: newPart, damage: newDamage, severity: newSeverity }]);
  };

  const regionsInput: DamagedRegion[] = parts.map((p, i) => ({
    id: `p-${i}`,
    partName: p.name,
    damageType: p.damage,
    severity: p.severity,
  }));

  const estimate = calculateRepairEstimate(regionsInput, category, referenceItems);
  const availablePartNames = Array.from(new Set(referenceItems.map((r) => r.partName)));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">{t('estimator.title')}</h1>
        <p className="text-xs text-slate-600">{t('estimator.subtitle')}</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Vehicle Segment</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as VehicleCategory)}
              className="w-full rounded-lg border border-slate-300 p-2 text-sm bg-white"
            >
              <option value="hatchback">Hatchback (1.0x baseline)</option>
              <option value="sedan">Sedan (1.25x baseline)</option>
              <option value="suv">SUV / MUV (1.45x baseline)</option>
              <option value="luxury">Luxury Premium (2.5x baseline)</option>
              <option value="two_wheeler">Two-Wheeler (0.35x baseline)</option>
              <option value="commercial">Commercial Vehicle (1.55x baseline)</option>
            </select>
          </div>

          {claims.length > 0 && (
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                Load Components from Claim (Optional)
              </label>
              <select
                value={selectedClaimId}
                onChange={(e) => handleLoadFromClaim(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm bg-white"
              >
                <option value="">-- Custom Scenario --</option>
                {claims.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.caseReference} ({c.incidentDate})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Add Part Row */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <span className="block text-xs font-bold text-slate-800 uppercase">Add Component to Estimate</span>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <select
              value={newPart}
              onChange={(e) => setNewPart(e.target.value)}
              className="rounded-lg border border-slate-300 p-2 text-xs bg-white"
            >
              {availablePartNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <select
              value={newDamage}
              onChange={(e) => setNewDamage(e.target.value as DamagedRegion['damageType'])}
              className="rounded-lg border border-slate-300 p-2 text-xs bg-white"
            >
              <option value="dent">Dent</option>
              <option value="scratch">Scratch</option>
              <option value="crack">Crack</option>
              <option value="broken">Broken</option>
              <option value="alignment">Alignment</option>
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
            <Button type="button" size="sm" onClick={handleAddPart} className="gap-1">
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </Button>
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-blue-800 uppercase">Overall Indicative Cost Range</span>
            <span className="text-[11px] text-blue-700 font-mono">{estimate.referenceTableVersion}</span>
          </div>
          <p className="text-2xl font-black text-blue-900">
            Rs. {estimate.totalMin.toLocaleString('en-IN')} &mdash; Rs. {estimate.totalMax.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-blue-800">{estimate.disclaimer}</p>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 font-semibold text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-3">Component</th>
                <th className="p-3">Action</th>
                <th className="p-3">Parts Range</th>
                <th className="p-3">Labor Range</th>
                <th className="p-3">Painting</th>
                <th className="p-3 text-right">Subtotal</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {estimate.components.map((c, i) => (
                <tr key={i}>
                  <td className="p-3 font-semibold text-slate-900">{c.partName}</td>
                  <td className="p-3 uppercase font-medium text-slate-600">{c.suggestedOperation}</td>
                  <td className="p-3 text-slate-600">Rs. {c.partsCostMin}-{c.partsCostMax}</td>
                  <td className="p-3 text-slate-600">Rs. {c.laborCostMin}-{c.laborCostMax}</td>
                  <td className="p-3 text-slate-600">Rs. {c.paintingCostMin}-{c.paintingCostMax}</td>
                  <td className="p-3 text-right font-bold text-slate-900">
                    Rs. {c.subtotalMin.toLocaleString('en-IN')} - {c.subtotalMax.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => setParts(parts.filter((_, idx) => idx !== i))}
                      className="text-red-600 hover:bg-red-50 p-1 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Assumptions Box */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-600">
          <p className="font-bold text-slate-800 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Calculation Assumptions & Transparency Notes</span>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            {estimate.assumptions.map((a, idx) => (
              <li key={idx}>{a}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
