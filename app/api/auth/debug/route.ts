import { forceCreateUser } from "@/actions/auth";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

/**
 * API route for debugging Clerk-Convex user synchronization
 * This forcefully attempts to create a user in the Convex database
 */
export async function GET() {
  // Get auth information
  const authData = await auth();
  
  if (!authData.userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  
  try {
    // Get detailed Clerk information for debugging
    const { userId: clerkId, sessionId } = authData;
    const sessionClaims = authData.sessionClaims;
    
    // Try to get a Convex token
    let tokenInfo;
    try {
      const token = await authData.getToken({ template: "convex" });
      tokenInfo = {
        success: !!token,
        length: token ? token.length : 0,
      };
    } catch (tokenError) {
      tokenInfo = {
        error: String(tokenError),
        success: false,
      };
    }
    
    // Attempt to force create the user
    const result = await forceCreateUser();
    
    // Return detailed debugging information
    return NextResponse.json({
      debug: {
        clerkId,
        sessionId: sessionId?.substring(0, 8), // First part only for privacy
        hasSessionClaims: !!sessionClaims,
        email: sessionClaims?.email,
        name: sessionClaims?.name,
        token: tokenInfo,
      },
      result
    });
  } catch (error) {
    console.error("Error in debug route:", error);
    return NextResponse.json({ 
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined 
    }, { status: 500 });
  }
} 