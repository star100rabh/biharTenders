/**
 * @file src/components/layout/Footer.jsx
 * @description Classical platform footer containing official portal links,
 * regional operations desk information, and directory shortcuts.
 */
import { Link } from 'react-router-dom';
import { Landmark, Mail, MapPin, ExternalLink, Phone, Send } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#FAF8F5] dark:bg-[#0D1117] text-[#1D3557] dark:text-slate-100 pt-12 pb-8 border-t border-[#E6E1D8] dark:border-[#283341] mt-auto relative overflow-hidden transition-colors duration-200">
      {/* Top Auspicious Bihar Ribbon */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#C85A32] via-[#D97706] to-[#2D6A4F]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          
          {/* Brand & Description */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C85A32] to-[#E07A5F] text-white flex items-center justify-center shadow-xs shrink-0 border border-[#FAF8F5] dark:border-[#283341]">
                <Landmark className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-display font-black tracking-tight text-[#1D3557] dark:text-white leading-none">
                  Bihar<span className="text-[#C85A32] dark:text-[#E07A5F]">Tenders</span>
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-wider mt-0.5">
                  बिहार सरकार निविदा पोर्टल
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Unified platform for transparent, digital, and real-time public tender notices across all 38 districts of Bihar. Covering Rural Works (RWD), Road Construction (RCD), Building Construction (BCD), and Water Resources (WRD) tenders.
            </p>
            <div className="pt-1 flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#FAF8F5] dark:bg-[#151B26] text-[#C85A32] dark:text-[#E07A5F] border border-[#E6E1D8] dark:border-[#283341]">
                38 Districts Covered
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#FAF8F5] dark:bg-[#151B26] text-[#2D6A4F] dark:text-[#52B788] border border-[#E6E1D8] dark:border-[#283341]">
                ✓ 100% Verified eProc2
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-display font-bold uppercase tracking-wider text-[#C85A32] dark:text-[#E07A5F] mb-3 flex items-center gap-1.5">
              <span>Navigation</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
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
              <li>
                <a 
                  href="https://t.me/bihartendersofficial" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#0284c7] dark:text-[#38bdf8] font-semibold hover:underline transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram Alerts Channel</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Official Bihar Links */}
          <div>
            <h4 className="text-xs font-display font-bold uppercase tracking-wider text-[#C85A32] dark:text-[#E07A5F] mb-3 flex items-center gap-1.5">
              <span>Government Portals</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li>
                <a 
                  href="https://eproc2.bihar.gov.in" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-[#C85A32] dark:hover:text-[#E07A5F] transition-colors"
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
                  className="inline-flex items-center gap-1.5 hover:text-[#C85A32] dark:hover:text-[#E07A5F] transition-colors"
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
                  className="inline-flex items-center gap-1.5 hover:text-[#C85A32] dark:hover:text-[#E07A5F] transition-colors"
                >
                  <span>BSPHCL (Power Grid Tenders)</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[#C85A32] dark:hover:text-[#E07A5F] transition-colors">
                  Bidding Terms
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-[#C85A32] dark:hover:text-[#E07A5F] transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Procurement Helpdesk */}
          <div className="space-y-3">
            <h4 className="text-xs font-display font-bold uppercase tracking-wider text-[#C85A32] dark:text-[#E07A5F] mb-3">
              Patna Helpdesk
            </h4>
            <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <MapPin className="w-4 h-4 text-[#C85A32] dark:text-[#E07A5F] shrink-0 mt-0.5" />
              <span>Dak Bungalow Chauraha, Bailey Road, Patna, Bihar 800001</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
              <Phone className="w-4 h-4 text-[#C85A32] dark:text-[#E07A5F] shrink-0" />
              <a href="tel:+918933068171" className="hover:text-[#C85A32] dark:hover:text-[#E07A5F] transition-colors font-mono tabular-nums">
                +91 8933068171
              </a>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
              <Mail className="w-4 h-4 text-[#C85A32] dark:text-[#E07A5F] shrink-0" />
              <a href="mailto:rsaurabhp03@gmail.com" className="hover:text-[#C85A32] dark:hover:text-[#E07A5F] transition-colors font-mono">
                rsaurabhp03@gmail.com
              </a>
            </div>
            <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span>Operating Hours: Monday to Saturday, 09:30 AM – 06:00 PM IST</span>
            </div>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="mt-10 pt-6 border-t border-[#E6E1D8] dark:border-[#283341] flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-3 text-center sm:text-left">
          <p>© {new Date().getFullYear()} BiharTenders. Unified e-procurement data intelligence for Bihar public works.</p>
          <div className="flex flex-wrap justify-center gap-4 text-slate-500 dark:text-slate-400">
            <Link to="/privacy-policy" className="hover:text-[#C85A32] dark:hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-[#C85A32] dark:hover:text-white transition-colors">Terms</Link>
            <Link to="/refund-policy" className="hover:text-[#C85A32] dark:hover:text-white transition-colors">Refunds</Link>
            <Link to="/contact" className="hover:text-[#C85A32] dark:hover:text-white transition-colors">Contact</Link>
            <span className="text-[#C85A32] dark:text-[#E07A5F] font-mono font-bold">Patliputra Edition</span>
          </div>
        </div>
      </div>
    </footer>
  );
}