"use server";

import { api } from "@/convex/_generated/api";
import { auth } from "@clerk/nextjs/server";

// We'll use fetch directly since TypeScript is having issues with ConvexHttpClient
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "";

/**
 * Server action to check if current user is an admin
 * Returns boolean indicating admin status
 */
export async function isUserAdmin() {
  const authObj = await auth();
  const userId = authObj.userId;
  
  if (!userId) {
    return false;
  }
  
  try {
    // Get a Convex token for the Clerk user
    const convexToken = await authObj.getToken({ template: "convex" });
    
    if (!convexToken) {
      return false;
    }

    // Call Convex API directly with fetch to get user data
    const response = await fetch(`${CONVEX_URL}/api/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${convexToken}`
      },
      body: JSON.stringify({
        path: "users:getMe",
        args: {}
      })
    });
    
    if (!response.ok) {
      return false;
    }
    
    const userData = await response.json();
    
    // Check if the user has admin role
    return userData.result?.role === "admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Server action to get the current Convex user
 * Requires user to be authenticated with Clerk
 */
export async function getCurrentUser() {
  const authObj = await auth();
  const userId = authObj.userId;
  
  if (!userId) {
    return null;
  }
  
  try {
    // Get a Convex token for the Clerk user
    const convexToken = await authObj.getToken({ template: "convex" });
    
    if (!convexToken) {
      throw new Error("Failed to get Convex token");
    }

    // Call Convex API directly with fetch
    const response = await fetch(`${CONVEX_URL}/api/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${convexToken}`
      },
      body: JSON.stringify({
        path: "users:getMe",
        args: {}
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }

    const userData = await response.json();
    return userData.result;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Server action to sync the Clerk user with Convex
 * This is useful on sign-in or user profile updates
 */
export async function syncUser() {
  const authObj = await auth();
  const userId = authObj.userId;
  
  if (!userId) {
    return { success: false, error: "Not authenticated" };
  }
  
  try {
    // Get Clerk user data to pass to Convex
    const { userId: clerkId, sessionId } = authObj;
    const sessionClaims = authObj.sessionClaims;
    const email = sessionClaims?.email as string || undefined;
    const name = sessionClaims?.name as string || undefined;
    const pictureUrl = sessionClaims?.picture as string || undefined;
    


    // console.log("Server Action: Syncing user to Convex:", { 
    //   clerkId, 
    //   email, 
    //   name, 
    //   hasImage: !!pictureUrl,
    //   sessionId: sessionId?.substring(0, 8) // Only log part of the session ID for privacy
    // });
    
    // Verify the Convex URL is set properly
    if (!CONVEX_URL) {
      console.error("NEXT_PUBLIC_CONVEX_URL is not set or empty");
      return { success: false, error: "Convex URL is not configured" };
    }
    
    // Get a Convex token for the Clerk user
    let convexToken;
    try {
      convexToken = await authObj.getToken({ template: "convex" });
      // console.log("Successfully obtained Convex token from Clerk");
    } catch (tokenError) {
      console.error("Failed to get Convex token:", tokenError);
      return { 
        success: false, 
        error: "Failed to get Convex token", 
        details: tokenError instanceof Error ? tokenError.message : String(tokenError)
      };
    }
    
    if (!convexToken) {
      console.error("Convex token is empty or undefined");
      return { success: false, error: "Empty Convex token" };
    }

    // Log the request we're about to make
    console.log(`Making request to Convex at: ${CONVEX_URL}/api/mutation`);
    
    // Call Convex API directly with fetch, including Clerk user data
    const response = await fetch(`${CONVEX_URL}/api/mutation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${convexToken}`
      },
      body: JSON.stringify({
        path: "users:createOrUpdateUser",
        args: {
          // Explicitly pass user data from Clerk session claims
          // This ensures Convex has the data it needs
          clerkId,
          email,
          name,
          imageUrl: pictureUrl
        }
      })
    });

    // Log detailed response information for debugging
    console.log(`Sync user response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      // Try to get response body for more detailed error information
      try {
        const errorDetails = await response.text();
        console.error(`User sync error details: ${errorDetails}`);
        return {
          success: false,
          error: `Failed to sync user: ${response.statusText}`,
          details: errorDetails,
          status: response.status
        };
      } catch (textError) {
        // If we can't get the error text, just use the status
        return {
          success: false,
          error: `Failed to sync user: ${response.statusText}`,
          status: response.status
        };
      }
    }

    try {
      const result = await response.json();
      
      // Extract the user ID properly from the response
      // Convex returns the ID in result.value not result.result
      const convexUserId = result.value;
      
      if (!convexUserId) {
        console.error("Missing user ID in Convex response:", result);
        return { 
          success: false, 
          error: "Missing user ID in response", 
          rawResult: JSON.stringify(result)
        };
      }
      
      console.log("User sync successful, Convex user ID:", convexUserId);
      return { success: true, userId: convexUserId };
    } catch (parseError) {
      console.error("Error parsing Convex response:", parseError);
      return { 
        success: false, 
        error: "Invalid response from Convex", 
        details: parseError instanceof Error ? parseError.message : String(parseError) 
      };
    }
  } catch (error) {
    console.error("Error syncing user:", error);
    return { 
      success: false, 
      error: String(error),
      details: error instanceof Error ? error.stack : undefined
    };
  }
}

/**
 * Server action to force create a user in Convex
 * This is useful when debugging authentication issues
 */
export async function forceCreateUser() {
  const authObj = await auth();
  const userId = authObj.userId;
  
  if (!userId) {
    return { success: false, error: "Not authenticated" };
  }
  
  try {
    // Get Clerk user data to pass to Convex
    const { userId: clerkId } = authObj;
    const sessionClaims = authObj.sessionClaims;
    const email = sessionClaims?.email as string || undefined;
    const name = sessionClaims?.name as string || undefined;
    const pictureUrl = sessionClaims?.picture as string || undefined;
    
    console.log("Force creating user in Convex:", { clerkId, email, name, hasImage: !!pictureUrl });
    
    // Get a Convex token for the Clerk user
    const convexToken = await authObj.getToken({ template: "convex" });
    
    if (!convexToken) {
      throw new Error("Failed to get Convex token");
    }
    
    // Direct mutation call with user data - ONLY include fields that are in the validator
    const userData = {
      clerkId,
      email,
      name,
      imageUrl: pictureUrl,
      role: "user"
      // Don't include createdAt or lastLoginAt as they're handled by the server
    };

    // Call Convex API directly with fetch, but in a more direct way
    const response = await fetch(`${CONVEX_URL}/api/mutation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${convexToken}`
      },
      body: JSON.stringify({
        path: "users:createOrUpdateUser",
        args: userData
      })
    });
    
    console.log(`Force create user response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorDetails = await response.text();
      console.error(`Force create user error details: ${errorDetails}`);
      throw new Error(`Failed to create user: ${response.statusText} - ${errorDetails}`);
    }

    const result = await response.json();
    console.log("User created/updated successfully with ID:", result.value);
    return { success: true, userId: result.value, userData };
  } catch (error) {
    console.error("Error creating user:", error);
    return { 
      success: false, 
      error: String(error),
      details: error instanceof Error ? error.stack : undefined
    };
  }
} 