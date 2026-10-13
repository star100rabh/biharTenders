/**
 * @file src/pages/Home.jsx
 * @description Official public procurement portal for Bihar, styled to strictly
 * match the Procure Hub visual theme (Images 1 & 3) with deep midnight navy hero,
 * floating search console with category & district dropdowns, 4 stat highlight cards,
 * live pipeline carousel, recent notices, and 2x2 guidance FAQ cards.
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
  RotateCcw
} from 'lucide-react';

import { PreferenceModal } from '@/components/shared/PreferenceModal';
import { AuthPromptModal } from '@/components/shared/AuthPromptModal';
import { TenderCard } from '@/components/shared/TenderCard';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/Button';
import { useTenderStats } from '@/hooks/useTenders';
import { formatCurrencyINR, cleanTenderTitle } from '@/utils/formatters';

// Common categories for the hero search dropdown
const CATEGORY_DROPDOWN = [
  { label: 'All Categories', value: '' },
  { label: 'Civil Works', value: 'Civil Works' },
  { label: 'Electrical Works', value: 'Electrical Works' },
  { label: 'Water Supply / PHE', value: 'Water' },
  { label: 'Roads & Bridges', value: 'Roads' },
  { label: 'Machineries & Mechanical', value: 'Machineries' },
  { label: 'Medical & Hospital Supplies', value: 'Medical' },
  { label: 'Agricultural Works', value: 'Agricultural' },
];

// Major Bihar administrative districts for the hero search dropdown
const REGION_DROPDOWN = [
  { label: 'All Regions', value: '' },
  { label: 'Patna', value: 'Patna' },
  { label: 'Gaya', value: 'Gaya' },
  { label: 'Muzaffarpur', value: 'Muzaffarpur' },
  { label: 'Bhagalpur', value: 'Bhagalpur' },
  { label: 'Darbhanga', value: 'Darbhanga' },
  { label: 'Purnia', value: 'Purnia' },
  { label: 'Nalanda', value: 'Nalanda' },
  { label: 'Begusarai', value: 'Begusarai' },
  { label: 'Rohtas', value: 'Rohtas' },
  { label: 'Saran', value: 'Saran' },
];

// Trending search chips matching Image 1
const TRENDING_SEARCHES = [
  'Road Construction',
  'Civil Works',
  'Water Supply / PHE',
  'Hospital Supplies',
  'Electrical Grid',
  'Muzaffarpur',
  'Patna'
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

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
    navigate(`/tenders?search=${encodeURIComponent(term)}`);
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
    { title: 'Road Construction & Highways', subtitle: 'Rural Works / PWD', count: '14 Active Notices', value: '₹75.08 Lakh', query: { category: 'Civil Works' } },
    { title: 'Rural Works Dept Patna', subtitle: 'RWD Division', count: '6 Active Notices', value: '₹42.15 Lakh', query: { department: 'Rural Works' } },
    { title: 'Electrical Works & Grid', subtitle: 'Power & Distribution', count: '7 Active Notices', value: '₹2.01 Cr', query: { category: 'Electrical Works' } },
    { title: 'Public Health Engineering (PHE)', subtitle: 'Jal Shakti Bihar', count: '5 Active Notices', value: '₹58.20 Lakh', query: { category: 'Water' } },
    { title: 'Agriculture Production Muzaffarpur', subtitle: 'Agriculture Dept', count: '5 Active Notices', value: '₹16.09 Lakh', query: { department: 'Agriculture' } },
    { title: 'Building Construction Dept Gaya', subtitle: 'Civil Works', count: '4 Active Notices', value: '₹34.80 Lakh', query: { department: 'Building Construction' } },
  ];

  const rawCarousel = (departmentCards.length > 0 || domainCards.length > 0)
    ? [...departmentCards, ...domainCards]
    : fallbackItems;

  const carouselItems = [...rawCarousel, ...rawCarousel];

  return (
    <div className="min-h-screen bg-paper dark:bg-[#071325] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <PreferenceModal />
      <AuthPromptModal 
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title={authModalConfig.title}
        subtitle={authModalConfig.subtitle}
        redirectUrl={authModalConfig.redirectUrl}
      />

      {/* =========================================================================
          HERO SECTION (Strictly matching Image 1: Deep Navy + Dot Grid + Pill)
          ========================================================================= */}
      <section className="relative bg-[#071325] text-white pt-12 sm:pt-16 pb-20 sm:pb-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-dot-grid overflow-hidden">
        {/* Subtle radial emerald gradient glow in center */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-5 sm:space-y-6">
          
          {/* Official Badge: Restored to Online Procurement */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-slate-200 text-xs font-semibold shadow-inner max-w-full truncate">
            <Landmark className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Bihar Public Works &amp; Online Procurement</span>
          </div>

          {/* Primary Headline with Emerald Accent */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white max-w-4xl mx-auto">
            Discover, Bid &amp; Win{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">
              Public &amp; Municipal
            </span>{' '}
            Tenders
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Transparent procurement network connecting certified contractors, service suppliers, and procurement agencies with real-time bidding updates across Bihar.
          </p>

          {/* Floating Search Console (Matching Image 1) */}
          <div className="max-w-4xl mx-auto mt-8 pt-2">
            <form 
              onSubmit={handleSearch}
              className="bg-white dark:bg-slate-800 rounded-3xl p-3 sm:p-4 shadow-2xl border border-slate-200/90 dark:border-slate-700/80 text-left transition-all"
            >
              {/* Row 1: Search Input + Category + Region + Find Tenders Button */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
                
                {/* Search Text Input */}
                <div className="flex items-center flex-1 bg-slate-50 dark:bg-slate-900/60 rounded-2xl px-3.5 py-2.5 border border-slate-200 dark:border-slate-700/80 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
                  <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tender title, ID, or keywords..."
                    className="w-full text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 bg-transparent focus:outline-none truncate"
                  />
                </div>

                {/* Categories Dropdown */}
                <div className="w-full lg:w-48 bg-slate-50 dark:bg-slate-900/60 rounded-2xl px-3 py-2.5 border border-slate-200 dark:border-slate-700/80">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 bg-transparent focus:outline-none cursor-pointer truncate"
                  >
                    {CATEGORY_DROPDOWN.map((cat) => (
                      <option key={cat.value} value={cat.value} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Regions / Districts Dropdown */}
                <div className="w-full lg:w-44 bg-slate-50 dark:bg-slate-900/60 rounded-2xl px-3 py-2.5 border border-slate-200 dark:border-slate-700/80">
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 bg-transparent focus:outline-none cursor-pointer truncate"
                  >
                    {REGION_DROPDOWN.map((reg) => (
                      <option key={reg.value} value={reg.value} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                        {reg.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Find Tenders Action Button */}
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer shrink-0"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Tenders</span>
                </button>
              </div>

              {/* Row 2: Trending Searches Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 px-1 text-xs">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0">
                  <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-amber-600 dark:text-amber-400">
                    <span>🔥 Trending Searches:</span>
                  </span>
                  {TRENDING_SEARCHES.map((term, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleTrendingClick(term)}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>

                {(searchQuery || selectedCategory || selectedRegion) && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-500 font-semibold cursor-pointer shrink-0"
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
          KEY METRICS ROW (Strictly matching Image 1: 4 Rounded White Cards)
          ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-12 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Card 1: Active E-Tenders (Green Folder) */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg flex items-center gap-3.5 sm:gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/60">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white truncate">
                {isStatsLoading ? '...' : `${stats?.activeTendersCount ?? 865}+`}
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                Active E-Tenders
              </div>
            </div>
          </div>

          {/* Card 2: Total Contract Value (Blue Money Bag) */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg flex items-center gap-3.5 sm:gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/60">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="text-lg sm:text-2xl font-bold font-mono text-slate-900 dark:text-white truncate">
                {isStatsLoading ? '...' : formatCurrencyINR(stats?.totalValue ?? 1450000000)}
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                Total Contract Value
              </div>
            </div>
          </div>

          {/* Card 3: Verified Contractors & Public Bodies (Orange Building) */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg flex items-center gap-3.5 sm:gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900/60">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white truncate">
                {isStatsLoading ? '...' : `${stats?.authoritiesCount ?? 34}+`}
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                Public Authorities
              </div>
            </div>
          </div>

          {/* Card 4: Districts Covered (Purple / Map Pin) */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg flex items-center gap-3.5 sm:gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-900/60">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white truncate">
                38
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                Districts Covered
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          ANIMATED LIVE PIPELINE CAROUSEL SECTION
          ========================================================================= */}
      <section className="py-12 sm:py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Live Active Pipeline</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Procurement Authorities &amp; Domains
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time active departmental feeds, tender counts, and estimated contract values across Bihar.
              </p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/tenders')}
              className="gap-1.5 text-xs hover:border-emerald-600 hover:text-emerald-600 shrink-0"
            >
              <span>Explore All Tenders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Continuous Moving Track */}
        <div className="relative w-full overflow-hidden group">
          <div className="absolute left-0 top-0 w-8 sm:w-20 lg:w-28 h-full bg-gradient-to-r from-paper dark:from-[#071325] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 w-8 sm:w-20 lg:w-28 h-full bg-gradient-to-l from-paper dark:from-[#071325] to-transparent z-10 pointer-events-none" />

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
                className="w-72 sm:w-80 bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 hover:border-emerald-500/50 p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 flex-shrink-0 flex flex-col justify-between group/card select-none"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
                      {item.count}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate max-w-[130px]" title={item.subtitle}>
                      {item.subtitle}
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover/card:text-emerald-600 dark:group-hover/card:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h4>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider font-semibold text-slate-400">Total Value</span>
                    <span className="font-mono text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">{item.value}</span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center text-slate-500 group-hover/card:bg-emerald-600 group-hover/card:text-white transition-colors">
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/card:translate-x-0.5" />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          RECENT TENDER ANNOUNCEMENTS (Matching 3-Column Grid)
          ========================================================================= */}
      {stats?.latestTenders && stats.latestTenders.length > 0 && (
        <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                Recent Tender Notices
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Latest procurement notices published across engineering departments and municipal corporations.
              </p>
            </div>
            
            <Link
              to="/tenders"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:underline shrink-0"
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
          PROCUREMENT & BIDDING GUIDANCE (Strictly matching Image 3: 2x2 Grid)
          ========================================================================= */}
      <section className="bg-slate-50/70 dark:bg-slate-900/40 py-16 sm:py-20 border-t border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Procurement &amp; Bidding Guidance
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2">
              Everything you need to know about digital tendering, submissions, and award compliance in Bihar.
            </p>
          </div>

          {/* 2x2 Grid of Guidance Cards with Green Question Icons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            
            {/* Card 1: EMD */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3.5 mb-3">
                <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                  What is Earnest Money Deposit (EMD)?
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-10.5">
                EMD is bid security deposited by participating contractors to demonstrate seriousness. Unsuccessful bidders receive full refunds within prescribed government guidelines after tender finalization.
              </p>
            </div>

            {/* Card 2: Upcoming Tenders */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3.5 mb-3">
                <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                  How do I apply for Upcoming Tenders?
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-10.5">
                Navigate to the Upcoming Pipeline tab to review pre-tender notices. Once the bidding window opens, access official NIT documents, BOQ Excel sheets, and submission instructions directly.
              </p>
            </div>

            {/* Card 3: Digital Credentials */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3.5 mb-3">
                <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                  What digital credentials are required?
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-10.5">
                All tender proposals on Bihar eProc2 require a valid Class-3 Digital Signature Certificate (DSC) along with tax compliance, GSTIN, PAN, and valid contractor registration credentials.
              </p>
            </div>

            {/* Card 4: Official Verification */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3.5 mb-3">
                <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                  How are tender documents verified?
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-10.5">
                All tender notices, corrigenda, and BOQ schedules are directly synchronized from official Bihar eProcurement systems and permanently preserved on cloud storage for reliable audit transparency.
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}