import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuth } from "./auth";

/**
 * Delete all chats and messages - DANGER: Admin only
 */
export const resetAllChats = mutation({
  handler: async (ctx) => {
    const auth = await getAuth(ctx);
    if (!auth) throw new Error("Not authenticated");

    const userId = auth.subject;
    
    // Get current user to check if they're an admin
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .unique();
    
    // Check if the user is an admin
    if (currentUser?.role !== "admin") {
      throw new Error("Only admins can reset all chats");
    }
    
    console.log("[resetAllChats] Starting database cleanup...");
    
    // Delete all messages
    const messages = await ctx.db.query("messages").collect();
    console.log(`[resetAllChats] Deleting ${messages.length} messages`);
    
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
    
    // Delete all typing statuses
    const typingStatuses = await ctx.db.query("typingStatus").collect();
    console.log(`[resetAllChats] Deleting ${typingStatuses.length} typing statuses`);
    
    for (const status of typingStatuses) {
      await ctx.db.delete(status._id);
    }
    
    // Delete all chats
    const chats = await ctx.db.query("chats").collect();
    console.log(`[resetAllChats] Deleting ${chats.length} chats`);
    
    for (const chat of chats) {
      await ctx.db.delete(chat._id);
    }
    
    console.log("[resetAllChats] Database cleanup complete");
    
    return {
      success: true,
      messagesDeleted: messages.length,
      chatsDeleted: chats.length,
      typingStatusesDeleted: typingStatuses.length,
    };
  },
});

/**
 * Create a test chat for admin users
 */
export const createTestChat = mutation({
  handler: async (ctx) => {
    const auth = await getAuth(ctx);
    if (!auth) throw new Error("Not authenticated");

    const userId = auth.subject;
    
    // Get current user to check if they're an admin
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .unique();
    
    // Check if the user is an admin
    if (currentUser?.role !== "admin") {
      throw new Error("Only admins can create test chats");
    }
    
    console.log("[createTestChat] Creating a test chat");
    
    // Get all users 
    const users = await ctx.db.query("users").collect();
    if (users.length < 2) {
      throw new Error("Need at least 2 users to create a test chat");
    }
    
    // Create a chat with all users as participants
    const chatId = await ctx.db.insert("chats", {
      name: "Test Chat",
      createdBy: userId,
      participantIds: users.map(user => user.clerkId),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Add a test message
    await ctx.db.insert("messages", {
      chatId,
      content: "This is a test message. The chat system should now be working correctly!",
      sender: userId,
      timestamp: Date.now(),
      read: [userId],
    });
    
    console.log(`[createTestChat] Created test chat with ID ${chatId}`);
    
    return {
      success: true,
      chatId,
    };
  },
});

/**
 * Create a one-on-one chat between admin and another user
 */
export const createOneOnOneChat = mutation({
  args: {
    otherUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx);
    if (!auth) throw new Error("Not authenticated");

    const userId = auth.subject;
    
    // Get current user to check if they're an admin
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .unique();
    
    // Check if the user is an admin
    if (currentUser?.role !== "admin") {
      throw new Error("Only admins can create one-on-one test chats");
    }
    
    // Get the other user
    const otherUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.otherUserId))
      .unique();
    
    if (!otherUser) {
      throw new Error("Other user not found");
    }
    
    console.log(`[createOneOnOneChat] Creating a one-on-one chat with ${otherUser.name || otherUser.email || otherUser.clerkId}`);
    
    // Create the chat with just these two users
    const chatId = await ctx.db.insert("chats", {
      name: `Chat with ${otherUser.name || otherUser.email || "User"}`,
      createdBy: userId,
      participantIds: [userId, otherUser.clerkId],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Add a welcome message
    await ctx.db.insert("messages", {
      chatId,
      content: `Hello ${otherUser.name || otherUser.email || "there"}! This is a private conversation between us.`,
      sender: userId,
      timestamp: Date.now(),
      read: [userId],
    });
    
    console.log(`[createOneOnOneChat] Created one-on-one chat with ID ${chatId}`);
    
    return {
      success: true,
      chatId,
    };
  },
}); 