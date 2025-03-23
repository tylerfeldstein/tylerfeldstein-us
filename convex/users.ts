import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { getAuth } from "./auth";

/**
 * Create or update a user when they authenticate with Clerk
 * Now accepts optional user data from the client/server action
 */
export const createOrUpdateUser = mutation({
  args: {
    // Make these optional so they can be provided by the client or extracted from identity
    clerkId: v.optional(v.string()),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    role: v.optional(v.string()), // Optional role parameter for admin control
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    // Get the identity from the token
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      console.error("Called createOrUpdateUser without authentication");
      throw new Error("Called createOrUpdateUser without authentication");
    }

    // Log identity information for debugging
    console.log("User identity from token:", {
      subject: identity.subject,
      issuer: identity.tokenIdentifier.split(":")[0], // Just the issuer part
      email: identity.email,
      name: identity.name,
      hasImage: !!identity.pictureUrl,
    });

    // Use provided args if available, otherwise fall back to identity data
    const clerkId = args.clerkId || identity.subject;
    const email = args.email || identity.email;
    const name = args.name || identity.name;
    const imageUrl = args.imageUrl || identity.pictureUrl;
    const now = Date.now();

    // Check if either source has the required data
    if (!clerkId) {
      console.error("Missing required clerkId in both args and identity");
      throw new Error("Missing required clerkId for user creation");
    }

    console.log("Creating/updating user with data:", { 
      clerkId, 
      email, 
      name, 
      hasImage: !!imageUrl,
      fromArgs: {
        hasClerkId: !!args.clerkId,
        hasEmail: !!args.email,
        hasName: !!args.name,
        hasImage: !!args.imageUrl
      },
      fromIdentity: {
        hasClerkId: !!identity.subject,
        hasEmail: !!identity.email,
        hasName: !!identity.name,
        hasImage: !!identity.pictureUrl
      }
    });

    try {
      // Check if the user already exists
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
        .unique();

      if (existingUser) {
        // User exists, update their information
        const userId = existingUser._id;
        
        console.log(`Found existing user with ID ${userId}`);
        
        // Only update fields that need to be updated
        const updates: Partial<Doc<"users">> = {
          lastLoginAt: now,
        };
        
        if (email && existingUser.email !== email) {
          updates.email = email;
        }
        
        if (name && existingUser.name !== name) {
          updates.name = name;
        }
        
        if (imageUrl && existingUser.imageUrl !== imageUrl) {
          updates.imageUrl = imageUrl;
        }
        
        // Only update role if explicitly provided (admin functionality)
        if (args.role && existingUser.role !== args.role) {
          updates.role = args.role;
        }
        
        // Only update if there are changes
        if (Object.keys(updates).length > 0) {
          console.log(`Updating user ${userId} with fields:`, Object.keys(updates));
          await ctx.db.patch(userId, updates);
        } else {
          console.log(`No changes needed for user ${userId}`);
        }
        
        return userId;
      } else {
        // Create a new user with default role of "user"
        console.log("Creating new user with clerkId:", clerkId);
        
        // Always include the timestamps from the server
        const userData = {
          clerkId,
          email,
          name,
          imageUrl,
          role: args.role || "user", // Use provided role or default to "user"
          lastLoginAt: now,
          createdAt: now,
        };
        
        const userId = await ctx.db.insert("users", userData);
        
        console.log(`Successfully created new user with ID ${userId}`);
        return userId;
      }
    } catch (error) {
      console.error("Error in createOrUpdateUser:", error);
      throw error; // Re-throw to propagate to client
    }
  },
});

/**
 * Get the current user information
 */
export const getMe = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("users"),
      clerkId: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      role: v.optional(v.string()),
      lastLoginAt: v.number(),
      createdAt: v.number(),
      _creationTime: v.optional(v.number()),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const clerkId = identity.subject;
    
    // Get the user from the database
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();
    
    return user;
  },
});

/**
 * Get a user by their Clerk ID
 */
export const getUserByClerkId = query({
  args: {
    clerkId: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      clerkId: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      role: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    
    return user;
  },
});

/**
 * Get users by role - requires admin access
 */
export const getUsersByRole = query({
  args: {
    role: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("users"),
      clerkId: v.string(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      role: v.optional(v.string()),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    // Get the current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Get the current user from DB to check role
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    
    // Only admins can get users by role
    if (!currentUser || currentUser.role !== "admin") {
      console.warn(`Non-admin user ${identity.subject} attempted to access getUsersByRole`);
      return [];
    }
    
    // Get users with specified role
    const users = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .collect();
    
    return users;
  },
});

/**
 * Admin function to set a user's role
 */
export const setUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    // Get the current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    // Get the current user from DB to check role
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    
    // Only admins can set user roles
    if (!currentUser || currentUser.role !== "admin") {
      console.warn(`Non-admin user ${identity.subject} attempted to set user role`);
      throw new Error("Admin access required to set user roles");
    }
    
    // Get the target user
    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("User not found");
    }
    
    // Update the user's role
    await ctx.db.patch(args.userId, {
      role: args.role,
    });
    
    return true;
  },
});

/**
 * Migration function to add roles to existing users
 * This should be run once after updating the schema
 */
export const migrateUserRoles = mutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    // First, verify the current user is authenticated
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }
    
    const clerkId = identity.subject;
    
    // Get the current user
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();
    
    if (!currentUser) {
      console.log(`User with clerkId ${clerkId} not found during role migration`);
      return 0;
    }
    
    // Only update the role if it's not set
    if (currentUser.role === undefined || currentUser.role === null) {
      await ctx.db.patch(currentUser._id, {
        role: "user", // Set default role
      });
      console.log(`Updated user ${currentUser._id} with the default role of "user"`);
      return 1;
    }
    
    // No updates needed
    return 0;
  },
});

/**
 * List all users for admin use only
 * This is secured so only admins can access it
 */
export const listUsers = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.string(),
      clerkId: v.string(),
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      role: v.optional(v.string()),
      createdAt: v.optional(v.number()),
    })
  ),
  handler: async (ctx) => {
    const auth = await getAuth(ctx);
    if (!auth) throw new Error("Not authenticated");

    const userId = auth.subject;
    
    // Get the current user to check if they are an admin
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .unique();
    
    // Verify the user is an admin, if not return empty list for security
    if (!currentUser || currentUser.role !== "admin") {
      console.warn(`Security alert: User ${userId} attempted to access listUsers without admin privileges`);
      return [];
    }
    
    // Fetch all users
    const users = await ctx.db.query("users").collect();
    
    // Return sanitized user data
    return users.map((user) => ({
      _id: user._id,
      clerkId: user.clerkId,
      name: user.name,
      email: user.email,
      imageUrl: user.imageUrl,
      role: user.role,
      createdAt: user.createdAt,
    }));
  },
});

/**
 * Get all users - admin only
 */
export const getAll = query({
  handler: async (ctx) => {
    const auth = await getAuth(ctx);
    if (!auth) return [];

    const userId = auth.subject;
    
    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .unique();
    
    // Only admins can list all users
    if (user?.role !== "admin") {
      console.log("[getAll] Non-admin attempted to access all users:", userId);
      return [];
    }
    
    // For admins, return all users
    const users = await ctx.db.query("users").collect();
    console.log(`[getAll] Admin ${userId} retrieved ${users.length} users`);
    
    return users;
  },
}); 