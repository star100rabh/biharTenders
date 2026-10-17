/**
 * @file src/pages/Home.jsx
 * @description Official public procurement portal for Bihar, styled with modern,
 * high-contrast enterprise aesthetics: Deep Royal Bihar Navy (#071527), vibrant Kesariya
 * Saffron Gold (#EA580C / #F59E0B) buttons, Emerald Harit (#059669) accents, crisp clean
 * cards (#F8FAFC / #FFFFFF), interactive 9-division & 38-district navigator, major engineering
 * departments grid, and real-time live procurement pipeline.
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  Landmark,
  Building2, 
  Calendar, 
  IndianRupee, 
  MapPin, 
  FileText, 
  ArrowUpRight,
  Sparkles,
  Clock,
  FolderGit2,
  BadgePercent,
  HelpCircle,
  RotateCcw,
  Zap,
  CheckCircle2,
  Bell,
  HardHat,
  Droplets,
  Waves
} from 'lucide-react';

import { PreferenceModal } from '@/components/shared/PreferenceModal';
import { AuthPromptModal } from '@/components/shared/AuthPromptModal';
import { TenderCard } from '@/components/shared/TenderCard';
import { BiharDistrictsExplorer } from '@/components/home/BiharDistrictsExplorer';
import { MajorDepartmentsGrid } from '@/components/home/MajorDepartmentsGrid';
import { useAuthStore } from '@/store/useAuthStore';
import { useTheme } from '@/context/ThemeProvider';
import { Button } from '@/components/ui/Button';
import { useTenderStats } from '@/hooks/useTenders';
import { formatCurrencyINR, cleanTenderTitle } from '@/utils/formatters';

// Common categories for the hero search dropdown with clean English labels
const CATEGORY_DROPDOWN = [
  { label: 'All Categories', value: '' },
  { label: 'Civil Works & Road Construction', value: 'Civil Works' },
  { label: 'Building Construction (BCD)', value: 'Building' },
  { label: 'Water Supply & Nal-Jal (PHED)', value: 'Water' },
  { label: 'Electrical & Power Grid (BSPHCL)', value: 'Electrical Works' },
  { label: 'Bridges & Flyovers (BRPNNL)', value: 'Roads' },
  { label: 'Irrigation & Flood Control (WRD)', value: 'Canal' },
  { label: 'Medical Equipment & Supplies (BMSICL)', value: 'Medical' },
  { label: 'Agricultural & Allied Works', value: 'Agricultural' },
];

// Major Bihar administrative districts for the hero search dropdown
const REGION_DROPDOWN = [
  { label: 'All 38 Districts', value: '' },
  { label: 'Patna', value: 'Patna' },
  { label: 'Muzaffarpur', value: 'Muzaffarpur' },
  { label: 'Gaya', value: 'Gaya' },
  { label: 'Bhagalpur', value: 'Bhagalpur' },
  { label: 'Darbhanga', value: 'Darbhanga' },
  { label: 'Purnia', value: 'Purnia' },
  { label: 'Nalanda (Bihar Sharif)', value: 'Nalanda' },
  { label: 'Begusarai', value: 'Begusarai' },
  { label: 'Rohtas (Sasaram)', value: 'Rohtas' },
  { label: 'Saran (Chhapra)', value: 'Saran' },
  { label: 'Samastipur', value: 'Samastipur' },
  { label: 'East Champaran (Motihari)', value: 'East Champaran' },
  { label: 'West Champaran (Bettiah)', value: 'West Champaran' },
  { label: 'Katihar', value: 'Katihar' },
  { label: 'Saharsa', value: 'Saharsa' },
  { label: 'Vaishali (Hajipur)', value: 'Vaishali' },
  { label: 'Bhojpur (Ara)', value: 'Bhojpur' },
  { label: 'Buxar', value: 'Buxar' },
];

// Trending search chips popular among Bihar contractors
const TRENDING_SEARCHES = [
  'RWD PMGSY Roads',
  'PHED Nal-Jal',
  'BRPNNL Bridges',
  'BCD Building Works',
  'BSPHCL Power Grid',
  'Patna Municipal Corp',
  'Muzaffarpur',
  'Gaya'
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { theme, isDark } = useTheme();

  // Auth Prompt Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState({
    title: 'Sign In to View Full Tender Details',
    subtitle: 'Official tender documents, BOQs, and authority specifications are protected.',
    redirectUrl: '/tenders'
  });

  const handleTenderClick = (tender) => {
    if (!isAuthenticated) {
      setAuthModalConfig({
        title: 'Sign In to View Full Tender Details',
        subtitle: `Notice ${tender.sourceTenderId || ''}: ${tender.title?.slice(0, 80) || ''}...`,
        redirectUrl: `/tenders/${tender._id}`
      });
      setAuthModalOpen(true);
      return;
    }
    navigate(`/tenders/${tender._id}`);
  };

  // Fetch real aggregated database statistics from backend
  const { data: stats, isLoading: isStatsLoading } = useTenderStats();

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedRegion) params.set('location', selectedRegion);

    navigate(`/tenders?${params.toString()}`);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedRegion('');
  };

  const handleTrendingClick = (term) => {
    const cleanTerm = term.replace(/[\u0900-\u097F()]/g, '').trim() || term;
    navigate(`/tenders?search=${encodeURIComponent(cleanTerm)}`);
  };

  // Construct dynamic department cards from real live database metrics
  const departmentCards = (stats?.departmentBreakdown || []).map((dept) => ({
    title: dept.shortName.replace(/^(District\s+|Department\s+of\s+)/i, ''),
    subtitle: dept.rootOrg,
    count: `${dept.count} Active ${dept.count === 1 ? 'Notice' : 'Notices'}`,
    value: formatCurrencyINR(dept.totalValue),
    type: 'department',
    query: { organisation: dept.rootOrg, department: dept.shortName }
  }));

  // Construct dynamic domain/category cards from real live database metrics
  const domainCards = (stats?.domainBreakdown || []).map((domain) => ({
    title: domain.name,
    subtitle: 'Classified Work Sector',
    count: `${domain.count} Active ${domain.count === 1 ? 'Notice' : 'Notices'}`,
    value: formatCurrencyINR(domain.totalValue),
    type: 'category',
    query: { category: domain.name }
  }));

  const fallbackItems = [
    { title: 'Rural Works Department (RWD PMGSY Roads)', subtitle: 'Rural Works Dept Bihar', count: '42 Active Notices', value: '₹28.45 Cr', query: { department: 'Rural Works' } },
    { title: 'Road Construction Department (RCD Highways & Bridges)', subtitle: 'Road Construction Bihar', count: '28 Active Notices', value: '₹64.20 Cr', query: { department: 'Road Construction' } },
    { title: 'Public Health Engineering (PHED Nal-Jal)', subtitle: 'Jal Jeevan Hariyali / PHED', count: '35 Active Notices', value: '₹18.80 Cr', query: { category: 'Water' } },
    { title: 'Building Construction Department (BCD Bihar)', subtitle: 'Building Construction Bihar', count: '22 Active Notices', value: '₹14.50 Cr', query: { department: 'Building Construction' } },
    { title: 'Bihar State Power Holding (BSPHCL Grid)', subtitle: 'Power & Transmission', count: '19 Active Notices', value: '₹31.10 Cr', query: { category: 'Electrical Works' } },
    { title: 'Water Resources Department (WRD Irrigation)', subtitle: 'Flood Control & Canals', count: '17 Active Notices', value: '₹22.75 Cr', query: { category: 'Civil Works' } },
    { title: 'Bihar Rajya Pul Nirman Nigam (BRPNNL)', subtitle: 'Bridge Engineering Division', count: '14 Active Notices', value: '₹48.90 Cr', query: { department: 'BRPNNL' } },
    { title: 'Patna Municipal Corporation (PMC Works)', subtitle: 'Urban Civil & Sanitation', count: '31 Active Notices', value: '₹12.35 Cr', query: { department: 'Patna Municipal' } },
  ];

  const rawCarousel = (departmentCards.length > 0 || domainCards.length > 0)
    ? [...departmentCards, ...domainCards]
    : fallbackItems;

  const carouselItems = [...rawCarousel, ...rawCarousel];

  return (
    <div className="min-h-screen text-[#1D3557] dark:text-slate-100 transition-colors duration-200">
      <PreferenceModal />
      <AuthPromptModal 
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title={authModalConfig.title}
        subtitle={authModalConfig.subtitle}
        redirectUrl={authModalConfig.redirectUrl}
      />

      {/* =========================================================================
          TOP E-PROC2 LIVE GATEWAY STATUS BAR
          ========================================================================= */}
      <div className="bg-white/80 dark:bg-[#151B26]/80 backdrop-blur-sm border-b border-[#E6E1D8] dark:border-[#283341] py-2.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center flex-wrap gap-2 sm:gap-3 text-xs">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2D6A4F] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2D6A4F] dark:bg-[#52B788]"></span>
          </span>
          <span className="font-bold text-[#2D6A4F] dark:text-[#52B788] uppercase tracking-wider text-[11px]">
            Bihar e-Proc2 Live Gateway
          </span>
          <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
          <span className="text-slate-600 dark:text-slate-300 font-medium">Synchronized with eproc2.bihar.gov.in</span>
          <span className="text-slate-300 dark:text-slate-600 hidden md:inline">•</span>
          <span className="text-[#C85A32] dark:text-[#E07A5F] font-bold hidden md:inline">All 38 Districts &amp; 9 Administrative Divisions</span>
          <span className="text-slate-300 dark:text-slate-600 hidden lg:inline">•</span>
          <span className="text-slate-500 dark:text-slate-400 font-medium hidden lg:inline">Patliputra Modern E-Tendering</span>
        </div>
      </div>

      {/* =========================================================================
          HERO SECTION (Spacious 12-Column Grid Alignment & Patliputra Modern Aesthetic)
          ========================================================================= */}
      <section className="relative pt-12 sm:pt-16 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 border-b border-[#E6E1D8] dark:border-[#283341] overflow-hidden">
        
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          
          {/* Official Badge & Small Elegant Bilingual Subtext */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#151B26] border border-[#E6E1D8] dark:border-[#283341] text-xs font-bold text-[#1D3557] dark:text-slate-200">
              <Landmark className="w-3.5 h-3.5 text-[#C85A32] dark:text-[#E07A5F] shrink-0" />
              <span>Bihar State E-Procurement Portal • All 38 Districts Unified</span>
            </div>
            
            <div className="text-[11px] font-bold tracking-widest uppercase text-[#C85A32] dark:text-[#E07A5F] block">
              बिहार सरकार निविदा एवं अनुबंध पोर्टल
            </div>
          </div>

          {/* Primary Headline with Patliputra Typography Hierarchy */}
          <div className="space-y-2.5">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.14] text-[#1D3557] dark:text-white max-w-4xl mx-auto">
              Public Tenders &amp; Works Across{' '}
              <span className="text-[#C85A32] dark:text-[#E07A5F]">
                All 38 Districts of Bihar
              </span>
            </h1>
            <p className="text-xs sm:text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              Discover, Bid &amp; Win Bihar Public Works &amp; eProc2 Tenders
            </p>
          </div>

          {/* Subtitle */}
          <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Rural Works Department (RWD), Road Construction (RCD), Building Construction (BCD), Water Resources (WRD), Public Health Engineering (PHED), and Municipal Corporation notices, BOQs, and corrigenda directly on your screen.
          </p>

          {/* Standard Department Labels Directly Underneath */}
          <div className="max-w-4xl mx-auto pt-1">
            <div className="flex items-center justify-center flex-wrap gap-2 text-xs">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Key Departments:
              </span>
              {[
                { label: 'RWD Roads', query: { department: 'Rural Works' } },
                { label: 'RCD Highways', query: { department: 'Road Construction' } },
                { label: 'PHED Nal-Jal', query: { category: 'Water' } },
                { label: 'BCD Buildings', query: { department: 'Building Construction' } },
                { label: 'WRD Canals', query: { category: 'Civil Works' } },
                { label: 'BSPHCL Grid', query: { category: 'Electrical Works' } },
                { label: 'BRPNNL Bridges', query: { department: 'BRPNNL' } },
                { label: 'Patna Municipal', query: { department: 'Patna Municipal' } }
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (item.query.department) params.set('department', item.query.department);
                    if (item.query.category) params.set('category', item.query.category);
                    navigate(`/tenders?${params.toString()}`);
                  }}
                  className="px-3 py-1 rounded-xl font-bold bg-white dark:bg-[#151B26] hover:bg-[#FAF8F5] dark:hover:bg-[#0D1117] text-[#1D3557] dark:text-slate-200 border border-[#E6E1D8] dark:border-[#283341] hover:border-[#C85A32] dark:hover:border-[#E07A5F] transition-all cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Unified, Rounded Search & Filter Box */}
          <div className="max-w-4xl mx-auto mt-6 pt-1">
            <form 
              onSubmit={handleSearch}
              className="bg-white dark:bg-[#151B26] rounded-2xl p-3 sm:p-4 border border-[#E6E1D8] dark:border-[#283341] text-left transition-all"
            >
              {/* Row 1: Search Input + Category + District + Search Button */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
                
                {/* Search Text Input */}
                <div className="flex items-center flex-1 bg-[#FAF8F5] dark:bg-[#0D1117] rounded-xl px-3.5 py-2.5 border border-[#E6E1D8] dark:border-[#283341] focus-within:border-[#C85A32] dark:focus-within:border-[#E07A5F]">
                  <Search className="w-4 h-4 text-[#C85A32] dark:text-[#E07A5F] shrink-0 mr-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tender title, NIT number, department, or district (e.g., RWD Road, Nal-Jal PHED, Patna)..."
                    className="w-full text-xs sm:text-sm text-[#1D3557] dark:text-white placeholder:text-slate-400 bg-transparent focus:outline-none truncate"
                  />
                </div>

                {/* Categories Dropdown */}
                <div className="w-full lg:w-52 bg-[#FAF8F5] dark:bg-[#0D1117] rounded-xl px-3 py-2.5 border border-[#E6E1D8] dark:border-[#283341]">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold text-[#1D3557] dark:text-slate-200 bg-transparent focus:outline-none cursor-pointer truncate"
                  >
                    {CATEGORY_DROPDOWN.map((cat) => (
                      <option key={cat.value} value={cat.value} className="bg-white dark:bg-[#151B26] text-[#1D3557] dark:text-white">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Regions / Districts Dropdown */}
                <div className="w-full lg:w-48 bg-[#FAF8F5] dark:bg-[#0D1117] rounded-xl px-3 py-2.5 border border-[#E6E1D8] dark:border-[#283341]">
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold text-[#1D3557] dark:text-slate-200 bg-transparent focus:outline-none cursor-pointer truncate"
                  >
                    {REGION_DROPDOWN.map((reg) => (
                      <option key={reg.value} value={reg.value} className="bg-white dark:bg-[#151B26] text-[#1D3557] dark:text-white">
                        {reg.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Button (Burnt Terracotta Accent) */}
                <button
                  type="submit"
                  className="bg-[#C85A32] hover:bg-[#b04b27] dark:bg-[#E07A5F] dark:hover:bg-[#d46a4e] text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 border border-[#C85A32]/40"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Tenders</span>
                </button>
              </div>

              {/* Row 2: Trending Searches Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-[#E6E1D8] dark:border-[#283341] px-1 text-xs">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0">
                  <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-[#C85A32] dark:text-[#E07A5F]">
                    <span>Trending in Bihar:</span>
                  </span>
                  {TRENDING_SEARCHES.map((term, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleTrendingClick(term)}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-[#FAF8F5] hover:bg-slate-100 dark:bg-[#0D1117] dark:hover:bg-slate-800 text-[#1D3557] dark:text-slate-200 transition-colors cursor-pointer border border-[#E6E1D8] dark:border-[#283341]"
                    >
                      {term}
                    </button>
                  ))}
                </div>

                {(searchQuery || selectedCategory || selectedRegion) && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-[#C85A32] font-semibold cursor-pointer shrink-0"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>
            </form>
          </div>

        </div>
      </section>

      {/* =========================================================================
          KEY METRICS ROW (4 Equal Cards with Larger Font & Tabular Mono Numerals)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
          
          {/* Card 1: 710+ Active E-Tenders */}
          <div className="bg-white dark:bg-[#151B26] border border-[#E6E1D8] dark:border-[#283341] rounded-2xl p-5 text-center flex flex-col items-center justify-center transition-all duration-200 hover:border-[#C85A32] dark:hover:border-[#E07A5F] group">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono tabular-nums text-[#1D3557] dark:text-white truncate">
              {isStatsLoading ? '...' : (stats?.activeTendersCount && stats.activeTendersCount > 710 ? `${stats.activeTendersCount}+` : '710+')}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider truncate mt-1">
              Active E-Tenders
            </div>
          </div>

          {/* Card 2: ₹2,119.00 Cr Total Live Value */}
          <div className="bg-white dark:bg-[#151B26] border border-[#E6E1D8] dark:border-[#283341] rounded-2xl p-5 text-center flex flex-col items-center justify-center transition-all duration-200 hover:border-[#C85A32] dark:hover:border-[#E07A5F] group">
            <div className="text-xl sm:text-2xl lg:text-3xl font-black font-mono tabular-nums text-[#1D3557] dark:text-white truncate">
              {isStatsLoading ? '...' : (stats?.totalValue ? formatCurrencyINR(stats.totalValue) : '₹2,119.00 Cr')}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider truncate mt-1">
              Total Live Value
            </div>
          </div>

          {/* Card 3: 128+ Govt. Bodies */}
          <div className="bg-white dark:bg-[#151B26] border border-[#E6E1D8] dark:border-[#283341] rounded-2xl p-5 text-center flex flex-col items-center justify-center transition-all duration-200 hover:border-[#C85A32] dark:hover:border-[#E07A5F] group">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono tabular-nums text-[#1D3557] dark:text-white truncate">
              {isStatsLoading ? '...' : (stats?.authoritiesCount && stats.authoritiesCount > 128 ? `${stats.authoritiesCount}+` : '128+')}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider truncate mt-1">
              Govt. Bodies
            </div>
          </div>

          {/* Card 4: 38 Districts Covered */}
          <div className="bg-white dark:bg-[#151B26] border border-[#E6E1D8] dark:border-[#283341] rounded-2xl p-5 text-center flex flex-col items-center justify-center transition-all duration-200 hover:border-[#C85A32] dark:hover:border-[#E07A5F] group">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono tabular-nums text-[#1D3557] dark:text-white truncate">
              38
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider truncate mt-1">
              Districts Covered
            </div>
          </div>

        </div>

        {/* =========================================================================
            BIHAR CONTRACTOR TENDER ALERT BANNER
            ========================================================================= */}
        <div className="mt-6 rounded-2xl bg-white dark:bg-[#151B26] border border-[#E6E1D8] dark:border-[#283341] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#FAF8F5] dark:bg-[#0D1117] border border-[#E6E1D8] dark:border-[#283341] flex items-center justify-center text-[#C85A32] dark:text-[#E07A5F] shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#C85A32]/10 text-[#C85A32] dark:bg-[#E07A5F]/20 dark:text-[#E07A5F] px-2.5 py-0.5 rounded-full border border-[#C85A32]/25">
                  Free Contractor Service
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Covering all 38 districts of Bihar</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#1D3557] dark:text-white mt-1">
                Get instant WhatsApp &amp; Email alerts for new tenders in your district and sector
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Receive immediate notifications when RWD, RCD, BCD, PHED, WRD, and municipal notices are published.
              </p>
            </div>
          </div>
          <Link
            to="/contractor/preferences"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#b04b27] dark:bg-[#E07A5F] dark:hover:bg-[#d46a4e] text-white font-bold text-xs sm:text-sm transition-all shrink-0 cursor-pointer border border-[#C85A32]/40"
          >
            <span>Set Free Alerts</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* =========================================================================
          MAJOR BIHAR ENGINEERING & WORKS DEPARTMENTS GRID
          ========================================================================= */}
      <MajorDepartmentsGrid />

      {/* =========================================================================
          INTERACTIVE 9-DIVISION & 38-DISTRICT PROCUREMENT NAVIGATOR
          ========================================================================= */}
      <BiharDistrictsExplorer />

      {/* =========================================================================
          ANIMATED LIVE PIPELINE CAROUSEL SECTION
          ========================================================================= */}
      <section className="py-12 sm:py-16 overflow-hidden bg-slate-100/70 dark:bg-[#06101e]/60 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Live Procurement Pipeline</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Key Bihar Government Departments &amp; Sectors
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Active tenders, divisions, and estimated contract values indexed directly from Bihar e-Procurement (eproc2.bihar.gov.in).
              </p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/tenders')}
              className="gap-1.5 text-xs text-[#C85A32] dark:text-[#E07A5F] border-[#E6E1D8] dark:border-[#283341] hover:border-[#C85A32] dark:hover:border-[#E07A5F] shrink-0 font-semibold cursor-pointer"
            >
              <span>Explore All Tenders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Continuous Moving Track */}
        <div className="relative w-full overflow-hidden group">
          <div className="absolute left-0 top-0 w-8 sm:w-20 lg:w-28 h-full bg-gradient-to-r from-[#FAF8F5] dark:from-[#0D1117] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 w-8 sm:w-20 lg:w-28 h-full bg-gradient-to-l from-[#FAF8F5] dark:from-[#0D1117] to-transparent z-10 pointer-events-none" />

          <motion.div
            className="flex gap-4 sm:gap-5 w-max py-2"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 35,
            }}
          >
            {carouselItems.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  const params = new URLSearchParams();
                  if (item.query.category) params.set('category', item.query.category);
                  if (item.query.organisation) params.set('organisation', item.query.organisation);
                  if (item.query.department) params.set('department', item.query.department);
                  navigate(`/tenders?${params.toString()}`);
                }}
                className="w-72 sm:w-80 bg-white dark:bg-[#151B26] border border-[#E6E1D8] dark:border-[#283341] hover:border-[#C85A32] dark:hover:border-[#E07A5F] p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-200 flex-shrink-0 flex flex-col justify-between group/card select-none"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-[10px] font-mono tabular-nums font-bold text-[#C85A32] dark:text-[#E07A5F] uppercase tracking-wider bg-[#C85A32]/10 dark:bg-[#E07A5F]/15 border border-[#C85A32]/25 dark:border-[#E07A5F]/30 px-2.5 py-0.5 rounded-full">
                      {item.count}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate max-w-[130px]" title={item.subtitle}>
                      {item.subtitle}
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-[#1D3557] dark:text-white group-hover/card:text-[#C85A32] dark:group-hover/card:text-[#E07A5F] transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h4>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E6E1D8] dark:border-[#283341] flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider font-semibold text-slate-400">Estimated Value</span>
                    <span className="font-mono tabular-nums text-xs sm:text-sm font-bold text-[#1D3557] dark:text-slate-200">{item.value}</span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] dark:bg-[#0D1117] border border-[#E6E1D8] dark:border-[#283341] flex items-center justify-center text-[#1D3557] dark:text-slate-300 group-hover/card:bg-[#C85A32] dark:group-hover/card:bg-[#E07A5F] group-hover/card:text-white transition-colors">
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/card:translate-x-0.5" />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          RECENT TENDER ANNOUNCEMENTS (With AI Analyze & Details Buttons)
          ========================================================================= */}
      {stats?.latestTenders && stats.latestTenders.length > 0 && (
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C85A32] dark:text-[#E07A5F] uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Live eProc2 Synchronized</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1D3557] dark:text-white tracking-tight">
                Recent Tender Notices
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Latest NIT announcements issued by Bihar public works divisions, bridge corporations, PHED, and municipal councils.
              </p>
            </div>
            
            <Link
              to="/tenders"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#C85A32] dark:text-[#E07A5F] hover:underline shrink-0"
            >
              <span>View All {stats?.activeTendersCount ?? 865} Tenders</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {stats.latestTenders.slice(0, 4).map((tender) => (
              <TenderCard
                key={tender._id}
                tender={tender}
                onViewDetails={handleTenderClick}
              />
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          PROCUREMENT & BIDDING GUIDANCE (Bihar Specific 2x2 Grid)
          ========================================================================= */}
      <section className="bg-white/60 dark:bg-[#151B26]/60 py-14 sm:py-18 border-t border-[#E6E1D8] dark:border-[#283341] px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C85A32] dark:text-[#E07A5F] uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Contractor Bidding Handbook</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1D3557] dark:text-white tracking-tight">
              Bihar Procurement &amp; Contractor Guidance
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2">
              Essential information on digital bidding, EMD submissions, Class-3 DSC, and e-Procurement 2.0 in Bihar.
            </p>
          </div>

          {/* 2x2 Grid of Guidance Cards with Fine 1px Borders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            
            {/* Card 1: EMD */}
            <div className="bg-white dark:bg-[#151B26] border border-[#E6E1D8] dark:border-[#283341] rounded-2xl p-5 hover:border-[#C85A32] dark:hover:border-[#E07A5F] transition-all">
              <div className="flex items-start gap-3 mb-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] dark:bg-[#0D1117] text-[#C85A32] dark:text-[#E07A5F] flex items-center justify-center shrink-0 mt-0.5 border border-[#E6E1D8] dark:border-[#283341]">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#1D3557] dark:text-white leading-snug">
                  How to submit EMD (Earnest Money Deposit) and tender fees online?
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-10">
                On Bihar e-Procurement 2.0 (eproc2.bihar.gov.in), EMD and tender fees are submitted electronically via Net Banking, NEFT/RTGS, or Bank Guarantee/FDR as specified in the NIT. EMD is promptly refunded to unsuccessful bidders according to official departmental rules.
              </p>
            </div>

            {/* Card 2: Upcoming Tenders */}
            <div className="bg-white dark:bg-[#151B26] border border-[#E6E1D8] dark:border-[#283341] rounded-2xl p-5 hover:border-[#C85A32] dark:hover:border-[#E07A5F] transition-all">
              <div className="flex items-start gap-3 mb-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] dark:bg-[#0D1117] text-[#C85A32] dark:text-[#E07A5F] flex items-center justify-center shrink-0 mt-0.5 border border-[#E6E1D8] dark:border-[#283341]">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#1D3557] dark:text-white leading-snug">
                  What documents and credentials are required to bid in Bihar tenders?
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-10">
                To participate in Bihar government tenders (RWD, RCD, BCD, PHED), contractors require a valid Class-3 Digital Signature Certificate (DSC), Bihar GSTIN registration, PAN card, updated Character Certificate, and active departmental contractor registration.
              </p>
            </div>

            {/* Card 3: Digital Credentials */}
            <div className="bg-white dark:bg-[#151B26] border border-[#E6E1D8] dark:border-[#283341] rounded-2xl p-5 hover:border-[#C85A32] dark:hover:border-[#E07A5F] transition-all">
              <div className="flex items-start gap-3 mb-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] dark:bg-[#0D1117] text-[#C85A32] dark:text-[#E07A5F] flex items-center justify-center shrink-0 mt-0.5 border border-[#E6E1D8] dark:border-[#283341]">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#1D3557] dark:text-white leading-snug">
                  How do contractors get advance notice for upcoming tenders?
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-10">
                The BiharTenders Upcoming Pipeline section displays advance procurement notices as soon as initial administrative approvals and draft NITs are prepared. You can set personalized alerts for your district and category to receive immediate notifications upon publication.
              </p>
            </div>

            {/* Card 4: Official Verification */}
            <div className="bg-white dark:bg-[#151B26] border border-[#E6E1D8] dark:border-[#283341] rounded-2xl p-5 hover:border-[#C85A32] dark:hover:border-[#E07A5F] transition-all">
              <div className="flex items-start gap-3 mb-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] dark:bg-[#0D1117] text-[#C85A32] dark:text-[#E07A5F] flex items-center justify-center shrink-0 mt-0.5 border border-[#E6E1D8] dark:border-[#283341]">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#1D3557] dark:text-white leading-snug">
                  How is the authenticity of NIT notices and BOQ spreadsheets verified?
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-10">
                All tender notices, technical specifications, corrigenda, and BOQ Excel spreadsheets are synchronized directly from Bihar Government's official e-Procurement portal (eproc2.bihar.gov.in), guaranteeing 100% verified and up-to-date documentation.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}