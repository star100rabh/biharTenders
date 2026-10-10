import React, { useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

export default function RefundPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 sm:p-12">
        <div className="flex items-center gap-4 mb-8 border-b border-slate-100 dark:border-slate-700 pb-8">
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Refund & Cancellation Policy</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Last Updated: October 10, 2026</p>
          </div>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-xl prose-h2:mt-8">
          <h2>1. Subscription Cancellations</h2>
          <p>You can cancel your BiharTenders Pro subscription at any time through your account dashboard. Upon cancellation, your automatic renewals will be stopped. You will continue to have access to Pro features until the end of your current paid billing cycle.</p>

          <h2>2. Refund Eligibility</h2>
          <p>As BiharTenders is a digital SaaS platform providing instant access to proprietary data and automated services, all subscription payments are generally non-refundable.</p>
          <p>Exceptions to this rule may be considered solely at our discretion under the following circumstances:</p>
          <ul>
            <li>Duplicate charges due to technical errors on our platform or payment gateway.</li>
            <li>Failure of the service to provide advertised core functionalities for a prolonged period (downtime exceeding 72 hours).</li>
          </ul>

          <h2>3. Requesting a Refund</h2>
          <p>If you believe you are eligible for a refund based on the criteria above, please contact our support team within 7 days of the transaction. You must include your Order ID, Email Address, and the reason for your refund request.</p>

          <h2>4. Processing Time</h2>
          <p>If a refund is approved, it will be processed and credited back to your original method of payment (bank account, UPI, or card) within 5 to 7 business days, depending on your bank's processing times.</p>

          <h2>5. Contact for Billing Issues</h2>
          <p>For any billing disputes or cancellation requests, please write to us immediately:</p>
          <ul>
            <li><strong>Email:</strong> bgmiwale@gmail.com</li>
            <li><strong>Address:</strong> Bihar, India</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
