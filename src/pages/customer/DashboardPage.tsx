import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  FilePlus,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
  HeartHandshake,
  Database,
  AlertTriangle,
  MessageSquare,
  CheckSquare,
} from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { dbGetVehicles, dbGetClaims, dbGetPolicies, dbGetAdminReview } from '../../services/database';
import { Vehicle, ClaimAssistanceCase, InsurancePolicy, AdminReview } from '../../types';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ToastBanner } from '../../components/ui/ToastBanner';
import { useTranslation } from '../../features/i18n/context';
import { seedSampleEvaluationData } from '../../data/demoEvaluationData';

export const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [claims, setClaims] = useState<ClaimAssistanceCase[]>([]);
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [clarifications, setClarifications] = useState<Array<{ claim: ClaimAssistanceCase; review: AdminReview }>>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [vList, cList, pList] = await Promise.all([
        dbGetVehicles(currentUser.uid),
        dbGetClaims(currentUser.uid),
        dbGetPolicies(currentUser.uid),
      ]);
      setVehicles(vList);
      setClaims(cList);
      setPolicies(pList);

      const clarificationList: Array<{ claim: ClaimAssistanceCase; review: AdminReview }> = [];
      await Promise.all(
        cList.map(async (claim) => {
          const rev = await dbGetAdminReview(claim.id);
          if (rev && (claim.status === 'more_info_required' || rev.requestedCustomerClarification)) {
            clarificationList.push({ claim, review: rev });
          }
        })
      );
      setClarifications(clarificationList);
    } catch (err) {
      console.warn('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSeedDemo = async () => {
    if (!currentUser) return;
    setSeeding(true);
    try {
      await seedSampleEvaluationData(currentUser.uid);
      await loadData();
      setBanner({
        type: 'success',
        message:
          'Loaded sample evaluation dataset (2 Indian vehicles, 2 policies, 2 demo claim cases, and illustrative damage records). Sample data is clearly labelled.',
      });
    } catch (err: any) {
      setBanner({
        type: 'error',
        message: err?.message || 'Failed to load sample evaluation data.',
      });
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 py-8 max-w-5xl mx-auto">
        <div className="h-8 bg-slate-200 rounded-lg w-1/3 animate-pulse"></div>
        <div className="h-32 bg-slate-100 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  const draftClaims = claims.filter((c) => c.status === 'draft');
  const activeClaims = claims.filter((c) => c.status !== 'draft' && c.status !== 'closed');

  const now = Date.now();
  const expiringPolicies = policies.filter((p) => {
    if (!p.expiryDate) return false;
    const diff = new Date(p.expiryDate).getTime() - now;
    return diff < 30 * 24 * 60 * 60 * 1000;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {banner && <ToastBanner type={banner.type} message={banner.message} onClose={() => setBanner(null)} />}

      {/* Welcome Banner & Primary Action */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col gap-5">
        <div className="space-y-2 max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">{t('dashboard.workspace')}</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('dashboard.welcome')}, {currentUser?.displayName.split(' ')[0]}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{t('dashboard.subtitle')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/claim-wizard">
            <Button size="md" className="bg-blue-600 hover:bg-blue-500 font-semibold shadow-sm">
              <FilePlus className="w-4 h-4 mr-2" />
              <span>{t('dashboard.startReport')}</span>
            </Button>
          </Link>
          <Link to="/nominee-assistance">
            <Button
              variant="outline"
              size="md"
              className="bg-slate-800/80 border-slate-700 text-amber-300 hover:bg-slate-800 hover:text-amber-200"
            >
              <HeartHandshake className="w-4 h-4 mr-2" />
              <span>{t('dashboard.deceasedClaim')}</span>
            </Button>
          </Link>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleSeedDemo}
            isLoading={seeding}
            className="bg-slate-800/60 border-slate-700 text-slate-200 hover:bg-slate-700"
          >
            <Database className="w-4 h-4 mr-2" />
            <span>{t('dashboard.seedDemo')}</span>
          </Button>
        </div>
      </div>

      {/* Policy Expiry Reminders */}
      {expiringPolicies.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Policy Renewal Attention ({expiringPolicies.length})</span>
            </div>
            <Link to="/policies" className="text-xs font-semibold text-amber-900 underline">
              Manage Policies
            </Link>
          </div>
          <div className="space-y-1 text-xs text-amber-800">
            {expiringPolicies.map((p) => {
              const expired = new Date(p.expiryDate).getTime() < now;
              return (
                <p key={p.id}>
                  <strong>{p.insurerName}</strong> ({p.policyNumber}) &mdash;{' '}
                  {expired ? `Expired on ${p.expiryDate}` : `Expires soon on ${p.expiryDate}`}.
                </p>
              );
            })}
          </div>
        </div>
      )}

      {/* Reviewer Clarification Requests */}
      {clarifications.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-red-900 font-bold text-xs sm:text-sm">
            <MessageSquare className="w-4 h-4 text-red-600 shrink-0" />
            <span>Reviewer Clarification Requested ({clarifications.length})</span>
          </div>
          <div className="space-y-2">
            {clarifications.map(({ claim, review }) => (
              <div
                key={claim.id}
                className="bg-white p-3 rounded-lg border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="text-xs">
                  <span className="font-bold text-slate-900">{claim.caseReference}:</span>{' '}
                  <span className="text-red-800">
                    {review.requestedCustomerClarification || review.reviewerNotes || 'Additional evidence requested.'}
                  </span>
                </div>
                <Link to={`/claim-wizard?id=${claim.id}`} className="shrink-0">
                  <Button size="sm" variant="outline" className="border-red-300 text-red-800 hover:bg-red-50">
                    Update Claim
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/vehicles"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between hover:border-blue-300 transition-colors"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('dashboard.registeredVehicles')}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{vehicles.length}</p>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Car className="w-5 h-5" />
          </div>
        </Link>

        <Link
          to="/reports"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between hover:border-blue-300 transition-colors"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('dashboard.activeCases')}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{activeClaims.length}</p>
          </div>
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </Link>

        <Link
          to="/policies"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between hover:border-blue-300 transition-colors"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('dashboard.linkedPolicies')}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{policies.length}</p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </Link>
      </div>

      {/* Drafts Requiring Attention */}
      {draftClaims.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              {t('dashboard.draftsTitle')} ({draftClaims.length})
            </span>
          </div>
          <div className="space-y-2">
            {draftClaims.map((claim) => (
              <div
                key={claim.id}
                className="bg-white p-3.5 rounded-lg border border-amber-200 flex items-center justify-between gap-2"
              >
                <div>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">{claim.caseReference}</span>
                  <span className="text-xs text-slate-500 block">
                    Incident: {claim.incidentDate || 'Date pending'} &bull; Step {claim.currentWizardStep || 1}
                  </span>
                </div>
                <Link to={`/claim-wizard?id=${claim.id}`}>
                  <Button size="sm" variant="outline" className="border-amber-300 text-amber-900 hover:bg-amber-100">
                    {t('dashboard.resumeDraft')}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Accident Cases */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900">{t('dashboard.recentReports')}</h2>
          <div className="flex items-center gap-3">
            <Link to="/claim-checklist" className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{t('nav.checklist')}</span>
            </Link>
            <Link to="/reports" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              <span>{t('dashboard.viewAll')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {claims.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-700">No accident reports created yet.</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Start a new report to record scene photos and estimates, or click “{t('dashboard.seedDemo')}” above to explore sample cases.
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <Link to="/claim-wizard">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  <span>Create First Report</span>
                </Button>
              </Link>
              <Button size="sm" variant="outline" onClick={handleSeedDemo} isLoading={seeding}>
                {t('dashboard.seedDemo')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {claims.slice(0, 5).map((claim) => (
              <div key={claim.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{claim.caseReference}</span>
                    <StatusBadge status={claim.status} />
                    {claim.isDemoData && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                        Sample Data
                      </span>
                    )}
                    {claim.isDeceasedCase && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold">
                        Nominee Case
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {claim.incidentDate} &bull; {claim.location || 'Location not entered'} &bull; {claim.evidenceList.length} Photos
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/claim-wizard?id=${claim.id}`}>
                    <Button size="sm" variant="ghost">
                      Edit
                    </Button>
                  </Link>
                  <Link to={`/report-preview?id=${claim.id}`}>
                    <Button size="sm" variant="outline">
                      {t('dashboard.viewReport')}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Registered Vehicles Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900">{t('vehicles.title')}</h2>
          <Link to="/vehicles/add">
            <Button size="sm" variant="outline" className="gap-1 text-xs">
              <Plus className="w-3.5 h-3.5" />
              <span>{t('vehicles.add')}</span>
            </Button>
          </Link>
        </div>

        {vehicles.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <p className="text-xs text-slate-500">No vehicles registered under your profile.</p>
            <Link to="/vehicles/add">
              <Button size="sm">Register Your Vehicle</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {vehicles.map((v) => (
              <Link
                key={v.id}
                to={`/vehicles/edit/${v.id}`}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-blue-300 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 text-sm tracking-wider uppercase bg-white px-2.5 py-1 rounded border border-slate-200">
                    {v.displayRegistrationNumber || v.registrationNumber}
                  </span>
                  <span className="text-[10px] text-slate-600 uppercase font-semibold px-2 py-0.5 bg-slate-200 rounded">
                    {v.category}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800">
                  {v.make} {v.model} ({v.manufacturingYear})
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
