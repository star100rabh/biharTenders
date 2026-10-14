/**
 * @file src/components/shared/TenderCard.jsx
 * @description Spacious, high-legibility enterprise tender notice card.
 * Combines full-width readability with the modern ProcureHub theme:
 * 5-column financial and timeline strip (Value, EMD, Published Date, Closing Date, Countdown),
 * live status indicator, district location tag, BOQ documents badge, and emerald CTA.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  MapPin, 
  Heart, 
  ArrowRight, 
  FileSpreadsheet, 
  Building2, 
  Calendar, 
  FileText, 
  Layers 
} from 'lucide-react';

import { 
  formatCurrencyINR, 
  formatDateDisplay, 
  formatDateTimeDisplay, 
  extractFamousLocation, 
  cleanTenderTitle 
} from '@/utils/formatters';
import { useBookmarkStore } from '@/store/useBookmarkStore';
import { useAuthStore } from '@/store/useAuthStore';

export function TenderCard({ tender, onViewDetails, isBlurred = false }) {
  const { toggleBookmark, isBookmarked } = useBookmarkStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();
  
  const tenderId = tender._id || tender.sourceTenderId;
  const bookmarked = isBookmarked(tenderId);

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(tender);
      return;
    }
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/tenders/${tenderId}`)}`);
      return;
    }
    navigate(`/tenders/${tenderId}`);
  };
  
  // Extract department hierarchy
  const orgParts = (tender.organisationChain || '').split('||').map((p) => p.trim());
  const issuingDept = orgParts[0] || tender.department || 'Government Authority';
  const subDept = orgParts.length > 1 ? orgParts[orgParts.length - 1] : '';

  // Calculate days remaining & live countdown to bid submission deadline
  const [liveTimeLeftStr, setLiveTimeLeftStr] = useState('');
  const [daysLeft, setDaysLeft] = useState(null);
  const [isPastClosing, setIsPastClosing] = useState(false);

  useEffect(() => {
    const closingDateStr = tender.bidSubmissionEndDate?.$date || tender.closingDate;
    if (!closingDateStr) return;

    const updateTime = () => {
      const diff = new Date(closingDateStr).getTime() - new Date().getTime();
      if (diff <= 0) {
        setDaysLeft(-1);
        setIsPastClosing(true);
        setLiveTimeLeftStr('');
        return;
      }
      
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      
      setDaysLeft(Math.ceil(diff / (1000 * 60 * 60 * 24)));
      setIsPastClosing(false);
      setLiveTimeLeftStr(`${d}d ${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m left`);
    };

    updateTime();
    const intervalId = setInterval(updateTime, 30000); // update every 30s
    return () => clearInterval(intervalId);
  }, [tender.bidSubmissionEndDate, tender.closingDate]);

  const isCritical = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;
  const isWarning = daysLeft !== null && daysLeft > 3 && daysLeft <= 7;
  const bidOpeningTime = tender.bidOpeningDate ? new Date(tender.bidOpeningDate).getTime() : 0;
  const isAwaitingOpening = isPastClosing && bidOpeningTime >= new Date().getTime();
  const isUpcoming = tender.status === 'UPCOMING' || Boolean(tender.bidSubmissionStartDate && new Date(tender.bidSubmissionStartDate).getTime() > new Date().getTime());

  // Category normalization
  const categoryLabel = ['PERCENTAGE', 'ITEM RATE', 'PERCENTAGE RATE'].includes((tender.productCategory || '').toUpperCase()) 
    ? (tender.tenderCategory || 'Works') 
    : (tender.productCategory || tender.tenderCategory || 'Works');

  const locationTag = extractFamousLocation(tender);
  const nitDocsCount = tender.nitDocuments?.length || tender.pdfUrls?.length || 0;

  return (
    <article className={`group bg-white dark:bg-slate-800/95 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-4 sm:p-6 shadow-xs transition-all duration-200 flex flex-col justify-between ${
      isBlurred 
        ? 'filter blur-[4px] select-none pointer-events-none opacity-45' 
        : 'hover:border-orange-500/60 dark:hover:border-amber-500/60 hover:shadow-lg hover:-translate-y-0.5'
    }`}>
      
      {/* ----------------- Top Header Row: Status Chip, ID, Authority & Save Heart ----------------- */}
      <div>
        <div className="flex items-start justify-between gap-2.5 mb-2.5">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0">
            {/* Live Bidding / Upcoming / Closed Chip */}
            {isPastClosing ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>{isAwaitingOpening ? 'Awaiting Opening' : 'Closed'}</span>
              </span>
            ) : isUpcoming ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Upcoming</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Bidding</span>
              </span>
            )}

            {/* Monospace Tender ID */}
            <span className="font-mono text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
              {tender.sourceTenderId || tender.tenderReferenceNumber || 'NIT-ACTIVE'}
            </span>

            {/* Multi-Work NIT Tag */}
            {tender.isMultiTender && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 shrink-0" title="Part of a Multi-Work Notice">
                <Layers className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>Multi-Work NIT</span>
              </span>
            )}

            {/* Issuing Authority */}
            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 truncate max-w-[150px] xs:max-w-[220px] sm:max-w-[320px]" title={issuingDept}>
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{issuingDept}</span>
            </span>
          </div>

          {/* Bookmark Heart Button */}
          <button
            type="button"
            onClick={() => toggleBookmark(tender)}
            className={`p-1.5 rounded-xl border transition-all shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
              bookmarked
                ? 'bg-red-50 border-red-200 text-red-500 dark:bg-red-950/40 dark:border-red-800 shadow-xs'
                : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50/50 dark:hover:bg-red-950/20 bg-white dark:bg-slate-800'
            }`}
            title={bookmarked ? 'Remove from Saved' : 'Save this Tender'}
            aria-label="Bookmark Tender"
          >
            <Heart className={`w-4 h-4 transition-transform active:scale-125 ${bookmarked ? 'fill-current text-red-500' : ''}`} />
          </button>
        </div>

        {/* ----------------- Prominent Tender Title ----------------- */}
        <h3 
          onClick={handleCardClick}
          title={cleanTenderTitle(tender.title)}
          className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-amber-400 transition-colors leading-snug break-words cursor-pointer mb-2"
        >
          {cleanTenderTitle(tender.title)}
        </h3>

        {/* Sub-header: Division & Quick Reference */}
        {subDept && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2 truncate">
            <span>Division:</span>
            <span className="font-medium text-slate-700 dark:text-slate-300 truncate" title={subDept}>
              {subDept}
            </span>
          </div>
        )}
      </div>

      {/* ----------------- Middle Financials & Timeline Strip (5 Columns) ----------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 py-3 my-3 border-y border-slate-100 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-900/40 rounded-xl px-3.5">
        {/* 1. Estimated Value */}
        <div>
          <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider truncate">
            Estimated Value
          </span>
          <span className="font-mono text-xs sm:text-sm lg:text-base font-bold text-[#071325] dark:text-white truncate block mt-0.5">
            {formatCurrencyINR(tender.estimatedValue)}
          </span>
        </div>

        {/* 2. EMD Deposit */}
        <div>
          <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider truncate">
            EMD Deposit
          </span>
          <div className="flex flex-wrap items-center gap-1 font-mono text-xs sm:text-sm font-bold text-orange-600 dark:text-amber-400 mt-0.5">
            <span className="truncate">
              {tender.emdExemptionAllowed === 'Yes' ? 'Exempt' : formatCurrencyINR(tender.emdAmount)}
            </span>
            {tender.emdExemptionAllowed === 'Yes' && (
              <span className="text-[9px] font-sans text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-1 py-0.2 rounded border border-emerald-200 dark:border-emerald-800 shrink-0">
                Exempt
              </span>
            )}
          </div>
        </div>

        {/* 3. Published Date & Time */}
        <div>
          <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider truncate">
            Published Date
          </span>
          <span 
            className="font-mono text-[11px] sm:text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1 mt-0.5" 
            title={(tender.publishedDateStr || tender.publishedDate) ? formatDateTimeDisplay(tender.publishedDateStr || tender.publishedDate) : 'See Notice'}
          >
            <Clock className="w-3 h-3 text-orange-600 dark:text-amber-400 shrink-0" />
            <span className="truncate">
              {(tender.publishedDateStr || tender.publishedDate) 
                ? formatDateTimeDisplay(tender.publishedDateStr || tender.publishedDate) 
                : 'See Notice'}
            </span>
          </span>
        </div>

        {/* 4. Closing / Expire Date */}
        <div>
          <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider truncate">
            Closing Date
          </span>
          <span 
            className="font-mono text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5"
            title={formatDateTimeDisplay(tender.closingDateStr || tender.bidSubmissionEndDateStr || tender.closingDate)}
          >
            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">
              {formatDateTimeDisplay(tender.closingDateStr || tender.bidSubmissionEndDateStr || tender.closingDate)}
            </span>
          </span>
        </div>

        {/* 5. Live Countdown / Status */}
        <div className="col-span-2 sm:col-span-1">
          <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider truncate">
            Time Left
          </span>
          <div className="mt-0.5">
            {liveTimeLeftStr ? (
              <span className={`inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-lg border font-mono truncate ${
                isCritical
                  ? 'text-red-700 bg-red-50 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900'
                  : isWarning
                  ? 'text-amber-800 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900'
                  : 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900'
              }`}>
                <Clock className="w-3 h-3 shrink-0" />
                <span className="truncate">{liveTimeLeftStr}</span>
              </span>
            ) : daysLeft !== null && daysLeft >= 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-lg text-emerald-700 bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900 truncate">
                <Clock className="w-3 h-3 shrink-0" />
                <span className="truncate">{daysLeft === 0 ? 'Closes Today' : `${daysLeft}d left`}</span>
              </span>
            ) : isAwaitingOpening ? (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900 px-2 py-0.5 rounded-lg truncate" title="Bids submitted. Awaiting opening.">
                <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="truncate">Awaiting Opening</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 truncate">
                Closed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ----------------- Bottom Row: District, Category, Badges & View Notice CTA ----------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Famous Bihar District / Location Tag */}
          {locationTag && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 dark:bg-orange-950/40 text-orange-800 dark:text-orange-200 rounded-lg text-[11px] sm:text-xs font-semibold border border-orange-200 dark:border-orange-800/60 shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
              <span className="truncate max-w-[140px] sm:max-w-[180px]" title={locationTag}>
                {locationTag}
              </span>
            </span>
          )}

          {/* Tender Category */}
          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-lg text-[11px] sm:text-xs font-medium truncate max-w-[140px] sm:max-w-[190px]" title={categoryLabel}>
            {categoryLabel}
          </span>

          {/* Official Notices Count */}
          {nitDocsCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[10px] font-mono font-semibold rounded-lg border border-blue-200 dark:border-blue-800" title={`${nitDocsCount} Official Notice PDF(s)`}>
              <FileText className="w-3 h-3 shrink-0" />
              <span>{nitDocsCount} {nitDocsCount > 1 ? 'NIT Docs' : 'NIT Doc'}</span>
            </span>
          )}

          {/* BOQ / Work Item Archive Badge */}
          {(tender.boqZipUrl || tender.boqFileUrl || tender.workItemDocuments?.length > 0 || tender.coversInfo?.some((c) => c.documentType === '.xls')) && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-semibold rounded-lg border border-emerald-200 dark:border-emerald-800" title="BOQ & Work Documents Archive Available">
              <FileSpreadsheet className="w-3 h-3 shrink-0" />
              <span>{tender.boqZipUrl ? 'BOQ ZIP' : (tender.workItemDocuments?.length > 1 ? `${tender.workItemDocuments.length} Work Docs` : 'BOQ')}</span>
            </span>
          )}

          {/* Pending Document Release Badge */}
          {(!tender.nitDocuments?.length && !tender.pdfUrls?.length && !tender.boqZipUrl && !tender.boqFileUrl && tender.documentDownloadStartDate) && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[10px] font-mono font-semibold rounded-lg border border-amber-200 dark:border-amber-800" title={`Documents available on ${formatDateTimeDisplay(tender.documentDownloadStartDate)}`}>
              <Clock className="w-3 h-3 shrink-0" />
              <span>Docs: {formatDateTimeDisplay(tender.documentDownloadStartDate)}</span>
            </span>
          )}
        </div>

        {/* Action Button: View Notice with Bihar Kesariya Gradient */}
        <div className="w-full sm:w-auto">
          <button
            type="button"
            onClick={handleCardClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl transition-all duration-150 shadow-xs hover:shadow-saffron-glow cursor-pointer group/btn"
          >
            <span>View Tender Details</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
          </button>
        </div>
      </div>

    </article>
  );
}