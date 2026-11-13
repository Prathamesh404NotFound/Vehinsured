import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastBannerProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onClose?: () => void;
}

export const ToastBanner: React.FC<ToastBannerProps> = ({ type, message, onClose }) => {
  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900',
  }[type];

  const Icon = type === 'success' ? CheckCircle2 : type === 'error' || type === 'warning' ? AlertCircle : Info;

  return (
    <div
      role="status"
      className={`p-3.5 rounded-xl border text-xs font-medium flex items-start justify-between gap-3 ${styles}`}
    >
      <div className="flex items-start gap-2">
        <Icon className="w-4 h-4 shrink-0 mt-0.5" />
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss message"
          className="p-0.5 rounded hover:bg-black/5 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
