"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { sendPasswordResetEmail } from "../actions";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("email", data.email);
    
    const result = await sendPasswordResetEmail(formData);
    
    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success("Password reset email sent!");
      setEmailSent(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-orange-50/50 to-white dark:from-slate-950 dark:to-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-2xl">
              Fix<span className="text-[var(--primary)]">hai</span>
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight">Reset Password</h1>
          <p className="text-[var(--muted-foreground)] mt-1 text-sm">
            Enter your email to receive a password reset link
          </p>
        </div>

        <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-8 shadow-xl">
          {emailSent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-bold mb-2">Check your email</h2>
              <p className="text-[var(--muted-foreground)] text-sm mb-6">
                We've sent a password reset link to your email address. Please check your inbox and spam folder.
              </p>
              <Link href="/auth/login">
                <Button variant="outline" className="w-full">Return to Login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={loading}
              >
                Send Reset Link
              </Button>
            </form>
          )}

          {!emailSent && (
            <div className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
              Remember your password?{" "}
              <Link href="/auth/login" className="text-[var(--primary)] font-semibold hover:underline">
                Sign in
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
