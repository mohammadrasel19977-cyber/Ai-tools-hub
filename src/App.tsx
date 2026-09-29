/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { QuickSearchModal } from './components/QuickSearchModal';
import { StripeCheckoutModal } from './components/StripeCheckoutModal';
import { ToastContainer } from './components/ToastContainer';
import { AIToolInterface } from './components/AIToolInterface';

// Views
import { HomeView } from './views/HomeView';
import { CategoryView } from './views/CategoryView';
import { DashboardView } from './views/DashboardView';
import { PricingView } from './views/PricingView';
import { AdminPanelView } from './views/AdminPanelView';
import { 
  LoginView, 
  SignUpView, 
  ForgotPasswordView, 
  ProfileView 
} from './views/AuthViews';

const AppContent: React.FC = () => {
  const { currentView, selectedToolId } = useApp();

  // Scroll to top whenever view or tool changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, selectedToolId]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Global Modals & Notifications */}
      <QuickSearchModal />
      <StripeCheckoutModal />
      <ToastContainer />

      {/* Main App Navigation */}
      <Navbar />

      {/* View Content Router */}
      <main className="flex-1">
        {currentView === 'home' && <HomeView />}
        {currentView === 'category' && <CategoryView />}
        {currentView === 'tool' && <AIToolInterface toolId={selectedToolId} />}
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'profile' && <ProfileView />}
        {currentView === 'pricing' && <PricingView />}
        {currentView === 'admin' && <AdminPanelView />}
        {currentView === 'login' && <LoginView />}
        {currentView === 'signup' && <SignUpView />}
        {currentView === 'forgot-password' && <ForgotPasswordView />}
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
