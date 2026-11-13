import React, { useState } from 'react';
import { FileCheck, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

export const ClaimChecklistPage: React.FC = () => {
  const [items, setItems] = useState([
    { id: '1', title: 'Vehicle Registration Certificate (RC)', desc: 'Proof of vehicle ownership and registration details.', checked: true },
    { id: '2', title: 'Valid Motor Insurance Policy Schedule', desc: 'Current active insurance coverage policy copy.', checked: true },
    { id: '3', title: 'Driver\'s Licence of person driving during accident', desc: 'Valid driving license matching vehicle category.', checked: true },
    { id: '4', title: 'Accident Photographs (Overall & Damage Close-ups)', desc: 'Evidence images recorded on accident scene.', checked: true },
    { id: '5', title: 'Police FIR / Diary Entry (if major accident or third party involved)', desc: 'Official police accident report copy.', checked: false },
    { id: '6', title: 'Repair Workshop Estimate / Inspection Note', desc: 'Itemized quotation from authorized workshop.', checked: false },
  ]);

  const toggle = (id: string) => {
    setItems(items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));
  };

  const completedCount = items.filter((i) => i.checked).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">Claim Compliance Checklist</h1>
        <p className="text-xs text-slate-600">Track required documentation needed before submitting to your insurance surveyor.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-blue-900 uppercase">Checklist Progress</span>
            <p className="text-xl font-extrabold text-blue-900">{completedCount} of {items.length} Documents Verified</p>
          </div>
          <div className="w-12 h-12 bg-white rounded-full border-4 border-blue-600 flex items-center justify-center font-bold text-blue-800 text-sm">
            {Math.round((completedCount / items.length) * 100)}%
          </div>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => toggle(item.id)}
              className={`p-4 rounded-xl border transition-colors cursor-pointer flex items-start gap-3 ${
                item.checked ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-slate-200'
              }`}
            >
              {item.checked ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className={`text-sm font-bold ${item.checked ? 'text-emerald-950' : 'text-slate-900'}`}>{item.title}</h4>
                <p className="text-xs text-slate-600 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
