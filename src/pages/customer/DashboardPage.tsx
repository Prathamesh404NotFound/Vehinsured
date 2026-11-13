import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  FilePlus,
  ShieldAlert,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
  HeartHandshake
} from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { dbGetVehicles, dbGetClaims, dbGetPolicies } from '../../services/database';
import { Vehicle, ClaimAssistanceCase, InsurancePolicy } from '../../types';
import { Button } from '../../components/ui/Button';
import { useTranslation } from '../../features/i18n/context';

export const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [claims, setClaims] = useState<ClaimAssistanceCase[]>([]);
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    async function loadData() {
      setLoading(true);
      try {
        const [vList, cList, pList] = await Promise.all([
          dbGetVehicles(currentUser!.uid),
          dbGetClaims(currentUser!.uid),
          dbGetPolicies(currentUser!.uid),
        ]);
        setVehicles(vList);
        setClaims(cList);
        setPolicies(pList);
      } catch (err) {
        console.warn('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser]);

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

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Banner & Primary Action */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Customer Workspace</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser?.displayName.split(' ')[0]}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Record vehicle accident damage, scan insurance documents, and prepare structured claim assistance reports.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <Link to="/claim-wizard" className="w-full sm:w-auto">
            <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-500 font-semibold shadow-sm">
              <FilePlus className="w-5 h-5 mr-2" />
              <span>Start Accident Report</span>
            </Button>
          </Link>
          <Link to="/nominee-assistance" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full bg-slate-800/80 border-slate-700 text-amber-300 hover:bg-slate-800">
              <HeartHandshake className="w-5 h-5 mr-2" />
              <span>Deceased Claim</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Vehicles</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{vehicles.length}</p>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Car className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Accident Cases</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{activeClaims.length}</p>
          </div>
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Linked Policies</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{policies.length}</p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Drafts Requiring Attention */}
      {draftClaims.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Unfinished Draft Reports ({draftClaims.length})</span>
          </div>
          <p className="text-xs text-amber-800">
            You have incomplete accident report drafts. You can resume them at any step without losing saved evidence.
          </p>
          <div className="space-y-2">
            {draftClaims.map((claim) => (
              <div key={claim.id} className="bg-white p-3.5 rounded-lg border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">{claim.caseReference}</span>
                  <span className="text-xs text-slate-500 block">Incident: {claim.incidentDate || 'Date pending'}</span>
                </div>
                <Link to={`/claim-wizard?id=${claim.id}`}>
                  <Button size="sm" variant="outline" className="border-amber-300 text-amber-900 hover:bg-amber-100">
                    Resume Draft
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
          <h2 className="text-lg font-bold text-slate-900">Recent Accident Reports</h2>
          <Link to="/reports" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
            <span>View All Reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {claims.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-700">No accident reports created yet.</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When an accident occurs, create a report to record evidence photos, damage severity, and cost estimates.
            </p>
            <Link to="/claim-wizard">
              <Button size="sm" className="mt-2">
                <Plus className="w-4 h-4 mr-1" />
                <span>Create First Report</span>
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {claims.slice(0, 5).map((claim) => (
              <div key={claim.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{claim.caseReference}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      claim.status === 'draft' ? 'bg-slate-100 text-slate-700' :
                      claim.status === 'review_complete' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {claim.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {claim.incidentDate} &bull; {claim.location || 'Location not entered'} &bull; {claim.evidenceList.length} Photos
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/report-preview?id=${claim.id}`}>
                    <Button size="sm" variant="outline">
                      View Report
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
          <h2 className="text-lg font-bold text-slate-900">My Vehicles</h2>
          <Link to="/vehicles/add">
            <Button size="sm" variant="outline" className="gap-1 text-xs">
              <Plus className="w-3.5 h-3.5" />
              <span>Add Vehicle</span>
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
              <div key={v.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 text-sm tracking-wider uppercase bg-white px-2.5 py-1 rounded border border-slate-200">
                    {v.displayRegistrationNumber || v.registrationNumber}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold px-2 py-0.5 bg-slate-200 rounded">
                    {v.category}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800">
                  {v.make} {v.model} ({v.manufacturingYear})
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
