"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays, CheckCircle2, DollarSign, Users, Clock,
  UserCheck, Shield, X, Search, Download, Plus, Copy, Eye, EyeOff,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { BookingStatus } from "@/types/database";
import { getAdminTechnicians, verifyTechnician, addTechnicianByAdmin } from "./actions";
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ full_name: "", email: "", phone: "", category: "", city: "", pincode: "", bio: "", experience_years: "" });
  const [addLoading, setAddLoading] = useState(false);
  const [createdCreds, setCreatedCreds] = useState<{ email: string; tempPassword: string } | null>(null);
  const [showTempPass, setShowTempPass] = useState(false);

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

  const handleAddTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    const res = await addTechnicianByAdmin({
      ...addForm,
      experience_years: addForm.experience_years ? Number(addForm.experience_years) : 0,
    });
    setAddLoading(false);
    if (res.error) {
      toast.error(res.error);
    } else {
      setCreatedCreds({ email: addForm.email, tempPassword: res.tempPassword! });
      // Refresh technicians list
      const techRes = await getAdminTechnicians();
      if (techRes.technicians) setTechnicians(techRes.technicians);
      toast.success("Technician added successfully!");
      setAddForm({ full_name: "", email: "", phone: "", category: "", city: "", pincode: "", bio: "", experience_years: "" });
    }
  };

  const resetModal = () => { setShowAddModal(false); setCreatedCreds(null); setShowTempPass(false); };

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
              {/* Header row with Add button */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-[var(--muted-foreground)]">{technicians.length} technician{technicians.length !== 1 ? 's' : ''} registered</p>
                <Button size="sm" variant="primary" onClick={() => setShowAddModal(true)}>
                  <Plus className="w-4 h-4" /> Add Technician
                </Button>
              </div>

              {technicians.length === 0 ? (
                <div className="text-center py-16 text-[var(--muted-foreground)]">
                  <UserCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No technicians yet</p>
                  <p className="text-sm mt-1">Click "Add Technician" to get started.</p>
                </div>
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
                            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold rounded-full">Pending</span>
                          )}
                          {tech.active ? (
                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full">Active</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-[var(--muted)] text-[var(--muted-foreground)] text-xs font-semibold rounded-full">Inactive</span>
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

    {/* ── Add Technician Modal ─────────────────────────────── */}
    <AnimatePresence>
      {showAddModal && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={resetModal}
          />
          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[var(--background)] shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              {/* Modal header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-extrabold text-lg">Add Technician</h2>
                  <p className="text-sm text-[var(--muted-foreground)]">Create a pre-verified technician account</p>
                </div>
                <button onClick={resetModal} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-[var(--muted)] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {createdCreds ? (
                /* ── Success state: show credentials ── */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="font-bold text-green-700 dark:text-green-400">Technician Created!</span>
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)] mb-4">Share these login credentials with the technician. They can change their password after first login.</p>

                    <div className="space-y-3">
                      <div className="bg-[var(--background)] rounded-xl p-3 flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-0.5">Email</p>
                          <p className="text-sm font-mono font-medium">{createdCreds.email}</p>
                        </div>
                        <button onClick={() => { navigator.clipboard.writeText(createdCreds.email); toast.success('Email copied!'); }} className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="bg-[var(--background)] rounded-xl p-3 flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-0.5">Temporary Password</p>
                          <p className="text-sm font-mono font-medium">{showTempPass ? createdCreds.tempPassword : '••••••••••••'}</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => setShowTempPass(v => !v)} className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors">
                            {showTempPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button onClick={() => { navigator.clipboard.writeText(createdCreds.tempPassword); toast.success('Password copied!'); }} className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors">
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button variant="primary" className="w-full" onClick={() => { setCreatedCreds(null); }}>Add Another Technician</Button>
                  <Button variant="outline" className="w-full" onClick={resetModal}>Done</Button>
                </div>
              ) : (
                /* ── Add form ── */
                <form onSubmit={handleAddTechnician} className="space-y-4">
                  {([
                    { label: 'Full Name', key: 'full_name', placeholder: 'e.g. Rahul Sharma', type: 'text', required: true },
                    { label: 'Email Address', key: 'email', placeholder: 'rahul@example.com', type: 'email', required: true },
                    { label: 'Phone Number', key: 'phone', placeholder: '+91 98765 43210', type: 'tel', required: true },
                    { label: 'City', key: 'city', placeholder: 'e.g. Gurugram', type: 'text', required: true },
                    { label: 'Pincode', key: 'pincode', placeholder: '6-digit pincode', type: 'text', required: true },
                    { label: 'Years of Experience', key: 'experience_years', placeholder: 'e.g. 3', type: 'number', required: false },
                  ] as const).map(({ label, key, placeholder, type, required }) => (
                    <div key={key}>
                      <label className="block text-sm font-semibold mb-1.5">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
                      <input
                        type={type}
                        value={addForm[key as keyof typeof addForm]}
                        onChange={e => setAddForm(prev => ({ ...prev, [key]: e.target.value }))}
                        placeholder={placeholder}
                        required={required}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      />
                    </div>
                  ))}

                  {/* Category select */}
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Service Category<span className="text-red-500 ml-0.5">*</span></label>
                    <select
                      value={addForm.category}
                      onChange={e => setAddForm(prev => ({ ...prev, category: e.target.value }))}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    >
                      <option value="">Select a category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.slug}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Bio <span className="text-[var(--muted-foreground)] font-normal">(optional)</span></label>
                    <textarea
                      value={addForm.bio}
                      onChange={e => setAddForm(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Brief description of skills and experience..."
                      rows={3}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                    />
                  </div>

                  <div className="pt-2 flex gap-3">
                    <Button type="button" variant="outline" className="flex-1" onClick={resetModal}>Cancel</Button>
                    <Button type="submit" variant="primary" className="flex-1" disabled={addLoading}>
                      {addLoading ? 'Creating...' : 'Create Technician'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
