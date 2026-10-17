/**
 * @file src/components/home/MajorDepartmentsGrid.jsx
 * @description Visual department cards and quick-jump filters for Bihar's major engineering and public procurement departments.
 * Styled with executive high-contrast enterprise design: deep navy badges, glowing Kesariya top highlights,
 * clear typography, and zero cartoonish elements.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Building2, 
  HardHat, 
  Droplets, 
  Zap, 
  Shield, 
  Waves, 
  GitCommit,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export const MAJOR_BIHAR_DEPARTMENTS = [
  {
    code: 'RWD',
    name: 'Rural Works Department',
    acronym: 'RWD Bihar',
    subtitle: 'PMGSY Rural Road Networks, Bridges & Culverts across 38 districts',
    icon: HardHat,
    accentGradient: 'from-emerald-500 to-teal-600',
    topGlow: 'bg-emerald-500',
    hoverBorder: 'hover:border-emerald-500',
    query: { department: 'Rural Works' },
    activeNoticeEstimate: '45+ Live Bids',
    portfolio: 'Rural Connectivity'
  },
  {
    code: 'RCD',
    name: 'Road Construction Department',
    acronym: 'RCD Bihar',
    subtitle: 'State Highways, 4-Lane Expressways & Paved River Corridors',
    icon: Building2,
    accentGradient: 'from-orange-500 to-amber-600',
    topGlow: 'bg-orange-500',
    hoverBorder: 'hover:border-orange-500',
    query: { department: 'Road Construction' },
    activeNoticeEstimate: '38+ Live Bids',
    portfolio: 'Highways & Paving'
  },
  {
    code: 'PHED',
    name: 'Public Health Engineering',
    acronym: 'PHED Bihar',
    subtitle: 'Har Ghar Nal-Jal Piped Drinking Water Supply Schemes & Filtration',
    icon: Droplets,
    accentGradient: 'from-sky-500 to-blue-600',
    topGlow: 'bg-sky-500',
    hoverBorder: 'hover:border-sky-500',
    query: { category: 'Water' },
    activeNoticeEstimate: '52+ Live Bids',
    portfolio: 'Jal-Jeevan-Hariyali'
  },
  {
    code: 'BCD',
    name: 'Building Construction Department',
    acronym: 'BCD Bihar',
    subtitle: 'Government Medical Colleges, Collectorates, Courts & Civil Complexes',
    icon: Building2,
    accentGradient: 'from-rose-500 to-red-600',
    topGlow: 'bg-rose-500',
    hoverBorder: 'hover:border-rose-500',
    query: { department: 'Building Construction' },
    activeNoticeEstimate: '29+ Live Bids',
    portfolio: 'Institutional Civil'
  },
  {
    code: 'WRD',
    name: 'Water Resources Department',
    acronym: 'WRD Bihar',
    subtitle: 'Embankment Flood Management, Barrages, Sluice Gates & Canal Irrigation',
    icon: Waves,
    accentGradient: 'from-blue-600 to-indigo-600',
    topGlow: 'bg-blue-600',
    hoverBorder: 'hover:border-blue-500',
    query: { category: 'Civil Works' },
    activeNoticeEstimate: '24+ Live Bids',
    portfolio: 'Irrigation & Drainage'
  },
  {
    code: 'BSPHCL',
    name: 'Bihar State Power Holding',
    acronym: 'BSPHCL Grid',
    subtitle: '33/11kV Substations, Transmission Lines, Transformers & Smart Meters',
    icon: Zap,
    accentGradient: 'from-amber-500 to-orange-600',
    topGlow: 'bg-amber-500',
    hoverBorder: 'hover:border-amber-500',
    query: { category: 'Electrical Works' },
    activeNoticeEstimate: '22+ Live Bids',
    portfolio: 'Energy & Power Grid'
  },
  {
    code: 'BRPNNL',
    name: 'Bihar Rajya Pul Nirman Nigam',
    acronym: 'BRPNNL',
    subtitle: 'Major River Bridges, Elevated Flyovers, Grade Separators & Railway ROBs',
    icon: GitCommit,
    accentGradient: 'from-purple-600 to-indigo-600',
    topGlow: 'bg-purple-600',
    hoverBorder: 'hover:border-purple-500',
    query: { department: 'BRPNNL' },
    activeNoticeEstimate: '18+ Live Bids',
    portfolio: 'Bridge Infrastructure'
  },
  {
    code: 'PMC',
    name: 'Patna Municipal Corporation',
    acronym: 'PMC Urban',
    subtitle: 'Capital City Roads, Stormwater Drain Systems, Solid Waste & Urban Works',
    icon: Shield,
    accentGradient: 'from-slate-700 to-slate-900',
    topGlow: 'bg-slate-700',
    hoverBorder: 'hover:border-slate-500',
    query: { department: 'Patna Municipal' },
    activeNoticeEstimate: '31+ Live Bids',
    portfolio: 'Municipal Works'
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
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#C85A32]/10 text-[#C85A32] dark:text-[#E07A5F] border border-[#C85A32]/25 mb-2.5">
            <Building2 className="w-3.5 h-3.5" />
            <span>Official Government Engineering Portfolios</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1D3557] dark:text-white tracking-tight">
            Major Bihar Engineering &amp; Works Departments
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Direct notices, technical schedules, and BOQ documents synchronized with Bihar State e-Procurement (eproc2.bihar.gov.in).
          </p>
        </div>

        <button
          onClick={() => navigate('/tenders')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#C85A32] dark:text-[#E07A5F] hover:bg-[#FAF8F5] dark:hover:bg-[#151B26] transition-colors border border-[#E6E1D8] dark:border-[#283341] shrink-0 cursor-pointer"
        >
          <span>View All Bihar Tenders</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Modern Department Cards (Strict 12-Column Grid Alignment) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {MAJOR_BIHAR_DEPARTMENTS.map((dept) => {
          const Icon = dept.icon;
          return (
            <div
              key={dept.code}
              onClick={() => handleDeptClick(dept.query)}
              className="group bg-white dark:bg-[#151B26] p-5 sm:p-6 rounded-2xl border border-[#E6E1D8] dark:border-[#283341] hover:border-[#C85A32] dark:hover:border-[#E07A5F] transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden h-full"
            >
              {/* Subtle 2px Top Accent Border */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#C85A32] dark:bg-[#E07A5F] opacity-75 group-hover:opacity-100 transition-opacity" />

              <div>
                {/* Header Row: Department Code Pill + Live Pulse */}
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg bg-[#FAF8F5] dark:bg-[#0D1117] text-[#1D3557] dark:text-[#7EA2D6] border border-[#E6E1D8] dark:border-[#283341] tracking-wider">
                      {dept.code}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {dept.portfolio}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#2D6A4F] dark:text-[#52B788] bg-[#2D6A4F]/10 dark:bg-[#52B788]/15 px-2 py-0.5 rounded-full border border-[#2D6A4F]/20 dark:border-[#52B788]/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F] dark:bg-[#52B788]" />
                    <span>Live</span>
                  </span>
                </div>

                {/* Icon Container with Dual Tone & Clean Geometry */}
                <div className="flex items-start gap-3 mb-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] dark:bg-[#0D1117] border border-[#E6E1D8] dark:border-[#283341] text-[#1D3557] dark:text-[#7EA2D6] flex items-center justify-center shrink-0 group-hover:text-[#C85A32] dark:group-hover:text-[#E07A5F] transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-[#1D3557] dark:text-white group-hover:text-[#C85A32] dark:group-hover:text-[#E07A5F] transition-colors leading-snug">
                      {dept.name}
                    </h3>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {dept.acronym}
                    </span>
                  </div>
                </div>

                {/* Subtitle / Scope Description */}
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed line-clamp-2">
                  {dept.subtitle}
                </p>
              </div>

              {/* Card Footer: Live Tender Count + Action CTA */}
              <div className="mt-5 pt-3 border-t border-[#E6E1D8] dark:border-[#283341] flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {dept.activeNoticeEstimate}
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-[#C85A32] dark:text-[#E07A5F] group-hover:translate-x-1 transition-transform">
                  <span>Browse Tenders</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
