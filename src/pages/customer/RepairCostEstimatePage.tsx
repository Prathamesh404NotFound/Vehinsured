import React, { useState } from 'react';
import { Calculator, Info } from 'lucide-react';
import { VehicleCategory, DamagedRegion } from '../../types';
import { calculateRepairEstimate } from '../../services/cost-estimation/calculator';
import { Button } from '../../components/ui/Button';

export const RepairCostEstimatePage: React.FC = () => {
  const [category, setCategory] = useState<VehicleCategory>('hatchback');
  const [parts, setParts] = useState<Array<{ name: string; damage: DamagedRegion['damageType']; severity: DamagedRegion['severity'] }>>([
    { name: 'Front Bumper', damage: 'dent', severity: 'moderate' },
    { name: 'Headlight', damage: 'broken', severity: 'severe' }
  ]);

  const mockRegions: DamagedRegion[] = parts.map((p, i) => ({
    id: `p-${i}`,
    partName: p.name,
    damageType: p.damage,
    severity: p.severity
  }));

  const estimate = calculateRepairEstimate(mockRegions, category);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">Indicative Repair Cost Estimator</h1>
        <p className="text-xs text-slate-600">Calculate labor and parts replacement ranges based on regional baseline reference data.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Select Vehicle Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as VehicleCategory)}
            className="w-full sm:w-64 rounded-lg border border-slate-300 p-2 text-sm bg-white"
          >
            <option value="hatchback">Hatchback (1.0x baseline)</option>
            <option value="sedan">Sedan (1.25x baseline)</option>
            <option value="suv">SUV / MUV (1.45x baseline)</option>
            <option value="luxury">Luxury Premium (2.5x baseline)</option>
            <option value="two_wheeler">Two-Wheeler (0.55x baseline)</option>
          </select>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <span className="text-xs font-semibold text-blue-800 uppercase">Overall Estimated Cost Range</span>
          <p className="text-2xl font-black text-blue-900 mt-1">
            Rs. {estimate.totalMin.toLocaleString('en-IN')} &mdash; Rs. {estimate.totalMax.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-blue-700 mt-1">{estimate.disclaimer}</p>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 font-semibold text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-3">Component</th>
                <th className="p-3">Action</th>
                <th className="p-3">Parts Range</th>
                <th className="p-3">Labor Range</th>
                <th className="p-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {estimate.components.map((c, i) => (
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
    </div>
  );
};
