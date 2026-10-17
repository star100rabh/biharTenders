import React, { useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 sm:p-12">
        <div className="flex items-center gap-4 mb-8 border-b border-slate-100 dark:border-slate-700 pb-8">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Privacy Policy</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Last Updated: October 10, 2026</p>
          </div>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-xl prose-h2:mt-8">
          <h2>1. Information We Collect</h2>
          <p>When you register for a BiharTenders account or subscribe to our services, we collect personal information such as your name, email address, phone number (for WhatsApp alerts), and company details.</p>

          <h2>2. How We Use Your Information</h2>
          <p>We use the collected information for the following purposes:</p>
          <ul>
            <li>To provide, operate, and maintain our platform.</li>
            <li>To send you relevant tender alerts and notifications via email or WhatsApp.</li>
            <li>To process your subscription payments securely via Razorpay.</li>
            <li>To improve customer support and respond to your inquiries.</li>
          </ul>

          <h2>3. Data Security and Third-Party Sharing</h2>
          <p>We take data security seriously. Your personal information is encrypted and stored securely. We do not sell or share your personal data with third parties for marketing purposes. Your payment details are processed directly by our authorized PCI-DSS compliant payment gateway partners (Cashfree / Razorpay) and are never stored on our servers.</p>

          <h2>4. Cookies</h2>
          <p>We use cookies to maintain your login session and save your preferences (such as dark mode and filter settings). You can instruct your browser to refuse all cookies, but some parts of the service may not function properly.</p>

          <h2>5. Your Rights</h2>
          <p>You have the right to access, update, or delete your personal information at any time through your Profile Dashboard. If you wish to permanently delete your account and all associated data, please contact us.</p>

          <h2>6. Contact Us</h2>
          <p>For any privacy-related concerns, please reach out to us:</p>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:rsaurabhp03@gmail.com" className="text-dalBlue dark:text-blue-400 hover:underline">rsaurabhp03@gmail.com</a></li>
            <li><strong>Phone / WhatsApp:</strong> <a href="tel:+918933068171" className="text-dalBlue dark:text-blue-400 hover:underline">+91 8933068171</a></li>
            <li><strong>Address:</strong> Dak Bungalow Chauraha, Bailey Road, Patna, Bihar 800001, India</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
