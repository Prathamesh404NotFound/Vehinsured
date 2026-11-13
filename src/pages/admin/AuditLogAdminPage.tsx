import React, { useState, useEffect } from 'react';
import { ArrowLeft, History, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { dbGetAllAdminReviews, dbGetReferenceCostRevisions } from '../../services/database';
import { useTranslation } from '../../features/i18n/context';

interface UnifiedAuditEntry {
  id: string;
  timestamp: number;
  category: 'case_review' | 'cost_table';
  actor: string;
  summary: string;
  details: string;
}

export const AuditLogAdminPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [entries, setEntries] = useState<UnifiedAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [reviews, revisions] = await Promise.all([
        dbGetAllAdminReviews(),
        dbGetReferenceCostRevisions(),
      ]);

      const merged: UnifiedAuditEntry[] = [];
      reviews.forEach((rev) => {
        (rev.history || []).forEach((h, idx) => {
          merged.push({
            id: `rev-${rev.claimId}-${idx}-${h.timestamp}`,
            timestamp: h.timestamp,
            category: 'case_review',
            actor: h.reviewerUid,
            summary: `Case ${rev.claimId}: ${h.oldStatus} -> ${h.newStatus}`,
            details: h.comment,
          });
        });
      });

      revisions.forEach((r) => {
        merged.push({
          id: r.id,
          timestamp: r.timestamp,
          category: 'cost_table',
          actor: r.updatedBy,
          summary: `Cost Baseline Updated: ${r.partName}`,
          details: `Parts Rs. ${r.newValues.replacePartsMin}-${r.newValues.replacePartsMax}, Labor Rs. ${r.newValues.repairLaborMin}-${r.newValues.repairLaborMax}`,
        });
      });

      merged.sort((a, b) => b.timestamp - a.timestamp);
      setEntries(merged);
      setLoading(false);
    }
    load();
  }, []);

  if (!isAdmin) {
    return (
      <div className="p-8 text-center space-y-2">
        <Shield className="w-8 h-8 text-slate-400 mx-auto" />
        <p className="text-xs text-slate-500">Administrator access required.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{t('admin.auditLog')}</h1>
          <p className="text-xs text-slate-600">
            Chronological log of case status reviews, reviewer comments, and cost-table edits.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {loading ? (
          <p className="text-center py-8 text-xs text-slate-500">Loading audit events...</p>
        ) : entries.length === 0 ? (
          <div className="text-center py-10 space-y-2 text-xs text-slate-500">
            <History className="w-8 h-8 text-slate-300 mx-auto" />
            <p>No review or cost revision events recorded yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {entries.map((e) => (
              <div key={e.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        e.category === 'case_review' ? 'bg-blue-50 text-blue-800' : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {e.category === 'case_review' ? 'Case Review' : 'Cost Baseline'}
                    </span>
                    <span className="font-bold text-slate-900">{e.summary}</span>
                  </div>
                  <p className="text-slate-600 mt-0.5">{e.details}</p>
                </div>
                <div className="text-[11px] text-slate-500 shrink-0 text-left sm:text-right">
                  <p className="font-mono">{e.actor}</p>
                  <p>{new Date(e.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
