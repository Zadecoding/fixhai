import type { Metadata } from "next";
import { PolicyLayout, Section, Highlight } from "@/components/layout/policy-layout";
import { Users, Target, ShieldCheck, Wrench, Heart, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Fixhai — our mission, story, and the team behind India's most trusted on-demand repair platform.",
};

const values = [
  { icon: ShieldCheck, title: "Transparency", desc: "No hidden charges. Every fee is shown upfront before you confirm a booking." },
  { icon: Heart, title: "Customer First", desc: "Every decision we make starts with one question: is this better for our customers?" },
  { icon: Wrench, title: "Expert Technicians", desc: "Every technician on our platform is background-verified and skill-tested." },
  { icon: TrendingUp, title: "Fair Earnings", desc: "We believe technicians deserve dignified pay. Our model ensures they keep the majority of every job." },
];

export default function AboutPage() {
  return (
    <PolicyLayout
      title="About Fixhai"
      subtitle="Connecting India's homes with trusted repair professionals — one booking at a time."
      lastUpdated="April 2026"
    >
      {/* Mission */}
      <Section title="Our Mission">
        <p>
          At Fixhai, our mission is simple: <strong>make home repairs stress-free, transparent, and affordable</strong> for every Indian household.
        </p>
        <p>
          We built Fixhai because we were tired of the same story — overpriced quotes, no-show technicians, and zero accountability. We knew there had to be a better way. So we built it.
        </p>
      </Section>

      {/* Story */}
      <Section title="Our Story">
        <p>
          Founded in 2024 in Gurugram, Fixhai started with a single idea: what if booking a repair technician was as easy as ordering food online?
        </p>
        <p>
          We started by partnering with a handful of local technicians in the NCR region. Within months, word spread. Customers loved the transparent ₹99 inspection fee model — no surprises, no haggling, just honest service.
        </p>
        <p>
          Today, Fixhai operates across multiple cities in India, with a growing network of verified professionals serving thousands of customers every month.
        </p>
        <Highlight>
          🔧 Every technician on Fixhai undergoes a background check, skill assessment, and identity verification before their first booking.
        </Highlight>
      </Section>

      {/* Values */}
      <Section title="What We Stand For">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 not-prose">
          {values.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="font-bold text-[var(--foreground)] mb-0.5">{title}</p>
                <p className="text-sm text-[var(--muted-foreground)]">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* How it works */}
      <Section title="How Fixhai Works">
        <ol className="space-y-3 list-none not-prose">
          {[
            ["Book in 60 seconds", "Select your appliance, describe the issue, pick a time slot — no calls required."],
            ["Pay ₹99 inspection fee", "A small fee locks your slot and covers the technician's visit. It's deducted from the final bill."],
            ["Get an honest quote", "Your technician diagnoses the problem and gives you a transparent quote before doing any work."],
            ["Approve & get it fixed", "Only approve the repair if you're happy with the quote. No pressure, ever."],
          ].map(([step, desc], i) => (
            <li key={i} className="flex gap-4 items-start">
              <span className="w-7 h-7 rounded-full bg-orange-500 text-white text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold text-[var(--foreground)]">{step}</p>
                <p className="text-sm text-[var(--muted-foreground)]">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* Contact */}
      <Section title="Get in Touch">
        <p>
          Have questions, partnership inquiries, or feedback? We'd love to hear from you.
        </p>
        <ul className="space-y-1 not-prose list-none">
          <li className="text-sm text-[var(--muted-foreground)]">📧 <strong>Email:</strong> hello@fixhai.in</li>
          <li className="text-sm text-[var(--muted-foreground)]">📞 <strong>Phone:</strong> +91 98765 43210</li>
          <li className="text-sm text-[var(--muted-foreground)]">📍 <strong>Location:</strong> Gurugram, Haryana, India</li>
        </ul>
      </Section>
    </PolicyLayout>
  );
}
