/**
 * @file src/components/layout/Footer.jsx
 * @description Classical platform footer containing official portal links,
 * regional operations desk information, and directory shortcuts.
 */
import { Link } from 'react-router-dom';
import { Landmark, Mail, MapPin, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#06101E] text-white pt-14 pb-9 border-t border-slate-800/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          
          {/* Brand & Description */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                <Landmark className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-display font-black tracking-tight text-white">
                Bihar<span className="text-emerald-400">Tenders</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              The unified national and state portal for transparent, paperless, and time-bound public procurement intelligence across all 38 districts of Bihar.
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-display font-bold uppercase tracking-wider text-slate-200 mb-3.5">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/tenders" className="hover:text-emerald-400 transition-colors">
                  Active RFPs &amp; Tenders
                </Link>
              </li>
              <li>
                <Link to="/tenders?status=upcoming" className="hover:text-emerald-400 transition-colors">
                  Upcoming Pipeline Notices
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-emerald-400 transition-colors">
                  AI Tender Dossier &amp; Estimator
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-emerald-400 transition-colors">
                  Contractor Plans &amp; Access
                </Link>
              </li>
              <li>
                <Link to="/check-score" className="hover:text-emerald-400 transition-colors">
                  Bid Qualification Checker
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h4 className="text-xs font-display font-bold uppercase tracking-wider text-slate-200 mb-3.5">
              Legal &amp; Compliance
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/terms" className="hover:text-emerald-400 transition-colors">
                  Standard Bidding Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-emerald-400 transition-colors">
                  Data Privacy &amp; Security Policy
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-emerald-400 transition-colors">
                  Refund &amp; Cancellation Terms
                </Link>
              </li>
              <li>
                <a 
                  href="https://eproc2.bihar.gov.in" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                >
                  <span>Bihar eProc2 Official Portal</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Procurement Helpdesk */}
          <div className="space-y-3">
            <h4 className="text-xs font-display font-bold uppercase tracking-wider text-slate-200 mb-3.5">
              Procurement Helpdesk
            </h4>
            <div className="flex items-start gap-2.5 text-xs text-slate-400 leading-relaxed">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Dak Bungalow Road, Fraser Road Area, Patna, Bihar 800001</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
              <a href="mailto:starsaurabhpatel143@gmail.com" className="hover:text-emerald-400 transition-colors">
                starsaurabhpatel143@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3 text-center sm:text-left">
          <p>© {new Date().getFullYear()} BiharTenders. Official procurement records synchronized via eproc2.bihar.gov.in.</p>
          <div className="flex flex-wrap justify-center gap-4 text-slate-400">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/refund-policy" className="hover:text-white transition-colors">Refunds</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            <span className="text-slate-600 font-mono">v2.1.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}