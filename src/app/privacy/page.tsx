import type { Metadata } from "next";
import { PolicyLayout, Section, Highlight } from "@/components/layout/policy-layout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how Fixhai collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <PolicyLayout
      title="Privacy Policy"
      subtitle="Your privacy matters to us. Here's exactly how we handle your data."
      lastUpdated="April 25, 2026"
    >
      <Highlight>
        By using Fixhai, you agree to the collection and use of information as described in this policy. We never sell your personal data to third parties.
      </Highlight>

      <Section title="1. Information We Collect">
        <p>We collect information you provide directly to us, including:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Account information:</strong> name, email address, phone number, and password when you create an account.</li>
          <li><strong>Booking information:</strong> service type, address, pincode, issue description, and preferred time slot.</li>
          <li><strong>Payment information:</strong> transaction ID and payment status (we do not store card details — payments are processed securely by Razorpay).</li>
          <li><strong>Device information:</strong> IP address, browser type, and operating system for security and analytics.</li>
        </ul>
      </Section>

      <Section title="2. How We Use Your Information">
        <p>We use the information we collect to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Process and manage your service bookings</li>
          <li>Connect you with available verified technicians</li>
          <li>Send booking confirmations, status updates, and receipts</li>
          <li>Respond to your support requests</li>
          <li>Improve the platform through aggregate analytics</li>
          <li>Comply with legal obligations</li>
        </ul>
        <p>We do <strong>not</strong> use your data for targeted advertising or sell it to any third party.</p>
      </Section>

      <Section title="3. Data Sharing">
        <p>We share your information only in the following circumstances:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>With technicians:</strong> Your name, phone number, and address are shared with the assigned technician only after booking confirmation.</li>
          <li><strong>With payment providers:</strong> Razorpay processes payments. Their privacy policy governs payment data.</li>
          <li><strong>With legal authorities:</strong> If required by applicable law, court order, or government regulation.</li>
        </ul>
      </Section>

      <Section title="4. Data Storage and Security">
        <p>
          Your data is stored securely on Supabase infrastructure with end-to-end encryption in transit (TLS/HTTPS) and at rest. We implement industry-standard security measures including:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Row-Level Security (RLS) ensuring users can only access their own data</li>
          <li>HTTP security headers (HSTS, X-Frame-Options, CSP)</li>
          <li>Regular security audits</li>
        </ul>
        <p>No method of transmission over the internet is 100% secure. We strive to use commercially acceptable means to protect your information.</p>
      </Section>

      <Section title="5. Cookies">
        <p>
          We use essential cookies to maintain your login session. We do not use tracking or advertising cookies. You can disable cookies in your browser settings, but this may affect your ability to log in.
        </p>
      </Section>

      <Section title="6. Your Rights">
        <p>You have the right to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your account and associated data</li>
          <li>Withdraw consent at any time</li>
        </ul>
        <p>To exercise these rights, email us at <strong>privacy@fixhai.in</strong></p>
      </Section>

      <Section title="7. Children's Privacy">
        <p>
          Fixhai is not intended for use by children under the age of 18. We do not knowingly collect personal information from minors. If you believe a minor has provided us with personal information, please contact us immediately.
        </p>
      </Section>

      <Section title="8. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. We will notify registered users of significant changes via email or an in-app notification. Continued use of Fixhai after changes constitutes acceptance of the updated policy.
        </p>
      </Section>

      <Section title="9. Contact Us">
        <p>For any privacy-related concerns:</p>
        <ul className="list-none space-y-1">
          <li>📧 <strong>Email:</strong> privacy@fixhai.in</li>
          <li>📍 <strong>Address:</strong> Fixhai Technologies, Gurugram, Haryana – 122001</li>
        </ul>
      </Section>
    </PolicyLayout>
  );
}
