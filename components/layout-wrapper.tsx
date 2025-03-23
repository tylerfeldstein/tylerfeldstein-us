"use client";

import { usePathname } from "next/navigation";
import ShadcnNavbar from "@/components/ShadcnNavbar";
import SmoothScrolling from "@/components/SmoothScrolling";

/**
 * Client component that conditionally renders different layouts
 * based on the current route
 */
export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMessagesPage = pathname === "/messages" || pathname?.startsWith("/messages/");
  
  if (isMessagesPage) {
    return children;
  }
  
  return (
    <div className="w-full min-h-screen main-gradient">
      <ShadcnNavbar />
      <SmoothScrolling>
        <div className="pt-16 w-full flex flex-col items-center justify-center overflow-x-hidden">
          {children}
        </div>
      </SmoothScrolling>
    </div>
  );
} 