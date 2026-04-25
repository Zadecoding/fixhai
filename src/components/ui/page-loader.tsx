"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PageLoaderProps {
  /** If true the loader is visible; false triggers the exit animation */
  show: boolean;
}

export function PageLoader({ show }: PageLoaderProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="page-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-zinc-950"
        >
          {/* ── Ambient glow ── */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-orange-400/20 blur-[120px]" />
            <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-orange-600/10 blur-[100px]" />
          </div>

          {/* ── Logo mark ── */}
          <div className="relative flex flex-col items-center gap-6">
            {/* Spinning ring */}
            <div className="relative w-24 h-24">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "conic-gradient(from 0deg, #f97316, #ea580c, #fb923c, #fdba74, transparent, transparent)",
                  borderRadius: "50%",
                }}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
              />
              {/* White cutout to make ring */}
              <div className="absolute inset-[5px] rounded-full bg-white dark:bg-zinc-950" />

              {/* Logo inside ring */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4, ease: "backOut" }}
              >
                <LogoMark />
              </motion.div>
            </div>

            {/* Brand name */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex items-baseline gap-0.5"
            >
              <span className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                fix
              </span>
              <span className="text-3xl font-black tracking-tight text-orange-500">
                hai
              </span>
            </motion.div>

            {/* Tagline with shimmer */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-sm text-zinc-400 dark:text-zinc-500 font-medium tracking-wide"
            >
              Book verified technicians, instantly
            </motion.p>

            {/* Animated dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex gap-1.5 mt-1"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-orange-400"
                  animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.1,
                    delay: i * 0.18,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Inline SVG logo mark — wrench + F */
function LogoMark() {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-12 h-12"
    >
      {/* Orange rounded-square background */}
      <rect width="40" height="40" rx="10" fill="url(#logoGrad)" />

      {/* White "F" letterform */}
      <text
        x="10"
        y="29"
        fontSize="22"
        fontWeight="900"
        fontFamily="'Arial Black', Arial, sans-serif"
        fill="white"
      >
        F
      </text>

      {/* Wrench accent — top right */}
      <g transform="translate(22, 6) rotate(45)">
        <rect x="2" y="0" width="3" height="10" rx="1.5" fill="white" opacity="0.85" />
        <rect x="0" y="0" width="7" height="3" rx="1.5" fill="white" opacity="0.85" />
        <rect x="0" y="7" width="7" height="3" rx="1.5" fill="white" opacity="0.85" />
      </g>

      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f97316" />
          <stop offset="1" stopColor="#c2410c" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * Hook that shows the loader on first mount and hides it after `delay` ms.
 * Use this in your page/layout components.
 *
 * @example
 * const loaderVisible = usePageLoader(1800);
 * return <><PageLoader show={loaderVisible} />{children}</>;
 */
export function usePageLoader(delay = 1800) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return visible;
}
