import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { MobileNav } from '../components/MobileNav';
import { useAuth } from '../features/auth/AuthContext';
import {
  WifiOff,
  Info,
  LayoutDashboard,
  Car,
  ShieldCheck,
  FilePlus,
  FileText,
  Scan,
  Cpu,
  Calculator,
  CheckSquare,
  HeartHandshake,
  Bell,
  User,
  Lock,
  Shield,
  History,
  Users,
  Settings,
} from 'lucide-react';
import { useTranslation } from '../features/i18n/context';

export const AppLayout: React.FC = () => {
  const { currentUser, loading, isDemoAccount, isAdmin } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-600">Loading ClaimAssist AI...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/signin" replace />;
  }

  const customerNav = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { path: '/claim-wizard', label: t('nav.newReport'), icon: FilePlus },
    { path: '/reports', label: t('nav.myReports'), icon: FileText },
    { path: '/vehicles', label: t('nav.myVehicles'), icon: Car },
    { path: '/policies', label: t('nav.myPolicies'), icon: ShieldCheck },
    { path: '/document-scanner', label: t('nav.documentScanner'), icon: Scan },
    { path: '/damage-assessment', label: t('nav.damageAssessment'), icon: Cpu },
    { path: '/cost-estimator', label: t('nav.costEstimate'), icon: Calculator },
    { path: '/claim-checklist', label: t('nav.checklist'), icon: CheckSquare },
    { path: '/nominee-assistance', label: t('nav.nomineeAssistance'), icon: HeartHandshake },
    { path: '/notifications', label: t('nav.notifications'), icon: Bell },
    { path: '/profile', label: t('nav.profile'), icon: User },
    { path: '/privacy-export', label: t('nav.privacyExport'), icon: Lock },
  ];

  const adminNav = [
    { path: '/admin', label: t('nav.adminWorkspace'), icon: Shield },
    { path: '/admin/reference-costs', label: t('admin.referenceCosts'), icon: Settings },
    { path: '/admin/audit-log', label: t('admin.auditLog'), icon: History },
    { path: '/admin/users', label: t('admin.users'), icon: Users },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased font-sans pb-16 md:pb-0">
      <Navbar />

      {/* Offline Status Banner */}
      {isOffline && (
        <div className="bg-amber-600 text-white text-xs px-4 py-2 text-center font-medium flex items-center justify-center gap-2 no-print">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>{t('offline.notice')}</span>
        </div>
      )}

      {/* Demonstration Mode Banner */}
      {isDemoAccount && (
        <div className="bg-blue-900/95 text-blue-100 text-xs px-4 py-1.5 border-b border-blue-800 no-print">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <Info className="w-4 h-4 text-blue-300 shrink-0" />
            <span>
              <strong>Demonstration Mode:</strong> Signed in as <strong>{currentUser.displayName}</strong> (
              {isAdmin ? 'Admin Reviewer' : 'Customer'}). Demo storage works locally in browser without cloud charges.
            </span>
          </div>
        </div>
      )}

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs sticky top-20 space-y-4 no-print">
          <nav aria-label="Workspace navigation" className="space-y-1">
            <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t('dashboard.workspace')}
            </p>
            {customerNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {isAdmin && (
            <nav aria-label="Administrator navigation" className="space-y-1 border-t border-slate-100 pt-3">
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                {t('admin.title')}
              </p>
              {adminNav.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-700 text-white font-semibold'
                        : 'text-emerald-800 hover:bg-emerald-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>

      <MobileNav />
      <Footer />
    </div>
  );
};
