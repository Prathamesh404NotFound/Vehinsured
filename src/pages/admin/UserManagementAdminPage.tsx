import React from 'react';
import { ArrowLeft, Shield, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';

export const UserManagementAdminPage: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (!isAdmin) {
    return <div className="p-8 text-center text-xs text-slate-500">Access Restricted</div>;
  }

  const adminUids = (import.meta.env.VITE_ADMIN_UIDS || '').split(',').map((s: string) => s.trim());

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <button onClick={() => navigate('/admin')} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">User Permissions & Admin Allowlist</h1>
          <p className="text-xs text-slate-600">Review system permission policies and configured administrator UIDs.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Configured Administrator Allowlist</h3>
        <p className="text-xs text-slate-600">
          Administrator privileges are strictly enforced via Firebase RTDB Security Rules and environment configuration.
        </p>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 font-mono text-xs">
          <p className="font-bold text-slate-800">Current Session Admin UID:</p>
          <p className="text-blue-700 bg-white p-2 rounded border border-slate-200">{currentUser?.uid}</p>

          <p className="font-bold text-slate-800 pt-2">Environment Configured Admin UIDs (VITE_ADMIN_UIDS):</p>
          <p className="text-slate-700 bg-white p-2 rounded border border-slate-200">
            {adminUids.join(', ') || 'Demo Admin Active'}
          </p>
        </div>
      </div>
    </div>
  );
};
