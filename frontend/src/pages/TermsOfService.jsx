import React, { useEffect } from 'react';
import { FileText } from 'lucide-react';

export default function TermsOfService() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 sm:p-12">
        <div className="flex items-center gap-4 mb-8 border-b border-slate-100 dark:border-slate-700 pb-8">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Terms of Service</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Last Updated: October 10, 2026</p>
          </div>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-xl prose-h2:mt-8">
          <h2>1. Introduction</h2>
          <p>Welcome to BiharTenders. By accessing our website and using our services, you agree to comply with and be bound by the following terms and conditions. If you disagree with any part of these terms, please do not use our service.</p>

          <h2>2. Use of Service</h2>
          <p>BiharTenders provides aggregated public procurement data, tender alerts, and related insights. You agree to use the service only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use of the website.</p>

          <h2>3. Subscriptions and Payments</h2>
          <p>Certain features are offered on a paid subscription basis. By subscribing, you agree to pay the fees indicated for the service. Payments are securely processed through Razorpay. All fees are exclusive of applicable taxes unless stated otherwise.</p>

          <h2>4. Data Accuracy and Liability</h2>
          <p>While we strive to provide accurate and timely tender information gathered from public portals, BiharTenders does not guarantee the absolute accuracy, completeness, or timeliness of the data. Users are advised to cross-verify critical information from official government sources.</p>
          <p>We shall not be held liable for any financial losses, missed deadlines, or damages resulting from the use of our data.</p>

          <h2>5. Intellectual Property</h2>
          <p>The layout, design, graphics, and proprietary software of BiharTenders are protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without explicit permission.</p>

          <h2>6. Termination</h2>
          <p>We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users or our business interests.</p>

          <h2>7. Contact Information</h2>
          <p>If you have any questions regarding these Terms of Service, please contact us at:</p>
          <ul>
            <li><strong>Email:</strong> bgmiwale@gmail.com</li>
            <li><strong>Address:</strong> Bihar, India</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
