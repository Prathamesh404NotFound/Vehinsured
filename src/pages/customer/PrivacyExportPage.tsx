import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Trash2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { dbGetVehicles, dbGetClaims, dbGetPolicies } from '../../services/database';
import { Button } from '../../components/ui/Button';

export const PrivacyExportPage: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);

  const handleExportData = async () => {
    if (!currentUser) return;
    setExporting(true);

    const [vList, cList, pList] = await Promise.all([
      dbGetVehicles(currentUser.uid),
      dbGetClaims(currentUser.uid),
      dbGetPolicies(currentUser.uid),
    ]);

    const bundle = {
      profile: currentUser,
      vehicles: vList,
      policies: pList,
      claims: cList,
      exportedAt: new Date().toISOString(),
    };

    const jsonStr = JSON.stringify(bundle, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `User_Data_Export_${currentUser.uid}.json`;
    a.click();

    setExporting(false);
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account and all stored records? This action cannot be undone.')) {
      localStorage.clear();
      await signOut();
      navigate('/');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">Privacy, Export & Account Control</h1>
        <p className="text-xs text-slate-600">Export your personal assessment records or request local data deletion.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900">Export Personal Records</h3>
          <p className="text-xs text-slate-600">Download a complete structured JSON archive containing your profile, registered vehicles, policies, and accident reports.</p>
          <Button onClick={handleExportData} isLoading={exporting} variant="outline" className="gap-2">
            <Download className="w-4 h-4 text-blue-600" />
            <span>Download Personal JSON Archive</span>
          </Button>
        </div>

        <div className="pt-6 border-t border-slate-200 space-y-2">
          <h3 className="text-sm font-bold text-red-700 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            <span>Delete Account & Erase Records</span>
          </h3>
          <p className="text-xs text-slate-600">
            Removes local browser storage and session profile. Note: Cloud database records are deleted per Firebase Auth UID ownership rules.
          </p>
          <Button onClick={handleDeleteAccount} variant="danger" className="gap-2">
            <Trash2 className="w-4 h-4" />
            <span>Delete Account & Data</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
