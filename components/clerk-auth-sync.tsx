"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { syncUser } from "@/actions/auth";
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
  // Store the last successful sync ID to avoid duplicates
  const lastSyncIdRef = useRef<string | null>(null);
  // Store last user hash for comparison
  const userChangedRef = useRef<string>('');
  
  // Debug logging for authentication states - only on initial load or changes
  useEffect(() => {
    if (!isLoaded && (isClerkLoaded !== isLoaded || isSignedIn !== (prevSignedIn.current ?? null))) {
      console.log("Auth states changed:", { 
        isClerkLoaded, 
        isSignedIn, 
        hasUser: !!user, 
        isConvexAuthenticated,
        isConvexLoading 
      });
      
      // Keep track of previous signed in state
      prevSignedIn.current = isSignedIn ?? null;
    }
  }, [isClerkLoaded, isSignedIn, user, isConvexAuthenticated, isConvexLoading]);
  
  // Reference to track previous signed in state to detect changes
  const prevSignedIn = useRef<boolean | null>(null);
  const isLoaded = useRef<boolean>(false);
  
  // Memoize the sync function to avoid recreating it on each render
  const syncUserData = useCallback(async (force = false) => {
    // Skip if already syncing
    if (isSyncingRef.current) {
      return;
    }
    
    // Only try to sync when both Clerk and Convex are authenticated
    if (isClerkLoaded && isSignedIn && user && isConvexAuthenticated && !isConvexLoading) {
      // Check browser storage to see if we've already synced this user in this session
      const syncedUserId = localStorage.getItem(SYNC_STATUS_KEY);
      const currentUserId = user.id;
      
      // If we've already synced this user and we're not forcing a sync, skip it
      if (!force && syncedUserId === currentUserId && hasInitialSyncRef.current) {
        return;
      }
      
      // Avoid excessive syncs - limit to once every 5 minutes unless forced or a new session
      const now = Date.now();
      const minSyncInterval = force ? 0 : 5 * 60 * 1000; // 5 minutes unless forced
      
      if (!force && hasInitialSyncRef.current && now - lastSyncTimeRef.current < minSyncInterval) {
        console.log("Skipping sync, too soon since last attempt");
        return;
      }
      
      // If we've already attempted an initial sync for this session and it succeeded, don't retry
      if (syncAttemptedRef.current && hasInitialSyncRef.current && !force) {
        return;
      }
      
      try {
        // Mark as syncing to prevent concurrent calls
        isSyncingRef.current = true;
        lastSyncTimeRef.current = now;
        
        // Generate a unique ID for this sync attempt
        const syncId = `${user.id}-${now}`;
        if (syncId === lastSyncIdRef.current && !force) {
          console.log("Skipping duplicate sync with ID:", syncId);
          return;
        }
        
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
        
        // This calls our server action which syncs the user to Convex
        const result = await syncUser();
        
        if (result.success) {
          console.log("ClerkAuthSync: User synced successfully with ID:", result.userId);
          // Reset retry count on success
          setRetryCount(0);
          hasInitialSyncRef.current = true;
          lastSyncIdRef.current = syncId;
          
          // Store in localStorage so we don't sync again in this browser session
          // unless the user changes or signs out and back in
          localStorage.setItem(SYNC_STATUS_KEY, currentUserId);
          
          // If this was a forced sync, show success message
          if (force) {
            toast.success("User data synced successfully");
          }
        } else {
          console.error("ClerkAuthSync: User sync failed:", result.error, result.details);
          
          // Show error toast only on the first failure or forced syncs
          if (retryCount === 0 || force) {
            toast.error("Failed to sync user data", {
              description: "We're having trouble connecting to our database. Please try again later."
            });
          }
          
          // Increment retry count and try again with exponential backoff
          // but only if this wasn't a manual forced sync
          if (retryCount < 2 && !force) {
            const nextRetry = Math.min(1000 * Math.pow(2, retryCount), 30000);
            console.log(`ClerkAuthSync: Will retry user sync in ${nextRetry}ms (attempt ${retryCount + 1})`);
            
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, nextRetry);
          } else {
            console.error("ClerkAuthSync: Max sync retries reached, giving up");
          }
        }
      } catch (error) {
        console.error("ClerkAuthSync: Failed to sync user with Convex:", error);
        
        // Try again after a delay if within retry limits and not a forced sync
        if (retryCount < 2 && !force) {
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
      lastSyncIdRef.current = null;
      
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
  
  // Initial sync on component mount
  useEffect(() => {
    // Only run this once when everything is loaded and authenticated
    if (!isLoaded.current && isClerkLoaded && isSignedIn && user && isConvexAuthenticated && !isConvexLoading) {
      isLoaded.current = true;
      
      // Check if the current user ID matches what's stored in localStorage
      const syncedUserId = localStorage.getItem(SYNC_STATUS_KEY);
      const currentUserId = user.id;
      
      // Only sync if we haven't synced this user yet in this browser session
      if (syncedUserId !== currentUserId) {
        console.log("ClerkAuthSync: Initial sync needed for user", currentUserId);
        syncUserData(false);
      } else {
        console.log("ClerkAuthSync: User already synced in this session, skipping initial sync");
        // Mark as synced since we already have a record in localStorage
        hasInitialSyncRef.current = true;
        syncAttemptedRef.current = true;
      }
    }
  }, [isClerkLoaded, isSignedIn, user, isConvexAuthenticated, isConvexLoading, syncUserData]);
  
  // Detect user profile changes
  useEffect(() => {
    if (!user) return;
    
    // Create a hash of critical user profile data
    const userHash = JSON.stringify({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      name: user.fullName,
      image: user.imageUrl
    });
    
    // If user profile data changed, sync to Convex
    if (userHash !== userChangedRef.current && userChangedRef.current && isConvexAuthenticated && !isConvexLoading) {
      console.log("ClerkAuthSync: User profile data changed, syncing updates");
      userChangedRef.current = userHash;
      syncUserData(true); // Force sync on profile changes
    } else if (!userChangedRef.current) {
      // Initialize on first run
      userChangedRef.current = userHash;
    }
  }, [user, isConvexAuthenticated, isConvexLoading, syncUserData]);

  // This component doesn't render anything
  return null;
} 