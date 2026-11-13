import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, CheckCircle2, AlertCircle, FileText, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const NomineeAssistancePage: React.FC = () => {
  const [deceasedName, setDeceasedName] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [relationship, setRelationship] = useState('spouse');
  const [contactedInsurer, setContactedInsurer] = useState(false);

  const [checklist, setChecklist] = useState([
    { id: 'c1', label: 'Municipal Death Certificate of Policyholder', status: 'available' },
    { id: 'c2', label: 'Legal Heirship / Family Member Certificate', status: 'pending' },
    { id: 'c3', label: 'Nominee NEFT Bank Account Details & Cancelled Cheque', status: 'available' },
    { id: 'c4', label: 'Original Vehicle Registration Certificate (RC)', status: 'available' },
    { id: 'c5', label: 'Original Motor Insurance Policy Schedule', status: 'available' },
    { id: 'c6', label: 'Police FIR & Inquest Report (if accident fatality)', status: 'pending' }
  ]);

  const toggleStatus = (id: string) => {
    setChecklist(
      checklist.map((item) => {
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
          <HeartHandshake className="w-6 h-6 text-amber-700" />
          <span>Nominee & Legal-Heir Assistance Guidance</span>
        </div>
        <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
          We offer sensitive, step-by-step documentation guidance for cases involving a deceased policyholder. Please note that this application organizes document checklists but does not determine legal inheritance rights or transfer vehicle ownership.
        </p>
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
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Relationship to Policyholder</label>
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

          <div className="flex items-center gap-2 pt-6">
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
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">2. Nominee Document Availability Checklist</h2>
          <p className="text-xs text-slate-600">Click any document item to toggle availability status (Available &rarr; Pending &rarr; Not Applicable).</p>

          <div className="space-y-2">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleStatus(item.id)}
                className="p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer transition-colors"
              >
                <span className="text-xs font-semibold text-slate-800">{item.label}</span>
                <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded ${
                  item.status === 'available' ? 'bg-emerald-100 text-emerald-800' :
                  item.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {item.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Link to="/claim-wizard">
            <Button size="md" className="gap-2">
              <span>Proceed to Claim Wizard</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
