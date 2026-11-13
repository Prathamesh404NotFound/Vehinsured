import React from 'react';
import { Clock, CheckCircle2, AlertCircle, FileEdit, Eye, Archive } from 'lucide-react';
import { ClaimAssistanceCase } from '../../types';
import { useTranslation } from '../../features/i18n/context';

export const StatusBadge: React.FC<{ status: ClaimAssistanceCase['status'] }> = ({ status }) => {
  const { t } = useTranslation();

  const config: Record<
    ClaimAssistanceCase['status'],
    { classes: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    draft: { classes: 'bg-slate-100 text-slate-700 border-slate-200', icon: FileEdit },
    ready_for_submission: { classes: 'bg-blue-50 text-blue-800 border-blue-200', icon: CheckCircle2 },
    submitted_for_review: { classes: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock },
    under_review: { classes: 'bg-amber-100 text-amber-900 border-amber-200', icon: Eye },
    more_info_required: { classes: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle },
    review_complete: { classes: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
    closed: { classes: 'bg-slate-200 text-slate-800 border-slate-300', icon: Archive },
  };

  const entry = config[status] || config.draft;
  const Icon = entry.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold border ${entry.classes}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span>{t(`status.${status}`, status.replace(/_/g, ' ').toUpperCase())}</span>
    </span>
  );
};
