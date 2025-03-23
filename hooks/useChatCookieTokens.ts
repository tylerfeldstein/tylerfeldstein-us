"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { 
  setChatJwtCookies, 
  clearChatJwtCookies, 
  chatJwtTokensExist, 
  refreshChatJwtTokens,
  verifyAccessToken
} from "@/actions/auth/cookieTokens";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Hook for managing JWT chat tokens via server-side HTTP-only cookies
 * 
 * This hook provides methods to:
 * - Generate and store tokens via cookies
 * - Check if tokens exist
 * - Refresh tokens
 * - Clear tokens on logout
 */
export function useChatCookieTokens() {
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const lastVerifiedRef = useRef<number>(0);
  const verificationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Minimum time between verifications (5 seconds)
  const MIN_VERIFICATION_INTERVAL = 5000;
  
  /**
   * Refresh the access token using the refresh token
   */
  const refreshToken = useCallback(async () => {
    if (isRefreshing) return false;
    
    setIsRefreshing(true);
    setRefreshError(null);
    
    try {
      const result = await refreshChatJwtTokens();
      
      if (!result.success) {
        setRefreshError(result.error || "Failed to refresh token");
        setHasToken(false);
        return false;
      }
      
      lastVerifiedRef.current = Date.now();
      setHasToken(true);
      return true;
    } catch (error) {
      console.error("Error refreshing token:", error);
      setRefreshError("An unexpected error occurred");
      setHasToken(false);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);
  
  // Check if access token exists on mount and verify it
  useEffect(() => {
    let mounted = true;
    
    async function checkAndVerifyToken() {
      // Don't verify if we've verified recently
      const now = Date.now();
      if (now - lastVerifiedRef.current < MIN_VERIFICATION_INTERVAL) {
        console.log("[useChatCookieTokens] Skipping verification - too soon");
        return;
      }
      
      try {
        // First check if tokens exist
        const { hasAccessToken, hasRefreshToken } = await chatJwtTokensExist();
        
        // If no tokens exist at all, set state and return
        if (!hasAccessToken && !hasRefreshToken) {
          setHasToken(false);
          setRefreshError(null);
          return;
        }
        
        // If we have an access token, verify it
        if (hasAccessToken) {
          const { success, error } = await verifyAccessToken();
          
          if (success) {
            lastVerifiedRef.current = now;
            setHasToken(true);
            setRefreshError(null);
            
            // Schedule next verification for 14 minutes (just before expiry)
            if (verificationTimeoutRef.current) {
              clearTimeout(verificationTimeoutRef.current);
            }
            verificationTimeoutRef.current = setTimeout(refreshToken, 14 * 60 * 1000);
            return;
          }
          
          // If verification failed and we have a refresh token, try refresh
          if (hasRefreshToken) {
            const refreshResult = await refreshToken();
            if (refreshResult) return;
          }
        }
        
        // If we get here, we either have no valid tokens or refresh failed
        setHasToken(false);
        if (!refreshError) {
          setRefreshError("No valid tokens available");
        }
      } catch (error) {
        console.error("[useChatCookieTokens] Error checking/verifying token:", error);
        setHasToken(false);
        setRefreshError("Error verifying token");
      }
    }
    
    // Run initial check
    checkAndVerifyToken();
    
    return () => {
      mounted = false;
      if (verificationTimeoutRef.current) {
        clearTimeout(verificationTimeoutRef.current);
      }
    };
  }, [refreshToken, refreshError]);
  
  /**
   * Generate new JWT tokens for a chat and store them in HTTP-only cookies
   */
  const generateChatTokens = useCallback(async () => {
    try {
      const result = await setChatJwtCookies();
      
      if (!result.success) {
        throw new Error(result.error || "Failed to generate tokens");
      }
      
      lastVerifiedRef.current = Date.now();
      setHasToken(true);
      setRefreshError(null);
      return true;
    } catch (error) {
      console.error("Error generating tokens:", error);
      setHasToken(false);
      setRefreshError(error instanceof Error ? error.message : "Failed to generate tokens");
      return false;
    }
  }, []);
  
  /**
   * Clear all tokens (logout)
   */
  const clearTokens = useCallback(async () => {
    try {
      await clearChatJwtCookies();
      setHasToken(false);
      lastVerifiedRef.current = 0;
      return true;
    } catch (error) {
      console.error("Error clearing tokens:", error);
      return false;
    }
  }, []);
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (verificationTimeoutRef.current) {
        clearTimeout(verificationTimeoutRef.current);
        verificationTimeoutRef.current = null;
      }
    };
  }, []);
  
  return {
    hasToken,
    isRefreshing,
    refreshError,
    generateChatTokens,
    refreshToken,
    clearTokens
  };
}
