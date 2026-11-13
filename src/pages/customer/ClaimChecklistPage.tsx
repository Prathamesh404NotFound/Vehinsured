import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Info, ShieldCheck } from 'lucide-react';
import { IRDAI_DOCUMENT_CHECKLIST, IRDAI_CLAIM_ADVISORIES } from '../../data/onlineReferenceData';
import { useAuth } from '../../features/auth/AuthContext';
import { useTranslation } from '../../features/i18n/context';

export const ClaimChecklistPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const storageKey = `claim_checklist_${currentUser?.uid || 'guest'}`;

  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : { 'doc-rc': true, 'doc-policy': true };
    } catch {
      return { 'doc-rc': true, 'doc-policy': true };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(checkedIds));
    } catch {}
  }, [checkedIds, storageKey]);

  const toggle = (id: string) => {
    setCheckedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const standardItems = IRDAI_DOCUMENT_CHECKLIST.filter((i) => i.category !== 'deceased_nominee');
  const nomineeItems = IRDAI_DOCUMENT_CHECKLIST.filter((i) => i.category === 'deceased_nominee');
  const completedCount = standardItems.filter((i) => checkedIds[i.id]).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">{t('checklist.title')}</h1>
        <p className="text-xs text-slate-600">{t('checklist.subtitle')}</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-blue-900 uppercase">Standard Motor Claim Readiness</span>
            <p className="text-xl font-extrabold text-blue-900">
              {completedCount} of {standardItems.length} Documents Prepared
            </p>
          </div>
          <div className="w-14 h-14 bg-white rounded-full border-4 border-blue-600 flex items-center justify-center font-bold text-blue-800 text-sm">
            {Math.round((completedCount / standardItems.length) * 100)}%
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900">Own Damage & Third-Party Documents</h2>
          {standardItems.map((item) => {
            const isChecked = Boolean(checkedIds[item.id]);
            return (
              <div
                key={item.id}
                onClick={() => toggle(item.id)}
                className={`p-4 rounded-xl border transition-colors cursor-pointer flex items-start gap-3 ${
                  isChecked ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                {isChecked ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className={`text-sm font-bold ${isChecked ? 'text-emerald-950' : 'text-slate-900'}`}>{item.title}</h4>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {item.category.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{item.whyNeeded}</p>
                  <p className="text-[11px] text-blue-700 font-medium mt-1">{item.requirementNote}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-200">
          <h2 className="text-sm font-bold text-amber-900">Additional Items for Deceased Policyholder / Nominee Cases</h2>
          {nomineeItems.map((item) => {
            const isChecked = Boolean(checkedIds[item.id]);
            return (
              <div
                key={item.id}
                onClick={() => toggle(item.id)}
                className={`p-4 rounded-xl border transition-colors cursor-pointer flex items-start gap-3 ${
                  isChecked ? 'bg-amber-50 border-amber-300' : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                {isChecked ? (
                  <CheckCircle2 className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-600 mt-1">{item.whyNeeded}</p>
                  <p className="text-[11px] text-amber-800 font-medium mt-1">{item.requirementNote}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Important IRDAI Claim Tips</span>
          </h3>
          <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
            {IRDAI_CLAIM_ADVISORIES.map((adv, idx) => (
              <li key={idx}>{adv}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
