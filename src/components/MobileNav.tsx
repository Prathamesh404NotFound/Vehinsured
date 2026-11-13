import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, Car, Scan, User } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { useTranslation } from '../features/i18n/context';

export const MobileNav: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  if (!currentUser) return null;

  const navItems = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: Home },
    { path: '/vehicles', label: t('nav.myVehicles'), icon: Car },
    { path: '/claim-wizard', label: t('nav.newReport'), icon: PlusCircle, isHighlight: true },
    { path: '/document-scanner', label: t('nav.documentScanner'), icon: Scan },
    { path: '/profile', label: t('nav.profile'), icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg px-2 py-1.5 flex items-center justify-around no-print">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        if (item.isHighlight) {
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center -mt-5 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 h-12 shadow-md transition-transform active:scale-95"
            >
              <Icon className="w-6 h-6" />
            </Link>
          );
        }

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
              isActive ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};
