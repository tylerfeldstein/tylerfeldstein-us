import { internalQuery } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get details about a chat
 */
export const getChatDetails = internalQuery({
  args: {
    chatId: v.id("chats"),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.chatId);
  },
});

/**
 * Get details about a message
 */
export const getMessageDetails = internalQuery({
  args: {
    messageId: v.id("messages"),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.messageId);
  },
});

/**
 * Get the count of non-system messages in a chat
 */
export const getMessageCount = internalQuery({
  args: {
    chatId: v.id("chats"),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", q => q.eq("chatId", args.chatId))
      .filter(q => q.eq(q.field("isSystemMessage"), false))
      .collect();
    
    return messages.length;
  },
});

/**
 * Get a user's name from their ID
 */
export const getSenderName = internalQuery({
  args: {
    senderId: v.string(),
  },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", q => q.eq("clerkId", args.senderId))
      .unique();
    
    return user?.name || null;
  },
}); 