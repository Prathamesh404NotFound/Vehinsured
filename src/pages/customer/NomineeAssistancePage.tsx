import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, ArrowRight, Save, Info } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ToastBanner } from '../../components/ui/ToastBanner';
import { useAuth } from '../../features/auth/AuthContext';
import { useTranslation } from '../../features/i18n/context';

export const NomineeAssistancePage: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const storageKey = `nominee_assist_${currentUser?.uid || 'guest'}`;

  const [deceasedName, setDeceasedName] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [relationship, setRelationship] = useState('spouse');
  const [contactNumber, setContactNumber] = useState('');
  const [contactedInsurer, setContactedInsurer] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const [checklist, setChecklist] = useState([
    { id: 'c1', label: 'Municipal Death Certificate of Policyholder (Certified Copy)', status: 'available' },
    { id: 'c2', label: 'Legal Heirship / Family Member / Succession Certificate', status: 'pending' },
    { id: 'c3', label: 'Nominee NEFT Bank Account Details & Cancelled Cheque', status: 'available' },
    { id: 'c4', label: 'Original Vehicle Registration Certificate (RC) & Transfer Form 31 Note', status: 'available' },
    { id: 'c5', label: 'Original Motor Insurance Policy Schedule (Check PA Owner-Driver Cover)', status: 'available' },
    { id: 'c6', label: 'Police FIR, Post-Mortem & Inquest Report (if road accident fatality)', status: 'pending' },
  ]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.deceasedName) setDeceasedName(parsed.deceasedName);
        if (parsed.applicantName) setApplicantName(parsed.applicantName);
        if (parsed.relationship) setRelationship(parsed.relationship);
        if (parsed.contactNumber) setContactNumber(parsed.contactNumber);
        if (typeof parsed.contactedInsurer === 'boolean') setContactedInsurer(parsed.contactedInsurer);
        if (Array.isArray(parsed.checklist)) setChecklist(parsed.checklist);
      }
    } catch {}
  }, [storageKey]);

  const persist = () => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          deceasedName,
          applicantName,
          relationship,
          contactNumber,
          contactedInsurer,
          checklist,
        })
      );
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch {}
  };

  const toggleStatus = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const next = item.status === 'available' ? 'pending' : item.status === 'pending' ? 'na' : 'available';
          return { ...item, status: next };
        }
        return item;
      })
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2 text-amber-900 font-extrabold text-lg">
          <HeartHandshake className="w-6 h-6 text-amber-700 shrink-0" />
          <span>{t('nominee.title')}</span>
        </div>
        <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
          {t('nominee.subtitle')} Please note that this application organizes claim evidence and document checklists only—it does not determine legal inheritance rights, validate succession certificates, or transfer vehicle ownership.
        </p>
      </div>

      {savedNotice && (
        <ToastBanner
          type="success"
          message="Nominee preparation details saved locally. You can carry these directly into the Claim Wizard."
          onClose={() => setSavedNotice(false)}
        />
      )}

      {/* IRDAI Advisory Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 space-y-1.5">
        <p className="font-bold flex items-center gap-1.5">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Motor Insurance & RTO Notes for Deceased Policyholder Cases</span>
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Check whether the policy includes mandatory <strong>Personal Accident (PA) Owner-Driver Cover</strong> (typically up to Rs. 15 Lakhs under IRDAI norms) in addition to vehicle repair coverage.
          </li>
          <li>
            Under Central Motor Vehicles Rules, inform the Regional Transport Office (RTO) and apply for RC ownership transfer (Form 31) within <strong>3 months</strong> of the registered owner’s demise.
          </li>
        </ul>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <h2 className="text-lg font-bold text-slate-900">1. Case & Nominee Information</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Deceased Policyholder Name"
            placeholder="e.g. Late Suresh Kumar"
            value={deceasedName}
            onChange={(e) => setDeceasedName(e.target.value)}
          />

          <Input
            label="Applicant / Nominee Name"
            placeholder="Your full legal name"
            value={applicantName}
            onChange={(e) => setApplicantName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
              Relationship to Policyholder
            </label>
            <select
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2 text-sm bg-white"
            >
              <option value="spouse">Spouse (Husband / Wife)</option>
              <option value="son">Son</option>
              <option value="daughter">Daughter</option>
              <option value="parent">Parent</option>
              <option value="legal_heir">Succession Certificate Holder / Legal Heir</option>
            </select>
          </div>

          <Input
            label="Nominee Contact Number (Optional)"
            placeholder="e.g. +91 98XXXXXXXX"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="contacted-insurer"
            checked={contactedInsurer}
            onChange={(e) => setContactedInsurer(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <label htmlFor="contacted-insurer" className="text-xs font-semibold text-slate-700">
            Have you notified the insurance company about the policyholder's death?
          </label>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">2. Nominee Document Availability Checklist</h2>
          <p className="text-xs text-slate-600">
            Click any document item to cycle availability status (Available &rarr; Pending &rarr; Not Applicable).
          </p>

          <div className="space-y-2">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleStatus(item.id)}
                className="p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between gap-2 cursor-pointer transition-colors"
              >
                <span className="text-xs font-semibold text-slate-800">{item.label}</span>
                <span
                  className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded shrink-0 ${
                    item.status === 'available'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.status === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {item.status === 'na' ? 'Not Applicable' : item.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 flex flex-wrap justify-between gap-3">
          <Button type="button" variant="outline" onClick={persist} className="gap-1.5">
            <Save className="w-4 h-4" />
            <span>Save Nominee Notes</span>
          </Button>
          <Link to="/claim-wizard?deceased=true">
            <Button size="md" className="gap-2">
              <span>Start Deceased Policyholder Claim Report</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
