import Link from "next/link";
import { Wrench, Phone, Mail, MapPin, Globe, MessageCircle, Share2 } from "lucide-react";

const footerLinks = {
  Services: [
    { href: "/services/mobile-repair", label: "Mobile Repair" },
    { href: "/services/laptop-repair", label: "Laptop Repair" },
    { href: "/services/air-conditioner", label: "AC Repair" },
    { href: "/services/washing-machine", label: "Washing Machine" },
    { href: "/services/refrigerator", label: "Refrigerator" },
    { href: "/services/tv-electronics", label: "TV & Electronics" },
  ],
  Company: [
    { href: "/about", label: "About Us" },
    { href: "/careers", label: "Careers" },
    { href: "/blog", label: "Blog" },
    { href: "/support", label: "Support" },
  ],
  Legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/refund", label: "Refund Policy" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[var(--card)] border-t border-[var(--border)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">
                Fix<span className="text-[var(--primary)]">hai</span>
              </span>
            </Link>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-6 max-w-xs">
              Book verified technicians for mobile, laptop and appliance repairs. Just ₹99 to get started. Transparent pricing, expert service.
            </p>
            <div className="space-y-2 text-sm text-[var(--muted-foreground)]">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[var(--primary)]" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[var(--primary)]" />
                <span>hello@fixhai.in</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--primary)]" />
                <span>Gurugram, Haryana, India</span>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              {[Globe, MessageCircle, Share2].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-xl border border-[var(--border)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-colors duration-150"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-sm mb-4 text-[var(--foreground)]">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-[var(--border)] mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            © 2026 Fixhai. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
