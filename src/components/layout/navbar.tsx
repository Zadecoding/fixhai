"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, Menu, X, Sun, Moon, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/book", label: "Book Now" },
  {
    label: "Services",
    children: [
      { href: "/services/mobile-repair", label: "Mobile Repair" },
      { href: "/services/laptop-repair", label: "Laptop Repair" },
      { href: "/services/air-conditioner", label: "AC Repair" },
      { href: "/services/washing-machine", label: "Washing Machine" },
      { href: "/services/refrigerator", label: "Refrigerator" },
      { href: "/services/tv-electronics", label: "TV & Electronics" },
    ],
  },
  { href: "/support", label: "Support" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const [techStatus, setTechStatus] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);

    const fetchStatus = async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setIsAuthenticated(true);
          const role = session.user.user_metadata?.role;
          setUserRole(role);
          if (role === 'technician') {
            const { data: techData } = await supabase
              .from('technician_profiles')
              .select('active')
              .eq('user_id', session.user.id)
              .single();
            if (techData) {
              setTechStatus((techData as any).active ? "ONLINE" : "OFFLINE");
            }
          } else {
            const { data } = await supabase
              .from("bookings")
              .select("status")
              .eq("user_id", session.user.id)
              .order("created_at", { ascending: false })
              .limit(1);
            if (data && data.length > 0) {
              const status = (data[0] as any).status;
              if (["assigned", "on_the_way", "diagnosis_complete"].includes(status)) {
                setTechStatus(`TECH: ${status.replace(/_/g, " ").toUpperCase()}`);
              }
            }
          }
        }
      } catch (e) {}
    };
    fetchStatus();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[var(--background)]/90 backdrop-blur-xl border-b border-[var(--border)] shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">
              Fix<span className="text-[var(--primary)]">hai</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
              link.children ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setServicesOpen(true)}
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors duration-150">
                    {link.label}
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        servicesOpen && "rotate-180"
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {servicesOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-1 w-52 bg-[var(--card)] rounded-2xl shadow-xl border border-[var(--border)] p-2 overflow-hidden"
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="flex items-center px-3 py-2 text-sm rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors duration-150"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href!}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150",
                    pathname === link.href
                      ? "text-[var(--primary)] bg-[var(--accent)]"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                  )}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {techStatus && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--muted)] border border-[var(--border)] mr-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  techStatus.includes("ONLINE") || techStatus.includes("WAY") ? "bg-green-500" : "bg-blue-500"
                )} />
                <span className="text-xs font-bold tracking-wider">{techStatus}</span>
              </div>
            )}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors duration-150"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>
            )}
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <Link
                  href={userRole === 'admin' ? '/admin' : userRole === 'technician' ? '/technician' : '/dashboard'}
                  className="px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors duration-150"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors duration-150"
                >
                  Log in
                </Link>
              )}
              <Link
                href="/book"
                className="px-4 py-2 text-sm font-semibold bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary)]/90 transition-all duration-150 shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Book Now
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden bg-[var(--background)] border-b border-[var(--border)]"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) =>
                link.children ? (
                  <div key={link.label}>
                    <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                      {link.label}
                    </div>
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-6 py-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href!}
                    className="block px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors"
                  >
                    {link.label}
                  </Link>
                )
              )}
              <div className="pt-3 flex flex-col gap-2">
                {isAuthenticated ? (
                  <Link
                    href={userRole === 'admin' ? '/admin' : userRole === 'technician' ? '/technician' : '/dashboard'}
                    className="w-full px-4 py-2.5 text-sm font-medium text-center border border-[var(--border)] rounded-xl text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/auth/login"
                    className="w-full px-4 py-2.5 text-sm font-medium text-center border border-[var(--border)] rounded-xl text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                  >
                    Log in
                  </Link>
                )}
                <Link
                  href="/book"
                  className="w-full px-4 py-2.5 text-sm font-semibold text-center bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary)]/90 transition-colors"
                >
                  Book Now — ₹99
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
