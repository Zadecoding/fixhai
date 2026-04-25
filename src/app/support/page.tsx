"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  HeadphonesIcon, ChevronRight, CheckCircle2, AlertTriangle,
  MessageSquare, Clock, Shield, Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { submitSupportTicket } from "@/app/actions/dashboard";

const PRIORITIES = [
  { value: "normal", label: "Normal", desc: "General question or minor issue", color: "border-blue-300 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400" },
  { value: "high", label: "High", desc: "Service issue affecting my booking", color: "border-orange-300 bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400" },
  { value: "critical", label: "Critical", desc: "Urgent — payment issue or serious complaint", color: "border-red-300 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400" },
] as const;

const FAQ = [
  { q: "How do I cancel a booking?", a: "Go to your Dashboard → Bookings → select the booking and tap 'Cancel'. Cancellations before technician assignment are fully refunded." },
  { q: "My technician didn't show up. What do I do?", a: "Raise a Critical ticket here with your Booking ID. We'll process a full refund of your ₹99 within 5–7 business days." },
  { q: "When will I get my refund?", a: "Approved refunds are credited to your original payment method within 5–7 business days after we process them." },
  { q: "Can I reschedule a booking?", a: "Currently, you can cancel and re-book. Rescheduling is coming soon. If you need help, raise a ticket and we'll assist manually." },
  { q: "How do I get my invoice?", a: "Invoices for completed bookings are available in Dashboard → Bookings → Download Invoice." },
];

export default function SupportPage() {
  const [form, setForm] = useState({ subject: "", description: "", priority: "normal" as "normal" | "high" | "critical", booking_id: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      toast.error("Please fill in subject and description.");
      return;
    }
    setLoading(true);
    const res = await submitSupportTicket({
      subject: form.subject,
      description: form.description,
      priority: form.priority,
      booking_id: form.booking_id || undefined,
    });
    setLoading(false);
    if (res.error) {
      toast.error(res.error);
    } else {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--muted)]/30">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-zinc-900 dark:to-zinc-950 border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] mb-5">
            <Link href="/" className="hover:text-[var(--primary)] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[var(--foreground)]">Support</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center">
              <HeadphonesIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Help &amp; Support</h1>
              <p className="text-[var(--muted-foreground)] mt-1">We typically respond within 2 hours on business days.</p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { icon: Clock, label: "Avg. Response", value: "< 2 hrs" },
              { icon: Shield, label: "Tickets Resolved", value: "98.4%" },
              { icon: Zap, label: "Support Hours", value: "9am – 6pm" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm rounded-2xl p-4 border border-white/40 dark:border-zinc-700/40">
                <Icon className="w-5 h-5 text-orange-500 shrink-0" />
                <div>
                  <div className="font-bold text-sm">{value}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Ticket form */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center py-16"
              >
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-5">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-extrabold mb-2">Ticket Submitted!</h2>
                <p className="text-[var(--muted-foreground)] max-w-sm mb-6">
                  We've received your request and will get back to you within 2 hours. Check your email for confirmation.
                </p>
                <div className="flex gap-3">
                  <Button variant="primary" onClick={() => { setSubmitted(false); setForm({ subject: "", description: "", priority: "normal", booking_id: "" }); }}>
                    Submit Another
                  </Button>
                  <Link href="/dashboard">
                    <Button variant="outline">Go to Dashboard</Button>
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-xl font-extrabold mb-5 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-orange-500" />
                  Raise a Support Ticket
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Priority</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {PRIORITIES.map((p) => (
                        <button
                          type="button"
                          key={p.value}
                          onClick={() => setForm(f => ({ ...f, priority: p.value }))}
                          className={`text-left px-4 py-3 rounded-xl border-2 transition-all ${
                            form.priority === p.value
                              ? p.color + " border-current"
                              : "border-[var(--border)] bg-[var(--card)] hover:border-orange-300"
                          }`}
                        >
                          <div className="font-bold text-sm">{p.label}</div>
                          <div className="text-xs opacity-70 mt-0.5">{p.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold mb-1.5">Subject <span className="text-red-500">*</span></label>
                    <input
                      id="subject"
                      type="text"
                      value={form.subject}
                      onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      placeholder="e.g. Technician didn't arrive for my AC repair"
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition-shadow"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-semibold mb-1.5">Description <span className="text-red-500">*</span></label>
                    <textarea
                      id="description"
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Please describe your issue in as much detail as possible..."
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition-shadow resize-none"
                      required
                    />
                  </div>

                  {/* Booking ID (optional) */}
                  <div>
                    <label htmlFor="booking_id" className="block text-sm font-semibold mb-1.5">
                      Booking ID <span className="text-[var(--muted-foreground)] font-normal">(optional)</span>
                    </label>
                    <input
                      id="booking_id"
                      type="text"
                      value={form.booking_id}
                      onChange={e => setForm(f => ({ ...f, booking_id: e.target.value }))}
                      placeholder="e.g. a1b2c3d4-..."
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition-shadow font-mono"
                    />
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">Find this in Dashboard → Bookings.</p>
                  </div>

                  {form.priority === "critical" && (
                    <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700 dark:text-red-400">Critical tickets are prioritised and reviewed within 1 hour.</p>
                    </div>
                  )}

                  <Button type="submit" variant="primary" size="md" className="w-full" disabled={loading}>
                    {loading ? "Submitting..." : "Submit Ticket"}
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FAQ sidebar */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-extrabold mb-5">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <Card key={i} className="overflow-hidden">
                <button
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-3"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-sm">{item.q}</span>
                  <ChevronRight
                    className={`w-4 h-4 text-[var(--muted-foreground)] shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-90" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-sm text-[var(--muted-foreground)] leading-relaxed border-t border-[var(--border)] pt-3">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            ))}
          </div>

          <Card className="p-5 mt-5 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
            <p className="font-bold text-sm mb-1">Need faster help?</p>
            <p className="text-xs text-[var(--muted-foreground)] mb-3">Call or WhatsApp us directly.</p>
            <a href="tel:+919876543210" className="text-sm font-semibold text-orange-600 hover:underline">
              📞 +91 98765 43210
            </a>
          </Card>
        </div>
      </div>
    </div>
  );
}
