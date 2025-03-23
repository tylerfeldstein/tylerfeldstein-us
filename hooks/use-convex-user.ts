"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser as useClerkUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

/**
 * Hook that combines Clerk and Convex user data
 * @returns Combined user data and loading state
 */
export function useConvexUser() {
  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn } = useClerkUser();
  const convexUser = useQuery(api.users.getMe);
  const [isReady, setIsReady] = useState(false);
  
  // Wait for both Clerk and Convex data to be ready
  useEffect(() => {
    if (isClerkLoaded && (convexUser !== undefined || !isSignedIn)) {
      setIsReady(true);
    }
  }, [isClerkLoaded, convexUser, isSignedIn]);
  
  return {
    // Combined user object with data from both Clerk and Convex
    user: isSignedIn ? {
      // Clerk user data
      id: clerkUser?.id,
      email: clerkUser?.emailAddresses[0]?.emailAddress,
      name: clerkUser?.fullName || clerkUser?.username,
      imageUrl: clerkUser?.imageUrl,
      
      // Convex user data (database fields)
      _id: convexUser?._id,
      role: convexUser?.role || "user", // Default to "user" if not set
      createdAt: convexUser?.createdAt,
      
      // Helper properties
      isAdmin: convexUser?.role === "admin"
    } : null,
    
    // Loading state combining both sources
    isLoading: !isReady,
    
    // Individual data sources for more granular access
    clerkUser,
    convexUser,
  };
} 