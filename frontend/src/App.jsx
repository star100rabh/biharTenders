/**
 * @file src/App.jsx
 * @description Top-level component establishing the application layout shell and route definitions.
 */
import { useEffect } from 'react';
import TenderDetails from './pages/TenderDetails';
import { Routes, Route } from 'react-router-dom';

// Layout Components
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ScrollToTop } from './components/layout/ScrollToTop';

// Pages
import Home from './pages/Home';
import Tenders from './pages/Tenders';
import Profile from './pages/Profile';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import CheckScore from './pages/CheckScore';
import Services from './pages/Services';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import RefundPolicy from './pages/RefundPolicy';
import { useAuthStore } from './store/useAuthStore';

import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { PatliputraWatermark } from './components/layout/PatliputraWatermark';

export default function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  // Validate session on application launch
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="relative flex flex-col min-h-screen bg-[#FAF8F5] dark:bg-[#0D1117] text-[#1D3557] dark:text-[#E2E8F0] w-full max-w-[100vw] overflow-x-hidden transition-colors duration-200">
      {/* Anchored static architectural watermark layer (Foreground content scrolls smoothly over it) */}
      <PatliputraWatermark />

      <div className="relative z-10 flex flex-col min-h-screen">
        <ScrollToTop />
        <Navbar />

        {/* Main content area grows to push the footer to the bottom */}
        <main className="flex-1 flex flex-col">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tenders" element={<Tenders />} />
            <Route path="/check-score" element={<CheckScore />} />
            <Route path="/check-score/:tenderId" element={<CheckScore />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:tenderId" element={<Services />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login defaultMode="login" />} />
            <Route path="/signup" element={<Login defaultMode="signup" />} />
            <Route path="/tenders/:id" element={<TenderDetails />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
          </Routes>
        </ErrorBoundary>
      </main>

      <Footer />
      </div>
    </div>
  );
}