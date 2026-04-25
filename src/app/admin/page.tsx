"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  CheckCircle2,
  DollarSign,
  Users,
  Clock,
  UserCheck,
  ChevronRight,
  Shield,
  X,
  Search,
  Download,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { BookingStatus } from "@/types/database";
import { getAdminTechnicians, verifyTechnician } from "./actions";
import { getAdminDashboardData, getCategories } from "@/app/actions/dashboard";

const adminTabs = ["Overview", "Bookings", "Technicians", "Categories", "Complaints"];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [techRes, dashRes, catRes] = await Promise.all([
          getAdminTechnicians(),
          getAdminDashboardData(),
          getCategories(),
        ]);
        if (techRes.technicians) setTechnicians(techRes.technicians);
        if (dashRes.bookings) setBookings(dashRes.bookings);
        if (dashRes.tickets) setTickets(dashRes.tickets);
        if (dashRes.users) setUsers(dashRes.users);
        if (catRes.categories) setCategories(catRes.categories);
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenue = bookings
    .filter((b) => b.status === "completed" || b.payment_status === "paid")
    .reduce((sum, b) => sum + (b.total_amount || b.booking_fee || 0), 0);

  const summaryStats = [
    { label: "Total Bookings", value: bookings.length.toString(), icon: CalendarDays, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
    { label: "Completed", value: bookings.filter((b) => b.status === "completed").length.toString(), icon: CheckCircle2, color: "bg-green-100 dark:bg-green-900/30 text-green-600" },
    { label: "Revenue (₹)", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: DollarSign, color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600" },
    { label: "Total Users", value: users.length.toString(), icon: Users, color: "bg-orange-100 dark:bg-orange-900/30 text-orange-600" },
    { label: "Support Tickets", value: tickets.length.toString(), icon: Clock, color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600" },
    { label: "Active Techs", value: technicians.filter((t) => t.active).length.toString(), icon: UserCheck, color: "bg-red-100 dark:bg-red-900/30 text-red-600" },
  ];

  const handleVerify = async (id: string, verify: boolean) => {
    const res = await verifyTechnician(id, verify);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(verify ? "Technician approved!" : "Technician rejected.");
      setTechnicians((prev) =>
        prev.map((t) => (t.id === id ? { ...t, verified: verify, active: verify } : t))
      );
    }
  };

  const exportCSV = () => {
    const headers = ["ID", "Service", "Issue", "Status", "City", "Fee", "Created At"];
    const rows = bookings.map((b) => [
      b.id,
      categories.find((c) => c.id === b.category_id)?.name || b.issue_title || "",
      b.issue_title,
      b.status,
      b.city,
      b.booking_fee,
      b.created_at,
    ]);
    const csvContent = [headers, ...rows].map((row) => row?.join(",")).join("\n");
    const blob = new Blob([csvContent as string], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fixhai_bookings.csv";
    a.click();
    toast.success("Bookings exported to CSV!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--muted-foreground)]">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--muted)]/30">
      {/* Header */}
      <div className="bg-[var(--background)] border-b border-[var(--border)] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-extrabold text-xl">Admin Dashboard</h1>
            <p className="text-sm text-[var(--muted-foreground)]">Fixhai Operations Centre</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={exportCSV}>
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {summaryStats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className="p-4">
                  <div className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-extrabold">{stat.value}</div>
                  <div className="text-xs text-[var(--muted-foreground)] leading-snug">{stat.label}</div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[var(--muted)] p-1 rounded-2xl mb-6 overflow-x-auto">
          {adminTabs.map((tab) => (
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
          {/* OVERVIEW */}
          {activeTab === "Overview" && (
            <div className="space-y-6">
              {/* Quick stats */}
              <div className="grid lg:grid-cols-3 gap-4">
                <Card className="p-5 lg:col-span-2">
                  <h3 className="font-bold mb-4">Recent Bookings</h3>
                  {bookings.length === 0 ? (
                    <p className="text-[var(--muted-foreground)] text-sm text-center py-6">No bookings yet.</p>
                  ) : (
                    <div className="divide-y divide-[var(--border)]">
                      {bookings.slice(0, 5).map((booking) => {
                        const category = categories.find((c) => c.id === booking.category_id);
                        return (
                          <div key={booking.id} className="py-3 flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-sm">{category?.name || booking.issue_title}</div>
                              <div className="text-xs text-[var(--muted-foreground)]">
                                {booking.issue_title} • {booking.city}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {booking.status && <StatusBadge status={booking.status as BookingStatus} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <button
                    className="text-sm text-[var(--primary)] font-semibold hover:underline mt-3"
                    onClick={() => setActiveTab("Bookings")}
                  >
                    View all bookings →
                  </button>
                </Card>

                <Card className="p-5">
                  <h3 className="font-bold mb-4">Pending Actions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--muted-foreground)]">Unverified Techs</span>
                      <span className="font-bold text-orange-600">
                        {technicians.filter((t) => !t.verified).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--muted-foreground)]">Unassigned Bookings</span>
                      <span className="font-bold text-blue-600">
                        {bookings.filter((b) => !b.technician_id && b.status === "pending").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--muted-foreground)]">Open Tickets</span>
                      <span className="font-bold text-red-600">
                        {tickets.filter((t) => t.status === "open").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--muted-foreground)]">Total Users</span>
                      <span className="font-bold">{users.length}</span>
                    </div>
                  </div>
                  <button
                    className="text-sm text-[var(--primary)] font-semibold hover:underline mt-4"
                    onClick={() => setActiveTab("Technicians")}
                  >
                    Manage technicians →
                  </button>
                </Card>
              </div>
            </div>
          )}

          {/* BOOKINGS */}
          {activeTab === "Bookings" && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by issue or city..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>

              <Card>
                <div className="overflow-x-auto">
                  {bookings.length === 0 ? (
                    <p className="text-center text-[var(--muted-foreground)] py-10">No bookings found.</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[var(--border)]">
                          {["ID", "Service", "Issue", "City", "Status", "Technician", "Fee", "Date"].map((h) => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {bookings
                          .filter(
                            (b) =>
                              !searchQuery ||
                              b.issue_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              b.city?.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((booking) => {
                            const category = categories.find((c) => c.id === booking.category_id);
                            return (
                              <tr key={booking.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/50">
                                <td className="px-4 py-3 font-mono text-xs">{booking.id.slice(0, 8)}...</td>
                                <td className="px-4 py-3 font-medium">{category?.name || "—"}</td>
                                <td className="px-4 py-3 text-[var(--muted-foreground)]">{booking.issue_title}</td>
                                <td className="px-4 py-3">{booking.city}</td>
                                <td className="px-4 py-3">
                                  {booking.status && <StatusBadge status={booking.status as BookingStatus} />}
                                </td>
                                <td className="px-4 py-3">
                                  {booking.technician ? (
                                    <span className="text-green-600 font-semibold text-xs">{booking.technician.full_name}</span>
                                  ) : (
                                    <span className="text-amber-600 text-xs">Unassigned</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 font-semibold">₹{booking.booking_fee}</td>
                                <td className="px-4 py-3 text-xs text-[var(--muted-foreground)]">
                                  {formatDate(booking.created_at)}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* TECHNICIANS */}
          {activeTab === "Technicians" && (
            <div className="space-y-4">
              {technicians.length === 0 ? (
                <div className="text-center py-10 text-[var(--muted-foreground)]">No technicians registered yet.</div>
              ) : (
                technicians.map((tech) => (
                  <Card key={tech.id} className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--primary)] flex items-center justify-center text-white font-bold text-lg">
                        {tech.full_name?.charAt(0) || "T"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="font-bold">{tech.full_name}</span>
                          {tech.verified ? (
                            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">✓ Verified</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold rounded-full">Pending Verification</span>
                          )}
                          {tech.active ? (
                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full">Online</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-[var(--muted)] text-[var(--muted-foreground)] text-xs font-semibold rounded-full">Offline</span>
                          )}
                        </div>
                        <div className="text-sm text-[var(--muted-foreground)]">
                          {tech.category} • {tech.city}, {tech.pincode} • {tech.phone}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!tech.verified && (
                          <>
                            <Button size="sm" variant="primary" onClick={() => handleVerify(tech.id, true)}>
                              <Shield className="w-3 h-3" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleVerify(tech.id, false)}>
                              <X className="w-3 h-3" /> Reject
                            </Button>
                          </>
                        )}
                        {tech.verified && (
                          <Button size="sm" variant="outline" onClick={() => handleVerify(tech.id, false)}>
                            <X className="w-3 h-3" /> Revoke
                          </Button>
                        )}
                      </div>
                    </div>
                    {tech.bio && (
                      <p className="text-xs text-[var(--muted-foreground)] mt-3 pl-16">{tech.bio}</p>
                    )}
                  </Card>
                ))
              )}
            </div>
          )}

          {/* CATEGORIES */}
          {activeTab === "Categories" && (
            <Card>
              <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
                <h3 className="font-bold">Service Categories</h3>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {categories.length === 0 ? (
                  <p className="text-center text-[var(--muted-foreground)] py-10">No categories found.</p>
                ) : (
                  categories.map((cat) => (
                    <div key={cat.id} className="px-6 py-4 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm">{cat.name}</div>
                        <div className="text-xs text-[var(--muted-foreground)]">/services/{cat.slug}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          cat.active
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                        }`}>
                          {cat.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}

          {/* COMPLAINTS */}
          {activeTab === "Complaints" && (
            <Card>
              <div className="px-6 py-4 border-b border-[var(--border)]">
                <h3 className="font-bold">Customer Complaints &amp; Support</h3>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {tickets.length === 0 ? (
                  <p className="text-center text-[var(--muted-foreground)] py-10">No support tickets found.</p>
                ) : (
                  tickets.map((ticket) => (
                    <div key={ticket.id} className="px-6 py-4 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{ticket.subject}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            ticket.priority === "critical"
                              ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                              : ticket.priority === "high"
                              ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                              : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                          }`}>
                            {ticket.priority || "normal"}
                          </span>
                        </div>
                        <div className="text-xs text-[var(--muted-foreground)] mb-2 max-w-2xl">{ticket.description}</div>
                        <div className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider font-semibold">
                          {formatDate(ticket.created_at)} • {ticket.user?.name || "Anonymous"}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          ticket.status === "open"
                            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                            : ticket.status === "in_progress"
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                            : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        }`}>
                          {(ticket.status || "open").replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
