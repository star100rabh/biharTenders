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
                  ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white border-transparent shadow-md shadow-orange-500/25'
                  : 'bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-orange-500/50 hover:bg-orange-50/50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{division.name}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                isActive 
                  ? 'bg-white/25 text-white' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}>
                {division.districts.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Division Card & District Grid */}
      <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-700/80 shadow-xl relative overflow-hidden">
        {/* Subtle Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-600 via-amber-500 to-emerald-500" />

        {/* Division Header Info Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-700/80 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#071527] to-[#0D264A] text-amber-400 border border-slate-700 flex items-center justify-center shadow-md shrink-0">
              <Landmark className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {activeDivision.name}
                </h3>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-amber-400 border border-orange-200 dark:border-orange-800/80">
                  Headquarters: {activeDivision.headquarters}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                {activeDivision.tag} • {activeDivision.districts.length} Administrative Districts Unified
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>e-Proc2 Bihar Active Gateway</span>
          </div>
        </div>

        {/* District Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {activeDivision.districts.map((district) => (
            <button
              key={district}
              onClick={() => handleDistrictClick(district)}
              className="group p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-700/80 hover:border-orange-500 dark:hover:border-amber-400 hover:bg-white dark:hover:bg-slate-850 hover:shadow-lg transition-all duration-200 text-left flex flex-col justify-between gap-4 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 dark:text-amber-400 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-orange-500 group-hover:to-amber-500 group-hover:text-white transition-all shadow-xs">
                  <MapPin className="w-4 h-4" />
                </span>
                <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-orange-500 dark:group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
              </div>

              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-amber-400 transition-colors block truncate">
                  {district}
                </span>
                <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
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
