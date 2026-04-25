"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Wrench, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { signup } from "../actions";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["customer", "technician"]),
});

type SignupData = z.infer<typeof signupSchema>;

function SignupContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: "customer" },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: SignupData) => {
    setLoading(true);
    
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("name", data.name);
    formData.append("role", data.role);
    if (next) formData.append("next", next);
    
    const result = await signup(formData);
    
    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success("Account created! Welcome to Fixhai.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-orange-50/50 to-white dark:from-slate-950 dark:to-slate-900">
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
          <h1 className="text-2xl font-extrabold tracking-tight">Create your account</h1>
          <p className="text-[var(--muted-foreground)] mt-1 text-sm">
            Join 12,000+ happy Fixhai customers
          </p>
        </div>

        <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-8 shadow-xl">
          {/* Role selector */}
          <div className="flex gap-3 mb-6">
            {(["customer", "technician"] as const).map((role) => (
              <label
                key={role}
                className={`flex-1 border-2 rounded-xl p-3 text-center text-sm font-semibold cursor-pointer transition-all ${
                  selectedRole === role
                    ? "border-[var(--primary)] bg-orange-50 dark:bg-orange-900/20 text-[var(--primary)]"
                    : "border-[var(--border)] text-[var(--muted-foreground)]"
                }`}
              >
                <input
                  {...register("role")}
                  type="radio"
                  value={role}
                  className="sr-only"
                />
                {role === "customer" ? "🙋 Customer" : "🔧 Technician"}
              </label>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {[
              { label: "Full Name", field: "name" as const, type: "text", placeholder: "Rahul Sharma" },
              { label: "Email", field: "email" as const, type: "email", placeholder: "you@example.com" },
              { label: "Mobile Number", field: "phone" as const, type: "tel", placeholder: "9876543210" },
            ].map(({ label, field, type, placeholder }) => (
              <div key={field}>
                <label className="block text-sm font-medium mb-1.5">{label}</label>
                <input
                  {...register(field)}
                  type={type}
                  placeholder={placeholder}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
                {errors[field] && (
                  <p className="text-xs text-red-500 mt-1">{errors[field]?.message}</p>
                )}
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--muted-foreground)] mt-5">
            Already have an account?{" "}
            <Link href={next ? `/auth/login?next=${encodeURIComponent(next)}` : "/auth/login"} className="text-[var(--primary)] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
