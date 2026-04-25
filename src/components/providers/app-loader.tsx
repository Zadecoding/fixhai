"use client";

import { PageLoader, usePageLoader } from "@/components/ui/page-loader";

export function AppLoader({ children }: { children: React.ReactNode }) {
  const visible = usePageLoader(2000);
  return (
    <>
      <PageLoader show={visible} />
      {children}
    </>
  );
}
