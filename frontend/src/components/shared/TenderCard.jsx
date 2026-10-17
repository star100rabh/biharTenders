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
  Layers,
  Sparkles 
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
    <article className={`group patliputra-glass border-l-4 border-l-[#C85A32] dark:border-l-[#E07A5F] rounded-2xl p-4 sm:p-5 shadow-xs transition-all duration-200 flex flex-col justify-between ${
      isBlurred 
        ? 'filter blur-[4px] select-none pointer-events-none opacity-45' 
        : 'hover:border-[#C85A32] dark:hover:border-[#E07A5F] hover:shadow-md'
    }`}>
      
      {/* ----------------- Top Header Row: Status Chip, ID, Authority & Save Heart ----------------- */}
      <div>
        <div className="flex items-start justify-between gap-2.5 mb-2">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0">
            {/* Live Bidding / Upcoming / Closed Chip */}
            {isPastClosing ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100/70 text-slate-600 dark:bg-[#0D1117]/60 dark:text-slate-400 border border-[#E6E1D8] dark:border-[#283341] shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>{isAwaitingOpening ? 'Awaiting Opening' : 'Closed'}</span>
              </span>
            ) : isUpcoming ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#1D3557]/10 text-[#1D3557] dark:bg-[#7EA2D6]/15 dark:text-[#7EA2D6] border border-[#1D3557]/20 dark:border-[#7EA2D6]/30 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1D3557] dark:bg-[#7EA2D6]" />
                <span>Upcoming</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#2D6A4F]/10 text-[#2D6A4F] dark:bg-[#52B788]/15 dark:text-[#52B788] border border-[#2D6A4F]/25 dark:border-[#52B788]/30 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F] dark:bg-[#52B788]" />
                <span>Live Bidding</span>
              </span>
            )}

            {/* Monospace Tabular Tender ID */}
            <span className="font-mono tabular-nums text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-200 patliputra-glass-badge px-2 py-0.5 rounded-lg shrink-0">
              {tender.sourceTenderId || tender.tenderReferenceNumber || 'NIT-ACTIVE'}
            </span>

            {/* Location Tag in Top Metadata Strip */}
            {locationTag && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 patliputra-glass-badge text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-medium">
                <MapPin className="w-3 h-3 text-[#C85A32] dark:text-[#E07A5F] shrink-0" />
                <span className="truncate max-w-[120px] sm:max-w-[160px]">{locationTag}</span>
              </span>
            )}

            {/* Issuing Authority */}
            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 truncate max-w-[150px] xs:max-w-[200px] sm:max-w-[280px]" title={issuingDept}>
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{issuingDept}</span>
            </span>
          </div>

          {/* Bookmark Heart Button */}
          <button
            type="button"
            onClick={() => toggleBookmark(tender)}
            className={`p-1.5 rounded-xl border transition-all shrink-0 cursor-pointer focus:outline-none ${
              bookmarked
                ? 'bg-red-50/90 border-red-200 text-red-500 dark:bg-red-950/40 dark:border-red-800'
                : 'border-[#E6E1D8]/80 dark:border-[#283341]/80 text-slate-400 hover:text-red-500 hover:border-red-200 bg-white/70 dark:bg-[#151B26]/70 backdrop-blur-xs'
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
          className="text-sm sm:text-base font-bold text-[#1D3557] dark:text-white hover:text-[#C85A32] dark:hover:text-[#E07A5F] transition-colors leading-snug break-words cursor-pointer mb-2"
        >
          {cleanTenderTitle(tender.title)}
        </h3>

        {/* Sub-header: Division & Multi-Work Notice */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2 truncate">
          {subDept && (
            <div className="flex items-center gap-1 truncate">
              <span>Division:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300 truncate" title={subDept}>
                {subDept}
              </span>
            </div>
          )}
          {tender.isMultiTender && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#C85A32] dark:text-[#E07A5F] bg-[#C85A32]/10 dark:bg-[#E07A5F]/15 px-2 py-0.2 rounded border border-[#C85A32]/25 dark:border-[#E07A5F]/30 shrink-0">
              <Layers className="w-3 h-3" />
              <span>Multi-Work NIT</span>
            </span>
          )}
        </div>
      </div>

      {/* ----------------- Middle Financials & Timeline Strip (Stacked Grid Columns) ----------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 py-2.5 my-2.5 patliputra-glass-subtle rounded-xl px-3.5">
        {/* 1. Estimated Value */}
        <div>
          <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider truncate">
            Estimated Value
          </span>
          <span className="font-mono tabular-nums text-xs sm:text-sm lg:text-base font-bold text-[#1D3557] dark:text-white truncate block mt-0.5">
            {formatCurrencyINR(tender.estimatedValue)}
          </span>
        </div>

        {/* 2. EMD Deposit */}
        <div>
          <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider truncate">
            EMD Deposit
          </span>
          <div className="flex flex-wrap items-center gap-1 font-mono tabular-nums text-xs sm:text-sm font-bold text-[#C85A32] dark:text-[#E07A5F] mt-0.5">
            <span className="truncate">
              {tender.emdExemptionAllowed === 'Yes' ? 'Exempt' : formatCurrencyINR(tender.emdAmount)}
            </span>
            {tender.emdExemptionAllowed === 'Yes' && (
              <span className="text-[9px] font-sans text-[#2D6A4F] dark:text-[#52B788] font-bold bg-[#2D6A4F]/10 dark:bg-[#52B788]/20 px-1 py-0.2 rounded border border-[#2D6A4F]/30 dark:border-[#52B788]/40 shrink-0">
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
            className="font-mono tabular-nums text-[11px] sm:text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1 mt-0.5" 
            title={(tender.publishedDateStr || tender.publishedDate) ? formatDateTimeDisplay(tender.publishedDateStr || tender.publishedDate) : 'See Notice'}
          >
            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
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
            className="font-mono tabular-nums text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5"
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
              <span className={`inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-lg border font-mono tabular-nums truncate ${
                isCritical
                  ? 'text-red-700 bg-red-50 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900'
                  : isWarning
                  ? 'text-[#C85A32] bg-[#C85A32]/10 border-[#C85A32]/30 dark:bg-[#E07A5F]/15 dark:text-[#E07A5F] dark:border-[#E07A5F]/30'
                  : 'text-[#2D6A4F] bg-[#2D6A4F]/10 border-[#2D6A4F]/30 dark:bg-[#52B788]/15 dark:text-[#52B788] dark:border-[#52B788]/30'
              }`}>
                <Clock className="w-3 h-3 shrink-0" />
                <span className="truncate">{liveTimeLeftStr}</span>
              </span>
            ) : daysLeft !== null && daysLeft >= 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-lg text-[#2D6A4F] bg-[#2D6A4F]/10 border border-[#2D6A4F]/30 dark:bg-[#52B788]/15 dark:text-[#52B788] dark:border-[#52B788]/30 truncate">
                <Clock className="w-3 h-3 shrink-0" />
                <span className="truncate">{daysLeft === 0 ? 'Closes Today' : `${daysLeft}d left`}</span>
              </span>
            ) : isAwaitingOpening ? (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900 px-2 py-0.5 rounded-lg truncate">
                <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="truncate">Awaiting Opening</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-medium text-slate-500 bg-[#FAF8F5] dark:bg-[#0D1117] px-2 py-0.5 rounded-lg border border-[#E6E1D8] dark:border-[#283341] truncate">
                Closed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ----------------- Bottom Row: District, Category, Badges & View Notice CTA ----------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Tender Category */}
          <span className="px-2 py-0.5 patliputra-glass-badge text-slate-600 dark:text-slate-300 rounded-lg text-[11px] font-medium truncate max-w-[140px] sm:max-w-[190px]" title={categoryLabel}>
            {categoryLabel}
          </span>

          {/* Official Notices Count */}
          {nitDocsCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 patliputra-glass-badge text-[#1D3557] dark:text-[#7EA2D6] text-[10px] font-mono tabular-nums font-semibold rounded-lg" title={`${nitDocsCount} Official Notice PDF(s)`}>
              <FileText className="w-3 h-3 shrink-0" />
              <span>{nitDocsCount} NIT Doc{nitDocsCount > 1 ? 's' : ''}</span>
            </span>
          )}

          {/* BOQ / NIT Archive Badge */}
          {(tender.boqZipUrl || tender.boqFileUrl || tender.workItemDocuments?.length > 0 || tender.coversInfo?.some((c) => c.documentType === '.xls')) && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#2D6A4F]/10 dark:bg-[#52B788]/15 text-[#2D6A4F] dark:text-[#52B788] text-[10px] font-mono tabular-nums font-semibold rounded-lg border border-[#2D6A4F]/20 dark:border-[#52B788]/30" title="BOQ & Work Documents Archive Available">
              <FileSpreadsheet className="w-3 h-3 shrink-0" />
              <span>BOQ / NIT</span>
            </span>
          )}
        </div>

        {/* Action Buttons: AI Analysis + View Details with Burnt Terracotta */}
        <div className="w-full sm:w-auto flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/services/${encodeURIComponent(tender.sourceTenderId || tenderId)}`);
            }}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#1D3557] dark:text-[#7EA2D6] patliputra-glass-badge hover:bg-white/80 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            title="Instant AI Tender Dossier & BOQ Extract"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C85A32] dark:text-[#E07A5F] shrink-0" />
            <span>AI Analyze</span>
          </button>

          <button
            type="button"
            onClick={handleCardClick}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-[#C85A32] hover:bg-[#b04b27] dark:bg-[#E07A5F] dark:hover:bg-[#d46a4e] text-white rounded-xl transition-all cursor-pointer group/btn shrink-0 border border-[#C85A32]/40"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
          </button>
        </div>
      </div>

    </article>
  );
}