"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import {
  Smartphone,
  Laptop,
  Wind,
  WashingMachine,
  Thermometer,
  Tv,
  Shield,
  Clock,
  Star,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Zap,
  Users,
  TrendingUp,
  HeadphonesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trustStats } from "@/lib/constants";
import type { ServiceCategory } from "@/types/database";
import { useState } from "react";
import { cn } from "@/lib/utils";

const categoryIcons: Record<string, React.ElementType> = {
  Smartphone,
  Laptop,
  Wind,
  WashingMachine,
  Thermometer,
  Tv,
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

function AnimatedSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const howItWorks = [
  {
    step: "01",
    icon: Smartphone,
    title: "Select Your Service",
    description: "Choose from mobile, laptop, AC, washing machine, refrigerator or TV repairs.",
  },
  {
    step: "02",
    icon: Zap,
    title: "Pay Inspection Fee to Book",
    description: "A small visit fee secures your slot. The final quote comes after diagnosis.",
  },
  {
    step: "03",
    icon: Users,
    title: "Expert Visits You",
    description: "A verified, background-checked technician arrives at your chosen time.",
  },
  {
    step: "04",
    icon: CheckCircle2,
    title: "Problem Solved",
    description: "Technician fixes your device. Pay only if satisfied. 30-day service warranty.",
  },
];

const faqs = [
  {
    q: "What is the inspection fee?",
    a: "The inspection fee (₹99 for mobile, ₹399 for other services) is paid upfront. It covers the cost of the technician traveling to your location and diagnosing the issue. The actual repair cost is quoted separately after diagnosis.",
  },
  {
    q: "What if I'm not satisfied with the diagnosis?",
    a: "If you choose not to proceed with the repair after diagnosis, you lose only the inspection fee. There are no hidden charges whatsoever.",
  },
  {
    q: "Are the technicians verified?",
    a: "Yes! All Fixhai technicians go through background verification, skill testing, and document checks before they're allowed to take bookings on our platform.",
  },
  {
    q: "What cities do you operate in?",
    a: "We currently operate in Hyderabad, Secunderabad, Bangalore, Chennai, Mumbai, Delhi, and are rapidly expanding to more cities.",
  },
  {
    q: "Is there a warranty on repairs?",
    a: "Yes. All Fixhai repairs come with a 30-day service warranty. If the same issue recurs, the technician will revisit at no additional cost.",
  },
  {
    q: "How quickly can I get a technician?",
    a: "Same-day or next-day appointments are usually available. You can choose a 2-hour time window that suits you during booking.",
  },
];

const trustBadges = [
  { icon: Shield, label: "Verified Technicians", description: "Background checks & skill tests" },
  { icon: TrendingUp, label: "Transparent Pricing", description: "Inspection fee, quote before repair" },
  { icon: Clock, label: "Fast Booking", description: "Same or next-day appointments" },
  { icon: HeadphonesIcon, label: "24/7 Support", description: "Help whenever you need it" },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      variants={fadeUp}
      className="border border-[var(--border)] rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-[var(--muted)] transition-colors duration-150"
      >
        <span className="font-medium text-sm pr-4">{q}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-[var(--muted-foreground)] flex-shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <p className="px-6 pb-5 text-sm text-[var(--muted-foreground)] leading-relaxed">
          {a}
        </p>
      </motion.div>
    </motion.div>
  );
}

export function LandingPage({ categories = [] }: { categories?: ServiceCategory[] }) {
  return (
    <main className="flex-1">
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-slate-950 dark:via-slate-900 dark:to-orange-950/20" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-400/10 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
            style={{
              backgroundImage: "radial-gradient(circle, #f97316 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-sm font-semibold mb-8 border border-orange-200 dark:border-orange-800"
            >
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              India&apos;s Most Trusted Repair Service
              <ArrowRight className="w-4 h-4" />
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6"
            >
              Fix anything at home
              <br />
              <span className="text-transparent bg-clip-text animated-gradient">
                starting at ₹99
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto mb-10"
            >
              Book a verified technician for your mobile, laptop, or home appliance.
              Pay just ₹99 (Mobile) or ₹399 (Other) inspection fee. Get an honest quote. Pay only if you&apos;re satisfied.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Link href="/book">
                <Button size="xl" variant="gradient" className="w-full sm:w-auto group">
                  Book a Technician
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="xl" variant="outline" className="w-full sm:w-auto">
                  How it works
                </Button>
              </Link>
            </motion.div>

            {/* Trust stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto"
            >
              {trustStats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-extrabold text-[var(--primary)]">{stat.value}</div>
                  <div className="text-xs text-[var(--muted-foreground)] mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SERVICE CATEGORIES */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[var(--muted)]/40">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
                What do you want to fix?
              </h2>
              <p className="text-[var(--muted-foreground)] max-w-xl mx-auto">
                Expert technicians for all your devices and home appliances
              </p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat) => {
                const Icon = categoryIcons[cat.icon] || Smartphone;
                return (
                  <motion.div key={cat.id} variants={fadeUp}>
                    <Link href={`/services/${cat.slug}`}>
                      <Card
                        hoverable
                        className="p-6 flex flex-col items-center text-center gap-4 group"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center group-hover:bg-[var(--primary)] transition-colors duration-300">
                          <Icon className="w-7 h-7 text-[var(--primary)] group-hover:text-white transition-colors duration-300" />
                        </div>
                        <span className="text-sm font-semibold leading-tight">{cat.name}</span>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
                Booking in 4 simple steps
              </h2>
              <p className="text-[var(--muted-foreground)] max-w-xl mx-auto">
                From booking to repair — fast, transparent, and hassle-free
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div key={i} variants={fadeUp} className="relative">
                    {i < howItWorks.length - 1 && (
                      <div className="hidden lg:block absolute top-8 left-[calc(100%-8px)] w-full h-px border-t-2 border-dashed border-[var(--border)] z-0" />
                    )}
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-[var(--primary)] flex items-center justify-center shadow-lg">
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-4xl font-black text-[var(--border)]">{item.step}</span>
                      </div>
                      <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                      <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.div variants={fadeUp} className="text-center mt-12">
              <Link href="/book">
                <Button size="xl" variant="primary" className="group">
                  Book Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-600 to-amber-500">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {trustBadges.map((badge, i) => {
              const Icon = badge.icon;
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="flex items-start gap-4 text-white"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">{badge.label}</div>
                    <div className="text-sm text-white/80 mt-0.5">{badge.description}</div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatedSection>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
                Loved by thousands of customers
              </h2>
              <div className="flex items-center justify-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-2 text-[var(--muted-foreground)] text-sm">
                  4.8 average from 12,000+ bookings
                </span>
              </div>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div variants={fadeUp}>
                <Card className="p-6 h-full flex flex-col gap-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm italic text-[var(--muted-foreground)] flex-1">
                    &quot;The best service I've ever used. The technician was professional, the booking process was seamless, and my AC was fixed in under an hour.&quot;
                  </p>
                  <div className="flex items-center gap-3 mt-auto">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-200 to-orange-400 flex items-center justify-center text-white font-bold">
                      P
                    </div>
                    <div>
                      <div className="text-sm font-bold">Priya Sharma</div>
                      <div className="text-xs text-[var(--muted-foreground)]">Verified Customer</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
              
              <motion.div variants={fadeUp}>
                <Card className="p-6 h-full flex flex-col gap-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm italic text-[var(--muted-foreground)] flex-1">
                    &quot;Very quick to respond. The technician knew exactly what was wrong with my washing machine and had the spare parts ready.&quot;
                  </p>
                  <div className="flex items-center gap-3 mt-auto">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-200 to-indigo-400 flex items-center justify-center text-white font-bold">
                      R
                    </div>
                    <div>
                      <div className="text-sm font-bold">Rahul Verma</div>
                      <div className="text-xs text-[var(--muted-foreground)]">Verified Customer</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
              
              <motion.div variants={fadeUp}>
                <Card className="p-6 h-full flex flex-col gap-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm italic text-[var(--muted-foreground)] flex-1">
                    &quot;Honest pricing. They told me the exact cost before starting the repair on my phone screen. Highly recommended!&quot;
                  </p>
                  <div className="flex items-center gap-3 mt-auto">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-200 to-emerald-400 flex items-center justify-center text-white font-bold">
                      A
                    </div>
                    <div>
                      <div className="text-sm font-bold">Anjali Desai</div>
                      <div className="text-xs text-[var(--muted-foreground)]">Verified Customer</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[var(--muted)]/40">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
                Frequently asked questions
              </h2>
              <p className="text-[var(--muted-foreground)]">
                Everything you need to know about Fixhai
              </p>
            </motion.div>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <FAQItem key={i} q={faq.q} a={faq.a} />
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <motion.div
              variants={fadeUp}
              className="relative rounded-3xl overflow-hidden text-center p-12 lg:p-20"
            >
              {/* Background */}
              <div className="absolute inset-0 animated-gradient opacity-90" />
              <div className="absolute inset-0" style={{
                backgroundImage: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(255,255,255,0.08) 0%, transparent 60%)"
              }} />
              <div className="relative z-10 text-white">
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
                  Your repair is one tap away
                </h2>
                <p className="text-xl text-white/80 mb-10 max-w-xl mx-auto">
                  Join 12,000+ happy customers. Book a verified technician now.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/book">
                    <Button size="xl" className="bg-white text-orange-600 hover:bg-white/90 shadow-xl w-full sm:w-auto group">
                      Book Now
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/services/mobile-repair">
                    <Button size="xl" variant="outline" className="border-white/40 text-white hover:bg-white/10 w-full sm:w-auto">
                      View Services
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
}
