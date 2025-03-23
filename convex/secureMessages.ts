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
      
      // Get the actual user from the database to check their role
      // This ensures we use the server's role information, not the client's claim
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", q => q.eq("clerkId", userId))
        .unique();
      
      if (!user) {
        console.warn(`[getMessagesSecure] User ${userId} not found in database`);
        return {
          error: "User not found",
          messages: []
        };
      }
      
      // Determine if user is admin from database record
      const isAdmin = user.role === "admin";
      
      // Access control check
      let hasAccess = false;
      
      // Admin always has access
      if (isAdmin) {
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
      
      // Get all unique sender IDs
      const senderIds = new Set<string>();
      for (const message of messages) {
        if (message.sender) {
          senderIds.add(message.sender);
        }
      }
      
      // Get sender info for all messages
      const userMap = new Map<string, any>();
      const userDocs = await Promise.all(
        Array.from(senderIds).map(async (senderId) => {
          const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", q => q.eq("clerkId", senderId))
            .unique();
          
          if (user) {
            return {
              clerkId: user.clerkId,
              name: user.name,
              email: user.email,
              imageUrl: user.imageUrl,
              role: user.role
            };
          }
          return null;
        })
      );
      
      // Create a map of sender ID to user info
      userDocs.filter(Boolean).forEach(userDoc => {
        if (userDoc && userDoc.clerkId) {
          userMap.set(userDoc.clerkId, userDoc);
        }
      });
      
      // Attach sender info to each message
      const messagesWithSenderInfo = messages.reverse().map(message => {
        const senderInfo = userMap.get(message.sender) || null;
        return {
          ...message,
          senderInfo
        };
      });
      
      return {
        messages: messagesWithSenderInfo,
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
      
      // Get the actual user from the database to check their role
      // This ensures we use the server's role information, not the client's claim
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", q => q.eq("clerkId", userId))
        .unique();
      
      if (!user) {
        console.warn(`[sendMessageSecure] User ${userId} not found in database`);
        return {
          error: "User not found",
          success: false
        };
      }
      
      // Determine if user is admin from database record
      const isAdmin = user.role === "admin";
      console.log(`[sendMessageSecure] User ${userId} role from database: ${user.role}, isAdmin: ${isAdmin}`);
      
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
      
      if (!isParticipant && !isAdmin) {
        console.warn(`[sendMessageSecure] Access denied: User ${userId} (admin: ${isAdmin}) attempted to send message to chat ${args.chatId} without being a participant`);
        return {
          error: "You do not have access to this chat",
          success: false
        };
      }
      
      // Create update object for the chat
      let chatUpdates: any = { updatedAt: Date.now() };
      
      // If the sender is not already in participants, add them
      // This is important for admins responding to chats they weren't originally part of
      if (!isParticipant) {
        console.log(`[sendMessageSecure] Adding sender ${userId} to participants for chat ${args.chatId}`);
        chatUpdates.participantIds = [...chat.participantIds, userId];
      }
      
      // Send the message
      const messageId: Id<"messages"> = await ctx.db.insert("messages", {
        chatId: args.chatId,
        content: args.content,
        sender: userId,
        timestamp: Date.now(),
        isAdmin: isAdmin
      });
      
      // Update the chat with new timestamp and potentially new participant
      await ctx.db.patch(args.chatId, chatUpdates);
      
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
      
      // Get the actual user from the database to check their role
      // This ensures we use the server's role information, not the client's claim
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", q => q.eq("clerkId", userId))
        .unique();
      
      if (!user) {
        console.warn(`[setTypingStatusSecure] User ${userId} not found in database`);
        return {
          error: "User not found",
          success: false
        };
      }
      
      // Determine if user is admin from database record
      const isAdmin = user.role === "admin";
      
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
      
      // Get the actual user from the database to check their role
      // This ensures we use the server's role information, not the client's claim
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", q => q.eq("clerkId", userId))
        .unique();
      
      if (!user) {
        console.warn(`[markMessagesAsReadSecure] User ${userId} not found in database`);
        return {
          error: "User not found",
          success: false
        };
      }
      
      // Determine if user is admin from database record
      const isAdmin = user.role === "admin";
      
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
      
      // Get the actual user from the database to check their role
      // This ensures we use the server's role information, not the client's claim
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", q => q.eq("clerkId", userId))
        .unique();
      
      if (!user) {
        console.warn(`[createChatSecure] User ${userId} not found in database`);
        return {
          error: "User not found",
          success: false,
          chatId: null
        };
      }
      
      // Determine if user is admin from database record
      const isAdmin = user.role === "admin";
      
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
        isAdmin: isAdmin,
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
      
      // Get the actual user from the database to check their role
      // This ensures we use the server's role information, not the client's claim
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", q => q.eq("clerkId", userId))
        .unique();
      
      if (!user) {
        console.warn(`[listChatsSecure] User ${userId} not found in database`);
        return [];
      }
      
      // Determine if user is admin from database record
      const isAdmin = user.role === "admin";
      console.log(`[listChatsSecure] User ${userId} role from database: ${user.role}, isAdmin: ${isAdmin}`);
      
      let chats;
      
      if (isAdmin) {
        // Admins can see all chats
        console.log(`[listChatsSecure] Fetching all chats for admin user ${userId}`);
        chats = await ctx.db.query("chats").collect();
        console.log(`[listChatsSecure] Found ${chats.length} total chats for admin`);
      } else {
        // Get all chats where user is a participant or creator
        console.log(`[listChatsSecure] Fetching chats for regular user ${userId}`);
        chats = await ctx.db
          .query("chats")
          .collect();
        
        // Filter for chats where user is a participant or creator
        chats = chats.filter(chat => 
          chat.createdBy === userId || 
          (chat.participantIds && chat.participantIds.includes(userId))
        );
        
        console.log(`[listChatsSecure] Found ${chats.length} chats for user`);
      }
      
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

/**
 * Get typing status for a chat with token authentication
 */
export const getTypingStatusSecure = query({
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
          typingUsers: []
        };
      }
      
      // Get the actual user from the database to check their role
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", q => q.eq("clerkId", userId))
        .unique();
      
      if (!user) {
        console.warn(`[getTypingStatusSecure] User ${userId} not found in database`);
        return {
          error: "User not found",
          typingUsers: []
        };
      }
      
      // Determine if user is admin from database record
      const isAdmin = user.role === "admin";
      
      // Access control check
      const chat = await ctx.db.get(args.chatId);
      if (!chat) {
        return {
          error: "Chat not found",
          typingUsers: []
        };
      }
      
      if (!('participantIds' in chat)) {
        return {
          error: "Invalid chat data",
          typingUsers: []
        };
      }
      
      const isParticipant = chat.participantIds.includes(userId);
      
      if (!isParticipant && !isAdmin) {
        return {
          error: "You do not have access to this chat",
          typingUsers: []
        };
      }
      
      // Get all typing statuses for this chat
      const typingStatuses = await ctx.db
        .query("typingStatus")
        .withIndex("by_chatId", q => q.eq("chatId", args.chatId))
        .collect();
      
      // Filter out expired typing statuses (older than 10 seconds)
      const now = Date.now();
      const activeStatuses = typingStatuses.filter(
        status => now - status.lastUpdated < 10000 && status.isTyping
      );
      
      // Don't include the current user's typing status
      const otherUsersTyping = activeStatuses.filter(status => status.userId !== userId);
      
      // Get user info for each typing user
      const typingUsers = await Promise.all(
        otherUsersTyping.map(async (status) => {
          const typingUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", q => q.eq("clerkId", status.userId))
            .unique();
          
          if (typingUser) {
            return {
              userId: status.userId,
              name: typingUser.name,
              email: typingUser.email,
              imageUrl: typingUser.imageUrl,
              lastUpdated: status.lastUpdated
            };
          }
          return null;
        })
      );
      
      return {
        typingUsers,
        error: null
      };
    } catch (error) {
      console.error("Error in getTypingStatusSecure:", error);
      return {
        error: "Authentication error",
        typingUsers: []
      };
    }
  }
});
