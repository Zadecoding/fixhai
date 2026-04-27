"use client";

import { motion } from "framer-motion";
import { use, useEffect, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
  MapPin,
  Phone,
  Star,
} from "lucide-react";
import { getBookingStatus } from "@/app/actions/dashboard";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import type { BookingStatus } from "@/types/database";
import Link from "next/link";

const timelineSteps: { status: BookingStatus; label: string; description: string }[] = [
  { status: "pending", label: "Booking Received", description: "Your booking and ₹99 fee received" },
  { status: "assigned", label: "Booking Confirmed", description: "A verified technician has been assigned" },
  { status: "on_the_way", label: "Technician on the Way", description: "Expert is heading to your location" },
  { status: "diagnosis_complete", label: "Diagnosis Complete", description: "Issue identified, quote shared" },
  { status: "completed", label: "Job Completed", description: "Repair done successfully! 🎉" },
];

const statusOrder: BookingStatus[] = [
  "pending", "assigned", "on_the_way", "diagnosis_complete", "completed",
];

interface Props {
  params: Promise<{ id: string }>;
}

export default function BookingStatusPage({ params }: Props) {
  const { id } = use(params);
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBookingStatus(id).then(res => {
      if (res.booking) setBooking(res.booking);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--primary)] mb-4" />
        <p className="text-[var(--muted-foreground)]">Fetching your booking details...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Booking not found</h1>
        <p className="text-[var(--muted-foreground)] mb-8">We couldn't find a booking with ID: {id}</p>
        <Link href="/dashboard">
          <Button variant="primary">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const technician = booking.technician;
  const categoryName = booking.service_name || "Service Repair";

  const currentStatusIndex = statusOrder.indexOf(
    (booking.status?.toLowerCase() as BookingStatus) || "pending"
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-extrabold tracking-tight">Booking Status</h1>
          {booking?.status && <StatusBadge status={booking.status as BookingStatus} />}
        </div>
        <p className="text-sm text-[var(--muted-foreground)]">
          Booking ID:{" "}
          <span className="font-mono font-bold text-[var(--foreground)]">{id}</span>
        </p>
      </div>

      {/* Booking Info Card */}
      <Card className="mb-6 overflow-hidden">
        <div className="bg-[var(--muted)] px-6 py-4 border-b border-[var(--border)]">
          <h2 className="font-bold">{categoryName}</h2>
          <p className="text-sm text-[var(--muted-foreground)]">{booking.issue_title}</p>
        </div>
        <div className="px-6 py-5 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-[var(--muted-foreground)]">Booking Fee</span>
            <div className="font-bold text-green-600">₹{booking?.booking_fee || 99} Paid</div>
          </div>
          {booking?.final_quote && (
            <div>
              <span className="text-[var(--muted-foreground)]">Final Quote</span>
              <div className="font-bold text-[var(--primary)]">₹{booking.final_quote}</div>
            </div>
          )}
          <div>
            <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
              <MapPin className="w-3 h-3" /> Address
            </div>
            <div className="font-medium">{booking?.address}</div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
              <Clock className="w-3 h-3" /> Booked At
            </div>
            <div className="font-medium">
              {booking?.created_at ? formatDateTime(booking.created_at) : "--"}
            </div>
          </div>
        </div>
      </Card>

      {/* Animated Timeline */}
      <Card className="mb-6 p-6">
        <h2 className="font-bold mb-6">Live Progress</h2>
        <div className="relative">
          {timelineSteps.map((step, i) => {
            const stepIndex = statusOrder.indexOf(step.status);
            const isComplete = stepIndex <= currentStatusIndex && booking?.status !== "cancelled";
            const isActive = stepIndex === currentStatusIndex;

            return (
              <div key={step.status} className="flex gap-4 pb-8 last:pb-0 relative">
                {/* Connector line */}
                {i < timelineSteps.length - 1 && (
                  <div className="absolute left-4 top-9 bottom-0 w-px">
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: stepIndex < currentStatusIndex && booking?.status !== "cancelled" ? 1 : 0 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      style={{ transformOrigin: "top" }}
                      className="w-full h-full bg-green-500"
                    />
                    <div className="absolute inset-0 bg-[var(--border)]" style={{ zIndex: -1 }} />
                  </div>
                )}

                {/* Icon */}
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10 bg-[var(--background)]"
                >
                  {isComplete ? (
                    isActive && booking?.status !== "completed" && step.status !== "assigned" ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="w-5 h-5 text-[var(--primary)]" />
                      </motion.div>
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )
                  ) : (
                    <Circle className="w-5 h-5 text-[var(--border)]" />
                  )}
                </motion.div>

                {/* Content */}
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                  className="flex-1"
                >
                  <div
                    className={`font-semibold text-sm ${
                      isComplete
                        ? "text-[var(--foreground)]"
                        : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    {step.label}
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    {step.description}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Technician Card */}
      {technician ? (
        <Card className="mb-6 p-5">
          <h2 className="font-bold mb-4">Your Technician</h2>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--primary)] flex items-center justify-center text-white font-bold text-xl">
              {technician.full_name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="font-semibold">{technician.full_name}</div>
              <div className="text-sm text-[var(--muted-foreground)]">{technician.category}</div>
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-semibold">{technician.rating}</span>
                {technician.verified && (
                  <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full font-semibold">
                    ✓ Verified
                  </span>
                )}
              </div>
            </div>
            <a
              href={`tel:${technician.phone}`}
              className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center"
            >
              <Phone className="w-4 h-4 text-white" />
            </a>
          </div>
          {technician.bio && (
            <p className="text-sm text-[var(--muted-foreground)] mt-3 pl-0">
              {technician.bio}
            </p>
          )}
        </Card>
      ) : booking?.status === "pending" ? (
        <Card className="mb-6 p-5">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-5 h-5 text-[var(--primary)]" />
            </motion.div>
            <div>
              <div className="font-semibold text-sm">Finding the best technician for you…</div>
              <div className="text-xs text-[var(--muted-foreground)]">
                Usually assigned within 30 minutes
              </div>
            </div>
          </div>
        </Card>
      ) : null}

      {/* Actions */}
      <div className="flex gap-3">
        <Link href="/dashboard" className="flex-1">
          <button className="w-full px-4 py-3 rounded-xl border border-[var(--border)] text-sm font-semibold hover:bg-[var(--muted)] transition-colors">
            My Dashboard
          </button>
        </Link>
        <Link href="/support" className="flex-1">
          <button className="w-full px-4 py-3 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:bg-[var(--primary)]/90 transition-colors">
            Need Help?
          </button>
        </Link>
      </div>
    </div>
  );
}
