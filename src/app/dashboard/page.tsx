"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  CalendarDays,
  CreditCard,
  Star,
  HeadphonesIcon,
  ChevronRight,
  Download,
  Clock,
  MapPin,
  User,
  LogOut,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Booking, Review } from "@/types/database";
import { getCustomerDashboardData } from "@/app/actions/dashboard";
import type { BookingStatus } from "@/types/database";

import { logout } from "@/app/auth/actions";

const tabs = ["Bookings", "Payments", "Reviews", "Profile"];

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("Bookings");
  const [bookings, setBookings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real user info from Supabase
    const loadData = async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) setUser(authUser);
      } catch {}

      getCustomerDashboardData().then((res) => {
        if (res.bookings) setBookings(res.bookings);
        if (res.reviews) setReviews(res.reviews);
        setLoading(false);
      });
    };
    loadData();
  }, []);

  const totalSpent = bookings
    .filter(b => b.payment_status === 'paid')
    .reduce((sum, b) => sum + (b.booking_fee || b.total_amount || 0), 0);

  const statsCards = [
    { label: "Total Bookings", value: bookings.length.toString(), icon: CalendarDays, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
    { label: "Total Spent", value: `₹${totalSpent}`, icon: CreditCard, color: "bg-green-100 dark:bg-green-900/30 text-green-600" },
    { label: "Reviews Given", value: reviews.length.toString(), icon: Star, color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600" },
  ];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-[var(--muted)]/30">
      {/* Top bar */}
      <div className="bg-[var(--background)] border-b border-[var(--border)] sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-extrabold text-xl tracking-tight">My Dashboard</h1>
            <p className="text-sm text-[var(--muted-foreground)]">Welcome back{user?.user_metadata?.name ? `, ${user.user_metadata.name.split(' ')[0]}` : ''} 👋</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/book">
              <Button size="md" variant="primary">+ New Booking</Button>
            </Link>
            <button onClick={() => logout()} className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {statsCards.map((stat, i) => {
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
                  <div className="text-2xl font-extrabold">{stat.value}</div>
                  <div className="text-sm text-[var(--muted-foreground)]">{stat.label}</div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[var(--muted)] p-1 rounded-2xl mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-max px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
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
          {activeTab === "Bookings" && (
            <div className="space-y-4">
              {bookings.length > 0 ? (
                <div className="grid gap-4">
                  {bookings.map((booking) => {
                    return (
                      <Card key={booking.id} className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold">{booking.service_name}</span>
                              {booking.status && (
                                <StatusBadge status={booking.status as BookingStatus} />
                              )}
                            </div>
                            <div className="text-sm text-[var(--muted-foreground)] mb-2">
                              {booking.issue_title}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {booking.created_at ? formatDate(booking.created_at) : "--"}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {booking.city}
                              </span>
                              <span className="flex items-center gap-1">
                                <CreditCard className="w-3 h-3" />
                                Paid ₹{booking.booking_fee}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Link href={`/booking/${booking.id}`}>
                              <Button size="sm" variant="outline">
                                Track <ChevronRight className="w-3 h-3" />
                              </Button>
                            </Link>
                            {booking.status === "completed" && (
                              <Button size="sm" variant="ghost">
                                <Download className="w-3 h-3" /> Invoice
                              </Button>
                            )}
                          </div>
                        </div>
                        {booking.final_quote && (
                          <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between text-sm">
                            <span className="text-[var(--muted-foreground)]">Final Repair Quote</span>
                            <span className="font-bold text-[var(--primary)]">
                              {formatCurrency(booking.final_quote)}
                            </span>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <EmptyState icon="calendar" title="No bookings yet" description="Book your first service to get started." />
              )}
            </div>
          )}

          {activeTab === "Payments" && (
            <Card>
              <div className="divide-y divide-[var(--border)]">
                {bookings.map((booking) => {
                  return (
                    <div key={booking.id} className="px-6 py-4 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm">{booking.service_name}</div>
                        <div className="text-xs text-[var(--muted-foreground)]">
                          Booking Fee • {booking.created_at ? formatDate(booking.created_at) : "--"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">₹{booking.booking_fee}</div>
                        <div className="text-xs text-green-600">
                          {booking.payment_status === "paid" ? "✓ Paid" : "Pending"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {activeTab === "Reviews" && (
            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <Card key={review.id} className="p-5">
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: review.rating || 5 }).map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)]">{review.comment}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-3">
                      {formatDate(review.created_at)}
                    </p>
                  </Card>
                ))
              ) : (
                <EmptyState
                  icon="search"
                  title="No reviews yet"
                  description="After your booking is complete, you can leave a review for your technician."
                />
              )}
            </div>
          )}

          {activeTab === "Profile" && (
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-[var(--primary)] flex items-center justify-center text-white text-2xl font-bold">
                  {(user?.user_metadata?.name || user?.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xl font-bold">{user?.user_metadata?.name || 'User'}</div>
                  <div className="text-[var(--muted-foreground)] text-sm">{user?.email}</div>
                  {user?.user_metadata?.phone && (
                    <div className="text-[var(--muted-foreground)] text-sm">{user.user_metadata.phone}</div>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { icon: User, label: "Edit Profile", href: "#", action: undefined },
                  { icon: HeadphonesIcon, label: "Contact Support", href: "/support", action: undefined },
                  { icon: LogOut, label: "Sign Out", href: undefined, action: () => logout() },
                ].map(({ icon: Icon, label, href, action }) => (
                  <div key={label}>
                    {action ? (
                      <div onClick={action} className="flex items-center justify-between p-4 rounded-xl hover:bg-[var(--muted)] transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-[var(--muted-foreground)]" />
                          <span className="font-medium text-sm">{label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)]" />
                      </div>
                    ) : (
                      <Link href={href || "#"}>
                        <div className="flex items-center justify-between p-4 rounded-xl hover:bg-[var(--muted)] transition-colors cursor-pointer">
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-[var(--muted-foreground)]" />
                            <span className="font-medium text-sm">{label}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)]" />
                        </div>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
