import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, CheckCircle2, Clock, AlertCircle, Settings, Users } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { dbGetAllSubmittedClaimsForAdmin } from '../../services/database';
import { ClaimAssistanceCase } from '../../types';
import { Button } from '../../components/ui/Button';

export const AdminOverviewPage: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const [submittedCases, setSubmittedCases] = useState<Array<{ uid: string; claim: ClaimAssistanceCase }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const allCases = await dbGetAllSubmittedClaimsForAdmin();
      setSubmittedCases(allCases);
      setLoading(false);
    }
    load();
  }, []);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <Shield className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Administrator Access Restricted</h2>
        <p className="text-xs text-slate-600">
          Your account ({currentUser?.email}) is not listed on the administrator allowlist. Contact system admin to grant reviewer access.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Internal Review Workspace</span>
          <h1 className="text-2xl font-extrabold tracking-tight">Administrator & Reviewer Dashboard</h1>
          <p className="text-xs text-slate-300 mt-1">Review customer accident claim submissions, verify OCR fields, and manage cost reference baselines.</p>
        </div>

        <div className="flex gap-2">
          <Link to="/admin/reference-costs">
            <Button size="sm" variant="outline" className="bg-slate-800 border-slate-700 text-slate-200">
              <Settings className="w-4 h-4 mr-1.5" />
              <span>Cost References</span>
            </Button>
          </Link>
          <Link to="/admin/users">
            <Button size="sm" variant="outline" className="bg-slate-800 border-slate-700 text-slate-200">
              <Users className="w-4 h-4 mr-1.5" />
              <span>User Permissions</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Total Submitted Claims</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{submittedCases.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Pending Review</p>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {submittedCases.filter((c) => c.claim.status === 'submitted_for_review' || c.claim.status === 'under_review').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Reviews Completed</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {submittedCases.filter((c) => c.claim.status === 'review_complete').length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900">Submitted Case Queue</h2>

        {loading ? (
          <div className="text-center py-8 text-xs text-slate-500">Loading cases...</div>
        ) : submittedCases.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">No cases submitted for review yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {submittedCases.map(({ uid, claim }) => (
              <div key={claim.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{claim.caseReference}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {claim.status.replace('_', ' ')}
                    </span>
                    {claim.isDeceasedCase && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                        Deceased Policyholder
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Submitted Date: {claim.incidentDate} &bull; Photos: {claim.evidenceList.length} &bull; User ID: {uid}
                  </p>
                </div>

                <Link to={`/admin/case?uid=${uid}&claimId=${claim.id}`}>
                  <Button size="sm" variant="outline">Inspect & Review Case</Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
