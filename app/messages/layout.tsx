"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  // Use query instead of mutation - this just reads data, doesn't modify it
  const currentUser = useQuery(api.users.getMe);
  
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in?redirect_url=/messages');
    }
    
    // Just log the user's role for debugging - no sync needed
    if (isLoaded && isSignedIn && currentUser) {
      console.log("User role in messages:", currentUser.role || "user");
    }
  }, [isLoaded, isSignedIn, router, currentUser]);
  
  // If not loaded or not signed in, show loading
  if (!isLoaded || !isSignedIn) {
    return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;
  }
  
  return (
    <div className="h-screen w-screen fixed inset-0">
      {children}
    </div>
  );
} 