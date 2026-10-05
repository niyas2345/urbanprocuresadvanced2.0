import {PasswordRecovery} from './components/PasswordRecovery.tsx';
import React, { useState, useEffect } from 'react';
import { UserRole } from './types/index.ts';
import { ToastProvider } from './components/ToastContext.tsx';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { GetAQuotePage } from './pages/GetAQuotePage.tsx';
import { ContractorPage } from './pages/ContractorPage.tsx';
import { VendorPage } from './pages/VendorPage.tsx';
import { AdminPage } from './pages/AdminPage.tsx';
import { TestSuitePage } from './pages/TestSuitePage.tsx';
import { DocsViewerPage } from './pages/DocsViewerPage.tsx';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [activeRole, setActiveRole] = useState<UserRole>('public');

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Automatically adjust perspective to fit destination if helpful
      if (path.startsWith('/contractor')) {
        setActiveRole('contractor');
      } else if (path.startsWith('/vendor')) {
        setActiveRole('vendor');
      } else if (path.startsWith('/admin')) {
        setActiveRole('admin');
      } else if (path === '/get-a-quote') {
        setActiveRole('public');
      }
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
  };

  const renderCurrentPage = () => {
    if(currentPath==='/reset-password')return <PasswordRecovery reset/>;
    if (currentPath === '/get-a-quote') {
      return <GetAQuotePage onNavigate={navigate} />;
    }
    if (currentPath.startsWith('/contractor')) {
      return <ContractorPage onNavigate={navigate} />;
    }
    if (currentPath.startsWith('/vendor')) {
      return <VendorPage onNavigate={navigate} />;
    }
    if (currentPath.startsWith('/admin')) {
      return <AdminPage onNavigate={navigate} />;
    }
    if (currentPath === '/test-suite') {
      return <TestSuitePage onNavigate={navigate} />;
    }
    if (currentPath === '/docs') {
      return <DocsViewerPage onNavigate={navigate} />;
    }
    return <HomePage onNavigate={navigate} />;
  };

  return (
    <ToastProvider>
      <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
        <Header
          currentPath={currentPath}
          onNavigate={navigate}
          activeRole={activeRole}
          onRoleChange={handleRoleChange}
        />

        <main className="flex-1">
          {renderCurrentPage()}
        </main>

        <Footer onNavigate={navigate} />
      </div>
    </ToastProvider>
  );
}
