import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Settings, Users, History, Search, Database } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { dbGetAllSubmittedClaimsForAdmin } from '../../services/database';
import { ClaimAssistanceCase } from '../../types';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ToastBanner } from '../../components/ui/ToastBanner';
import { seedSampleEvaluationData } from '../../data/demoEvaluationData';
import { useTranslation } from '../../features/i18n/context';

export const AdminOverviewPage: React.FC = () => {
  const { currentUser, isAdmin, isDemoAccount } = useAuth();
  const { t } = useTranslation();

  const [submittedCases, setSubmittedCases] = useState<Array<{ uid: string; claim: ClaimAssistanceCase }>>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadCases = useCallback(async () => {
    setLoading(true);
    const allCases = await dbGetAllSubmittedClaimsForAdmin();
    setSubmittedCases(allCases);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  const handleSeedEvaluationCases = async () => {
    setSeeding(true);
    try {
      await seedSampleEvaluationData('demo-user-123');
      await loadCases();
      setBanner({ type: 'success', message: 'Loaded sample evaluation customer cases into review queue.' });
    } catch (err: any) {
      setBanner({ type: 'error', message: err?.message || 'Failed to seed demo cases.' });
    } finally {
      setSeeding(false);
    }
  };

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

  const filtered = submittedCases.filter(({ claim }) => {
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    const matchesSearch =
      !searchTerm.trim() ||
      claim.caseReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (claim.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Internal Review Workspace</span>
          <h1 className="text-2xl font-extrabold tracking-tight">{t('admin.title')}</h1>
          <p className="text-xs text-slate-300 mt-1">{t('admin.subtitle')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to="/admin/reference-costs">
            <Button size="sm" variant="outline" className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700">
              <Settings className="w-4 h-4 mr-1.5" />
              <span>Cost References</span>
            </Button>
          </Link>
          <Link to="/admin/audit-log">
            <Button size="sm" variant="outline" className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700">
              <History className="w-4 h-4 mr-1.5" />
              <span>Audit Log</span>
            </Button>
          </Link>
          <Link to="/admin/users">
            <Button size="sm" variant="outline" className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700">
              <Users className="w-4 h-4 mr-1.5" />
              <span>User Permissions</span>
            </Button>
          </Link>
        </div>
      </div>

      {banner && <ToastBanner type={banner.type} message={banner.message} onClose={() => setBanner(null)} />}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Total Cases in System</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{submittedCases.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Pending / Active Review</p>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {
              submittedCases.filter(
                (c) =>
                  c.claim.status === 'submitted_for_review' ||
                  c.claim.status === 'under_review' ||
                  c.claim.status === 'more_info_required'
              ).length
            }
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900">Submitted Case Queue</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search case ref..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
            >
              <option value="all">All Statuses</option>
              <option value="submitted_for_review">Submitted for Review</option>
              <option value="under_review">Under Review</option>
              <option value="more_info_required">Clarification Requested</option>
              <option value="review_complete">Review Complete</option>
              <option value="draft">Drafts</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-xs text-slate-500">Loading cases...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <p className="text-xs text-slate-500">No cases found matching the filter.</p>
            {isDemoAccount && submittedCases.length === 0 && (
              <Button size="sm" variant="outline" onClick={handleSeedEvaluationCases} isLoading={seeding} className="gap-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>Load Sample Customer Cases</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(({ uid, claim }) => (
              <div key={claim.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{claim.caseReference}</span>
                    <StatusBadge status={claim.status} />
                    {claim.isDeceasedCase && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                        Deceased Policyholder
                      </span>
                    )}
                    {claim.isDemoData && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        Sample Data
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Incident: {claim.incidentDate} &bull; Locality: {claim.location || 'N/A'} &bull; Photos:{' '}
                    {claim.evidenceList.length} &bull; User: {uid}
                  </p>
                </div>

                <Link to={`/admin/case?uid=${uid}&claimId=${claim.id}`}>
                  <Button size="sm" variant="outline">
                    Inspect & Review Case
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
