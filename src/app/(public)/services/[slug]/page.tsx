import { SERVICE_ISSUES } from "@/lib/constants";
import { getCategories } from "@/app/actions/dashboard";
import { notFound } from "next/navigation";
import { Smartphone, Laptop, Wind, WashingMachine, Thermometer, Tv, CheckCircle2, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import type { Metadata } from "next";

const categoryIcons: Record<string, React.ElementType> = {
  Smartphone, Laptop, Wind, WashingMachine, Thermometer, Tv,
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { categories } = await getCategories();
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return {};
  return {
    title: cat.name,
    description: cat.description,
  };
}

export async function generateStaticParams() {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: categories } = await supabase
      .from('service_categories')
      .select('slug')
      .eq('active', true);
    if (categories) return categories.map((c) => ({ slug: c.slug }));
  } catch {}
  // Fallback to static slugs if DB is unavailable at build time
  return [
    { slug: 'mobile-repair' },
    { slug: 'laptop-repair' },
    { slug: 'washing-machine' },
    { slug: 'air-conditioner' },
    { slug: 'refrigerator' },
    { slug: 'tv-electronics' },
  ];
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const { categories } = await getCategories();
  const category = categories.find((c) => c.slug === slug);

  if (!category) notFound();

  const Icon = categoryIcons[category.icon] || Smartphone;
  const issues = SERVICE_ISSUES[slug] || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="w-20 h-20 rounded-3xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-6">
          <Icon className="w-10 h-10 text-[var(--primary)]" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">{category.name}</h1>
        <p className="text-lg text-[var(--muted-foreground)] max-w-xl mx-auto mb-8">
          {category.description}
        </p>
        <Link href={`/book?category=${slug}`}>
          <button className="px-8 py-4 bg-[var(--primary)] text-white rounded-2xl font-bold text-lg hover:bg-[var(--primary)]/90 hover:-translate-y-0.5 transition-all duration-200 shadow-lg inline-flex items-center gap-2">
            Book a Technician — ₹99
            <ArrowRight className="w-5 h-5" />
          </button>
        </Link>
      </div>

      {/* Common Issues */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Common issues we fix</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {issues.map((issue) => (
            <Card key={issue} className="flex items-center gap-4 p-4">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm font-medium">{issue}</span>
              <Link
                href={`/book?category=${slug}&issue=${encodeURIComponent(issue)}`}
                className="ml-auto text-xs text-[var(--primary)] font-semibold hover:underline"
              >
                Book →
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {/* Why Fixhai */}
      <div className="bg-[var(--muted)]/60 rounded-3xl p-8 mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Why book with Fixhai?</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { title: "Verified Experts", desc: "All technicians are background-checked and skill-tested before joining." },
            { title: "Transparent Pricing", desc: "₹99 inspection fee. Free diagnosis quote. You decide before paying repair cost." },
            { title: "30-Day Warranty", desc: "Every Fixhai repair comes with a 30-day service warranty. Peace of mind guaranteed." },
          ].map((item) => (
            <div key={item.title} className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-[var(--primary)] flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold mb-1">{item.title}</h3>
              <p className="text-sm text-[var(--muted-foreground)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-3">Ready to get it fixed?</h2>
        <p className="text-[var(--muted-foreground)] mb-6">
          Book in 2 minutes. Pay just ₹99. Expert at your door.
        </p>
        <Link href={`/book?category=${slug}`}>
          <button className="px-8 py-4 bg-[var(--primary)] text-white rounded-2xl font-bold text-lg hover:bg-[var(--primary)]/90 hover:-translate-y-0.5 transition-all duration-200 shadow-lg inline-flex items-center gap-2">
            Book Now — ₹99
            <ArrowRight className="w-5 h-5" />
          </button>
        </Link>
      </div>
    </div>
  );
}
