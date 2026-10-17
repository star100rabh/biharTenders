/**
 * @file src/pages/Tenders.jsx
 * @description Official public procurement directory for Bihar.
 * Features structured dropdown filters (Districts, Categories, Authorities, Divisions),
 * prominent interactive focus and selection states, and live notice analytics.
 */
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, 
  RotateCcw, 
  Filter, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Clock, 
  Archive, 
  CalendarX,
  CalendarClock,
  ArrowUpDown,
  MapPin,
  Layers,
  Building2,
  Calendar,
  X,
  Eye, 
  Sparkles,
  Briefcase,
  FileCheck,
  Lock
} from 'lucide-react';

import { useTenders } from '@/hooks/useTenders';
import { useDebounce } from '@/hooks/useDebounce';
import { TenderCard } from '@/components/shared/TenderCard';
import { AuthPromptModal } from '@/components/shared/AuthPromptModal';
import { DailyAccessMeter } from '@/components/shared/DailyAccessMeter';
import { useAuthStore } from '@/store/useAuthStore';
import { Input } from '@/components/ui/Input';
import { Select, SelectTrigger, SelectItem } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

// =============================================================================
// Comprehensive Filter Datasets Verified Against MongoDB Aggregation
// =============================================================================

// 1. All 38 Administrative Districts of Bihar
const DISTRICT_OPTIONS = [
  { label: 'All 38 Districts', value: '' },
  { label: 'Patna', value: 'Patna' },
  { label: 'Gaya', value: 'Gaya' },
  { label: 'Muzaffarpur', value: 'Muzaffarpur' },
  { label: 'Bhagalpur', value: 'Bhagalpur' },
  { label: 'Darbhanga', value: 'Darbhanga' },
  { label: 'Purnia', value: 'Purnia' },
  { label: 'Nalanda (Bihar Sharif)', value: 'Nalanda' },
  { label: 'Begusarai', value: 'Begusarai' },
  { label: 'Rohtas (Sasaram)', value: 'Rohtas' },
  { label: 'Saran (Chhapra)', value: 'Saran' },
  { label: 'Samastipur', value: 'Samastipur' },
  { label: 'Madhubani', value: 'Madhubani' },
  { label: 'Siwan', value: 'Siwan' },
  { label: 'East Champaran (Motihari)', value: 'East Champaran' },
  { label: 'West Champaran (Bettiah)', value: 'West Champaran' },
  { label: 'Katihar', value: 'Katihar' },
  { label: 'Saharsa', value: 'Saharsa' },
  { label: 'Munger', value: 'Munger' },
  { label: 'Vaishali (Hajipur)', value: 'Vaishali' },
  { label: 'Buxar', value: 'Buxar' },
  { label: 'Bhojpur (Ara)', value: 'Bhojpur' },
  { label: 'Gopalganj', value: 'Gopalganj' },
  { label: 'Sitamarhi', value: 'Sitamarhi' },
  { label: 'Supaul', value: 'Supaul' },
  { label: 'Araria', value: 'Araria' },
  { label: 'Kishanganj', value: 'Kishanganj' },
  { label: 'Banka', value: 'Banka' },
  { label: 'Jamui', value: 'Jamui' },
  { label: 'Nawada', value: 'Nawada' },
  { label: 'Jehanabad', value: 'Jehanabad' },
  { label: 'Aurangabad', value: 'Aurangabad' },
  { label: 'Kaimur (Bhabhua)', value: 'Kaimur' },
  { label: 'Khagaria', value: 'Khagaria' },
  { label: 'Madhepura', value: 'Madhepura' },
  { label: 'Lakhisarai', value: 'Lakhisarai' },
  { label: 'Sheikhpura', value: 'Sheikhpura' },
  { label: 'Arwal', value: 'Arwal' },
  { label: 'Sheohar', value: 'Sheohar' },
];

// 2. Nature of Procurement / Tender Category (Works, Goods, Services)
const PROCUREMENT_TYPE_OPTIONS = [
  { label: 'All Procurement Types', value: '' },
  { label: 'Works Contracts (Civil / Electrical / Mech)', value: 'Works' },
  { label: 'Goods & Equipment Supplies', value: 'Goods' },
  { label: 'Services & Operations', value: 'Services' },
];

// 3. All 38 Distinct Work Categories / Product Domains in MongoDB
const CATEGORY_OPTIONS = [
  { label: 'All Work Categories', value: '' },
  { label: 'Civil Works (Buildings, Roads & General)', value: 'Civil Works' },
  { label: 'Electrical Works', value: 'Electrical Works' },
  { label: 'Drilling Works & Boring', value: 'Drilling Works' },
  { label: 'Medical Equipments & Bio-Waste', value: 'Medical Equipments/Waste' },
  { label: 'Machineries & Mechanical Engg Items', value: 'Machineries/ Mechanical Engg Items' },
  { label: 'Agricultural or Forestry Works', value: 'Agricultural or Forestry' },
  { label: 'Miscellaneous Services', value: 'Miscellaneous Services' },
  { label: 'Repair & Maintenance Works', value: 'Repair and Maintenance Works' },
  { label: 'Civil Works - Others', value: 'Civil Works - Others' },
  { label: 'Miscellaneous Works', value: 'Miscellaneous Works' },
  { label: 'Civil Works - Canal & Irrigation', value: 'Civil Works - Canal' },
  { label: 'Electrical and Maintenance Works', value: 'Electrical and Maintenance Works' },
  { label: 'Supply of Materials & Aggregate', value: 'Supply of Materials' },
  { label: 'Civil Works - Roads & Macadamization', value: 'Civil Works - Roads' },
  { label: 'Miscellaneous Goods & Hardware', value: 'Miscellaneous Goods' },
  { label: 'Consultancy & Technical Advisory', value: 'Consultancy' },
  { label: 'Repair and Maintenance Services', value: 'Repair and Maintenance Services' },
  { label: 'Civil Works - Water Works & Distribution', value: 'Civil Works - Water Works' },
  { label: 'Civil Construction Goods', value: 'Civil Construction Goods' },
  { label: 'Suture & Surgical Products', value: 'Suture and related products' },
  { label: 'Shipping / Transportation / Vehicles', value: 'Shipping/ Transportation/ Vehicle' },
  { label: 'Electrical Goods & Equipments', value: 'Electrical Goods/Equipments' },
  { label: 'Land & Building Infrastructure', value: 'Land/Building' },
  { label: 'Medicines & Pharmaceuticals', value: 'Medicines' },
  { label: 'Food Products & Ration Supply', value: 'Food Products' },
  { label: 'Water Equipments / Meters / Boring', value: 'Water Equipments/ Meter/ Drilling/ Boring' },
  { label: 'Hotel & Catering Services', value: 'Hotel/ Catering' },
  { label: 'Audio-Visual & Studio Equipment', value: 'Audio-Visual Equipment' },
  { label: 'Network & Communication Equipments', value: 'Network /Communication Equipments' },
  { label: 'Consumables (Hospital / Lab)', value: 'Consumables (Hospital / Lab)' },
  { label: 'Topographical & Land Survey', value: 'Survey' },
  { label: 'Pumps & Electric Motors', value: 'Pumps/Motors' },
  { label: 'Electronics & Computing Equipment', value: 'Electronics Equipment' },
  { label: 'Machineries & Mechanical Engg Works', value: 'Machineries/ Mechanical Engg Works' },
  { label: 'Support & Maintenance Services', value: 'Support/Maintenance Service' },
  { label: 'Furniture & Fixture', value: 'Furniture/ Fixture' },
  { label: 'Printing & Stationery', value: 'Stationery' },
  { label: 'Lift Irrigation Schemes', value: 'Civil Works - Lift Irrigation Schemes' },
  { label: 'Housekeeping & Sanitation', value: 'Housekeeping/ Cleaning' },
  { label: 'Mechanical Engineering Items', value: 'Mechanical Engineering Items' },
  { label: 'Chemicals & Minerals', value: 'Chemicals/Minerals' },
];

// 4. All Verified Government Authorities & Departments in Bihar
const AUTHORITY_OPTIONS = [
  { label: 'All Government Authorities & Depts', value: '' },
  { label: 'Rural Works Department (RWD Bihar)', value: 'Rural Works' },
  { label: 'Road Construction Department (RCD Bihar)', value: 'Road Construction' },
  { label: 'Building Construction Department (BCD Bihar)', value: 'Building Construction' },
  { label: 'Water Resources Department (WRD / Irrigation)', value: 'Water Resources' },
  { label: 'Public Health Engineering Dept (PHED Nal-Jal)', value: 'PHE' },
  { label: 'Bihar State Power Holding Co. (BSPHCL)', value: 'Power' },
  { label: 'Bihar Rajya Pul Nirman Nigam Ltd (BRPNNL)', value: 'BRPNNL' },
  { label: 'Bihar Medical Services & Infra Corp (BMSICL)', value: 'BMSICL' },
  { label: 'Bihar State Educational Infra Dev Corp (BSEIDC)', value: 'BSEIDC' },
  { label: 'Patna Municipal Corporation (PMC)', value: 'Patna Municipal' },
  { label: 'Muzaffarpur Municipal Corporation (MMC)', value: 'Muzaffarpur Municipal' },
  { label: 'Gaya Municipal Corporation (GMC)', value: 'Gaya Municipal' },
  { label: 'Bhagalpur Municipal Corporation (BMC)', value: 'Bhagalpur Municipal' },
  { label: 'Bihar Urban Infrastructure Dev Corp (BUIDCO)', value: 'BUIDCO' },
  { label: 'Minor Water Resources Department (MWRD)', value: 'Minor Water' },
  { label: 'Department of Agriculture, Bihar', value: 'Agriculture' },
  { label: 'Panchayati Raj Department, Bihar', value: 'Panchayati Raj' },
  { label: 'Environment, Forest & Climate Change Dept', value: 'FOREST DEPARTMENT' },
  { label: 'Bihar State Tourism Dev Corp (BSTDC)', value: 'Tourism' },
  { label: 'Bihar Police Building Construction Corp (BPBCC)', value: 'Police' },
  { label: 'Patna Smart City Limited (PSCL)', value: 'Patna Smart City' },
  { label: 'Gaya Smart City Limited', value: 'Gaya Smart City' },
  { label: 'Muzaffarpur Smart City Limited', value: 'Muzaffarpur Smart City' },
  { label: 'Bihar State Road Transport Corp (BSRTC)', value: 'BSRTC' },
  { label: 'Higher Education Department, Bihar', value: 'HIGHER EDUCATION' },
  { label: 'Animal & Fisheries Resources Department', value: 'Animal Husbandry' },
];

// 5. Verified Bihar Engineering & Administrative Works Divisions
const DIVISION_OPTIONS = [
  { label: 'All Divisions & Executive Circles', value: '' },
  { label: 'Executive Engineer RWD Works Patna', value: 'REW Patna' },
  { label: 'Executive Engineer RWD Muzaffarpur', value: 'REW Muzaffarpur' },
  { label: 'Executive Engineer RWD Gaya', value: 'REW Gaya' },
  { label: 'Executive Engineer RWD Bhagalpur', value: 'REW Bhagalpur' },
  { label: 'Executive Engineer RWD Darbhanga', value: 'REW Darbhanga' },
  { label: 'Executive Engineer RWD Purnia', value: 'REW Purnia' },
  { label: 'Executive Engineer RCD Road Division Patna', value: 'RCD Patna' },
  { label: 'Executive Engineer RCD Road Division Muzaffarpur', value: 'RCD Muzaffarpur' },
  { label: 'Executive Engineer RCD Road Division Gaya', value: 'RCD Gaya' },
  { label: 'Executive Engineer BCD Building Division Patna', value: 'BCD Patna' },
  { label: 'Executive Engineer BCD Building Division Muzaffarpur', value: 'BCD Muzaffarpur' },
  { label: 'Executive Engineer BCD Building Division Gaya', value: 'BCD Gaya' },
  { label: 'Executive Engineer PHED Division Patna', value: 'PHED Patna' },
  { label: 'Executive Engineer PHED Division Muzaffarpur', value: 'PHED Muzaffarpur' },
  { label: 'Executive Engineer PHED Division Darbhanga', value: 'PHED Darbhanga' },
  { label: 'Executive Engineer PHED Division Bhagalpur', value: 'PHED Bhagalpur' },
  { label: 'Irrigation & Flood Control Division 1 Patna (WRD)', value: 'ID-1 Patna' },
  { label: 'Irrigation & Flood Control Division 2 Patna (WRD)', value: 'ID-2 Patna' },
  { label: 'Tube Well Irrigation Division Patna (TWID)', value: 'T.W.I.D Patna' },
  { label: 'Patna Municipal Corporation Circle Divisions', value: 'Patna Municipal' },
  { label: 'Bridge Engineering Division Patna (BRPNNL)', value: 'BRPNNL Patna' },
  { label: 'Bridge Engineering Division Muzaffarpur (BRPNNL)', value: 'BRPNNL Muzaffarpur' },
  { label: 'Electricity Supply Division Patna (BSPHCL)', value: 'Electric Div Patna' },
  { label: 'Ground Water Investigation Division Patna', value: 'Ground Water' },
  { label: 'Directorate of Urban Local Bodies Patna', value: 'Urban Local Bodies Patna' },
];

// 6. Contract Agreement Types
const CONTRACT_TYPE_OPTIONS = [
  { label: 'All Contract Forms', value: '' },
  { label: 'Item Rate / Turnkey Tender', value: 'Tender' },
  { label: 'Rate Contract (Annual / Bulk)', value: 'Rate Contract' },
  { label: 'Empanelment / Vendor Roster', value: 'Empanelment' },
];

// 7. Closing Submission Windows
const DEADLINE_OPTIONS = [
  { label: 'All Closing Deadlines', value: '' },
  { label: 'Closing in 3 Days (Urgent)', value: '3' },
  { label: 'Closing in 7 Days (Within 1 Week)', value: '7' },
  { label: 'Closing in 15 Days (Fortnightly)', value: '15' },
  { label: 'Closing in 30 Days (Monthly Window)', value: '30' },
];

export default function Tenders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, isPro } = useAuthStore();

  // Auth Prompt Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState({
    title: 'Sign In to View Full Tender Details',
    subtitle: 'Official tender documents, BOQs, and authority specifications are protected.',
    redirectUrl: '/tenders'
  });

  const handleRequestAuth = (config = {}) => {
    setAuthModalConfig((prev) => ({ ...prev, ...config }));
    setAuthModalOpen(true);
  };

  const handleViewDetails = (tender) => {
    const tenderId = tender._id || tender.sourceTenderId;
    if (!isAuthenticated) {
      handleRequestAuth({
        title: 'Sign In to View Full Tender Details',
        subtitle: `Notice ${tender.sourceTenderId || tender.tenderReferenceNumber || 'NIT'}: ${tender.title?.slice(0, 80) || ''}...`,
        redirectUrl: `/tenders/${tenderId}`
      });
      return;
    }
    navigate(`/tenders/${tenderId}`);
  };

  // 1. Initial State from URL params
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialTenderCategory = searchParams.get('tenderCategory') || '';
  const initialContractType = searchParams.get('contractType') || '';
  const initialPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  const [advancedSearch, setAdvancedSearch] = useState(initialSearch);
  const debouncedSearch = useDebounce(advancedSearch, 500);

  const [tenderCategory, setTenderCategory] = useState(initialTenderCategory);
  const [category, setCategory] = useState(initialCategory);
  const [contractType, setContractType] = useState(initialContractType);
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [organisation, setOrganisation] = useState(searchParams.get('organisation') || '');
  const [department, setDepartment] = useState(searchParams.get('department') || '');
  const [closingDate, setClosingDate] = useState(searchParams.get('closingDays') || '');
  
  // Tab State: Latest vs Archived Tenders
  const [status, setStatus] = useState('active');
  const [sortBy, setSortBy] = useState('arrival');
  
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync page state when user navigates using browser Back / Forward buttons
  useEffect(() => {
    const pageFromUrl = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    if (pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl);
    }
  }, [searchParams]);

  // Active filter count for badge
  const activeFilterCount = [
    Boolean(advancedSearch),
    Boolean(tenderCategory),
    Boolean(category),
    Boolean(contractType),
    Boolean(location),
    Boolean(organisation),
    Boolean(department),
    Boolean(closingDate),
  ].filter(Boolean).length;

  // Always fetch 10 items per page to keep the UI clean and structured
  const queryLimit = 10;

  // 2. Construct API Query
  const queryFilters = {
    search: debouncedSearch,
    tenderCategory: tenderCategory,
    category: category,
    contractType: contractType,
    organisation: organisation,
    department: department,
    location: location,
    closingDays: closingDate,
    status: status,
    sortBy: sortBy,
    page: currentPage,
    limit: queryLimit,
  };

  const { data, isLoading, isError, error } = useTenders(queryFilters);

  const tenders = data?.data || [];
  const totalCount = data?.meta?.total || 0;
  const activeCount = data?.meta?.activeCount ?? 0;
  const upcomingCount = data?.meta?.upcomingCount ?? 0;
  const archivedCount = data?.meta?.archivedCount ?? 0;
  const expiredCount = data?.meta?.expiredCount ?? 0;
  const totalPages = Math.ceil(totalCount / queryLimit) || 1;

  // 3. Handlers
  const handleReset = () => {
    setAdvancedSearch('');
    setTenderCategory('');
    setCategory('');
    setContractType('');
    setOrganisation('');
    setDepartment('');
    setLocation('');
    setClosingDate('');
    setStatus('active');
    setSortBy('arrival');
    setCurrentPage(1);
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    if (!isAuthenticated && newPage > 1) {
      handleRequestAuth({
        title: 'Sign In to View More Tenders',
        subtitle: 'Guests are limited to previewing the 10 latest tender notices. Sign in to browse all pages across Bihar.',
        redirectUrl: `/tenders?page=${newPage}`
      });
      return;
    }
    setCurrentPage(newPage);
    setSearchParams((prev) => {
      const updated = new URLSearchParams(prev);
      if (newPage > 1) {
        updated.set('page', newPage.toString());
      } else {
        updated.delete('page');
      }
      return updated;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-paper dark:bg-slate-900 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Title & Reset Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
                Tender Notice Directory
              </h1>
              {(import.meta.env.VITE_TEST_MODE === 'true' || (typeof window !== 'undefined' && window.location.port === '5175')) ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span>Testing Port 5175: All Content &amp; Full Details Unlocked (No Login Required)</span>
                </span>
              ) : !isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => handleRequestAuth({
                    title: 'Sign In to Unlock 5 Free Tender Views',
                    subtitle: 'Create a free contractor account to get 5 full tender views and direct document downloads every 24 hours.',
                    redirectUrl: '/tenders'
                  })}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer shadow-xs"
                  title="Click to sign in and claim your 5 free tender views per day"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>5 Free Full Views &amp; Downloads / Day (Sign In to Use)</span>
                </button>
              ) : isPro ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700 shadow-xs">
                  Pro Unlimited Access
                </span>
              ) : (
                <DailyAccessMeter 
                  viewsUsed={user?.dailyViews?.viewsUsed ?? 0}
                  viewsLimit={typeof user?.dailyViews?.viewsLimit === 'number' ? user.dailyViews.viewsLimit : 5}
                  resetsAt={user?.dailyViews?.resetsAt}
                  isPro={isPro}
                />
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Official public works, civil contracts, and procurement notices published across Bihar.
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleReset} 
            className="gap-1.5 text-xs self-start sm:self-auto hover:border-chinarRed hover:text-chinarRed transition-colors shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
          </Button>
        </div>

        {/* Mobile/Tablet Filter Accordion Toggle (< lg) */}
        <div className="lg:hidden mb-4">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="w-full flex items-center justify-between p-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xs text-xs font-bold text-dalBlue dark:text-blue-300 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-dalBlue dark:text-blue-400 shrink-0" />
              <span>{mobileFiltersOpen ? 'Hide Search Filters' : 'Show Search Filters'}</span>
              {activeFilterCount > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-dalBlue text-white dark:bg-blue-600">
                  {activeFilterCount} active
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <span 
                  onClick={(e) => { e.stopPropagation(); handleReset(); }}
                  className="text-[11px] text-chinarRed hover:underline font-semibold"
                >
                  Reset
                </span>
              )}
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${mobileFiltersOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* ---------------- FILTER SIDEBAR ---------------- */}
          <aside className={`lg:col-span-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xs lg:sticky lg:top-20 flex flex-col max-h-[520px] sm:max-h-[560px] lg:max-h-[calc(100vh-6rem)] overflow-hidden transition-all ${
            mobileFiltersOpen ? 'flex mb-4 lg:mb-0' : 'hidden lg:flex'
          }`}>
            {/* Pinned Header */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-slate-100 dark:border-slate-700/80 text-dalBlue dark:text-blue-400 bg-white dark:bg-slate-800 shrink-0 select-none">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <h2 className="text-xs font-bold uppercase tracking-wider">Search Filters</h2>
              </div>
              {activeFilterCount > 0 && (
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-dalBlue text-white dark:bg-blue-600 shadow-xs animate-in fade-in">
                  {activeFilterCount} active
                </span>
              )}
            </div>

            {/* Scrollable Filters Body with Dedicated Vertical Scrollbar */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4 filter-scrollbar">
              {/* Keyword Search Input */}
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>Keyword / NIT No.</span>
                  {advancedSearch && (
                    <button 
                      onClick={() => { setAdvancedSearch(''); setCurrentPage(1); }}
                      className="text-[10px] text-slate-400 hover:text-chinarRed"
                    >
                      Clear
                    </button>
                  )}
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 sm:top-3" />
                  <Input
                    type="text"
                    value={advancedSearch}
                    onChange={(e) => {
                      setAdvancedSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="e.g. Borewell, NIT No, Road..."
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              {/* Procurement Nature (Works, Goods, Services) */}
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-dalBlue dark:text-blue-400" /> Procurement Type
                  </span>
                  {tenderCategory && (
                    <button 
                      onClick={() => { setTenderCategory(''); setCurrentPage(1); }}
                      className="text-[10px] text-chinarRed font-bold hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </label>
                <Select value={tenderCategory} onValueChange={(val) => { setTenderCategory(val); setCurrentPage(1); }}>
                  <SelectTrigger className="text-xs">
                    {PROCUREMENT_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectTrigger>
                </Select>
              </div>

              {/* District / Location Dropdown */}
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-chinarRed" /> District / Region
                  </span>
                  {location && (
                    <button 
                      onClick={() => { setLocation(''); setCurrentPage(1); }}
                      className="text-[10px] text-chinarRed font-bold hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </label>
                <Select value={location} onValueChange={(val) => { setLocation(val); setCurrentPage(1); }}>
                  <SelectTrigger className="text-xs">
                    {DISTRICT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectTrigger>
                </Select>
              </div>

              {/* Work Category Dropdown */}
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-dalBlue dark:text-blue-400" /> Work Domain / Category
                  </span>
                  {category && (
                    <button 
                      onClick={() => { setCategory(''); setCurrentPage(1); }}
                      className="text-[10px] text-chinarRed font-bold hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </label>
                <Select value={category} onValueChange={(val) => { setCategory(val); setCurrentPage(1); }}>
                  <SelectTrigger className="text-xs">
                    {CATEGORY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectTrigger>
                </Select>
              </div>

              {/* Government Authority Dropdown */}
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" /> Procuring Authority
                  </span>
                  {organisation && (
                    <button 
                      onClick={() => { setOrganisation(''); setCurrentPage(1); }}
                      className="text-[10px] text-chinarRed font-bold hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </label>
                <Select value={organisation} onValueChange={(val) => { setOrganisation(val); setCurrentPage(1); }}>
                  <SelectTrigger className="text-xs">
                    {AUTHORITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectTrigger>
                </Select>
              </div>

              {/* Division / Sub-Department Dropdown */}
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>Executive Division / Wing</span>
                  {department && (
                    <button 
                      onClick={() => { setDepartment(''); setCurrentPage(1); }}
                      className="text-[10px] text-chinarRed font-bold hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </label>
                <Select value={department} onValueChange={(val) => { setDepartment(val); setCurrentPage(1); }}>
                  <SelectTrigger className="text-xs">
                    {DIVISION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectTrigger>
                </Select>
              </div>

              {/* Form of Contract Dropdown */}
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" /> Form of Contract
                  </span>
                  {contractType && (
                    <button 
                      onClick={() => { setContractType(''); setCurrentPage(1); }}
                      className="text-[10px] text-chinarRed font-bold hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </label>
                <Select value={contractType} onValueChange={(val) => { setContractType(val); setCurrentPage(1); }}>
                  <SelectTrigger className="text-xs">
                    {CONTRACT_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectTrigger>
                </Select>
              </div>

              {/* Closing Date Window */}
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" /> Submission Deadline
                  </span>
                  {closingDate && (
                    <button 
                      onClick={() => { setClosingDate(''); setCurrentPage(1); }}
                      className="text-[10px] text-chinarRed font-bold hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </label>
                <Select value={closingDate} onValueChange={(val) => { setClosingDate(val); setCurrentPage(1); }}>
                  <SelectTrigger className="text-xs">
                    {DEADLINE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectTrigger>
                </Select>
              </div>
            </div>

            {/* Pinned Quick Reset in Sidebar Footer */}
            {activeFilterCount > 0 && (
              <div className="px-4 sm:px-5 py-3 border-t border-slate-100 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-900/60 shrink-0">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleReset}
                  className="w-full text-xs text-chinarRed border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 font-semibold"
                >
                  Clear All Filters ({activeFilterCount})
                </Button>
              </div>
            )}
          </aside>

          {/* ---------------- MAIN RESULTS FEED ---------------- */}
          <main className="lg:col-span-3 space-y-4">
            
            {/* Top Tab Bar strictly matching Image 2 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 sm:p-2.5 rounded-2xl shadow-xs">
              {/* Menu Tabs: Active Tenders, Upcoming, Expired */}
              <div 
                className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-hide [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar-thumb]:hidden [&::-webkit-scrollbar-track]:hidden"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setStatus('active');
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer font-semibold whitespace-nowrap shrink-0 ${
                    status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <span className="text-emerald-500 font-bold">⚡</span>
                  <span>Active Tenders</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                    status === 'active' 
                      ? 'bg-emerald-200/80 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200' 
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {activeCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStatus('upcoming');
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer font-semibold whitespace-nowrap shrink-0 ${
                    status === 'upcoming'
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-700 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <CalendarClock className="w-3.5 h-3.5 text-blue-500" />
                  <span>Upcoming</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                    status === 'upcoming' 
                      ? 'bg-blue-200/80 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {upcomingCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStatus('expired');
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer font-semibold whitespace-nowrap shrink-0 ${
                    status === 'expired'
                      ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 shadow-xs'
                      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <CalendarX className="w-3.5 h-3.5 text-slate-400" />
                  <span>Expired</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                    status === 'expired' 
                      ? 'bg-slate-300 text-slate-900 dark:bg-slate-600 dark:text-slate-100' 
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {expiredCount}
                  </span>
                </button>
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-white hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-xs transition-all"
                >
                  <option value="arrival">Sort: Latest Published (Newest First)</option>
                  <option value="closingAsc">Sort: Closing Date (Urgent First)</option>
                  <option value="closingDesc">Sort: Closing Date (Furthest First)</option>
                  <option value="valueDesc">Sort: Estimated Value (High to Low)</option>
                  <option value="valueAsc">Sort: Estimated Value (Low to High)</option>
                </select>
              </div>
            </div>

            {/* FILTER BY Row: Clean horizontal scrolling chips without visible scrollbar */}
            <div 
              className="flex items-center gap-1.5 sm:gap-2 px-1 py-2.5 my-1 overflow-x-auto scrollbar-hide no-scrollbar scroll-smooth [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar-thumb]:hidden [&::-webkit-scrollbar-track]:hidden"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap shrink-0 mr-1 select-none">
                FILTER BY:
              </span>
              {[
                { label: 'All Items', value: '' },
                { label: 'Civil Infrastructure', value: 'Civil' },
                { label: 'Electrical Works', value: 'Electrical' },
                { label: 'Healthcare & Medical', value: 'Medical' },
                { label: 'Water Supply / PHE', value: 'Water' },
                { label: 'Roads & Highways', value: 'Roads' },
                { label: 'Energy & Utilities', value: 'Energy' },
              ].map((chip) => {
                const isActive = (chip.value === '' && !category) || (chip.value && category?.toLowerCase() === chip.value.toLowerCase());
                return (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => {
                      if (chip.value === '') {
                        setCategory('');
                      } else if (category?.toLowerCase() === chip.value.toLowerCase()) {
                        setCategory(''); // Toggle off if clicked again
                      } else {
                        setCategory(chip.value);
                      }
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-[#071325] text-white dark:bg-white dark:text-[#071325] shadow-xs font-semibold'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/90 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

            {/* Active Filter Chips Bar */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs shadow-xs">
                <span className="font-semibold text-slate-400 dark:text-slate-500 uppercase text-[10px] mr-1">Active:</span>
                
                {advancedSearch && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-dalBlue dark:text-blue-200 border border-dalBlue/20 font-medium">
                    <span>Search: &quot;{advancedSearch}&quot;</span>
                    <button onClick={() => setAdvancedSearch('')} className="hover:text-chinarRed font-bold ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {tenderCategory && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-dalBlue dark:text-blue-200 border border-dalBlue/20 font-medium">
                    <Briefcase className="w-3 h-3" />
                    <span>Type: {tenderCategory}</span>
                    <button onClick={() => setTenderCategory('')} className="hover:text-chinarRed font-bold ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {location && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-dalBlue dark:text-blue-200 border border-dalBlue/20 font-medium">
                    <MapPin className="w-3 h-3 text-chinarRed" />
                    <span>District: {location}</span>
                    <button onClick={() => setLocation('')} className="hover:text-chinarRed font-bold ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {category && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-dalBlue dark:text-blue-200 border border-dalBlue/20 font-medium">
                    <Layers className="w-3 h-3" />
                    <span>
                      Domain: {
                        category === 'Civil' ? 'Civil Infrastructure' :
                        category === 'Electrical' ? 'Electrical Works' :
                        category === 'Medical' ? 'Healthcare & Medical' :
                        category === 'Water' ? 'Water Supply / PHE' :
                        category === 'Roads' ? 'Roads & Highways' :
                        category === 'Energy' ? 'Energy & Utilities' :
                        category
                      }
                    </span>
                    <button onClick={() => setCategory('')} className="hover:text-chinarRed font-bold ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {organisation && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-dalBlue dark:text-blue-200 border border-dalBlue/20 font-medium">
                    <Building2 className="w-3 h-3" />
                    <span className="truncate max-w-[160px]">Authority: {organisation}</span>
                    <button onClick={() => setOrganisation('')} className="hover:text-chinarRed font-bold ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {department && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-dalBlue dark:text-blue-200 border border-dalBlue/20 font-medium">
                    <span className="truncate max-w-[160px]">Division: {department}</span>
                    <button onClick={() => setDepartment('')} className="hover:text-chinarRed font-bold ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {contractType && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-dalBlue dark:text-blue-200 border border-dalBlue/20 font-medium">
                    <FileCheck className="w-3 h-3" />
                    <span>Contract: {contractType}</span>
                    <button onClick={() => setContractType('')} className="hover:text-chinarRed font-bold ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {closingDate && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-dalBlue dark:text-blue-200 border border-dalBlue/20 font-medium">
                    <Calendar className="w-3 h-3" />
                    <span>Deadline: &le; {closingDate} days</span>
                    <button onClick={() => setClosingDate('')} className="hover:text-chinarRed font-bold ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  onClick={handleReset}
                  className="text-chinarRed font-bold hover:underline text-xs ml-auto cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Total Results Summary */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl text-xs text-slate-600 dark:text-slate-400 shadow-xs">
              <span>
                Showing <strong className="font-mono text-sm text-emerald-600 dark:text-emerald-400 font-bold">{totalCount}</strong> {status === 'upcoming' ? 'upcoming notices' : status === 'expired' ? 'expired notices' : 'active notices'}
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Page {currentPage} of {totalPages}
              </span>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center space-y-3 shadow-xs">
                <div className="w-8 h-8 rounded-full border-3 border-dalBlue border-t-transparent animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Loading tender notices...</p>
              </div>
            )}

            {/* Error State */}
            {isError && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl p-6 text-center text-red-700 dark:text-red-300 text-xs space-y-1">
                <p className="font-bold text-sm">Unable to load tender directory.</p>
                <p>{error?.message || 'Please verify database connection.'}</p>
              </div>
            )}

            {/* Tender Feed (Spacious, full-width cards with high legibility) */}
            {!isLoading && !isError && tenders.length > 0 && (
              <div className="space-y-4">
                {tenders.map((tender, index) => {
                  const isBlurredCard = !isPro && index >= 15;
                  return (
                    <div 
                      key={tender._id || tender.sourceTenderId} 
                      className="w-full"
                    >
                      {/* Banner injected before first blurred tender card (index 15) */}
                      {!isPro && index === 15 && (
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#071325] via-slate-900 to-[#071325] text-white p-5 sm:p-7 shadow-xl border border-emerald-500/30 my-6">
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-inner">
                                <Lock className="w-6 h-6 text-emerald-400" />
                              </div>
                              <div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-mono font-bold text-emerald-300 mb-1.5">
                                  <span>Viewing 15 of {totalCount} Active Notices</span>
                                </div>
                                <h3 className="text-base sm:text-lg font-display font-bold">
                                  {isAuthenticated ? 'Upgrade to BiharTenders Pro (₹399/mo)' : 'Unlock All Tender Notices & Technical Details'}
                                </h3>
                                <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                                  {isAuthenticated 
                                    ? 'Get unlimited tender views, 1-click BOQ Excel downloads, and automated WhatsApp alerts for your preferred Bihar departments & districts.'
                                    : 'Cards below are blurred for preview. Log in or create a free contractor account to unlock all active tenders, search across 38 districts, and download BOQs.'}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full md:w-auto shrink-0">
                              {isAuthenticated ? (
                                <Button
                                  type="button"
                                  onClick={() => navigate('/pricing')}
                                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-lg cursor-pointer"
                                >
                                  Upgrade to Pro (₹399)
                                </Button>
                              ) : (
                                <Button
                                  type="button"
                                  onClick={() => handleRequestAuth({
                                    title: 'Sign In to View More Tenders',
                                    subtitle: 'Sign in to unlock all tender notices and view full details (5 views/24 hours).',
                                    redirectUrl: '/tenders'
                                  })}
                                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-lg cursor-pointer"
                                >
                                  Log In to View More Tenders
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      <div 
                        onClick={() => {
                          if (isBlurredCard) {
                            if (!isAuthenticated) {
                              handleRequestAuth({
                                title: 'Sign In to View More Tenders',
                                subtitle: 'Sign in to unlock all tender notices and view full details.',
                                redirectUrl: '/tenders'
                              });
                            } else {
                              navigate('/pricing');
                            }
                            return;
                          }
                        }}
                        className={isBlurredCard ? 'cursor-pointer' : ''}
                      >
                        <TenderCard 
                          tender={tender} 
                          isBlurred={isBlurredCard}
                          onViewDetails={() => handleViewDetails(tender)}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Standard Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl mt-6 shadow-xs gap-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Page <strong className="text-slate-800 dark:text-white font-mono">{currentPage}</strong> of <strong className="text-slate-800 dark:text-white font-mono">{totalPages}</strong>
                    {!isAuthenticated && <span className="ml-2 text-slate-400 dark:text-slate-500 font-normal">(Sign in for all pages)</span>}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline" size="sm"
                      onClick={() => handlePageChange(Math.max(currentPage - 1, 1))} disabled={currentPage === 1}
                      className="px-2.5 text-xs"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
                    </Button>
                    
                    <div className="h-8 px-3 flex items-center justify-center bg-dalBlue text-white dark:bg-blue-600 rounded-lg text-xs font-mono font-bold shadow-xs border border-dalBlue dark:border-blue-500">
                      {currentPage}
                    </div>

                    <Button
                      variant="outline" size="sm"
                      onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages}
                      className="px-2.5 text-xs"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !isError && tenders.length === 0 && (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center space-y-3 shadow-xs">
                <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <h4 className="text-base font-bold text-slate-800 dark:text-white">
                  {status === 'archived' ? 'No Archived Notices Found' : status === 'expired' ? 'No Expired Notices Found' : status === 'upcoming' ? 'No Upcoming Notices Found' : 'No Matching Tender Notices'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {status === 'archived'
                    ? 'No notices currently awaiting bid opening or with download concluded match your filters.'
                    : status === 'expired'
                    ? 'No expired notices match your current filters.'
                    : status === 'upcoming'
                    ? 'There are no upcoming tenders scheduled at this moment.'
                    : 'Try clearing specific department, category, or district filters to broaden your search results.'}
                </p>
                <div className="pt-2">
                  <Button variant="outline" onClick={handleReset} className="text-xs hover:border-dalBlue">
                    Reset All Filters
                  </Button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title={authModalConfig.title}
        subtitle={authModalConfig.subtitle}
        redirectUrl={authModalConfig.redirectUrl}
      />
    </div>
  );
}