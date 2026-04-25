"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { HeadphonesIcon, MessageSquare, Phone, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const supportSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(20, "Please describe your issue in detail (at least 20 chars)"),
  bookingId: z.string().optional(),
});

type SupportData = z.infer<typeof supportSchema>;

const contactMethods = [
  {
    icon: Phone,
    title: "Call Us",
    detail: "+91 98765 43210",
    subtext: "Mon–Sat, 8AM–8PM",
    href: "tel:+919876543210",
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
  },
  {
    icon: Mail,
    title: "Email Us",
    detail: "support@fixhai.in",
    subtext: "Reply within 24 hours",
    href: "mailto:support@fixhai.in",
    color: "bg-green-100 dark:bg-green-900/30 text-green-600",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp",
    detail: "+91 98765 43210",
    subtext: "Quick responses",
    href: "https://wa.me/919876543210",
    color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
];

export default function SupportPage() {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupportData>({ resolver: zodResolver(supportSchema) });

  const onSubmit = async (data: SupportData) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    toast.success("Support ticket raised! We'll respond within 24 hours.");
    reset();
    console.log(data);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-14"
      >
        <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-5">
          <HeadphonesIcon className="w-8 h-8 text-[var(--primary)]" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-3">How can we help?</h1>
        <p className="text-[var(--muted-foreground)] max-w-sm mx-auto">
          Our support team is here to help you resolve any issues quickly and smoothly.
        </p>
      </motion.div>

      {/* Contact Methods */}
      <div className="grid sm:grid-cols-3 gap-4 mb-12">
        {contactMethods.map((method, i) => {
          const Icon = method.icon;
          return (
            <motion.a
              key={method.title}
              href={method.href}
              target={method.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card hoverable className="p-5 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl ${method.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">{method.title}</div>
                  <div className="text-sm text-[var(--foreground)]">{method.detail}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">{method.subtext}</div>
                </div>
              </Card>
            </motion.a>
          );
        })}
      </div>

      {/* Support Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-8">
          <h2 className="text-xl font-bold mb-6">Submit a Support Ticket</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">Full Name</label>
                <input
                  {...register("name")}
                  placeholder="Rahul Sharma"
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Booking ID (optional)</label>
              <input
                {...register("bookingId")}
                placeholder="BK001234"
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Subject</label>
              <input
                {...register("subject")}
                placeholder="Technician not arriving on time"
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
              {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Describe Your Issue</label>
              <textarea
                {...register("message")}
                placeholder="Please describe your issue in detail. The more info you provide, the faster we can resolve it."
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
              />
              {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
              Submit Ticket
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
