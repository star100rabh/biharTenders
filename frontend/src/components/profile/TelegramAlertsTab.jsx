/**
 * @file frontend/src/components/profile/TelegramAlertsTab.jsx
 * @description Contractor Telegram notification & live channel tab.
 * Matches WhatsApp Alerts aesthetics with official BiharTenders Telegram integration.
 */
import { 
  Send, 
  ExternalLink, 
  BellRing, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Check, 
  Radio, 
  Bot, 
  Layers,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function TelegramAlertsTab() {
  const telegramChannelUrl = 'https://t.me/bihartendersofficial';
  const telegramBotUrl = 'https://t.me/Bihar_tenders_bot';

  const benefits = [
    {
      title: 'Instant eProc2 Broadcasts',
      desc: 'Get notified within seconds when Bihar government departments publish new NITs and tender notices.',
      icon: Radio
    },
    {
      title: '38 Districts & Key Departments',
      desc: 'Comprehensive coverage of RWD, RCD, PHED, BCD, WRD, BSPHCL, and all district divisions.',
      icon: Layers
    },
    {
      title: 'Direct PDF & BOQ Downloads',
      desc: 'Direct secured links to tender documents hosted on Cloudflare high-speed edge network.',
      icon: FileText
    },
    {
      title: 'Verified Official Source',
      desc: '100% automated crawler pipeline synced directly with eproc2.bihar.gov.in portal.',
      icon: ShieldCheck
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: Channel Highlights */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0088cc]/10 via-[#0088cc]/5 to-transparent border border-[#0088cc]/20 dark:border-[#0088cc]/30 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#0088cc]/15 text-[#0088cc] dark:text-[#38bdf8] border border-[#0088cc]/30">
              <span className="w-2 h-2 rounded-full bg-[#0088cc] animate-pulse" />
              <span>Official BiharTenders Broadcast</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2.5">
              <Send className="w-6 h-6 text-[#0088cc]" />
              <span>Telegram Tender Alerts</span>
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Connect directly to our official broadcast channel and automated bot to receive real-time Bihar public procurement alerts directly on your phone or desktop.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <a
              href={telegramChannelUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold text-sm shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Send className="w-4 h-4" />
              <span>Join Official Channel</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            <a
              href={telegramBotUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl patliputra-glass-badge hover:bg-slate-50/50 dark:hover:bg-slate-700/50 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 font-semibold text-xs shadow-xs transition-all"
            >
              <Bot className="w-4 h-4 text-[#0088cc]" />
              <span>Start Personal Alert Bot</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Two-Column Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Channel Details Card */}
        <div className="patliputra-glass border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#0088cc]/10 flex items-center justify-center text-[#0088cc]">
                <Send className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                ● Live Channel
              </span>
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Bihar Tenders Official Channel
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                @bihartendersofficial
              </p>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Public channel delivering collective procurement bulletins, large-value NIT announcements, corrigendum alerts, and active tender updates as soon as they are indexed.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
            <a
              href={telegramChannelUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0088cc] hover:underline"
            >
              <span>Open https://t.me/bihartendersofficial</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Bot Details Card */}
        <div className="patliputra-glass border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Bot className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                Verified Bot
              </span>
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Bihar Tenders Alert Bot
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                @Bihar_tenders_bot
              </p>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Automated ingestion engine bot that delivers crawl status, system health reports, and direct alert pings without relying on 3rd-party messaging quotas.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
            <a
              href={telegramBotUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
            >
              <span>Open https://t.me/Bihar_tenders_bot</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

      </div>

      {/* Feature Grid */}
      <div className="patliputra-glass border border-slate-200 dark:border-slate-700 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
        <div>
          <h4 className="text-base font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Why Join BiharTenders on Telegram?</span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Built for contractors who require zero-delay notifications for competitive bidding.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div 
                key={i} 
                className="p-4 rounded-xl patliputra-glass-subtle border border-slate-100 dark:border-slate-700/60 flex items-start gap-3.5"
              >
                <div className="w-8 h-8 rounded-lg bg-[#0088cc]/10 text-[#0088cc] flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                    {b.title}
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {b.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Status & Help Note */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>100% Free for all registered Bihar contractors</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <span>Channel ID:</span>
            <code className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-800 dark:text-slate-200">
              @bihartendersofficial
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TelegramAlertsTab;
