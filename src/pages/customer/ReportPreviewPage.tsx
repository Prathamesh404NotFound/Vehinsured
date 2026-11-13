import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FileText, FileDown, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { dbGetClaimById, dbGetVehicles, dbGetPolicies, dbGetAssessmentById } from '../../services/database';
import { ClaimAssistanceCase, Vehicle, InsurancePolicy, DamageAssessment } from '../../types';
import { Button } from '../../components/ui/Button';
import { calculateRepairEstimate } from '../../services/cost-estimation/calculator';
import { generateAssessmentPdfReport, exportBundleAsJson } from '../../services/pdf/reportGenerator';

export const ReportPreviewPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const claimId = searchParams.get('id');

  const [claim, setClaim] = useState<ClaimAssistanceCase | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [policy, setPolicy] = useState<InsurancePolicy | null>(null);
  const [assessment, setAssessment] = useState<DamageAssessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || !claimId) return;
    async function load() {
      setLoading(true);
      const c = await dbGetClaimById(currentUser!.uid, claimId!);
      if (c) {
        setClaim(c);
        const [vList, pList] = await Promise.all([
          dbGetVehicles(currentUser!.uid),
          dbGetPolicies(currentUser!.uid),
        ]);
        setVehicle(vList.find((v) => v.id === c.vehicleId) || null);
        setPolicy(pList.find((p) => p.id === c.policyId) || null);

        if (c.assessmentId) {
          const ass = await dbGetAssessmentById(currentUser!.uid, c.assessmentId);
          setAssessment(ass);
        }
      }
      setLoading(false);
    }
    load();
  }, [currentUser, claimId]);

  if (loading) {
    return <div className="text-center py-12 text-xs text-slate-500">Loading Report Preview...</div>;
  }

  if (!claim) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-sm font-medium text-slate-700">Claim Report record not found.</p>
        <Button size="sm" onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
      </div>
    );
  }

  const costEst = calculateRepairEstimate(assessment?.regions || [], vehicle?.category || 'hatchback');

  const handleDownloadPdf = () => {
    const doc = generateAssessmentPdfReport({
      claim,
      vehicle,
      policy,
      assessment,
      costEstimate: costEst,
    });
    doc.save(`${claim.caseReference}_Report.pdf`);
  };

  const handleDownloadJson = () => {
    const jsonStr = exportBundleAsJson({
      claim,
      vehicle,
      policy,
      assessment,
      costEstimate: costEst,
    });
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${claim.caseReference}_Export.json`;
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/dashboard')} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-bold text-blue-700 uppercase">Ref: {claim.caseReference}</span>
            <h1 className="text-2xl font-extrabold text-slate-900">Damage Assessment Report</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadJson}>
            Export JSON
          </Button>
          <Button size="sm" onClick={handleDownloadPdf} className="gap-1.5">
            <FileDown className="w-4 h-4" />
            <span>Download PDF</span>
          </Button>
        </div>
      </div>

      {/* Report Paper Preview Container */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-sm text-slate-800">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900 text-xs font-semibold text-center">
          PRELIMINARY ASSESSMENT REPORT — NOT AN OFFICIAL INSURANCE SURVEY OR GUARANTEE OF APPROVAL
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vehicle Details</h3>
            <p className="font-bold text-slate-900 text-base">{vehicle?.make} {vehicle?.model}</p>
            <p className="text-xs text-slate-600">Reg No: {vehicle?.displayRegistrationNumber || vehicle?.registrationNumber}</p>
            <p className="text-xs text-slate-600">Category: {vehicle?.category.toUpperCase()}</p>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Incident Info</h3>
            <p className="text-xs text-slate-700"><strong>Date:</strong> {claim.incidentDate} at {claim.incidentTime}</p>
            <p className="text-xs text-slate-700"><strong>Location:</strong> {claim.location}</p>
            <p className="text-xs text-slate-700"><strong>Incident Type:</strong> {claim.typeOfIncident.replace('_', ' ').toUpperCase()}</p>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Damage Observations</h3>
          {assessment?.regions && assessment.regions.length > 0 ? (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
              {assessment.regions.map((r, i) => (
                <div key={i} className="p-3 flex justify-between items-center bg-slate-50">
                  <div>
                    <span className="font-bold text-slate-900">{r.partName}</span>
                    <span className="text-slate-500 ml-2">({r.damageType})</span>
                  </div>
                  <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-[10px]">
                    {r.severity.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No specific damage components recorded.</p>
          )}
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <span className="text-xs font-bold text-slate-700 uppercase">Estimated Repair Range</span>
          <p className="text-xl font-extrabold text-slate-900">
            Rs. {costEst.totalMin.toLocaleString('en-IN')} &mdash; Rs. {costEst.totalMax.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-500">{costEst.disclaimer}</p>
        </div>
      </div>
    </div>
  );
};
