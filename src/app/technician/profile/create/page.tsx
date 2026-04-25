"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createProfile } from "./actions";
import { getCategories } from "@/app/actions/dashboard";
import type { ServiceCategory } from "@/types/database";

const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  category: z.string().min(1, "Please select a service category"),
  city: z.string().min(2, "Please enter your city"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  bio: z.string().optional(),
});

type ProfileData = z.infer<typeof profileSchema>;

export default function CreateProfilePage() {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const router = useRouter();
  
  // Fetch categories on mount
  useEffect(() => {
    getCategories().then((res) => {
      if (res.categories) setCategories(res.categories);
    });
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
  });

  const onSubmit = async (data: ProfileData) => {
    setLoading(true);
    
    // Verify Pincode
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${data.pincode}`);
      const postalData = await res.json();
      
      if (postalData[0].Status === "Error" || postalData[0].PostOffice === null) {
        toast.error("Invalid Pincode. Please enter a valid Indian pincode.");
        setLoading(false);
        return;
      }
    } catch (err) {
      toast.error("Failed to verify pincode. Please try again.");
      setLoading(false);
      return;
    }
    
    const formData = new FormData();
    formData.append("full_name", data.full_name);
    formData.append("phone", data.phone);
    formData.append("category", data.category);
    formData.append("city", data.city);
    formData.append("pincode", data.pincode);
    if (data.bio) formData.append("bio", data.bio);
    
    const result = await createProfile(formData);
    
    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success("Profile created successfully!");
      router.push("/technician");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-orange-50/50 to-white dark:from-slate-950 dark:to-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-2xl">
              Fix<span className="text-[var(--primary)]">hai</span>
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Complete your Technician Profile</h1>
          <p className="text-[var(--muted-foreground)] mt-1 text-sm">
            We need a few more details before you can start accepting jobs.
          </p>
        </div>

        <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-8 shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Full Name</label>
              <input
                {...register("full_name")}
                type="text"
                placeholder="Rajesh Kumar"
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
              {errors.full_name && (
                <p className="text-xs text-red-500 mt-1">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Mobile Number</label>
              <input
                {...register("phone")}
                type="tel"
                placeholder="9876543210"
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Service Category</label>
              <select
                {...register("category")}
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="">Select a category...</option>
                {categories.map(c => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">City</label>
              <input
                {...register("city")}
                type="text"
                placeholder="Hyderabad"
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
              {errors.city && (
                <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Pincode</label>
              <input
                {...register("pincode")}
                type="text"
                placeholder="500081"
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
              {errors.pincode && (
                <p className="text-xs text-red-500 mt-1">{errors.pincode.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Bio (Optional)</label>
              <textarea
                {...register("bio")}
                placeholder="Tell customers about your experience..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
              {errors.bio && (
                <p className="text-xs text-red-500 mt-1">{errors.bio.message}</p>
              )}
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full mt-6" loading={loading}>
              Create Profile
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
