import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { MobileNav } from '../components/MobileNav';
import { useAuth } from '../features/auth/AuthContext';
import { WifiOff, AlertTriangle, Info } from 'lucide-react';
import { useTranslation } from '../features/i18n/context';

export const AppLayout: React.FC = () => {
  const { currentUser, loading, isDemoAccount } = useAuth();
  const { t } = useTranslation();
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased font-sans pb-16 md:pb-0">
      <Navbar />

      {/* Offline Status Banner */}
      {isOffline && (
        <div className="bg-amber-600 text-white text-xs px-4 py-2 text-center font-medium flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span>{t('offline.notice')}</span>
        </div>
      )}

      {/* Demonstration Mode Banner */}
      {isDemoAccount && (
        <div className="bg-blue-900/90 text-blue-100 text-xs px-4 py-1.5 border-b border-blue-800 flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <Info className="w-4 h-4 text-blue-300 shrink-0" />
            <span>
              <strong>Demonstration Mode Active:</strong> You are reviewing as <strong>{currentUser.displayName}</strong> ({currentUser.isAdmin ? 'Admin Reviewer' : 'Customer'}). Realtime Database local sync enabled.
            </span>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      <MobileNav />
      <Footer />
    </div>
  );
};
