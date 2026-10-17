/**
 * @file src/components/layout/Navbar.jsx
 * @description Classical, human-crafted top navigation with reliable theme toggle,
 * clear institutional branding, and responsive mobile navigation.
 */
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Landmark, Heart, User, Menu, X, Sun, Moon, LogIn, LogOut, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { useBookmarkStore } from '@/store/useBookmarkStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTheme } from '@/context/ThemeProvider';

export function Navbar() {
  const location = useLocation();
  const { theme, toggleTheme, isDark } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Subscribe to global stores
  const savedTenders = useBookmarkStore((state) => state.savedTenders);
  const { user, isAuthenticated, isPro, logout } = useAuthStore();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Tenders', path: '/tenders' },
    { label: 'AI Services', path: '/services', isAi: true },
    { label: 'Check Score', path: '/check-score' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF8F5]/90 dark:bg-[#0D1117]/90 backdrop-blur-md border-b border-[#E6E1D8] dark:border-[#283341] text-[#1D3557] dark:text-slate-100 transition-colors duration-200">
      {/* Top Auspicious Cultural Double-Line Ribbon */}
      <div className="h-0.5 w-full bg-gradient-to-r from-[#C85A32] via-[#D97706] to-[#2D6A4F]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-17 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Left Side: Brand Identity & Desktop Navigation */}
        <div className="flex items-center gap-5 lg:gap-7 min-w-0">
          {/* Institutional Brand Identity with Bihar Monogram */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group focus:outline-none">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#C85A32] to-[#E07A5F] text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-all duration-200 border border-[#FAF8F5] dark:border-[#283341]">
              <Landmark className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-display font-black tracking-tight text-[#1D3557] dark:text-white leading-none">
                  Bihar<span className="text-[#C85A32] dark:text-[#E07A5F]">Tenders</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#C85A32]/10 text-[#C85A32] dark:bg-[#E07A5F]/20 dark:text-[#E07A5F] border border-[#C85A32]/30 hidden xs:inline-block">
                  EP-2
                </span>
                {(import.meta.env.VITE_TEST_MODE === 'true' || (typeof window !== 'undefined' && window.location.port === '5175')) && (
                  <span className="text-[9px] font-bold tracking-tight bg-purple-500/20 text-purple-700 dark:text-purple-300 px-1.5 py-0.2 rounded border border-purple-500/40 select-none">
                    TEST
                  </span>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-wider mt-0.5 hidden sm:block">
                बिहार सरकार निविदा एवं अनुबंध पोर्टल
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 focus:outline-none ${
                    isActive
                      ? 'bg-[#1D3557]/10 dark:bg-[#283341] text-[#1D3557] dark:text-[#7EA2D6] font-bold border border-[#E6E1D8] dark:border-[#283341]'
                      : 'text-slate-600 dark:text-slate-300 hover:text-[#1D3557] dark:hover:text-white hover:bg-[#FAF8F5]/80 dark:hover:bg-[#151B26] border border-transparent'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.isAi && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black tracking-widest bg-gradient-to-r from-[#C85A32] to-[#D97706] text-white">
                      AI
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side Action Center: Theme, Saved, Contractor Workspace & Sign In */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Light / Dark Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="h-9 px-2.5 rounded-xl border border-[#E6E1D8] dark:border-[#283341] bg-white dark:bg-[#151B26] hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all cursor-pointer focus:outline-none shrink-0"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle theme mode"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="text-[11px] font-mono hidden sm:inline">Dark</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#1D3557]" />
                <span className="text-[11px] font-mono hidden sm:inline">Light</span>
              </>
            )}
          </button>

          {/* Saved Tenders Bookmark Indicator */}
          <Link
            to="/profile"
            className="relative w-9 h-9 rounded-xl border border-[#E6E1D8] dark:border-[#283341] bg-white dark:bg-[#151B26] hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#2D6A4F] dark:hover:text-[#52B788] transition-all cursor-pointer focus:outline-none shrink-0"
            title="Saved Tenders"
            aria-label="Saved Tenders"
          >
            <Heart className="w-4 h-4" />
            {savedTenders.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#2D6A4F] dark:bg-[#52B788] text-white text-[9px] font-mono font-black flex items-center justify-center">
                {savedTenders.length}
              </span>
            )}
          </Link>

          {/* User Auth: Contractor Workspace / Sign In */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#E6E1D8] dark:border-[#283341] bg-white dark:bg-[#151B26] text-xs font-semibold text-[#1D3557] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shrink-0"
              >
                <User className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#52B788]" />
                <span>Contractor Workspace</span>
              </Link>

              {/* Circular Avatar */}
              <Link
                to="/profile"
                className={`relative w-9 h-9 rounded-full overflow-hidden shrink-0 flex items-center justify-center transition-all cursor-pointer ${
                  isPro
                    ? 'ring-2 ring-[#2D6A4F] dark:ring-[#52B788]'
                    : 'border border-[#E6E1D8] dark:border-[#283341]'
                }`}
                title={user?.name ? `${user.name} (${user.email || ''})` : user?.email || 'Contractor Workspace'}
              >
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name || 'User'}
                    className="w-9 h-9 rounded-full object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full text-xs font-bold bg-[#2D6A4F]/20 text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center shrink-0">
                    {(user?.name || user?.email || 'U')[0].toUpperCase()}
                  </div>
                )}
              </Link>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                title="Sign Out"
                className="w-9 h-9 rounded-xl border border-transparent hover:border-red-200 dark:hover:border-red-900/60 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer focus:outline-none shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-xl border border-[#E6E1D8] dark:border-[#283341] bg-white dark:bg-[#151B26] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-[#C85A32] transition-all"
              >
                <span>Sign In</span>
              </Link>

              <Link
                to="/profile"
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#C85A32] hover:bg-[#b04b27] dark:bg-[#E07A5F] dark:hover:bg-[#d46a4e] text-white text-xs font-bold shadow-xs transition-all cursor-pointer border border-[#C85A32]/40"
              >
                <User className="w-3.5 h-3.5" />
                <span>Contractor Workspace</span>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-9 h-9 rounded-xl border border-[#E6E1D8] dark:border-[#283341] bg-white dark:bg-[#151B26] flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-[#1D3557] dark:hover:text-white transition-colors focus:outline-none shrink-0"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-[#E6E1D8] dark:border-[#283341] bg-[#FAF8F5] dark:bg-[#0D1117] px-4 py-4 space-y-2 overflow-hidden text-[#1D3557] dark:text-slate-100"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`min-h-[42px] flex items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  location.pathname === link.path
                    ? 'bg-[#1D3557]/10 dark:bg-[#283341] text-[#1D3557] dark:text-[#7EA2D6] font-bold border border-[#E6E1D8] dark:border-[#283341]'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-2 border-t border-[#E6E1D8] dark:border-[#283341] space-y-2">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[42px] flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#C85A32] dark:bg-[#E07A5F]"
              >
                <User className="w-4 h-4 text-white shrink-0" />
                <span>Contractor Workspace</span>
              </Link>

              {isAuthenticated ? (
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#151B26] border border-[#E6E1D8] dark:border-[#283341] min-h-[44px]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {user?.picture ? (
                      <img
                        src={user.picture}
                        alt="Profile"
                        className="w-7 h-7 rounded-xl object-cover shrink-0 ring-1 ring-[#2D6A4F]"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-xl bg-[#2D6A4F]/20 text-[#2D6A4F] dark:text-[#52B788] text-xs font-bold flex items-center justify-center shrink-0">
                        {(user?.name || user?.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      {user?.name && (
                        <span className="text-xs font-semibold text-[#1D3557] dark:text-white truncate">
                          {user.name}
                        </span>
                      )}
                      <span className="text-[11px] font-medium text-slate-400 truncate">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1 cursor-pointer py-1 px-2 rounded-lg"
                  >
                    <LogOut className="w-3.5 h-3.5 shrink-0" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[42px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#1D3557] dark:text-slate-200 border border-[#E6E1D8] dark:border-[#283341] bg-white dark:bg-[#151B26]"
                  >
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[42px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#C85A32] dark:bg-[#E07A5F] text-white"
                  >
                    <span>Register</span>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}