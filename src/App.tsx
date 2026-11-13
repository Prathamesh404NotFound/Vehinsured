import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { LanguageProvider } from './features/i18n/context';
import { ErrorBoundary } from './components/ErrorBoundary';

import { MainLayout } from './layouts/MainLayout';
import { AppLayout } from './layouts/AppLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { FeaturesPage } from './pages/public/FeaturesPage';
import { FaqPage } from './pages/public/FaqPage';
import { PrivacyPage } from './pages/public/PrivacyPage';
import { TermsPage } from './pages/public/TermsPage';
import { NotFoundPage } from './pages/public/NotFoundPage';

// Auth Pages
import { SignInPage } from './pages/auth/SignInPage';
import { SignUpPage } from './pages/auth/SignUpPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Customer Pages
import { DashboardPage } from './pages/customer/DashboardPage';
import { MyVehiclesPage } from './pages/customer/MyVehiclesPage';
import { AddEditVehiclePage } from './pages/customer/AddEditVehiclePage';
import { MyPoliciesPage } from './pages/customer/MyPoliciesPage';
import { ClaimWizardPage } from './pages/customer/ClaimWizardPage';
import { DamageAssessmentPage } from './pages/customer/DamageAssessmentPage';
import { RepairCostEstimatePage } from './pages/customer/RepairCostEstimatePage';
import { DocumentScannerPage } from './pages/customer/DocumentScannerPage';
import { NomineeAssistancePage } from './pages/customer/NomineeAssistancePage';
import { ClaimChecklistPage } from './pages/customer/ClaimChecklistPage';
import { ReportPreviewPage } from './pages/customer/ReportPreviewPage';
import { MyReportsPage } from './pages/customer/MyReportsPage';
import { NotificationsPage } from './pages/customer/NotificationsPage';
import { ProfilePage } from './pages/customer/ProfilePage';
import { PrivacyExportPage } from './pages/customer/PrivacyExportPage';

// Admin Pages
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { CaseDetailsPage } from './pages/admin/CaseDetailsPage';
import { ReferenceCostsAdminPage } from './pages/admin/ReferenceCostsAdminPage';
import { AuditLogAdminPage } from './pages/admin/AuditLogAdminPage';
import { UserManagementAdminPage } from './pages/admin/UserManagementAdminPage';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Layout */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
              </Route>

              {/* Authenticated Customer & Admin Layout */}
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/vehicles" element={<MyVehiclesPage />} />
                <Route path="/vehicles/add" element={<AddEditVehiclePage />} />
                <Route path="/vehicles/edit/:id" element={<AddEditVehiclePage />} />
                <Route path="/policies" element={<MyPoliciesPage />} />
                <Route path="/claim-wizard" element={<ClaimWizardPage />} />
                <Route path="/damage-assessment" element={<DamageAssessmentPage />} />
                <Route path="/cost-estimator" element={<RepairCostEstimatePage />} />
                <Route path="/document-scanner" element={<DocumentScannerPage />} />
                <Route path="/nominee-assistance" element={<NomineeAssistancePage />} />
                <Route path="/claim-checklist" element={<ClaimChecklistPage />} />
                <Route path="/report-preview" element={<ReportPreviewPage />} />
                <Route path="/reports" element={<MyReportsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/privacy-export" element={<PrivacyExportPage />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminOverviewPage />} />
                <Route path="/admin/case" element={<CaseDetailsPage />} />
                <Route path="/admin/reference-costs" element={<ReferenceCostsAdminPage />} />
                <Route path="/admin/audit-log" element={<AuditLogAdminPage />} />
                <Route path="/admin/users" element={<UserManagementAdminPage />} />
              </Route>

              {/* 404 Catch-All */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
