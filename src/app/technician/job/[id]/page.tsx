"use client";

import { use, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MapPin, Phone, Clock, User, Wrench,
  CheckCircle2, Loader2, ChevronRight, AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BookingStatus } from "@/types/database";
import { updateBookingStatusAction } from "@/app/technician/actions";
import { createClient } from "@/lib/supabase/client";

// ── Status progression ─────────────────────────────────────────────────────

const JOB_STEPS: {
  status: BookingStatus;
  label: string;
  actionLabel: string;
  nextStatus: BookingStatus | null;
  color: string;
  description: string;
}[] = [
  {
    status: "assigned",
    label: "Job Accepted",
    actionLabel: "I'm on my way",
    nextStatus: "on_the_way",
    color: "bg-blue-600 hover:bg-blue-700",
    description: "Tap the button when you start heading to the customer's location.",
  },
  {
    status: "on_the_way",
    label: "On the Way",
    actionLabel: "I have arrived — Start Diagnosing",
    nextStatus: "diagnosing",
    color: "bg-amber-600 hover:bg-amber-700",
    description: "Tap when you arrive at the customer's location to begin the inspection.",
  },
  {
    status: "diagnosing",
    label: "Diagnosing",
    actionLabel: "Diagnosis Complete",
    nextStatus: "diagnosis_complete",
    color: "bg-purple-600 hover:bg-purple-700",
    description: "Tap after you have inspected the issue and shared the quote with the customer.",
  },
  {
    status: "diagnosis_complete",
    label: "Diagnosis Done",
    actionLabel: "Mark Job as Completed",
    nextStatus: "completed",
    color: "bg-green-600 hover:bg-green-700",
    description: "Tap after the repair is done and the customer is satisfied.",
  },
  {
    status: "completed",
    label: "Completed",
    actionLabel: "",
    nextStatus: null,
    color: "",
    description: "This job is complete. Great work!",
  },
];

// ── Page component ─────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ id: string }>;
}

export default function TechnicianJobPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, user:users(name, phone), technician:technician_profiles(*)")
        .eq("id", id)
        .single();

      if (error || !data) {
        toast.error("Booking not found.");
        router.push("/technician");
        return;
      }

      // Verify the logged-in technician owns this booking
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      setBooking(data);
      setLoading(false);
    };

    fetchBooking();
  }, [id, router, supabase]);

  const currentStep = JOB_STEPS.find((s) => s.status === booking?.status);
  const stepIndex = JOB_STEPS.findIndex((s) => s.status === booking?.status);

  const handleStatusUpdate = async () => {
    if (!currentStep?.nextStatus) return;
    setUpdating(true);
    const res = await updateBookingStatusAction(id, currentStep.nextStatus);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Status updated: ${currentStep.nextStatus.replace(/_/g, " ")}`);
      setBooking((prev: any) => ({ ...prev, status: currentStep.nextStatus }));
    }
    setUpdating(false);
  };

  // ── Loading state ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  // ── Main UI ────────────────────────────────────────────────────────────

  const isCompleted = booking?.status === "completed";
  const isCancelled = booking?.status === "cancelled";

  return (
    <div className="min-h-screen bg-[var(--muted)]/30">
      {/* Header */}
      <div className="bg-[var(--background)] border-b border-[var(--border)] sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/technician">
            <button className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="font-extrabold text-lg leading-tight">Job Details</h1>
            <p className="text-xs text-[var(--muted-foreground)] font-mono">{id.slice(0, 8).toUpperCase()}</p>
          </div>
          <StatusBadge status={booking?.status as BookingStatus} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* ── Action Panel ────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {isCompleted ? (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-3xl p-6 text-center"
            >
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h2 className="font-extrabold text-lg text-green-700 dark:text-green-400 mb-1">Job Completed!</h2>
              <p className="text-sm text-green-600 dark:text-green-500">Great work. The customer has been notified.</p>
            </motion.div>
          ) : isCancelled ? (
            <motion.div
              key="cancelled"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-3xl p-6 text-center"
            >
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h2 className="font-extrabold text-lg text-red-700 dark:text-red-400 mb-1">Booking Cancelled</h2>
              <p className="text-sm text-red-600">This booking has been cancelled.</p>
            </motion.div>
          ) : currentStep ? (
            <motion.div
              key={currentStep.status}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">Current Status</p>
                  <p className="font-extrabold text-base">{currentStep.label}</p>
                </div>
              </div>
              <p className="text-sm text-[var(--muted-foreground)] mb-5">{currentStep.description}</p>
              {currentStep.nextStatus && (
                <Button
                  variant="primary"
                  size="lg"
                  className={`w-full text-white ${currentStep.color}`}
                  loading={updating}
                  onClick={handleStatusUpdate}
                >
                  {currentStep.actionLabel} <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* ── Progress Timeline ────────────────────────────────────────── */}
        <Card className="p-6">
          <h2 className="font-bold mb-6 text-sm uppercase tracking-wide text-[var(--muted-foreground)]">Job Progress</h2>
          <div className="relative space-y-0">
            {JOB_STEPS.filter(s => s.status !== "completed" || isCompleted).map((step, i) => {
              const done = stepIndex > i || isCompleted;
              const active = stepIndex === i && !isCompleted;
              return (
                <div key={step.status} className="flex gap-4 pb-7 last:pb-0 relative">
                  {/* Connector */}
                  {i < JOB_STEPS.length - 1 && (
                    <div className="absolute left-4 top-9 bottom-0 w-px">
                      <motion.div
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: done ? 1 : 0 }}
                        transition={{ duration: 0.4, delay: i * 0.05 }}
                        style={{ transformOrigin: "top" }}
                        className="w-full h-full bg-green-500"
                      />
                      <div className="absolute inset-0 bg-[var(--border)]" style={{ zIndex: -1 }} />
                    </div>
                  )}

                  {/* Icon */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10 bg-[var(--background)]">
                    {done ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : active ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                        <Loader2 className="w-5 h-5 text-[var(--primary)]" />
                      </motion.div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-[var(--border)]" />
                    )}
                  </div>

                  {/* Label */}
                  <div className="flex-1 pt-0.5">
                    <p className={`font-semibold text-sm ${done || active ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"}`}>
                      {step.label}
                    </p>
                    {active && (
                      <p className="text-xs text-[var(--primary)] font-medium mt-0.5">In progress…</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* ── Customer Details ─────────────────────────────────────────── */}
        <Card className="p-6">
          <h2 className="font-bold mb-4">Customer Details</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--muted)] flex items-center justify-center">
                <User className="w-4 h-4 text-[var(--muted-foreground)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--muted-foreground)]">Name</p>
                <p className="font-semibold text-sm">{booking?.customer_name || booking?.user?.name || "—"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={`tel:${booking?.customer_phone || booking?.user?.phone}`}
                className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center flex-shrink-0"
              >
                <Phone className="w-4 h-4 text-white" />
              </a>
              <div>
                <p className="text-xs text-[var(--muted-foreground)]">Mobile — tap to call</p>
                <p className="font-semibold text-sm">{booking?.customer_phone || booking?.user?.phone || "—"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--muted)] flex items-center justify-center">
                <MapPin className="w-4 h-4 text-[var(--muted-foreground)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--muted-foreground)]">Address</p>
                <p className="font-semibold text-sm">{booking?.address}, {booking?.city} — {booking?.pincode}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--muted)] flex items-center justify-center">
                <Clock className="w-4 h-4 text-[var(--muted-foreground)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--muted-foreground)]">Preferred Slot</p>
                <p className="font-semibold text-sm">{booking?.preferred_slot || "Not specified"}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* ── Issue Details ─────────────────────────────────────────────── */}
        <Card className="p-6">
          <h2 className="font-bold mb-3">Issue Details</h2>
          <div className="bg-[var(--muted)] rounded-2xl p-4 space-y-2">
            <p className="font-semibold text-sm">{booking?.issue_title}</p>
            {booking?.issue_description && (
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{booking?.issue_description}</p>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-[var(--muted-foreground)]">Booking Fee Paid</span>
            <span className="font-bold text-green-600">₹{booking?.booking_fee || 99} ✓</span>
          </div>
          {booking?.final_quote && (
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">Final Quote</span>
              <span className="font-bold text-[var(--primary)]">₹{booking?.final_quote}</span>
            </div>
          )}
        </Card>

      </div>
    </div>
  );
}
