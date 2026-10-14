/**
 * @file src/components/home/MajorDepartmentsGrid.jsx
 * @description Visual department badges and quick-jump filters for Bihar's major engineering and public procurement departments.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Building2, HardHat, Droplets, Zap, Shield, Waves, GitCommit } from 'lucide-react';

export const MAJOR_BIHAR_DEPARTMENTS = [
  {
    code: 'RWD',
    name: 'Rural Works Department (RWD)',
    subtitle: 'PMGSY Rural Roads, Bridges & Culverts',
    icon: HardHat,
    accentColor: 'border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300',
    iconBg: 'bg-emerald-500 text-white',
    borderHover: 'hover:border-emerald-500',
    query: { department: 'Rural Works' },
    badge: 'State Road Network'
  },
  {
    code: 'RCD',
    name: 'Road Construction Department (RCD)',
    subtitle: 'State Highways, Expressways & 4-Lane Corridors',
    icon: Building2,
    accentColor: 'border-orange-500/40 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300',
    iconBg: 'bg-gradient-to-br from-orange-600 to-amber-600 text-white',
    borderHover: 'hover:border-orange-500',
    query: { department: 'Road Construction' },
    badge: 'Highways & Paving'
  },
  {
    code: 'PHED',
    name: 'Public Health Engineering (PHED)',
    subtitle: 'Har Ghar Nal-Jal Piped Water Supply Schemes',
    icon: Droplets,
    accentColor: 'border-sky-500/40 bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300',
    iconBg: 'bg-sky-500 text-white',
    borderHover: 'hover:border-sky-500',
    query: { category: 'Water' },
    badge: 'Jal-Jeevan-Hariyali'
  },
  {
    code: 'BCD',
    name: 'Building Construction Department (BCD)',
    subtitle: 'Medical Colleges, Courts, Collectorates & Civil Complexes',
    icon: Building2,
    accentColor: 'border-rose-500/40 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300',
    iconBg: 'bg-rose-600 text-white',
    borderHover: 'hover:border-rose-500',
    query: { department: 'Building Construction' },
    badge: 'Institutional Civil'
  },
  {
    code: 'WRD',
    name: 'Water Resources Department (WRD)',
    subtitle: 'Embankment Flood Control, Barrages & Canal Irrigation',
    icon: Waves,
    accentColor: 'border-blue-500/40 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300',
    iconBg: 'bg-blue-600 text-white',
    borderHover: 'hover:border-blue-500',
    query: { category: 'Civil Works' },
    badge: 'Irrigation & Drainage'
  },
  {
    code: 'BSPHCL',
    name: 'Bihar State Power Holding (BSPHCL)',
    subtitle: '33/11kV Substations, Transmission Grids & Smart Meters',
    icon: Zap,
    accentColor: 'border-amber-500/40 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300',
    iconBg: 'bg-amber-500 text-white',
    borderHover: 'hover:border-amber-500',
    query: { category: 'Electrical Works' },
    badge: 'Energy & Grid'
  },
  {
    code: 'BRPNNL',
    name: 'Bihar Rajya Pul Nirman Nigam (BRPNNL)',
    subtitle: 'Major River Bridges, Elevated Flyovers & Railway ROBs',
    icon: GitCommit,
    accentColor: 'border-purple-500/40 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300',
    iconBg: 'bg-purple-600 text-white',
    borderHover: 'hover:border-purple-500',
    query: { department: 'BRPNNL' },
    badge: 'Bridge Engineering'
  },
  {
    code: 'PMC',
    name: 'Patna Municipal Corporation (PMC)',
    subtitle: 'Urban Roads, Stormwater Drainage & Solid Waste Works',
    icon: Shield,
    accentColor: 'border-slate-500/40 bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300',
    iconBg: 'bg-slate-700 text-white',
    borderHover: 'hover:border-slate-500',
    query: { department: 'Patna Municipal' },
    badge: 'Urban Infrastructure'
  }
];

export function MajorDepartmentsGrid() {
  const navigate = useNavigate();

  const handleDeptClick = (query) => {
    const params = new URLSearchParams();
    if (query.department) params.set('department', query.department);
    if (query.category) params.set('category', query.category);
    navigate(`/tenders?${params.toString()}`);
  };

  return (
    <section id="departments-section" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-amber-400 border border-orange-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Government Bodies</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Major Bihar Engineering &amp; Works Departments
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Direct notices, technical specifications, and BOQ schedules synchronized with Bihar State e-Procurement.
          </p>
        </div>

        <button
          onClick={() => navigate('/tenders')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-orange-600 dark:text-amber-400 hover:underline shrink-0 cursor-pointer"
        >
          <span>All Departments</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {MAJOR_BIHAR_DEPARTMENTS.map((dept) => {
          const Icon = dept.icon;
          return (
            <div
              key={dept.code}
              onClick={() => handleDeptClick(dept.query)}
              className={`group bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 ${dept.borderHover} shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${dept.iconBg} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${dept.accentColor}`}>
                    {dept.badge}
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-amber-400 transition-colors leading-snug">
                  {dept.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {dept.subtitle}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs font-bold text-orange-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                <span>Browse Tenders</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
