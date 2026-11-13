import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Trash2, Search, Edit } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { dbGetClaims, dbDeleteClaim } from '../../services/database';
import { ClaimAssistanceCase } from '../../types';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ToastBanner } from '../../components/ui/ToastBanner';
import { canCustomerEditClaim } from '../../utils/validation';
import { useTranslation } from '../../features/i18n/context';

export const MyReportsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  const [claims, setClaims] = useState<ClaimAssistanceCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<ClaimAssistanceCase | null>(null);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    async function load() {
      setLoading(true);
      const list = await dbGetClaims(currentUser!.uid);
      setClaims(list);
      setLoading(false);
    }
    load();
  }, [currentUser]);

  const filteredClaims = claims.filter((c) => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSearch =
      !searchTerm.trim() ||
      c.caseReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const confirmDelete = async () => {
    if (!currentUser || !deleteTarget) return;
    await dbDeleteClaim(currentUser.uid, deleteTarget.id);
    setClaims(claims.filter((c) => c.id !== deleteTarget.id));
    setBanner({ type: 'success', message: `Deleted report ${deleteTarget.caseReference}.` });
    setDeleteTarget(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{t('reports.title')}</h1>
          <p className="text-xs text-slate-600">{t('reports.subtitle')}</p>
        </div>

        <Link to="/claim-wizard">
          <Button size="md" className="gap-2">
            <Plus className="w-4 h-4" />
            <span>{t('nav.newReport')}</span>
          </Button>
        </Link>
      </div>

      {banner && <ToastBanner type={banner.type} message={banner.message} onClose={() => setBanner(null)} />}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Case Reference or Location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
        >
          <option value="all">All Statuses ({claims.length})</option>
          <option value="draft">Draft</option>
          <option value="submitted_for_review">Submitted for Review</option>
          <option value="under_review">Under Review</option>
          <option value="more_info_required">Clarification Requested</option>
          <option value="review_complete">Review Complete</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-10 text-xs text-slate-500">Loading claims...</div>
      ) : filteredClaims.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-900">No Reports Match Your Filter</h3>
          <Link to="/claim-wizard">
            <Button size="sm">Create Accident Report</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredClaims.map((claim) => (
            <div
              key={claim.id}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{claim.caseReference}</span>
                  <StatusBadge status={claim.status} />
                  {claim.isDemoData && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                      Sample Data
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Incident: {claim.incidentDate} &bull; Locality: {claim.location || 'N/A'} &bull; Photos:{' '}
                  {claim.evidenceList.length}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {canCustomerEditClaim(claim.status) && (
                  <Link to={`/claim-wizard?id=${claim.id}`}>
                    <Button size="sm" variant="ghost" className="gap-1">
                      <Edit className="w-3.5 h-3.5" />
                      <span>{t('btn.edit')}</span>
                    </Button>
                  </Link>
                )}
                <Link to={`/report-preview?id=${claim.id}`}>
                  <Button size="sm" variant="outline">
                    View Full Report
                  </Button>
                </Link>
                {claim.status === 'draft' && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteTarget(claim)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Draft Report"
        message={`Delete draft ${deleteTarget?.caseReference}? This cannot be undone.`}
        confirmLabel={t('btn.delete')}
        cancelLabel={t('btn.cancel')}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
