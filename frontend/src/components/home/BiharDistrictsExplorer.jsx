/**
 * @file src/components/home/BiharDistrictsExplorer.jsx
 * @description Interactive 9-Division and 38-District procurement navigator for Bihar contractors.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight, Sparkles, Building2, Layers } from 'lucide-react';

export const BIHAR_DIVISIONS = [
  {
    id: 'patna',
    name: 'Patna Division',
    headquarters: 'Patna',
    tag: 'Capital Region',
    badgeColor: 'border-orange-500/40 bg-orange-500/10 text-orange-400',
    districts: ['Patna', 'Nalanda', 'Bhojpur', 'Buxar', 'Rohtas', 'Kaimur']
  },
  {
    id: 'tirhut',
    name: 'Tirhut Division',
    headquarters: 'Muzaffarpur',
    tag: 'North Commercial Hub',
    badgeColor: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    districts: ['Muzaffarpur', 'Vaishali', 'East Champaran', 'West Champaran', 'Sitamarhi', 'Sheohar']
  },
  {
    id: 'magadh',
    name: 'Magadh Division',
    headquarters: 'Gaya',
    tag: 'Heritage & Pilgrimage Zone',
    badgeColor: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
    districts: ['Gaya', 'Nawada', 'Aurangabad', 'Jehanabad', 'Arwal']
  },
  {
    id: 'darbhanga',
    name: 'Darbhanga (Mithila)',
    headquarters: 'Darbhanga',
    tag: 'Mithila Cultural Heart',
    badgeColor: 'border-rose-500/40 bg-rose-500/10 text-rose-400',
    districts: ['Darbhanga', 'Madhubani', 'Samastipur']
  },
  {
    id: 'saran',
    name: 'Saran Division',
    headquarters: 'Chhapra',
    tag: 'Western Gateway',
    badgeColor: 'border-sky-500/40 bg-sky-500/10 text-sky-400',
    districts: ['Saran', 'Siwan', 'Gopalganj']
  },
  {
    id: 'kosi',
    name: 'Kosi Division',
    headquarters: 'Saharsa',
    tag: 'Eastern Waterways & Flood Plains',
    badgeColor: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400',
    districts: ['Saharsa', 'Madhepura', 'Supaul']
  },
  {
    id: 'purnia',
    name: 'Purnia Division',
    headquarters: 'Purnia',
    tag: 'Seemanchal Agro Belt',
    badgeColor: 'border-teal-500/40 bg-teal-500/10 text-teal-400',
    districts: ['Purnia', 'Katihar', 'Kishanganj', 'Araria']
  },
  {
    id: 'bhagalpur',
    name: 'Bhagalpur Division',
    headquarters: 'Bhagalpur',
    tag: 'Silk City & South Ganga',
    badgeColor: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400',
    districts: ['Bhagalpur', 'Banka']
  },
  {
    id: 'munger',
    name: 'Munger Division',
    headquarters: 'Munger',
    tag: 'Industrial & Rail Corridor',
    badgeColor: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400',
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
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-amber-400 border border-orange-500/30 mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>All 38 Districts Covered</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Explore Tenders by Bihar Administrative Division
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Filter public works directly for your registered circle, division, or local municipal corporation across Bihar.
          </p>
        </div>

        <button
          onClick={() => navigate('/tenders')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-orange-600 dark:text-amber-400 hover:underline shrink-0 cursor-pointer"
        >
          <span>View All Bihar Tenders</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 9 Division Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {BIHAR_DIVISIONS.map((division) => {
          const isActive = division.id === activeDivisionId;
          return (
            <button
              key={division.id}
              onClick={() => setActiveDivisionId(division.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border ${
                isActive
                  ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white border-transparent shadow-md shadow-orange-500/20'
                  : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-orange-500/50 hover:bg-orange-50/50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{division.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}>
                {division.districts.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Division Card & District Grid */}
      <div className="bg-gradient-to-br from-white via-slate-50 to-orange-50/20 dark:from-slate-850 dark:via-slate-800 dark:to-slate-900 rounded-3xl p-6 sm:p-8 border border-orange-200/60 dark:border-slate-700 shadow-xl relative overflow-hidden">
        {/* Subtle Madhubani top accent strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bihar-ribbon" />

        {/* Division Header Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-200/80 dark:border-slate-700/80 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-black text-sm shadow-md shrink-0">
              {activeDivision.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {activeDivision.name}
                </h3>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${activeDivision.badgeColor}`}>
                  HQ: {activeDivision.headquarters}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {activeDivision.tag} • {activeDivision.districts.length} Districts Unified
              </p>
            </div>
          </div>

          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>e-Proc2 Active Contracts</span>
          </div>
        </div>

        {/* District Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {activeDivision.districts.map((district) => (
            <button
              key={district}
              onClick={() => handleDistrictClick(district)}
              className="group p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 hover:border-orange-500 dark:hover:border-amber-400 hover:shadow-md transition-all text-left flex flex-col justify-between gap-3 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-xl bg-orange-50 dark:bg-slate-800 text-orange-600 dark:text-amber-400 flex items-center justify-center text-xs font-bold group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  <MapPin className="w-3.5 h-3.5" />
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-orange-500 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-amber-400 transition-colors block truncate">
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
