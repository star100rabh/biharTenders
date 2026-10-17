/**
 * @file src/components/home/BiharDistrictsExplorer.jsx
 * @description Interactive 9-Division and 38-District procurement navigator for Bihar contractors.
 * Sleek, high-contrast command center design without cartoonish graphics.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight, Landmark, Layers, Building2, CheckCircle2 } from 'lucide-react';

export const BIHAR_DIVISIONS = [
  {
    id: 'patna',
    name: 'Patna Division',
    headquarters: 'Patna',
    tag: 'Capital Region',
    districts: ['Patna', 'Nalanda', 'Bhojpur', 'Buxar', 'Rohtas', 'Kaimur']
  },
  {
    id: 'tirhut',
    name: 'Tirhut Division',
    headquarters: 'Muzaffarpur',
    tag: 'North Commercial Hub',
    districts: ['Muzaffarpur', 'Vaishali', 'East Champaran', 'West Champaran', 'Sitamarhi', 'Sheohar']
  },
  {
    id: 'magadh',
    name: 'Magadh Division',
    headquarters: 'Gaya',
    tag: 'Heritage & Pilgrimage Zone',
    districts: ['Gaya', 'Nawada', 'Aurangabad', 'Jehanabad', 'Arwal']
  },
  {
    id: 'darbhanga',
    name: 'Darbhanga (Mithila)',
    headquarters: 'Darbhanga',
    tag: 'Mithila Cultural Heart',
    districts: ['Darbhanga', 'Madhubani', 'Samastipur']
  },
  {
    id: 'saran',
    name: 'Saran Division',
    headquarters: 'Chhapra',
    tag: 'Western Gateway',
    districts: ['Saran', 'Siwan', 'Gopalganj']
  },
  {
    id: 'kosi',
    name: 'Kosi Division',
    headquarters: 'Saharsa',
    tag: 'Eastern Waterways & Flood Plains',
    districts: ['Saharsa', 'Madhepura', 'Supaul']
  },
  {
    id: 'purnia',
    name: 'Purnia Division',
    headquarters: 'Purnia',
    tag: 'Seemanchal Agro Belt',
    districts: ['Purnia', 'Katihar', 'Kishanganj', 'Araria']
  },
  {
    id: 'bhagalpur',
    name: 'Bhagalpur Division',
    headquarters: 'Bhagalpur',
    tag: 'Silk City & South Ganga',
    districts: ['Bhagalpur', 'Banka']
  },
  {
    id: 'munger',
    name: 'Munger Division',
    headquarters: 'Munger',
    tag: 'Industrial & Rail Corridor',
    districts: ['Munger', 'Begusarai', 'Lakhisarai', 'Khagaria', 'Jamui', 'Sheikhpura']
  }
];

export function BiharDistrictsExplorer() {
  const [activeDivisionId, setActiveDivisionId] = useState('patna');
  const navigate = useNavigate();

  const activeDivision = BIHAR_DIVISIONS.find((d) => d.id === activeDivisionId) || BIHAR_DIVISIONS[0];

  const handleDistrictClick = (districtName) => {
    navigate(`/tenders?location=${encodeURIComponent(districtName)}`);
  };

  return (
    <section id="districts-section" className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-amber-400 border border-orange-500/30 mb-3">
            <MapPin className="w-3.5 h-3.5 text-orange-500" />
            <span>All 38 Districts Covered • 9 Administrative Divisions</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Explore Tenders by Administrative Division
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">
            Filter public works directly for your registered circle, executive engineer division, or local municipal corporation across Bihar.
          </p>
        </div>

        <button
          onClick={() => navigate('/tenders')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-orange-600 dark:text-amber-400 hover:bg-orange-50 dark:hover:bg-slate-800 transition-colors border border-orange-200 dark:border-slate-700 shrink-0 cursor-pointer"
        >
          <span>View All Bihar Tenders</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 9 Division Filter Tabs */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {BIHAR_DIVISIONS.map((division) => {
          const isActive = division.id === activeDivisionId;
          return (
            <button
              key={division.id}
              onClick={() => setActiveDivisionId(division.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 border ${
                isActive
                  ? 'bg-[#C85A32] dark:bg-[#E07A5F] text-white border-transparent shadow-xs'
                  : 'patliputra-glass-badge text-[#1D3557] dark:text-slate-300 border-[#E6E1D8] dark:border-[#283341] hover:border-[#C85A32]/50 hover:bg-[#FAF8F5]/50'
              }`}
            >
              <span>{division.name}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono tabular-nums font-bold ${
                isActive 
                  ? 'bg-white/25 text-white' 
                  : 'patliputra-glass-subtle text-slate-500 dark:text-slate-400 border border-[#E6E1D8] dark:border-[#283341]'
              }`}>
                {division.districts.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Division Card & District Grid */}
      <div className="patliputra-glass rounded-2xl p-6 sm:p-8 border border-[#E6E1D8] dark:border-[#283341] relative overflow-hidden">
        {/* Subtle Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C85A32] via-[#D97706] to-[#2D6A4F]" />

        {/* Division Header Info Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E6E1D8] dark:border-[#283341] mb-6">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl patliputra-glass-badge text-[#C85A32] dark:text-[#E07A5F] border border-[#E6E1D8] dark:border-[#283341] flex items-center justify-center shrink-0">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-xl sm:text-2xl font-black text-[#1D3557] dark:text-white">
                  {activeDivision.name}
                </h3>
                <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-[#C85A32]/10 dark:bg-[#E07A5F]/15 text-[#C85A32] dark:text-[#E07A5F] border border-[#C85A32]/25">
                  Headquarters: {activeDivision.headquarters}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                {activeDivision.tag} • {activeDivision.districts.length} Administrative Districts Unified
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl patliputra-glass-badge border border-[#E6E1D8] dark:border-[#283341] text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-[#2D6A4F] dark:bg-[#52B788] animate-pulse" />
            <span>e-Proc2 Bihar Active Gateway</span>
          </div>
        </div>

        {/* District Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {activeDivision.districts.map((district) => (
            <button
              key={district}
              onClick={() => handleDistrictClick(district)}
              className="group p-4 rounded-xl patliputra-glass-subtle border border-[#E6E1D8] dark:border-[#283341] hover:border-[#C85A32] dark:hover:border-[#E07A5F] transition-all duration-200 text-left flex flex-col justify-between gap-3 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg patliputra-glass-badge text-[#C85A32] dark:text-[#E07A5F] border border-[#E6E1D8] dark:border-[#283341] flex items-center justify-center group-hover:bg-[#C85A32] group-hover:text-white transition-all">
                  <MapPin className="w-3.5 h-3.5" />
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-[#C85A32] dark:group-hover:text-[#E07A5F] group-hover:translate-x-0.5 transition-all" />
              </div>

              <div>
                <span className="text-xs sm:text-sm font-bold text-[#1D3557] dark:text-white group-hover:text-[#C85A32] dark:group-hover:text-[#E07A5F] transition-colors block truncate">
                  {district}
                </span>
                <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                  Tenders &amp; BOQs
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
