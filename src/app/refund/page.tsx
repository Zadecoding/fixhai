import type { Metadata } from "next";
import { PolicyLayout, Section, Highlight } from "@/components/layout/policy-layout";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Understand Fixhai's refund and cancellation policy for booking fees and repair payments.",
};

export default function RefundPage() {
  return (
    <PolicyLayout
      title="Refund Policy"
      subtitle="We strive for complete satisfaction. Here's when and how refunds are processed."
      lastUpdated="April 25, 2026"
    >
      <Highlight>
        💡 The ₹99 inspection fee is generally non-refundable. However, if a technician fails to show up or we are unable to fulfil your booking, you will receive a full refund within 5–7 business days.
      </Highlight>

      <Section title="1. Inspection Fee (₹99)">
        <p>
          The ₹99 inspection fee is collected at the time of booking to confirm your slot and compensate the Technician for their travel and time.
        </p>
        <p><strong>The inspection fee is non-refundable in the following cases:</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>You cancel the booking after it has been accepted by a Technician.</li>
          <li>You are not present at the address during the Technician's visit.</li>
          <li>The Technician arrives on time and performs the inspection.</li>
        </ul>
        <p><strong>The inspection fee will be refunded in full if:</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>No Technician is available in your area for the selected time.</li>
          <li>The assigned Technician fails to show up without prior notice.</li>
          <li>You cancel the booking <strong>before</strong> a Technician is assigned to your request.</li>
          <li>Fixhai is unable to fulfil your booking for any reason on our end.</li>
        </ul>
      </Section>

      <Section title="2. Final Repair Payment">
        <p>
          You are only charged for repair work <strong>after</strong> you have reviewed and approved the Technician's quote on-site. You have the right to decline the repair without any additional charge (beyond the inspection fee).
        </p>
        <p><strong>Refunds on the final repair payment may be requested if:</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>The repair fails to resolve the original issue reported at the time of booking.</li>
          <li>The same fault recurs within 30 days of the repair without any new fault introduced.</li>
          <li>The Technician caused damage to the appliance while attempting the repair.</li>
        </ul>
        <p>
          Refund requests on repair payments are reviewed case-by-case. We may require photographic evidence or a re-visit by a different Technician to validate the claim.
        </p>
      </Section>

      <Section title="3. How to Request a Refund">
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong>Email us</strong> at <strong>refunds@fixhai.in</strong> within <strong>7 days</strong> of the booking/repair date.
          </li>
          <li>
            Include your <strong>Booking ID</strong>, the reason for your refund request, and any supporting evidence (photos, screenshots).
          </li>
          <li>
            Our support team will review and respond within <strong>2 business days</strong>.
          </li>
          <li>
            Approved refunds are processed back to the original payment method within <strong>5–7 business days</strong>.
          </li>
        </ol>
      </Section>

      <Section title="4. Cancellation Policy">
        <div className="overflow-x-auto not-prose">
          <table className="w-full text-sm border-collapse rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-orange-50 dark:bg-orange-950/20">
                <th className="text-left px-4 py-3 font-semibold text-[var(--foreground)] border-b border-[var(--border)]">When you cancel</th>
                <th className="text-left px-4 py-3 font-semibold text-[var(--foreground)] border-b border-[var(--border)]">Refund</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {[
                ["Before Technician is assigned", "Full ₹99 refund"],
                ["After Technician is assigned (2+ hours before visit)", "₹99 refund at Fixhai's discretion"],
                ["Within 2 hours of visit / no-show by customer", "No refund"],
                ["Technician no-show (without notification)", "Full ₹99 refund"],
                ["Unable to find Technician in your area", "Full ₹99 refund"],
              ].map(([when, refund]) => (
                <tr key={when} className="hover:bg-[var(--muted)]/30">
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">{when}</td>
                  <td className="px-4 py-3 font-medium text-[var(--foreground)]">{refund}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="5. Payment Method">
        <p>
          Refunds are credited to the <strong>original payment method</strong> used during booking (UPI, debit/credit card, or net banking). We do not issue refunds via cash or to a different payment method.
        </p>
        <p>
          Processing time depends on your bank or payment provider — typically <strong>5–7 business days</strong> after we approve the refund.
        </p>
      </Section>

      <Section title="6. Disputes">
        <p>
          If you are dissatisfied with the outcome of a refund request, you may escalate by emailing <strong>grievances@fixhai.in</strong>. We aim to resolve all disputes within 10 business days.
        </p>
        <p>
          Fixhai's decision on all refund matters is final, subject to applicable consumer protection laws of India.
        </p>
      </Section>

      <Section title="7. Contact">
        <ul className="list-none space-y-1">
          <li>📧 <strong>Refund requests:</strong> refunds@fixhai.in</li>
          <li>📧 <strong>Disputes:</strong> grievances@fixhai.in</li>
          <li>📞 <strong>Phone:</strong> +91 98765 43210 (Mon–Sat, 9am–6pm)</li>
        </ul>
      </Section>
    </PolicyLayout>
  );
}
