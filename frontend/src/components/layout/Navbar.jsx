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
  const { isDark, toggleTheme } = useTheme();
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
    <header className="sticky top-0 z-40 w-full bg-[#071527]/95 dark:bg-[#071527]/95 backdrop-blur-md border-b border-orange-500/20 text-white transition-colors duration-200">
      {/* Top Auspicious Cultural Ribbon */}
      <div className="h-1 w-full bg-gradient-to-r from-orange-600 via-amber-500 to-emerald-600" />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 h-16 sm:h-17 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Left Side: Brand Identity & Desktop Navigation grouped together */}
        <div className="flex items-center gap-4 lg:gap-6 min-w-0">
          {/* Institutional Brand Identity with Bihar Saffron Badge */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group focus:outline-none">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-md shadow-orange-500/25 shrink-0 group-hover:scale-105 group-hover:from-orange-400 group-hover:to-amber-500 transition-all duration-200 border border-amber-300/40">
              <Landmark className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-display font-black tracking-tight text-white leading-none">
                  Bihar<span className="text-amber-400">Tenders</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 hidden xs:inline-block">
                  BIHAR
                </span>
                {(import.meta.env.VITE_TEST_MODE === 'true' || (typeof window !== 'undefined' && window.location.port === '5175')) && (
                  <span className="text-[9px] font-bold tracking-tight bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded-full border border-purple-500/40 select-none">
                    TEST
                  </span>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] text-amber-200/80 font-semibold tracking-wider mt-0.5 hidden sm:block">
                Bihar Government Tenders & e-Procurement Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1 focus:outline-none ${
                    isActive
                      ? 'bg-orange-600/20 text-amber-300 font-bold border border-orange-500/40 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.isAi && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black tracking-widest bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs">
                      AI
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side Action Center: Theme, Saved, Contractor Workspace & Sign In */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          
          {/* Light/Dark Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="w-8.5 h-8.5 rounded-xl border border-slate-700/80 bg-slate-800/60 hover:bg-slate-750 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer focus:outline-none"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-300" />
            )}
          </button>

          {/* Saved Tenders Bookmark Indicator */}
          <Link
            to="/profile"
            className="relative w-8.5 h-8.5 rounded-xl border border-slate-700/80 bg-slate-800/60 hover:bg-slate-750 hover:border-emerald-500/40 flex items-center justify-center text-slate-300 hover:text-emerald-400 transition-all cursor-pointer focus:outline-none"
            title="Saved Tenders"
            aria-label="Saved Tenders"
          >
            <Heart className="w-4 h-4" />
            {savedTenders.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-mono font-black flex items-center justify-center shadow-xs">
                {savedTenders.length}
              </span>
            )}
          </Link>

          {/* User Auth: Contractor Workspace / Sign In */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                to="/profile"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-700/80 transition-all"
              >
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>Contractor Workspace</span>
              </Link>

              {/* Circular Avatar */}
              <Link
                to="/profile"
                className={`relative w-8.5 h-8.5 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  isPro
                    ? 'ring-2 ring-emerald-400'
                    : 'border border-slate-700'
                }`}
                title={user?.name ? `${user.name} (${user.email || ''})` : user?.email || 'Contractor Workspace'}
              >
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name || 'User'}
                    className="w-full h-full rounded-xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl text-xs font-bold bg-emerald-600/30 text-emerald-300 flex items-center justify-center">
                    {(user?.name || user?.email || 'U')[0].toUpperCase()}
                  </div>
                )}
              </Link>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                title="Sign Out"
                className="w-8.5 h-8.5 rounded-xl border border-transparent hover:border-red-900/60 flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-all cursor-pointer focus:outline-none"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/signup"
                className="hidden sm:inline-flex items-center px-3.5 py-1.5 rounded-xl border border-amber-500/40 bg-slate-800/80 text-xs font-semibold text-amber-200 hover:text-white hover:border-amber-400 transition-all"
              >
                <span>Register</span>
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-orange-600/30 hover:shadow-orange-600/40 transition-all cursor-pointer border border-amber-300/30"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-8.5 h-8.5 rounded-xl border border-slate-700/80 bg-slate-800/60 flex items-center justify-center text-slate-300 hover:text-white transition-colors focus:outline-none"
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
            className="lg:hidden border-t border-slate-800 bg-[#071325] px-4 py-4 space-y-2 overflow-hidden text-white"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`min-h-[42px] flex items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  location.pathname === link.path
                    ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-2 border-t border-slate-800 space-y-2">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[42px] flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-800/60 border border-slate-700"
              >
                <User className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Contractor Workspace</span>
              </Link>

              {isAuthenticated ? (
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 min-h-[44px]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {user?.picture ? (
                      <img
                        src={user.picture}
                        alt="Profile"
                        className="w-7 h-7 rounded-xl object-cover shrink-0 ring-1 ring-slate-600"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-xl bg-emerald-600/30 text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">
                        {(user?.name || user?.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      {user?.name && (
                        <span className="text-xs font-semibold text-white truncate">
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
                    className="text-xs font-bold text-red-400 hover:underline flex items-center gap-1 cursor-pointer py-1 px-2 rounded-lg"
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
                    className="min-h-[42px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 border border-slate-700 bg-slate-800/80"
                  >
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[42px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950"
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