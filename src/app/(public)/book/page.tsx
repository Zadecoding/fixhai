"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CheckCircle2,
  Smartphone,
  Laptop,
  Wind,
  WashingMachine,
  Thermometer,
  Tv,
  MapPin,
  Clock,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SERVICE_ISSUES, timeSlots } from "@/lib/constants";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getCategories } from "@/app/actions/dashboard";
import type { ServiceCategory } from "@/types/database";
import dynamic from "next/dynamic";
import { useRazorpay } from "react-razorpay";
import { checkAvailability, createBooking } from "./actions";

const Map = dynamic(() => import("@/components/ui/map"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />,
});

const categoryIcons: Record<string, React.ElementType> = {
  Smartphone, Laptop, Wind, WashingMachine, Thermometer, Tv,
};

const bookingSchema = z.object({
  category: z.string().min(1, "Please select a service"),
  issue: z.string().min(1, "Please select an issue"),
  issueDescription: z.string().min(10, "Please describe your issue in at least 10 characters"),
  name: z.string().min(2, "Please enter your name"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  address: z.string().min(10, "Please enter your full address"),
  city: z.string().min(2, "Please enter your city"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  timeSlot: z.string().min(1, "Please select a time slot"),
  location: z.tuple([z.number(), z.number()]).optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const steps = [
  { id: 1, label: "Service", icon: Smartphone },
  { id: 2, label: "Issue", icon: Laptop },
  { id: 3, label: "Address", icon: MapPin },
  { id: 4, label: "Schedule", icon: Clock },
  { id: 5, label: "Payment", icon: CreditCard },
];

export default function BookPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [confirmed, setConfirmed] = useState(false);
  const [actualBookingId, setActualBookingId] = useState<string | null>(null);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [userEmail, setUserEmail] = useState<string>('');
  const [availabilityStatus, setAvailabilityStatus] = useState<{
    checked: boolean;
    available: boolean | null;
    technicianCount: number;
    technicianName?: string;
    technicianRating?: number;
    message?: string;
  }>({
    checked: false,
    available: null,
    technicianCount: 0,
  });
  
  useEffect(() => {
    getCategories().then(res => {
      if (res.categories) setCategories(res.categories);
    });
    // Get the current user's email for Razorpay prefill
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user?.email) setUserEmail(user.email);
      });
    });
  }, []);

  const [bookingId] = useState(`BK${Date.now().toString().slice(-6)}`);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    mode: "onChange",
    defaultValues: {
      category: "",
      issue: "",
      issueDescription: "",
      name: "",
      phone: "",
      address: "",
      city: "",
      pincode: "",
      timeSlot: "",
      location: [17.3850, 78.4867], // Default Hyderabad
    },
  });

  const { watch, setValue, trigger, formState: { errors } } = form;
  const formValues = watch();
  const watchCategory = watch("category");
  const { Razorpay } = useRazorpay();

  const selectedCategory = categories.find((c) => c.slug === formValues.category);
  const inspectionFee = formValues.category === 'mobile-repair' ? 0 : 399;

  const [isChecking, setIsChecking] = useState(false);

  const goNext = async () => {
    const fieldsToValidate: (keyof BookingFormData)[][] = [
      ["category"],
      ["issue", "issueDescription"],
      ["name", "phone", "address", "city", "pincode"],
      ["timeSlot"],
      [],
    ];
    const valid = await trigger(fieldsToValidate[currentStep - 1]);
    
    if (valid) {
      if (currentStep === 3) {
        setIsChecking(true);
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${formValues.pincode}`);
          const postalData = await res.json();
          if (postalData[0].Status === "Error" || postalData[0].PostOffice === null) {
            toast.error("Invalid Pincode. Please enter a valid Indian pincode.");
            setIsChecking(false);
            return;
          }
        } catch (err) {
          toast.error("Failed to verify pincode. Proceeding anyway.");
        }
        setIsChecking(false);
      }

      // When moving to the Payment step, pre-check availability
      if (currentStep === 4) {
        setCurrentStep((s) => Math.min(s + 1, 5));
        // Reset previous status then fetch fresh
        setAvailabilityStatus({ checked: false, available: null, technicianCount: 0 });
        setIsChecking(true);
        try {
          const res = await checkAvailability(formValues.category, formValues.pincode);
          if (res.error) {
            setAvailabilityStatus({ checked: true, available: false, technicianCount: 0, message: res.error });
          } else {
            setAvailabilityStatus({
              checked: true,
              available: res.available ?? false,
              technicianCount: res.technicianCount ?? 0,
              technicianName: res.technician_name,
              technicianRating: res.technician_rating,
              message: res.message,
            });
          }
        } catch {
          setAvailabilityStatus({ checked: true, available: false, technicianCount: 0, message: 'Failed to check availability.' });
        } finally {
          setIsChecking(false);
        }
        return; // already navigated
      }
      
      setCurrentStep((s) => Math.min(s + 1, 5));
    }
  };

  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const handlePayment = async () => {
    try {
      setIsChecking(true);

      // Re-verify availability right before payment (source of truth)
      const availability = await checkAvailability(formValues.category, formValues.pincode);
      if (availability.error) {
        toast.error(availability.error);
        setIsChecking(false);
        return;
      }
      
      if (!availability.available) {
        toast.error(
          availability.message ||
          `Sorry, no technicians are currently available in pincode ${formValues.pincode} for ${selectedCategory?.name}.`,
          { duration: 6000 }
        );
        setAvailabilityStatus({
          checked: true,
          available: false,
          technicianCount: 0,
          message: availability.message,
        });
        setIsChecking(false);
        return;
      }

      // --- FREE BOOKING: Skip Razorpay for ₹0 inspection fee ---
      if (inspectionFee === 0) {
        const bookingResult = await createBooking({
          categorySlug: formValues.category,
          issueTitle: formValues.issue,
          issueDescription: formValues.issueDescription,
          name: formValues.name,
          phone: formValues.phone,
          address: formValues.address,
          city: formValues.city,
          pincode: formValues.pincode,
          preferredSlot: formValues.timeSlot,
          bookingFee: 0,
          technicianId: availability.technician_id ?? null,
          razorpayPaymentId: 'free',
          razorpayOrderId: 'free',
        });
        if (bookingResult.error) {
          toast.error(`Booking failed: ${bookingResult.error}`);
        } else {
          toast.success('Booking confirmed! Technician will be assigned shortly.', {
            description: `Booking ID: ${bookingResult.bookingDbId?.slice(0, 8)} | No inspection fee for mobile repairs.`,
          });
          if (bookingResult.bookingDbId) {
            setActualBookingId(bookingResult.bookingDbId);
          }
          setConfirmed(true);
        }
        setIsChecking(false);
        return;
      }

      // Step 2: Initialize Razorpay Payment for paid categories
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: formValues.category, receipt: bookingId }),
      });
      const order = await response.json();

      if (order.error) {
        toast.error("Failed to initiate payment");
        setIsChecking(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: order.amount,
        currency: order.currency,
        name: "Fixhai",
        description: "Booking Inspection Fee",
        order_id: order.orderId,
        handler: async function (response: any) {
          // Persist booking to database after payment succeeds
          const bookingResult = await createBooking({
            categorySlug: formValues.category,
            issueTitle: formValues.issue,
            issueDescription: formValues.issueDescription,
            name: formValues.name,
            phone: formValues.phone,
            address: formValues.address,
            city: formValues.city,
            pincode: formValues.pincode,
            preferredSlot: formValues.timeSlot,
            bookingFee: inspectionFee,
            technicianId: availability.technician_id ?? null,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
          });

          if (bookingResult.error) {
            toast.error(`Payment received but booking save failed: ${bookingResult.error}. Contact support with Payment ID: ${response.razorpay_payment_id}`);
          } else {
            toast.success("Booking confirmed! Technician will be assigned shortly.", {
              description: `Booking ID: ${bookingResult.bookingDbId?.slice(0, 8)} | Payment ID: ${response.razorpay_payment_id}`,
            });
            if (bookingResult.bookingDbId) {
              setActualBookingId(bookingResult.bookingDbId);
            }
          }
          setConfirmed(true);
        },
        prefill: {
          name: formValues.name,
          email: userEmail,
          contact: formValues.phone,
        },
        theme: {
          color: "#f97316",
        },
      };

      const rzp1 = new Razorpay(options);
      
      rzp1.on("payment.failed", function (response: any) {
        toast.error("Payment failed. Please try again.");
      });

      rzp1.open();
    } catch (err) {
      toast.error("Payment integration error");
    } finally {
      setIsChecking(false);
    }
  };

  if (confirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-extrabold mb-2">Booking Confirmed!</h1>
          <p className="text-[var(--muted-foreground)] mb-2">
            Your booking has been received. A verified technician will be assigned shortly.
          </p>
          <div className="bg-[var(--muted)] rounded-2xl p-4 mb-6 text-sm">
            <div className="flex justify-between mb-2">
              <span className="text-[var(--muted-foreground)]">Booking ID</span>
              <span className="font-mono font-bold">{actualBookingId ? actualBookingId.slice(0, 8).toUpperCase() : bookingId}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-[var(--muted-foreground)]">Service</span>
              <span className="font-semibold">{selectedCategory?.name}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-[var(--muted-foreground)]">Issue</span>
              <span className="font-semibold">{formValues.issue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Fee Paid</span>
              <span className="font-bold text-green-600">₹{inspectionFee}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <a href={`/booking/${actualBookingId || bookingId}`} className="flex-1">
              <Button size="lg" className="w-full" variant="primary">
                Track Booking <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
            <a href="/dashboard" className="flex-1">
              <Button size="lg" className="w-full" variant="outline">
                Dashboard
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Book a Technician</h1>
          <p className="text-[var(--muted-foreground)]">
            Mobile repair: <span className="text-green-600 font-bold">FREE inspection</span> · Other appliances: ₹399. Honest quote. Pay only if satisfied.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-10 px-2">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isComplete = currentStep > step.id;
            const isActive = currentStep === step.id;
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={{
                      backgroundColor: isComplete
                        ? "#22c55e"
                        : isActive
                        ? "#f97316"
                        : "var(--muted)",
                    }}
                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
                  >
                    {isComplete ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <Icon
                        className={cn(
                          "w-5 h-5",
                          isActive ? "text-white" : "text-[var(--muted-foreground)]"
                        )}
                      />
                    )}
                  </motion.div>
                  <span
                    className={cn(
                      "text-xs mt-1 font-medium",
                      isActive
                        ? "text-[var(--primary)]"
                        : isComplete
                        ? "text-green-600"
                        : "text-[var(--muted-foreground)]"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="flex-1 h-px mx-2 mt-[-1rem]">
                    <motion.div
                      animate={{ scaleX: isComplete ? 1 : 0 }}
                      initial={{ scaleX: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ transformOrigin: "left" }}
                      className="h-full bg-green-500"
                    />
                    <div className="h-px w-full -mt-px bg-[var(--border)]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-6">
              {/* Step 1: Service Selection */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-lg font-bold mb-1">Select a service</h2>
                  <p className="text-sm text-[var(--muted-foreground)] mb-6">
                    What device or appliance needs repair?
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {categories.map((cat) => {
                      const Icon = categoryIcons[cat.icon] || Smartphone;
                      const selected = formValues.category === cat.slug;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setValue("category", cat.slug);
                            setValue("issue", "");
                          }}
                          className={cn(
                            "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 text-sm font-medium",
                            selected
                              ? "border-[var(--primary)] bg-orange-50 dark:bg-orange-900/20 text-[var(--primary)]"
                              : "border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[var(--muted)]"
                          )}
                        >
                          <div
                            className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center",
                              selected
                                ? "bg-[var(--primary)]"
                                : "bg-[var(--muted)]"
                            )}
                          >
                            <Icon
                              className={cn(
                                "w-6 h-6",
                                selected ? "text-white" : "text-[var(--muted-foreground)]"
                              )}
                            />
                          </div>
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                  {errors.category && (
                    <p className="text-xs text-red-500 mt-3">{errors.category.message}</p>
                  )}
                </div>
              )}

              {/* Step 2: Issue */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-lg font-bold mb-1">Describe the issue</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
                    {(watchCategory && SERVICE_ISSUES[watchCategory] || []).map((issue) => {
                      const selected = formValues.issue === issue;
                      return (
                        <button
                          key={issue}
                          onClick={() => setValue("issue", issue)}
                          className={cn(
                            "text-left px-4 py-3 rounded-xl border-2 text-sm transition-all duration-150",
                            selected
                              ? "border-[var(--primary)] bg-orange-50 dark:bg-orange-900/20 text-[var(--primary)] font-semibold"
                              : "border-[var(--border)] hover:border-[var(--primary)]/50"
                          )}
                        >
                          {issue}
                        </button>
                      );
                    })}
                  </div>
                  {errors.issue && (
                    <p className="text-xs text-red-500 mb-3">{errors.issue.message}</p>
                  )}
                  <label className="block text-sm font-medium mb-2">
                    Tell us more (optional but helpful)
                  </label>
                  <textarea
                    placeholder="E.g. My phone screen cracked after it fell from 2 feet..."
                    value={formValues.issueDescription}
                    onChange={(e) => setValue("issueDescription", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                  {errors.issueDescription && (
                    <p className="text-xs text-red-500 mt-1">{errors.issueDescription.message}</p>
                  )}
                </div>
              )}

              {/* Step 3: Address */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-lg font-bold mb-1">Your details & address</h2>
                  <p className="text-sm text-[var(--muted-foreground)] mb-6">
                    The technician will visit this location
                  </p>
                  
                  <div className="w-full h-56 mb-3 rounded-xl border border-[var(--border)] overflow-hidden">
                    <Map 
                      location={formValues.location as [number, number] || [17.3850, 78.4867]} 
                      onChange={(loc) => setValue("location", loc)}
                      geocodeQuery={[
                        formValues.address,
                        formValues.city,
                        formValues.pincode
                      ].filter(Boolean).join(', ')}
                    />
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] text-center mb-5 flex items-center justify-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Map auto-updates as you type your address · Click map to adjust pin
                  </p>

                  <div className="space-y-4">
                    {[
                      { label: "Full Name", field: "name" as const, placeholder: "Rahul Sharma", type: "text" },
                      { label: "Mobile Number", field: "phone" as const, placeholder: "9876543210", type: "tel" },
                      { label: "Full Address", field: "address" as const, placeholder: "Flat 301, Tower B, Sunshine Apartments", type: "text" },
                      { label: "City", field: "city" as const, placeholder: "Hyderabad", type: "text" },
                      { label: "Pincode", field: "pincode" as const, placeholder: "500081", type: "text" },
                    ].map(({ label, field, placeholder, type }) => (
                      <div key={field}>
                        <label className="block text-sm font-medium mb-1">{label}</label>
                        <input
                          type={type}
                          placeholder={placeholder}
                          value={formValues[field]}
                          onChange={(e) => setValue(field, e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        />
                        {errors[field] && (
                          <p className="text-xs text-red-500 mt-1">{errors[field]?.message}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Schedule */}
              {currentStep === 4 && (
                <div>
                  <h2 className="text-lg font-bold mb-1">Choose a time slot</h2>
                  <p className="text-sm text-[var(--muted-foreground)] mb-6">
                    Pick a convenient 2-hour window
                  </p>
                  <div className="space-y-3">
                    {timeSlots.map((slot) => {
                      const selected = formValues.timeSlot === slot;
                      return (
                        <button
                          key={slot}
                          onClick={() => setValue("timeSlot", slot)}
                          className={cn(
                            "w-full flex items-center gap-3 px-5 py-4 rounded-xl border-2 text-sm font-medium transition-all duration-150",
                            selected
                              ? "border-[var(--primary)] bg-orange-50 dark:bg-orange-900/20 text-[var(--primary)]"
                              : "border-[var(--border)] hover:border-[var(--primary)]/50"
                          )}
                        >
                          <Clock className={cn("w-4 h-4", selected ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]")} />
                          {slot}
                          {selected && <CheckCircle2 className="w-4 h-4 ml-auto text-[var(--primary)]" />}
                        </button>
                      );
                    })}
                  </div>
                  {errors.timeSlot && (
                    <p className="text-xs text-red-500 mt-3">{errors.timeSlot.message}</p>
                  )}
                </div>
              )}

              {/* Step 5: Payment */}
              {currentStep === 5 && (
                <div>
                  <h2 className="text-lg font-bold mb-1">Review & Pay</h2>
                  <p className="text-sm text-[var(--muted-foreground)] mb-6">
                    {inspectionFee === 0
                      ? 'Confirm your booking details — mobile inspection is FREE!'
                      : `Confirm your booking details and pay ₹${inspectionFee}`}
                  </p>

                  {/* Availability Badge */}
                  <div className={`mb-5 flex items-center gap-3 rounded-xl px-4 py-3 border text-sm font-medium ${
                    !availabilityStatus.checked
                      ? 'bg-[var(--muted)] border-[var(--border)] text-[var(--muted-foreground)]'
                      : availabilityStatus.available
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                  }`}>
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      !availabilityStatus.checked
                        ? 'bg-gray-400 animate-pulse'
                        : availabilityStatus.available
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`} />
                    <span className="flex-1">
                      {!availabilityStatus.checked
                        ? 'Checking technician availability in your area…'
                        : availabilityStatus.available
                        ? `${availabilityStatus.technicianCount} technician${availabilityStatus.technicianCount > 1 ? 's' : ''} available in pincode ${formValues.pincode}${
                            availabilityStatus.technicianName
                              ? ` · Assigned: ${availabilityStatus.technicianName}${
                                  availabilityStatus.technicianRating
                                    ? ` ⭐ ${availabilityStatus.technicianRating}`
                                    : ''
                                }`
                              : ''
                          }`
                        : availabilityStatus.message || `No technicians available in pincode ${formValues.pincode} right now`}
                    </span>
                  </div>

                  <div className="bg-[var(--muted)] rounded-2xl p-5 space-y-3 mb-6">
                    {[
                      { label: "Service", value: selectedCategory?.name },
                      { label: "Issue", value: formValues.issue },
                      { label: "Name", value: formValues.name },
                      { label: "Phone", value: formValues.phone },
                      { label: "Address", value: formValues.address },
                      { label: "City", value: `${formValues.city} - ${formValues.pincode}` },
                      { label: "Time Slot", value: formValues.timeSlot },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between text-sm">
                        <span className="text-[var(--muted-foreground)]">{label}</span>
                        <span className="font-semibold max-w-xs text-right">{value}</span>
                      </div>
                    ))}
                    <div className="border-t border-[var(--border)] my-2 pt-3 flex justify-between">
                      <span className="font-bold">Booking Fee</span>
                      {inspectionFee === 0 ? (
                        <span className="text-xl font-extrabold text-green-600">FREE 🎉</span>
                      ) : (
                        <span className="text-xl font-extrabold text-[var(--primary)]">₹{inspectionFee}</span>
                      )}
                    </div>
                  </div>

                  {inspectionFee === 0 ? (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-6 text-sm text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                      🎉 <strong>Mobile repair inspection is completely FREE!</strong> The technician will diagnose your device at no charge. Repair charges are quoted after diagnosis — you pay only if you approve.
                    </div>
                  ) : (
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 mb-6 text-sm text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                      <strong>Note:</strong> ₹{inspectionFee} is the inspection/visit fee only. The actual repair cost will be quoted by the technician after diagnosis. You pay repair charges only if you approve.
                    </div>
                  )}

                  <Button
                    size="xl"
                    variant="primary"
                    className="w-full"
                    onClick={handlePayment}
                    disabled={isChecking || (availabilityStatus.checked && availabilityStatus.available === false)}
                  >
                    <CreditCard className="w-5 h-5" />
                    {isChecking
                      ? 'Checking Availability...'
                      : availabilityStatus.checked && availabilityStatus.available === false
                      ? 'No Technicians Available in Your Area'
                      : inspectionFee === 0
                      ? 'Confirm Free Booking 🎉'
                      : `Pay ₹${inspectionFee} & Confirm Booking`}
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {currentStep < 5 && (
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              size="lg"
              onClick={goBack}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            <Button size="lg" variant="primary" onClick={goNext} disabled={isChecking}>
              {isChecking ? "Verifying..." : "Next"}
              {!isChecking && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
