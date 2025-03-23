import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";
import { JWTPayload } from "./types/jwt";

/**
 * Get messages for a chat with token authentication
 */
export const getMessagesSecure = query({
  args: { 
    chatId: v.id("chats"),
    tokenPayload: v.object({
      userId: v.string(),
      userRole: v.string(),
      exp: v.number(),
      iat: v.number(),
      jti: v.string()
    })
  },
  handler: async (ctx, args) => {
    try {
      const userId = args.tokenPayload.userId;
      const userRole = args.tokenPayload.userRole;
      const jti = args.tokenPayload.jti;
      
      // Check if token is invalidated
      const tokenRecord = await ctx.db
        .query("chatTokens")
        .filter(q => 
          q.eq(q.field("tokenId"), jti) && 
          q.eq(q.field("userId"), userId)
        )
        .first();
      
      if (!tokenRecord || tokenRecord.isInvalidated) {
        return {
          error: "Token has been invalidated",
          messages: []
        };
      }
      
      // Access control check
      let hasAccess = false;
      
      // Admin always has access
      if (userRole === "admin") {
        hasAccess = true;
      } else {
        // Get the chat to check if user is a participant
        const chat = await ctx.db.get(args.chatId);
        if (!chat) {
          return {
            error: "Chat not found",
            messages: []
          };
        }
        
        if (!('participantIds' in chat)) {
          return {
            error: "Invalid chat data",
            messages: []
          };
        }
        
        hasAccess = chat.participantIds.includes(userId);
      }
      
      if (!hasAccess) {
        return {
          error: "You do not have access to this chat",
          messages: []
        };
      }
      
      // Get messages
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_chatId_timestamp", q => 
          q.eq("chatId", args.chatId)
        )
        .order("desc")
        .take(50);
      
      return {
        messages: messages.reverse(),
        error: null
      };
    } catch (error) {
      console.error("Error in getMessagesSecure:", error);
      return {
        error: "Authentication error",
        messages: []
      };
    }
  }
});

/**
 * Send a message to a chat with token authentication
 */
export const sendMessageSecure = mutation({
  args: {
    chatId: v.id("chats"),
    content: v.string(),
    tokenPayload: v.object({
      userId: v.string(),
      userRole: v.string(),
      exp: v.number(),
      iat: v.number(),
      jti: v.string()
    })
  },
  handler: async (ctx, args) => {
    try {
      const userId = args.tokenPayload.userId;
      const userRole = args.tokenPayload.userRole;
      const jti = args.tokenPayload.jti;
      
      // Check if token is invalidated
      const tokenRecord = await ctx.db
        .query("chatTokens")
        .filter(q => 
          q.eq(q.field("tokenId"), jti) && 
          q.eq(q.field("userId"), userId)
        )
        .first();
      
      if (!tokenRecord || tokenRecord.isInvalidated) {
        return {
          error: "Token has been invalidated",
          success: false
        };
      }
      
      // Access control check
      const chat = await ctx.db.get(args.chatId);
      if (!chat) {
        return {
          error: "Chat not found",
          success: false
        };
      }
      
      if (!('participantIds' in chat)) {
        return {
          error: "Invalid chat data",
          success: false
        };
      }
      
      const isParticipant = chat.participantIds.includes(userId);
      const isAdmin = userRole === "admin";
      
      if (!isParticipant && !isAdmin) {
        return {
          error: "You do not have access to this chat",
          success: false
        };
      }
      
      // Send the message
      const messageId: Id<"messages"> = await ctx.db.insert("messages", {
        chatId: args.chatId,
        content: args.content,
        sender: userId,
        timestamp: Date.now(),
        isAdmin: isAdmin
      });
      
      // Update the chat's last modified time
      await ctx.db.patch(args.chatId, {
        updatedAt: Date.now()
      });
      
      return {
        success: true,
        messageId,
        error: null
      };
    } catch (error) {
      console.error("Error in sendMessageSecure:", error);
      return {
        error: "Authentication error",
        success: false
      };
    }
  }
});

/**
 * Set typing status with token authentication
 */
export const setTypingStatusSecure = mutation({
  args: {
    chatId: v.id("chats"),
    isTyping: v.boolean(),
    tokenPayload: v.object({
      userId: v.string(),
      userRole: v.string(),
      exp: v.number(),
      iat: v.number(),
      jti: v.string()
    })
  },
  handler: async (ctx, args) => {
    try {
      const userId = args.tokenPayload.userId;
      const userRole = args.tokenPayload.userRole;
      const jti = args.tokenPayload.jti;
      
      // Check if token is invalidated
      const tokenRecord = await ctx.db
        .query("chatTokens")
        .filter(q => 
          q.eq(q.field("tokenId"), jti) && 
          q.eq(q.field("userId"), userId)
        )
        .first();
      
      if (!tokenRecord || tokenRecord.isInvalidated) {
        return {
          error: "Token has been invalidated",
          success: false
        };
      }
      
      // Access control check
      const chat = await ctx.db.get(args.chatId);
      if (!chat) {
        return {
          error: "Chat not found",
          success: false
        };
      }
      
      if (!('participantIds' in chat)) {
        return {
          error: "Invalid chat data",
          success: false
        };
      }
      
      const isParticipant = chat.participantIds.includes(userId);
      const isAdmin = userRole === "admin";
      
      if (!isParticipant && !isAdmin) {
        return {
          error: "You do not have access to this chat",
          success: false
        };
      }
      
      // Get the existing typing status
      const existingStatus = await ctx.db
        .query("typingStatus")
        .withIndex("by_chatId_userId", q => 
          q.eq("chatId", args.chatId)
           .eq("userId", userId)
        )
        .first();
      
      if (existingStatus) {
        // Update existing status
        await ctx.db.patch(existingStatus._id, {
          isTyping: args.isTyping,
          lastUpdated: Date.now()
        });
      } else {
        // Create new status
        await ctx.db.insert("typingStatus", {
          chatId: args.chatId,
          userId,
          isTyping: args.isTyping,
          lastUpdated: Date.now()
        });
      }
      
      return {
        success: true,
        error: null
      };
    } catch (error) {
      console.error("Error in setTypingStatusSecure:", error);
      return {
        error: "Authentication error",
        success: false
      };
    }
  }
});

/**
 * Mark messages as read with token authentication
 */
export const markMessagesAsReadSecure = mutation({
  args: {
    chatId: v.id("chats"),
    tokenPayload: v.object({
      userId: v.string(),
      userRole: v.string(),
      exp: v.number(),
      iat: v.number(),
      jti: v.string()
    })
  },
  handler: async (ctx, args) => {
    try {
      const userId = args.tokenPayload.userId;
      const userRole = args.tokenPayload.userRole;
      const jti = args.tokenPayload.jti;
      
      // Check if token is invalidated
      const tokenRecord = await ctx.db
        .query("chatTokens")
        .filter(q => 
          q.eq(q.field("tokenId"), jti) && 
          q.eq(q.field("userId"), userId)
        )
        .first();
      
      if (!tokenRecord || tokenRecord.isInvalidated) {
        return {
          error: "Token has been invalidated",
          success: false
        };
      }
      
      // Access control check
      const chat = await ctx.db.get(args.chatId);
      if (!chat) {
        return {
          error: "Chat not found",
          success: false
        };
      }
      
      if (!('participantIds' in chat)) {
        return {
          error: "Invalid chat data",
          success: false
        };
      }
      
      const isParticipant = chat.participantIds.includes(userId);
      const isAdmin = userRole === "admin";
      
      if (!isParticipant && !isAdmin) {
        return {
          error: "You do not have access to this chat",
          success: false
        };
      }
      
      // Get all messages in this chat
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_chatId_timestamp", q => 
          q.eq("chatId", args.chatId)
        )
        .collect();
      
      // Update each message to mark as read by this user
      for (const message of messages) {
        const read = message.read || [];
        if (!read.includes(userId)) {
          await ctx.db.patch(message._id, {
            read: [...read, userId]
          });
        }
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error("Error in markMessagesAsReadSecure:", error);
      return {
        error: "Authentication error",
        success: false
      };
    }
  }
});

/**
 * Create a new chat with token authentication
 */
export const createChatSecure = mutation({
  args: {
    name: v.string(),
    initialMessage: v.string(),
    participantIds: v.array(v.string()),
    tokenPayload: v.object({
      userId: v.string(),
      userRole: v.string(),
      exp: v.number(),
      iat: v.number(),
      jti: v.string()
    })
  },
  handler: async (ctx, args) => {
    try {
      const userId = args.tokenPayload.userId;
      const userRole = args.tokenPayload.userRole;
      const jti = args.tokenPayload.jti;
      
      // Check if token is invalidated
      const tokenRecord = await ctx.db
        .query("chatTokens")
        .filter(q => 
          q.eq(q.field("tokenId"), jti) && 
          q.eq(q.field("userId"), userId)
        )
        .first();
      
      if (!tokenRecord || tokenRecord.isInvalidated) {
        return {
          error: "Token has been invalidated",
          success: false,
          chatId: null
        };
      }
      
      // Create the chat
      const chatId = await ctx.db.insert("chats", {
        name: args.name,
        createdBy: userId,
        participantIds: [userId, ...args.participantIds],
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      
      // Create the initial message
      await ctx.db.insert("messages", {
        chatId,
        content: args.initialMessage,
        sender: userId,
        timestamp: Date.now(),
        read: [userId],
        isAdmin: userRole === "admin",
        isSystemMessage: true
      });
      
      return { success: true, error: null, chatId };
    } catch (error) {
      console.error("Error in createChatSecure:", error);
      return {
        error: "Authentication error",
        success: false,
        chatId: null
      };
    }
  }
});

/**
 * List chats with token authentication
 */
export const listChatsSecure = query({
  args: {
    tokenPayload: v.object({
      userId: v.string(),
      userRole: v.string(),
      exp: v.number(),
      iat: v.number(),
      jti: v.string()
    })
  },
  handler: async (ctx, args) => {
    try {
      const userId = args.tokenPayload.userId;
      const userRole = args.tokenPayload.userRole;
      const jti = args.tokenPayload.jti;
      
      // Check if token is invalidated
      const tokenRecord = await ctx.db
        .query("chatTokens")
        .filter(q => 
          q.eq(q.field("tokenId"), jti) && 
          q.eq(q.field("userId"), userId)
        )
        .first();
      
      if (!tokenRecord || tokenRecord.isInvalidated) {
        return [];
      }
      
      // Get all chats where user is a participant or is an admin
      const chats = await ctx.db
        .query("chats")
        .filter(q => 
          q.or(
            q.eq(q.field("createdBy"), userId),
            q.and(
              q.neq(q.field("participantIds"), []),
              q.eq(q.field("participantIds"), [userId])
            )
          )
        )
        .collect();
      
      // For each chat, get the last message and participant info
      const chatsWithDetails = await Promise.all(chats.map(async (chat) => {
        // Get last message
        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_chatId_timestamp", q => q.eq("chatId", chat._id))
          .order("desc")
          .first();
        
        // Get participant info
        const participantsInfo = await Promise.all(
          chat.participantIds.map(async (participantId: string) => {
            const user = await ctx.db
              .query("users")
              .withIndex("by_clerkId", q => q.eq("clerkId", participantId))
              .unique();
            
            return user ? {
              clerkId: user.clerkId,
              name: user.name,
              email: user.email,
              imageUrl: user.imageUrl,
              role: user.role
            } : null;
          })
        );
        
        return {
          ...chat,
          lastMessageContent: lastMessage?.content,
          lastMessageTimestamp: lastMessage?.timestamp,
          participantsInfo: participantsInfo.filter(Boolean)
        };
      }));
      
      // Sort chats by last message timestamp
      return chatsWithDetails.sort((a: any, b: any) => {
        const aTimestamp = a.lastMessageTimestamp || a.updatedAt || a.createdAt;
        const bTimestamp = b.lastMessageTimestamp || b.updatedAt || b.createdAt;
        return bTimestamp - aTimestamp;
      });
    } catch (error) {
      console.error("Error in listChatsSecure:", error);
      return [];
    }
  }
});
