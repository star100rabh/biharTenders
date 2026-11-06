/**
 * @file src/pages/Pricing.jsx
 * @description Modern, conversion-focused pricing plans with explicit WhatsApp number confirmation and live Razorpay checkout.
 */
import { useState, useEffect } from 'react';
import { 
  Check, 
  Shield, 
  ArrowRight, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { billingApi } from '@/services/billingApi';

export default function Pricing() {
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const navigate = useNavigate();

  const [subscription, setSubscription] = useState(null);
  const [loadingPlanId, setLoadingPlanId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch current user subscription status
  useEffect(() => {
    if (isAuthenticated) {
      billingApi.getStatus()
        .then((sub) => setSubscription(sub))
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const loadCashfreeScript = () => {
    return new Promise((resolve) => {
      if (window.Cashfree) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Direct checkout handler without intermediate modals
  const handleInitiateUpgrade = async (plan) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/pricing');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setLoadingPlanId(plan.id);

    try {
      const orderData = await billingApi.createOrder(plan.id, { 
        phone: user?.phone || '9999999999' 
      });

      // ==========================================
      // FLOW A: CASHFREE PAYMENT GATEWAY
      // ==========================================
      if (orderData.gateway === 'cashfree' && orderData.paymentSessionId) {
        const isLoaded = await loadCashfreeScript();
        if (!isLoaded || !window.Cashfree) {
          throw new Error('Failed to load Cashfree payment gateway SDK.');
        }

        const cashfree = window.Cashfree({
          mode: orderData.environment === 'production' ? 'production' : 'sandbox',
        });

        await cashfree.checkout({
          paymentSessionId: orderData.paymentSessionId,
          redirectTarget: '_modal',
        });

        // Verify after modal closes/completes
        try {
          const verifyRes = await billingApi.verifyPayment({
            orderId: orderData.orderId,
            planId: plan.id,
            gateway: 'cashfree',
          });

          if (verifyRes.success) {
            setSuccessMessage(`🎉 Payment verified! ${plan.name} activated successfully.`);
            const updatedSub = await billingApi.getStatus();
            setSubscription(updatedSub);
            checkAuth();
          }
        } catch (err) {
          const msg = err.response?.data?.message || err.message;
          if (msg && !msg.toLowerCase().includes('cancelled') && !msg.toLowerCase().includes('dismiss')) {
            setErrorMessage(msg);
          }
        } finally {
          setLoadingPlanId(null);
        }
        return;
      }

      // ==========================================
      // FLOW B: RAZORPAY GATEWAY
      // ==========================================
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Failed to load Razorpay payment gateway SDK.');
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount, // in paise
        currency: orderData.currency || 'INR',
        name: 'ContraBid',
        description: `${plan.name} Subscription`,
        order_id: orderData.orderId,
        prefill: {
          name: orderData.prefill?.name || user?.name || '',
          email: orderData.prefill?.email || user?.email || '',
          contact: orderData.prefill?.phone || user?.phone || '',
        },
        theme: {
          color: '#1E3A8A',
        },
        modal: {
          ondismiss: () => {
            setLoadingPlanId(null);
          }
        },
        handler: async (response) => {
          try {
            setLoadingPlanId(plan.id);
            const verifyRes = await billingApi.verifyPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              planId: plan.id,
              gateway: 'razorpay',
            });

            if (verifyRes.success) {
              setSuccessMessage(`🎉 Payment verified! ${plan.name} activated successfully. All Pro features unlocked.`);
              const updatedSub = await billingApi.getStatus();
              setSubscription(updatedSub);
              checkAuth();
            }
          } catch (err) {
            setErrorMessage(err.response?.data?.message || 'Payment verification failed.');
          } finally {
            setLoadingPlanId(null);
          }
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (failResponse) {
        setErrorMessage(`Payment Failed: ${failResponse.error?.description || 'Transaction declined.'}`);
        setLoadingPlanId(null);
      });
      paymentObject.open();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Payment initiation failed.');
      setLoadingPlanId(null);
    }
  };

  const PLANS = [
    {
      id: 'free',
      name: 'Free Starter',
      price: '₹0',
      period: 'forever',
      ratePerDay: 'Free forever',
      badge: 'Basic Access',
      desc: 'Discover active tenders and evaluate public works across Bihar.',
      features: [
        'First 15 tender cards unlocked per day',
        'Search across all 38 Bihar districts',
        'Save up to 10 bookmarked tenders',
        'Standard portal search helpers',
      ],
      isPopular: false,
      cta: 'Current Plan',
      disabled: true,
    },
    {
      id: 'pro_monthly',
      name: 'Pro Monthly',
      price: '₹10',
      period: '/ month',
      ratePerDay: 'Special Launch Offer',
      badge: 'Most Popular',
      desc: 'Everything an active contractor needs to win tenders in their district.',
      features: [
        'Full access to ALL tenders & pagination (no view limits)',
        'Instant Telegram & Email alerts for your Depts & Districts',
        'Instant BOQ Excel & Price Schedule 1-click downloads',
        'Save UNLIMITED tenders & document bookmarks',
        'Corrigendum & bid extension notifications',
        'Priority technical support desk',
      ],
      isPopular: true,
      cta: 'Pay ₹10 & Upgrade',
    },
    {
      id: 'pro_quarterly',
      name: 'Pro Quarterly',
      price: '₹999',
      period: '/ 3 months',
      ratePerDay: '~₹11 / day (Save 17%)',
      badge: 'Working Season',
      desc: 'Tailored for peak bidding seasons from spring through autumn.',
      features: [
        'All Pro Monthly features included',
        'Save 17% compared to monthly renewal',
        'Real-time Telegram & Email notification queue',
        'Dedicated contractor relationship liaison',
      ],
      isPopular: false,
      cta: 'Upgrade to Pro Quarterly',
    },
    {
      id: 'pro_annual',
      name: 'Pro Annual',
      price: '₹2,999',
      period: '/ year',
      ratePerDay: 'Only ~₹8 / day (Save 37%)',
      badge: 'Best Value',
      desc: 'Complete peace of mind for established Class A/B engineering firms.',
      features: [
        'All Pro features for a full 365 days',
        'Effective rate of only ₹249/month',
        'Priority desk & email hotline support',
        'Early access to newly automated department scrapers',
      ],
      isPopular: false,
      cta: 'Upgrade to Pro Annual',
    },
  ];

  const hasActiveSub = subscription?.hasActiveSubscription;

  return (
    <div className="min-h-screen bg-transparent py-10 sm:py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-patliputra-terracotta/10 dark:bg-patliputra-darkTerracotta/20 border border-patliputra-terracotta/30 dark:border-patliputra-darkTerracotta/40 text-patliputra-terracotta dark:text-patliputra-darkTerracotta text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Transparent Contractor Pricing
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-black text-patliputra-indigo dark:text-white tracking-tight">
            Win More Bihar Tenders with <span className="text-patliputra-terracotta dark:text-patliputra-darkTerracotta">Pro Intelligence</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Never miss an important contract in your district. Instant Telegram &amp; Email alerts, unblurred access across all departments, and 1-click BOQ downloads.
          </p>
        </div>

        {/* Alerts / Feedback */}
        {successMessage && (
          <div className="mt-8 max-w-2xl mx-auto p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div className="text-sm font-medium">{successMessage}</div>
          </div>
        )}

        {errorMessage && (
          <div className="mt-8 max-w-2xl mx-auto p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
            <div className="text-sm font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {PLANS.map((plan) => {
            const isCurrentActivePlan = hasActiveSub && subscription?.planId === plan.id;
            const isLoading = loadingPlanId === plan.id;

            return (
              <div 
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-xl p-6 transition-all duration-300 patliputra-glass ${
                  plan.isPopular 
                    ? 'border-2 border-patliputra-terracotta dark:border-patliputra-darkTerracotta shadow-xl shadow-patliputra-terracotta/10 scale-102 z-10' 
                    : 'border border-[#E6E1D8] dark:border-[#283341] shadow-xs hover:border-patliputra-terracotta/50'
                }`}
              >
                {/* Popular / Best Value Badge */}
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wide shadow-xs ${
                    plan.isPopular 
                      ? 'bg-patliputra-terracotta text-white' 
                      : 'bg-patliputra-indigo text-white dark:bg-[#283341]'
                  }`}>
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="text-lg font-bold text-patliputra-indigo dark:text-white mt-1">
                    {plan.name}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[32px]">
                    {plan.desc}
                  </p>

                  {/* Price */}
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-mono tabular-nums font-black text-patliputra-indigo dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {plan.period}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono tabular-nums font-semibold text-patliputra-peepal dark:text-patliputra-sage mt-0.5">
                    {plan.ratePerDay}
                  </div>

                  {/* Feature Checklist */}
                  <div className="mt-6 border-t border-slate-100 dark:border-slate-700 pt-5 space-y-3">
                    {plan.features.map((perk, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call to Action Button */}
                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-700">
                  {isCurrentActivePlan ? (
                    <div className="w-full py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-center font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-4 h-4" /> Active Plan
                    </div>
                  ) : plan.disabled ? (
                    <Button 
                      variant="outline" 
                      className="w-full text-xs font-semibold cursor-default opacity-60" 
                      disabled
                    >
                      {plan.cta}
                    </Button>
                  ) : (
                    <Button
                      variant={plan.isPopular ? 'primary' : 'outline'}
                      className="w-full text-xs font-bold py-2.5 shadow-sm"
                      onClick={() => handleInitiateUpgrade(plan)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                          Opening Payment...
                        </>
                      ) : (
                        <>
                          {plan.cta}
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust & Guarantee Banner */}
        <div className="mt-16 patliputra-glass rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-dalBlue dark:text-blue-400 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Zero Risk • Instant Online Activation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pay securely via UPI (Google Pay, PhonePe, Paytm), Netbanking, or Debit Cards. Cancel anytime.
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-3">
            <Button 
              variant="outline" 
              className="text-xs font-semibold"
              onClick={() => navigate('/contact')}
            >
              Need Enterprise Help?
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}