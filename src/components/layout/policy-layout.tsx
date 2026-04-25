import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface PolicyLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function PolicyLayout({ title, subtitle, lastUpdated, children }: PolicyLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-zinc-900 dark:to-zinc-950 border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] mb-6">
            <Link href="/" className="hover:text-[var(--primary)] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[var(--foreground)]">{title}</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--foreground)] mb-3">{title}</h1>
          <p className="text-lg text-[var(--muted-foreground)]">{subtitle}</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-4 font-medium uppercase tracking-wider">
            Last updated: {lastUpdated}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <div className="prose prose-zinc dark:prose-invert max-w-none
          prose-headings:font-extrabold prose-headings:tracking-tight
          prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-[var(--foreground)]
          prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2 prose-h3:text-[var(--foreground)]
          prose-p:text-[var(--muted-foreground)] prose-p:leading-relaxed
          prose-li:text-[var(--muted-foreground)] prose-li:leading-relaxed
          prose-strong:text-[var(--foreground)] prose-strong:font-semibold
          prose-a:text-orange-500 prose-a:no-underline hover:prose-a:underline">
          {children}
        </div>
      </div>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-extrabold text-[var(--foreground)] mb-4 pb-2 border-b border-[var(--border)]">
        {title}
      </h2>
      <div className="space-y-3 text-[var(--muted-foreground)] leading-relaxed text-[15px]">
        {children}
      </div>
    </section>
  );
}

export function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-orange-50 dark:bg-orange-950/20 border-l-4 border-orange-400 rounded-r-xl px-5 py-4 my-4 text-[var(--foreground)] text-sm font-medium">
      {children}
    </div>
  );
}
