"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Wrench, Mail, ArrowRight, RefreshCw, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function VerifyEmailPage() {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        toast.error("Could not find your email. Please try signing up again.");
        setResending(false);
        return;
      }
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
      });
      if (error) throw error;
      setResent(true);
      toast.success("Verification email resent!");
    } catch {
      toast.error("Failed to resend. Please try again in a moment.");
    } finally {
      setResending(false);
    }
  };

  const steps = [
    { icon: "📧", text: "Check your inbox (and spam folder)" },
    { icon: "🔗", text: "Click the verification link in the email" },
    { icon: "✅", text: "You're in — start booking repairs!" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-orange-50/60 via-white to-amber-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-200/30 dark:bg-orange-900/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-200/30 dark:bg-amber-900/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-lg"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center shadow-lg">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight">
              Fix<span className="text-[var(--primary)]">hai</span>
            </span>
          </Link>
        </div>

        {/* Main card */}
        <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] shadow-2xl overflow-hidden">
          {/* Top gradient strip */}
          <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500" />

          <div className="p-8 sm:p-10">
            {/* Icon + heading */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4, type: "spring", stiffness: 200 }}
              className="flex flex-col items-center text-center mb-8"
            >
              <div className="relative mb-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center shadow-inner">
                  <Mail className="w-9 h-9 text-[var(--primary)]" strokeWidth={1.5} />
                </div>
                {/* Animated ping */}
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500" />
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                Verify your email
              </h1>
              <p className="text-[var(--muted-foreground)] text-sm sm:text-base leading-relaxed max-w-sm">
                We&apos;ve sent a verification link to your inbox. Please verify your email before logging in.
              </p>
            </motion.div>

            {/* Steps grid */}
            <div className="grid gap-3 mb-8">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.1, duration: 0.35 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-orange-50/60 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20"
                >
                  <span className="text-xl shrink-0">{step.icon}</span>
                  <span className="text-sm font-medium text-[var(--foreground)]">{step.text}</span>
                  <CheckCircle2 className="w-4 h-4 ml-auto text-orange-300 dark:text-orange-700 shrink-0" />
                </motion.div>
              ))}
            </div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.35 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link
                href="/auth/login"
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold text-sm hover:opacity-90 active:scale-95 transition-all shadow-md shadow-orange-200 dark:shadow-orange-900/30"
              >
                Go to Login
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={handleResend}
                disabled={resending || resent}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm font-semibold text-[var(--foreground)] hover:bg-orange-50 dark:hover:bg-orange-900/10 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {resending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : resent ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                {resent ? "Email Sent!" : resending ? "Sending…" : "Resend Email"}
              </button>
            </motion.div>

            {/* Footer note */}
            <p className="text-center text-xs text-[var(--muted-foreground)] mt-6">
              Wrong email?{" "}
              <Link href="/auth/signup" className="text-[var(--primary)] font-semibold hover:underline">
                Sign up again
              </Link>{" "}
              with the correct address.
            </p>
          </div>
        </div>

        {/* Help text */}
        <p className="text-center text-xs text-[var(--muted-foreground)] mt-5">
          Need help?{" "}
          <Link href="/support" className="hover:underline text-[var(--primary)]">
            Contact support
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
