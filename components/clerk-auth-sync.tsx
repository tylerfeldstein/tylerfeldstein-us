"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { syncUser, forceCreateUser } from "@/actions/auth";
import { toast } from "sonner";

// Key for localStorage to track sync status
const SYNC_STATUS_KEY = 'convex_user_synced';

/**
 * Component that automatically syncs Clerk authentication state with Convex database
 * Place this component at the root of your authenticated layout
 */
export function ClerkAuthSync() {
  const { isLoaded: isClerkLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { isAuthenticated: isConvexAuthenticated, isLoading: isConvexLoading } = useConvexAuth();
  const [retryCount, setRetryCount] = useState(0);
  const lastSyncTimeRef = useRef<number>(0);
  const isSyncingRef = useRef<boolean>(false);
  const hasInitialSyncRef = useRef<boolean>(false);
  // Track if initial sync has been attempted for this session
  const syncAttemptedRef = useRef<boolean>(false);
  
  // Debug logging for authentication states - always log
  useEffect(() => {
    console.log("Auth states:", { 
      isClerkLoaded, 
      isSignedIn, 
      hasUser: !!user, 
      userId: user?.id,
      userEmail: user?.emailAddresses[0]?.emailAddress,
      isConvexAuthenticated,
      isConvexLoading 
    });
  }, [isClerkLoaded, isSignedIn, user, isConvexAuthenticated, isConvexLoading]);
  
  // Reference to track previous signed in state to detect changes
  const prevSignedIn = useRef<boolean | null>(null);
  
  // Memoize the sync function to avoid recreating it on each render
  const syncUserData = useCallback(async (force = false) => {
    // Skip if already syncing
    if (isSyncingRef.current) {
      console.log("Already syncing user, skipping");
      return;
    }
    
    // Only try to sync when both Clerk and Convex are authenticated
    if (isClerkLoaded && isSignedIn && user && isConvexAuthenticated && !isConvexLoading) {
      try {
        // Mark as syncing to prevent concurrent calls
        isSyncingRef.current = true;
        lastSyncTimeRef.current = Date.now();
        
        console.log("ClerkAuthSync: Syncing user to Convex...", {
          userId: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          retryCount,
          hasInitialSync: hasInitialSyncRef.current,
          convexAuthenticated: isConvexAuthenticated,
          force
        });
        
        // Mark that we've attempted a sync for this session
        syncAttemptedRef.current = true;
        
        // First try the regular sync
        console.log("Attempting regular sync first...");
        const result = await syncUser();
        
        if (result.success) {
          console.log("ClerkAuthSync: User synced successfully with ID:", result.userId);
          // Reset retry count on success
          setRetryCount(0);
          hasInitialSyncRef.current = true;
          
          // Store in localStorage so we don't sync again in this browser session
          // unless the user changes or signs out and back in
          localStorage.setItem(SYNC_STATUS_KEY, user.id);
          
          // toast.success("User data synced successfully");
        } else {
          console.error("ClerkAuthSync: Regular sync failed, trying force create:", result.error, result.details);
          
          // If regular sync fails, try force create
          console.log("Attempting force create as fallback...");
          const forceResult = await forceCreateUser();
          
          if (forceResult.success) {
            console.log("ClerkAuthSync: Force create succeeded with ID:", forceResult.userId);
            toast.success("User created successfully");
            hasInitialSyncRef.current = true;
            setRetryCount(0);
            localStorage.setItem(SYNC_STATUS_KEY, user.id);
          } else {
            console.error("ClerkAuthSync: Force create also failed:", forceResult.error, forceResult.details);
            toast.error("Failed to sync user data", {
              description: "We're having trouble connecting to our database. Please try again later."
            });
            
            // Increment retry count for next attempt
            setRetryCount(prev => prev + 1);
          }
        }
      } catch (error) {
        console.error("ClerkAuthSync: Failed to sync user with Convex:", error);
        
        toast.error("Unexpected error syncing user", {
          description: error instanceof Error ? error.message : "Please try again or contact support"
        });
        
        // Try again after a delay if within retry limits
        if (retryCount < 3) {
          const nextRetry = Math.min(1000 * Math.pow(2, retryCount), 30000);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, nextRetry);
        }
      } finally {
        // Always reset the syncing flag
        isSyncingRef.current = false;
      }
    } else if (isClerkLoaded && !isSignedIn) {
      // If user is not signed in, reset the sync state
      hasInitialSyncRef.current = false;
      syncAttemptedRef.current = false;
      
      // Remove from localStorage when signed out
      localStorage.removeItem(SYNC_STATUS_KEY);
    } else if (isClerkLoaded && isSignedIn && user && (!isConvexAuthenticated || isConvexLoading)) {
      // Debug log for when user is signed in but Convex isn't ready
      console.log("ClerkAuthSync: Waiting for Convex to be authenticated", {
        isConvexAuthenticated,
        isConvexLoading
      });
    }
  }, [isClerkLoaded, isSignedIn, user, isConvexAuthenticated, isConvexLoading, retryCount]);
  
  // Initial sync on component mount
  useEffect(() => {
    // Run whenever authentication state is ready
    if (isClerkLoaded && isSignedIn && user && isConvexAuthenticated && !isConvexLoading) {
      console.log("ClerkAuthSync: All systems ready, forcing initial sync for user", user.id);
      
      // Always force a sync when the component mounts with an authenticated user
      syncUserData(true);
    }
  }, [isClerkLoaded, isSignedIn, user, isConvexAuthenticated, isConvexLoading, syncUserData]);
  
  // Detect sign-in changes
  useEffect(() => {
    // Check if this is a sign-in event (previous not signed in, now signed in)
    const isSignInEvent = isClerkLoaded && isSignedIn && prevSignedIn.current === false;
    
    // If this is a sign-in event, we should sync the user
    if (isSignInEvent && user) {
      console.log("ClerkAuthSync: Detected sign-in event, will sync user");
      syncUserData(true); // Force sync on sign-in
    }
    
    // Update previous state
    prevSignedIn.current = isSignedIn ?? null;
  }, [isClerkLoaded, isSignedIn, user, syncUserData]);

  // This component doesn't render anything
  return null;
} 