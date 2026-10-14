/**
 * @file src/components/layout/Footer.jsx
 * @description Classical platform footer containing official portal links,
 * regional operations desk information, and directory shortcuts.
 */
import { Link } from 'react-router-dom';
import { Landmark, Mail, MapPin, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#051121] text-white pt-14 pb-9 border-t border-orange-500/20 mt-auto relative overflow-hidden">
      {/* Top Auspicious Bihar Ribbon */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 via-amber-500 to-emerald-600" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          
          {/* Brand & Description */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0 border border-amber-300/40">
                <Landmark className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-display font-black tracking-tight text-white leading-none">
                  Bihar<span className="text-amber-400">Tenders</span>
                </span>
                <span className="text-[10px] text-amber-200/90 font-semibold tracking-wider mt-0.5">
                  Bihar Procurement Portal
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Unified platform for transparent, digital, and real-time public tender notices across all 38 districts of Bihar. Covering Rural Works (RWD), Road Construction (RCD), Building Construction (BCD), and Water Resources (WRD) tenders.
            </p>
            <div className="pt-1 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-orange-500/20 text-amber-300 border border-orange-500/40">
                All 38 Districts Covered
              </span>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ✓ 100% Verified
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-display font-bold uppercase tracking-wider text-amber-400 mb-3.5 flex items-center gap-1.5">
              <span>Navigation</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link to="/tenders" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span>Active Tenders</span>
                </Link>
              </li>
              <li>
                <Link to="/tenders?status=upcoming" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span>Upcoming Pipeline</span>
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span>AI Tender Dossier</span>
                </Link>
              </li>
              <li>
                <Link to="/check-score" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span>Bid Capacity Calculator</span>
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span>Contractor Plans</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Official Bihar Links */}
          <div>
            <h4 className="text-xs font-display font-bold uppercase tracking-wider text-amber-400 mb-3.5 flex items-center gap-1.5">
              <span>Government Portals</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <a 
                  href="https://eproc2.bihar.gov.in" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-amber-400 transition-colors"
                >
                  <span>eProc2 Bihar Official Portal</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a 
                  href="https://state.bihar.gov.in" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-amber-400 transition-colors"
                >
                  <span>Bihar State Portal</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a 
                  href="http://bsphcl.co.in" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-amber-400 transition-colors"
                >
                  <span>BSPHCL (Power Grid Tenders)</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <Link to="/terms" className="hover:text-amber-400 transition-colors">
                  Bidding Terms
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-amber-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Procurement Helpdesk */}
          <div className="space-y-3">
            <h4 className="text-xs font-display font-bold uppercase tracking-wider text-amber-400 mb-3.5">
              Patna Helpdesk
            </h4>
            <div className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
              <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <span>Dak Bungalow Chauraha, Bailey Road, Patna, Bihar 800001</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <Mail className="w-4 h-4 text-orange-400 shrink-0" />
              <a href="mailto:support@bihartenders.in" className="hover:text-amber-400 transition-colors font-mono">
                support@bihartenders.in
              </a>
            </div>
            <div className="pt-2 text-[11px] text-slate-400">
              <span>Operating Hours: Monday to Saturday, 09:30 AM – 06:00 PM IST</span>
            </div>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3 text-center sm:text-left">
          <p>© {new Date().getFullYear()} BiharTenders. Unified e-procurement data intelligence for Bihar public works.</p>
          <div className="flex flex-wrap justify-center gap-4 text-slate-400">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/refund-policy" className="hover:text-white transition-colors">Refunds</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            <span className="text-amber-500 font-mono font-bold">Bihar Edition</span>
          </div>
        </div>
      </div>
    </footer>
  );
}