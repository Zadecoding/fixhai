import type { Metadata } from "next";
import { PolicyLayout, Section, Highlight } from "@/components/layout/policy-layout";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read Fixhai's terms and conditions governing the use of our platform and services.",
};

export default function TermsPage() {
  return (
    <PolicyLayout
      title="Terms of Service"
      subtitle="Please read these terms carefully before using Fixhai."
      lastUpdated="April 25, 2026"
    >
      <Highlight>
        By accessing or using Fixhai, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.
      </Highlight>

      <Section title="1. Acceptance of Terms">
        <p>
          These Terms of Service ("Terms") govern your access to and use of the Fixhai platform, including our website, mobile applications, and related services. By registering for an account or placing a booking, you confirm that you have read, understood, and agree to these Terms.
        </p>
      </Section>

      <Section title="2. Platform Description">
        <p>
          Fixhai is an online marketplace that connects customers ("Customers") with independent repair technicians ("Technicians"). Fixhai facilitates the booking process but is <strong>not</strong> itself a repair service provider. The service is delivered by the Technician.
        </p>
      </Section>

      <Section title="3. Account Registration">
        <ul className="list-disc pl-5 space-y-1">
          <li>You must be at least 18 years old to create an account.</li>
          <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
          <li>You must provide accurate and complete information during registration.</li>
          <li>You are responsible for all activities that occur under your account.</li>
          <li>Notify us immediately at <strong>support@fixhai.in</strong> of any unauthorized access.</li>
        </ul>
      </Section>

      <Section title="4. Booking and Payments">
        <ul className="list-disc pl-5 space-y-1">
          <li>A non-refundable ₹99 inspection fee is charged at the time of booking to secure the Technician's visit.</li>
          <li>The final repair cost is quoted by the Technician on-site after diagnosis and is separate from the inspection fee.</li>
          <li>Customers are not obligated to proceed with the repair after receiving the quote.</li>
          <li>All payments are processed securely through Razorpay. Fixhai does not store card or banking details.</li>
          <li>Prices are quoted in Indian Rupees (INR) and include applicable taxes unless stated otherwise.</li>
        </ul>
      </Section>

      <Section title="5. Customer Obligations">
        <p>As a Customer, you agree to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Provide accurate information about the appliance and issue at the time of booking.</li>
          <li>Be present (or have an authorized adult present) during the Technician's visit.</li>
          <li>Treat Technicians with respect and professionalism.</li>
          <li>Not solicit Technicians for work outside of the Fixhai platform.</li>
        </ul>
      </Section>

      <Section title="6. Technician Obligations">
        <p>Technicians registered on Fixhai agree to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Provide services to the best of their professional ability.</li>
          <li>Arrive within the agreed time slot or notify the customer of delays.</li>
          <li>Provide honest and accurate quotes prior to performing any repair work.</li>
          <li>Maintain up-to-date skills and possess necessary tools.</li>
          <li>Comply with all applicable laws and safety regulations.</li>
        </ul>
      </Section>

      <Section title="7. Limitation of Liability">
        <p>
          Fixhai is a technology platform and is <strong>not liable</strong> for:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>The quality, safety, or legality of the services provided by Technicians.</li>
          <li>Any damage to property resulting from a Technician's work.</li>
          <li>Any loss of data or income arising from use of the platform.</li>
          <li>Service interruptions or technical failures beyond our reasonable control.</li>
        </ul>
        <p>
          Our total liability to you for any claim arising from these Terms shall not exceed the amount you paid for the relevant booking.
        </p>
      </Section>

      <Section title="8. Prohibited Uses">
        <p>You may not use Fixhai to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Engage in fraudulent, deceptive, or misleading activity.</li>
          <li>Attempt to hack, reverse-engineer, or disrupt the platform.</li>
          <li>Post false reviews or manipulate ratings.</li>
          <li>Use the platform for any unlawful purpose.</li>
        </ul>
        <p>Violations may result in immediate account termination without refund.</p>
      </Section>

      <Section title="9. Intellectual Property">
        <p>
          All content on the Fixhai platform — including the logo, design, text, and software — is owned by Fixhai Technologies and protected by copyright and trademark laws. You may not reproduce, distribute, or create derivative works without our express written consent.
        </p>
      </Section>

      <Section title="10. Governing Law">
        <p>
          These Terms are governed by and construed in accordance with the laws of India. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Gurugram, Haryana.
        </p>
      </Section>

      <Section title="11. Changes to Terms">
        <p>
          We reserve the right to modify these Terms at any time. Material changes will be communicated via email or in-app notice. Continued use of Fixhai after changes constitutes your acceptance of the updated Terms.
        </p>
      </Section>

      <Section title="12. Contact">
        <ul className="list-none space-y-1">
          <li>📧 <strong>Email:</strong> legal@fixhai.in</li>
          <li>📍 <strong>Address:</strong> Fixhai Technologies, Gurugram, Haryana – 122001</li>
        </ul>
      </Section>
    </PolicyLayout>
  );
}
