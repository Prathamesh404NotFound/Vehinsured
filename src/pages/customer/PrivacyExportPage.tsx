import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Trash2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import {
  dbGetVehicles,
  dbGetClaims,
  dbGetPolicies,
  dbGetDocuments,
  dbDeleteAllUserRecords,
} from '../../services/database';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ToastBanner } from '../../components/ui/ToastBanner';
import { useTranslation } from '../../features/i18n/context';

export const PrivacyExportPage: React.FC = () => {
  const { currentUser, signOut, isDemoAccount } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const handleExportData = async () => {
    if (!currentUser) return;
    setExporting(true);

    const [vList, cList, pList, dList] = await Promise.all([
      dbGetVehicles(currentUser.uid),
      dbGetClaims(currentUser.uid),
      dbGetPolicies(currentUser.uid),
      dbGetDocuments(currentUser.uid),
    ]);

    const bundle = {
      profile: currentUser,
      vehicles: vList,
      policies: pList,
      claims: cList,
      documents: dList,
      exportedAt: new Date().toISOString(),
    };

    const jsonStr = JSON.stringify(bundle, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `User_Data_Export_${currentUser.uid}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setExporting(false);
    setBanner({ type: 'success', message: 'Personal records exported as JSON.' });
  };

  const handleConfirmDelete = async () => {
    if (!currentUser) return;
    setDeleting(true);
    setConfirmOpen(false);
    try {
      const result = await dbDeleteAllUserRecords(currentUser.uid);
      if (result.errors.length > 0) {
        setBanner({
          type: 'error',
          message: `Partial deletion completed. Some nodes could not be removed (${result.errors.join(', ')}). Firebase Auth account removal requires recent re-authentication.`,
        });
      } else {
        await signOut();
        navigate('/');
      }
    } catch (err: any) {
      setBanner({ type: 'error', message: err?.message || 'Unable to complete data deletion.' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">{t('nav.privacyExport')}</h1>
        <p className="text-xs text-slate-600">Export your personal assessment records or delete your stored database records.</p>
      </div>

      {banner && <ToastBanner type={banner.type} message={banner.message} onClose={() => setBanner(null)} />}

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900">Export Personal Records</h3>
          <p className="text-xs text-slate-600">
            Download a complete structured JSON archive containing your profile, registered vehicles, policies, confirmed documents, and accident reports.
          </p>
          <Button onClick={handleExportData} isLoading={exporting} variant="outline" className="gap-2">
            <Download className="w-4 h-4 text-blue-600" />
            <span>Download Personal JSON Archive</span>
          </Button>
        </div>

        <div className="pt-6 border-t border-slate-200 space-y-2">
          <h3 className="text-sm font-bold text-red-700 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            <span>Delete Records & Sign Out</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Deletes all your vehicles, policies, claims, assessments, confirmed documents, and activity logs under UID{' '}
            <code className="font-mono bg-slate-100 px-1 rounded">{currentUser?.uid}</code>.{' '}
            {isDemoAccount
              ? 'Demonstration session records stored in your browser will be cleared.'
              : 'Deleting the underlying Firebase Authentication login additionally requires recent re-authentication per security rules.'}
          </p>
          <Button onClick={() => setConfirmOpen(true)} isLoading={deleting} variant="danger" className="gap-2">
            <Trash2 className="w-4 h-4" />
            <span>Delete All My Data</span>
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete All Stored Records?"
        message="This will permanently erase all vehicles, insurance policies, accident reports, and documents stored for your account. Export a JSON backup first if needed."
        confirmLabel="Erase My Records"
        cancelLabel={t('btn.cancel')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};
