"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  CheckCircle2,
  XCircle,
  MapPin,
  Clock,
  DollarSign,
  ToggleLeft,
  ToggleRight,
  Star,
  ChevronRight,
  Phone,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import type { BookingStatus } from "@/types/database";
import { logout } from "@/app/auth/actions";
import { AlertCircle, LogOut } from "lucide-react";
import Link from "next/link";

const tabs = ["Active Jobs", "History", "Earnings"];

export default function TechnicianDashboardClient({ 
  profile, 
  initialBookings = [],
  categories = [] 
}: { 
  profile: any; 
  initialBookings?: any[];
  categories?: any[];
}) {
  const [online, setOnline] = useState(profile?.active || false);
  const [activeTab, setActiveTab] = useState("Active Jobs");
  const [bookings, setBookings] = useState(initialBookings);
  const [jobStatuses, setJobStatuses] = useState<Record<string, BookingStatus>>({});

  const activeJobs = bookings.filter((b) => b.status !== "completed" && b.status !== "cancelled");
  const historyJobs = bookings.filter((b) => b.status === "completed" || b.status === "cancelled");

  const updateStatus = (bookingId: string, status: BookingStatus) => {
    setJobStatuses((prev) => ({ ...prev, [bookingId]: status }));
    toast.success(`Status updated to: ${status.replace(/_/g, " ")}`);
  };

  return (
    <>
      {/* Profile Creation Dialog Overlay */}
      {!profile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--card)] rounded-3xl p-8 max-w-md w-full shadow-2xl border border-[var(--border)] text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-orange-500" />
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-2xl font-extrabold mb-3">Profile Incomplete</h2>
            <p className="text-[var(--muted-foreground)] mb-8 text-sm leading-relaxed">
              Welcome to Fixhai! To start receiving jobs and accessing your dashboard, you need to complete your technician profile.
            </p>
            <div className="space-y-3">
              <Link href="/technician/profile/create" className="block">
                <Button size="lg" variant="primary" className="w-full">
                  Complete Profile Now
                </Button>
              </Link>
              <button
                onClick={() => logout()}
                className="w-full py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                Sign out
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <div className={`min-h-screen bg-[var(--muted)]/30 ${!profile ? 'pointer-events-none blur-sm select-none' : ''}`}>
      {/* Header */}
      <div className="bg-[var(--background)] border-b border-[var(--border)] sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-extrabold text-xl">Technician Portal</h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              {profile?.full_name || "Technician"} — {profile?.category ? categories.find((c: any) => c.slug === profile.category)?.name || profile.category : "No Category"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setOnline(!online);
                toast(online ? "You are now offline" : "You are now online and receiving jobs!");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                online
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)]"
              }`}
            >
              {online ? (
                <ToggleRight className="w-5 h-5" />
              ) : (
                <ToggleLeft className="w-5 h-5" />
              )}
              {online ? "Online" : "Offline"}
            </button>
            <button
              onClick={() => logout()}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Earnings overview */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Today's Earnings", value: "₹2,400", icon: DollarSign, color: "text-green-600 bg-green-100 dark:bg-green-900/30" },
            { label: "Jobs Completed", value: "18", icon: CheckCircle2, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30" },
            { label: "Rating", value: "4.8★", icon: Star, color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-5">
                  <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-xl font-extrabold">{stat.value}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">{stat.label}</div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Verification Check */}
        {!profile?.verified ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-6">
              <Clock className="w-10 h-10 text-orange-600 dark:text-orange-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-extrabold mb-3">Verification Pending</h2>
            <p className="text-[var(--muted-foreground)] max-w-md mx-auto">
              We are currently reviewing your profile. Once an admin grants permission, you will be able to start accepting jobs and viewing your dashboard.
            </p>
          </motion.div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-1 bg-[var(--muted)] p-1 rounded-2xl mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === tab
                      ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "Active Jobs" && (
            <div className="space-y-4">
              {!online && activeJobs.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-sm text-amber-700 dark:text-amber-400">
                  ⚠️ You are currently offline. Toggle to Online to receive new job assignments.
                </div>
              )}

              {activeJobs.length > 0 ? (
                activeJobs.map((booking) => {
                  const currentStatus = jobStatuses[booking.id] || booking.status;
                  return (
                    <Card key={booking.id} className="p-5 border-2 border-[var(--primary)]/10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{booking.service_name}</span>
                          {booking.status === 'pending' && (
                            <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-[10px] font-bold rounded-lg uppercase">
                              New
                            </span>
                          )}
                        </div>
                        <StatusBadge status={currentStatus as BookingStatus} />
                      </div>
                      <div className="text-sm text-[var(--muted-foreground)] mb-3">
                        {booking.issue_title}
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs text-[var(--muted-foreground)] mb-4">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {booking.city} {booking.pincode}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {booking.preferred_slot || "No slot specified"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {booking.user?.phone || "No phone"}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-[var(--primary)]">
                          <DollarSign className="w-3 h-3" /> Fee Paid: ₹{booking.booking_fee}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        {currentStatus === 'pending' ? (
                          <>
                            <Button size="sm" variant="primary" className="flex-1" onClick={() => updateStatus(booking.id, 'assigned' as any)}>
                              Accept
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">Decline</Button>
                          </>
                        ) : (
                          <Link href={`/technician/job/${booking.id}`} className="flex-1">
                            <Button size="sm" variant="primary" className="w-full">
                              Manage Job <ChevronRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </Card>
                  );
                })
              ) : (
                <EmptyState icon="calendar" title="No active jobs" description="New assignments will appear here." />
              )}
            </div>
          )}

          {activeTab === "History" && (
            <Card>
              <div className="divide-y divide-[var(--border)]">
                {historyJobs.length > 0 ? (
                  historyJobs.map((booking) => (
                    <div key={booking.id} className="px-6 py-4 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm">{booking.service_name}</div>
                        <div className="text-xs text-[var(--muted-foreground)]">
                          {booking.issue_title} • {booking.city}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          {booking.total_amount ? formatCurrency(booking.total_amount) : "—"}
                        </div>
                        <StatusBadge status={booking.status as BookingStatus} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-10 text-center text-[var(--muted-foreground)]">
                    No job history available.
                  </div>
                )}
              </div>
            </Card>
          )}

          {activeTab === "Earnings" && (
            <Card className="p-6">
              <div className="text-center mb-8">
                <div className="text-4xl font-extrabold text-[var(--primary)] mb-1">
                  {formatCurrency(historyJobs.reduce((sum, b) => sum + (b.total_amount || 0), 0))}
                </div>
                <div className="text-[var(--muted-foreground)]">Total Earnings from Completed Jobs</div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 text-sm text-center">
                 Earnings are calculated based on completed repairs and inspection fees collected.
              </div>
            </Card>
          )}
        </motion.div>
      </>
    )}
  </div>
</div>
</>
  );
}
