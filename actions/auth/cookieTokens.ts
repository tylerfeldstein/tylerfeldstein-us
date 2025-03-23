"use server";

import { cookies } from "next/headers";
import { RedirectType, redirect } from "next/navigation";
import { ConvexError } from "convex/values";
import { auth } from "@clerk/nextjs/server";
import { SignJWT, jwtVerify } from "jose";
import { randomUUID } from "crypto";

// Create a ConvexHttpClient for server-side calls
import { ConvexHttpClient } from "convex/browser";
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
const convex = new ConvexHttpClient(convexUrl);

// Import Convex API
import { api } from "@/convex/_generated/api";

// Cookie names for the JWT tokens
const ACCESS_COOKIE_NAME = "chat-access-token";
const REFRESH_COOKIE_NAME = "chat-refresh-token";

// Cookie max age (in seconds)
const ACCESS_COOKIE_MAX_AGE = 15 * 60; // 15 minutes
const REFRESH_COOKIE_MAX_AGE = 24 * 60 * 60; // 24 hours

// JWT Secret - Should be moved to environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-chat-tokens';

// Token expiration time (in seconds)
const TOKEN_EXPIRY = 15 * 60; // 15 minutes
const REFRESH_TOKEN_EXPIRY = 24 * 60 * 60; // 24 hours

/**
 * Generate JWT tokens directly in NextJS server action
 */
async function generateJWTTokens(userId: string, userRole: string) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + TOKEN_EXPIRY;
  const jti = randomUUID();
  
  // Create a key from the secret
  const secretKey = new TextEncoder().encode(JWT_SECRET);
  
  // Generate JWT token
  const token = await new SignJWT({ userId, userRole })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_EXPIRY}s`)
    .setJti(jti)
    .sign(secretKey);
  
  // Generate refresh token
  const refreshExp = now + REFRESH_TOKEN_EXPIRY;
  const tokenId = randomUUID();
  
  const refreshToken = await new SignJWT({ userId, tokenId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TOKEN_EXPIRY}s`)
    .sign(secretKey);
  
  // Store the token in the Convex database for tracking (optional)
  await convex.mutation(api.chatTokens.storeToken, {
    userId,
    tokenId: jti,
    refreshTokenId: tokenId,
    issuedAt: Date.now(),
    expiresAt: exp * 1000,
    refreshExpiresAt: refreshExp * 1000,
    isInvalidated: false
  });
  
  return {
    accessToken: token,
    refreshToken,
    expiresAt: exp * 1000,
    refreshExpiresAt: refreshExp * 1000
  };
}

/**
 * Verify a JWT token
 */
async function verifyJWTToken(token: string) {
  try {
    const secretKey = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secretKey);
    
    return {
      userId: payload.userId as string,
      userRole: payload.userRole as string,
      exp: payload.exp as number,
      iat: payload.iat as number,
      jti: payload.jti as string
    };
  } catch (error) {
    console.error('Error verifying JWT token:', error);
    return null;
  }
}

/**
 * Sets JWT tokens as HTTP-only cookies
 */
export async function setChatJwtCookies() {
  try {
    // Get user ID from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return { success: false, error: "Not authenticated with Clerk" };
    }
    
    // Get user info from Convex to determine role
    const user = await convex.query(api.users.getUserById, { clerkId: userId });
    
    if (!user) {
      return { success: false, error: "User not found in database" };
    }
    
    const userRole = user.role || "user";
    
    // Generate JWT tokens directly in NextJS
    const result = await generateJWTTokens(userId, userRole);
    
    // Set access token cookie
    const cookieStore = await cookies();
    cookieStore.set(ACCESS_COOKIE_NAME, result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: ACCESS_COOKIE_MAX_AGE,
      path: "/"
    });
    
    // Set refresh token cookie
    cookieStore.set(REFRESH_COOKIE_NAME, result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: REFRESH_COOKIE_MAX_AGE,
      path: "/"
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error setting JWT cookies:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Clears JWT token cookies
 */
export async function clearChatJwtCookies() {
  try {
    // Clear access token cookie
    const cookieStore = await cookies();
    cookieStore.delete(ACCESS_COOKIE_NAME);
    
    // Clear refresh token cookie
    cookieStore.delete(REFRESH_COOKIE_NAME);
    
    return { success: true };
  } catch (error) {
    console.error("Error clearing JWT cookies:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Refreshes the access token using the refresh token
 */
export async function refreshChatJwtTokens() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;
    
    if (!refreshToken) {
      return { success: false, error: "No refresh token found" };
    }
    
    // Verify refresh token directly in NextJS
    const secretKey = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(refreshToken, secretKey);
    
    const userId = payload.userId as string;
    const refreshTokenId = payload.tokenId as string;
    
    if (!userId || !refreshTokenId) {
      return { success: false, error: "Invalid refresh token payload" };
    }
    
    // Check if refresh token is invalidated in Convex
    const tokenRecord = await convex.query(api.chatTokens.getByRefreshTokenId, { 
      refreshTokenId,
      userId
    });
    
    if (!tokenRecord || tokenRecord.isInvalidated) {
      // Clear cookies since refresh token is invalid
      await clearChatJwtCookies();
      return { success: false, error: "Refresh token has been invalidated" };
    }
    
    // Get user info from Convex
    const user = await convex.query(api.users.getUserById, { clerkId: userId });
    
    if (!user) {
      return { success: false, error: "User not found" };
    }
    
    // Generate a new JWT token
    const userRole = user.role || "user";
    const now = Math.floor(Date.now() / 1000);
    const exp = now + TOKEN_EXPIRY;
    const jti = randomUUID();
    
    const token = await new SignJWT({ userId, userRole })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(`${TOKEN_EXPIRY}s`)
      .setJti(jti)
      .sign(secretKey);
    
    // Update the token record in Convex
    await convex.mutation(api.chatTokens.updateToken, {
      id: tokenRecord._id,
      newTokenId: jti,
      expiresAt: exp * 1000
    });
    
    // Set the new access token cookie
    cookieStore.set(ACCESS_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: ACCESS_COOKIE_MAX_AGE,
      path: "/"
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error refreshing JWT token:", error);
    
    // Clear cookies on any error
    await clearChatJwtCookies();
    return { success: false, error: error instanceof Error ? error.message : "Failed to refresh token" };
  }
}

/**
 * Checks if JWT tokens exist in cookies
 */
export async function chatJwtTokensExist() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE_NAME);
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME);
  
  return { 
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken
  };
}

/**
 * Verify the access token
 */
export async function verifyAccessToken() {
  try {
    console.log("[verifyAccessToken] Starting token verification...");
    
    // Get access token from cookie
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
    
    if (!accessToken) {
      console.log("[verifyAccessToken] No access token found in cookies");
      return { success: false, error: "No access token found" };
    }
    
    console.log("[verifyAccessToken] Found access token, verifying...");
    
    // Verify token
    const payload = await verifyJWTToken(accessToken);
    
    if (!payload || !payload.userId || !payload.jti) {
      console.log("[verifyAccessToken] Token verification failed - invalid payload");
      return { success: false, error: "Invalid token payload" };
    }
    
    console.log("[verifyAccessToken] Token decoded successfully, checking invalidation...");
    
    // Check if token is invalidated in Convex
    const tokenRecord = await convex.query(api.chatTokens.getByTokenId, { 
      tokenId: payload.jti,
      userId: payload.userId
    });
    
    console.log("[verifyAccessToken] Token record:", tokenRecord);
    
    if (!tokenRecord || tokenRecord.isInvalidated) {
      console.log("[verifyAccessToken] Token is invalidated or not found in database");
      return { success: false, error: "Token has been invalidated" };
    }
    
    console.log("[verifyAccessToken] Token verification successful");
    return { success: true };
  } catch (error) {
    console.error("[verifyAccessToken] Error verifying token:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Invalidates a JWT token by adding it to the blacklist in Convex
 */
export async function invalidateJwtToken() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
    
    if (!accessToken) {
      return { success: false, error: "No access token to invalidate" };
    }
    
    // Verify and get the token payload
    const payload = await verifyJWTToken(accessToken);
    
    if (!payload) {
      return { success: false, error: "Invalid token" };
    }
    
    // Invalidate the token in Convex
    const updated = await convex.mutation(api.chatTokens.invalidateToken, {
      tokenId: payload.jti
    });
    
    // Clear the cookies
    cookieStore.delete(ACCESS_COOKIE_NAME);
    cookieStore.delete(REFRESH_COOKIE_NAME);
    
    return { success: !!updated };
  } catch (error) {
    console.error("Error invalidating JWT token:", error);
    
    // Still clear cookies even if invalidation fails
    const cookieStore = await cookies();
    cookieStore.delete(ACCESS_COOKIE_NAME);
    cookieStore.delete(REFRESH_COOKIE_NAME);
    
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Force logout and invalidate token
 */
export async function forceLogout() {
  try {
    // Invalidate token first
    await invalidateJwtToken();
    
    // Clear cookies
    await clearChatJwtCookies();
    
    return { success: true };
  } catch (error) {
    console.error("Error during force logout:", error);
    
    // Make sure cookies are cleared even if there's an error
    await clearChatJwtCookies();
    
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
