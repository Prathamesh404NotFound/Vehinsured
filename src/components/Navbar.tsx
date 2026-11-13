import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, ShieldAlert, FileText, User, LogOut, Globe, Shield, Menu, X } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { useTranslation } from '../features/i18n/context';
import { SupportedLanguage } from '../types';

export const Navbar: React.FC = () => {
  const { currentUser, signOut, isAdmin, isDemoAccount } = useAuth();
  const { language, setLanguage, t } = useTranslation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as SupportedLanguage);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/signin');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md border-b border-slate-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight hover:opacity-90 transition-opacity">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Car className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-semibold text-base leading-tight">ClaimAssist AI</span>
            <span className="text-[10px] text-slate-400 font-normal">Vehicle Damage Assessment</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-5 text-xs lg:text-sm font-medium text-slate-300 whitespace-nowrap">
          <Link to="/" className="hover:text-white transition-colors">{t('nav.home')}</Link>
          <Link to="/how-it-works" className="hover:text-white transition-colors">{t('nav.howItWorks')}</Link>
          <Link to="/features" className="hover:text-white transition-colors">{t('nav.features')}</Link>

          {currentUser && (
            <>
              <Link to="/dashboard" className="hover:text-white transition-colors">{t('nav.dashboard')}</Link>
              <Link to="/claim-wizard" className="hover:text-white transition-colors text-blue-400 font-semibold">{t('nav.newReport')}</Link>
              <Link to="/nominee-assistance" className="hover:text-white transition-colors text-amber-300">{t('nav.nomineeAssistance')}</Link>
              {isAdmin && (
                <Link to="/admin" className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold px-2 py-1 bg-emerald-950/60 border border-emerald-800 rounded-md">
                  <Shield className="w-3.5 h-3.5 shrink-0" />
                  <span>Admin</span>
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Right Action Menu */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={language}
              onChange={handleLanguageChange}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="en" className="bg-slate-800 text-white">English</option>
              <option value="hi" className="bg-slate-800 text-white">हिंदी</option>
              <option value="mr" className="bg-slate-800 text-white">मराठी</option>
            </select>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>{currentUser.displayName.split(' ')[0]}</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title={t('nav.signOut')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/signin"
                className="text-xs font-semibold px-3 py-1.5 text-slate-300 hover:text-white transition-colors"
              >
                {t('nav.signIn')}
              </Link>
              <Link
                to="/signup"
                className="text-xs font-semibold px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-colors"
              >
                {t('nav.signUp')}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center gap-2">
          {/* Mobile Language Selector */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-md px-1.5 py-1 text-xs text-white">
            <select
              value={language}
              onChange={handleLanguageChange}
              className="bg-transparent focus:outline-none text-xs"
            >
              <option value="en" className="bg-slate-800">EN</option>
              <option value="hi" className="bg-slate-800">HI</option>
              <option value="mr" className="bg-slate-800">MR</option>
            </select>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-white py-1.5 text-sm"
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-white py-1.5 text-sm"
          >
            {t('nav.howItWorks')}
          </Link>
          <Link
            to="/features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-white py-1.5 text-sm"
          >
            {t('nav.features')}
          </Link>

          {currentUser ? (
            <>
              <div className="border-t border-slate-800 my-2 pt-2"></div>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-200 hover:text-white py-1.5 text-sm font-medium"
              >
                {t('nav.dashboard')}
              </Link>
              <Link
                to="/claim-wizard"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-blue-400 hover:text-blue-300 py-1.5 text-sm font-semibold"
              >
                {t('nav.newReport')}
              </Link>
              <Link
                to="/vehicles"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-300 hover:text-white py-1.5 text-sm"
              >
                {t('nav.myVehicles')}
              </Link>
              <Link
                to="/policies"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-300 hover:text-white py-1.5 text-sm"
              >
                {t('nav.myPolicies')}
              </Link>
              <Link
                to="/nominee-assistance"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-amber-300 hover:text-amber-200 py-1.5 text-sm font-medium"
              >
                {t('nav.nomineeAssistance')}
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-emerald-400 font-semibold py-1.5 text-sm"
                >
                  {t('admin.title')}
                </Link>
              )}
              <div className="border-t border-slate-800 my-2 pt-2 flex items-center justify-between">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-300 text-xs font-medium"
                >
                  {currentUser.displayName}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-red-400 font-medium"
                >
                  {t('nav.signOut')}
                </button>
              </div>
            </>
          ) : (
            <div className="border-t border-slate-800 pt-3 flex gap-3">
              <Link
                to="/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                {t('nav.signIn')}
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
              >
                {t('nav.signUp')}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
