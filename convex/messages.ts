// @ts-nocheck
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { getAuth } from "./auth";

/**
 * Create a new chat
 */
export const createChat = mutation({
  args: {
    name: v.string(),
    initialMessage: v.optional(v.string()),
    participantIds: v.optional(v.array(v.string())),
  },
  returns: v.id("chats"),
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx);
    if (!auth) throw new Error("Authentication required");

    const userId = auth.subject;
    console.log("Creating chat for user:", userId);
    
    // IMPORTANT: Always include the current user in participants
    let participants = [userId];
    
    // Add other participants if provided
    if (args.participantIds && args.participantIds.length > 0) {
      // Filter out the current user to avoid duplication
      const otherParticipants = args.participantIds.filter(id => id !== userId);
      
      // Validate each participant ID and add valid ones
      for (const participantId of otherParticipants) {
        if (participantId) {
          participants.push(participantId);
        }
      }
    }
    
    // Find all users with admin role and add them to the chat
    const adminUsers = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .collect();
    
    // Add admin ClerkIds to participants (if not already included)
    for (const admin of adminUsers) {
      if (admin.clerkId && !participants.includes(admin.clerkId)) {
        console.log(`Adding admin ${admin.clerkId} to chat participants`);
        participants.push(admin.clerkId);
      }
    }
    
    // Make sure we have a unique list of valid participants
    participants = [...new Set(participants)].filter(Boolean);
    
    console.log("FINAL PARTICIPANTS:", participants);
    console.log("CREATOR:", userId);
    
    // Create the chat
    try {
      const now = Date.now();
      
      // Get user info for the chat name (if using default name)
      const currentUser = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
        .unique();
      
      // Set chat name to user's name if it's the default "New Chat"
      let chatName = args.name;
      if (chatName === "New Chat" && currentUser) {
        chatName = currentUser.name || currentUser.email || "Chat with User";
      }
      
      console.log("Creating chat with fields:", {
        name: chatName,
        participants,
        createdBy: userId,
        createdAt: now,
        updatedAt: now
      });
      
      const chatId = await ctx.db.insert("chats", {
        name: chatName,
        participants,
        createdBy: userId,
        createdAt: now,
        updatedAt: now,
      });
      
      // Create initial message if provided
      if (args.initialMessage) {
        // Create initial message as if from a system/placeholder admin
        // We'll use a special sender ID to indicate this is a system message
        const systemSenderId = "system_admin";
        
        await ctx.db.insert("messages", {
          chatId,
          content: args.initialMessage,
          sender: systemSenderId, // Use system ID instead of the user's ID
          timestamp: now,
          read: [userId], // Mark as read by the creator
          isAdmin: true, // Mark as admin message
          isSystemMessage: true, // Flag to identify placeholder messages
        });
      }
      
      return chatId;
    } catch (error) {
      console.error("Error creating chat:", error);
      throw error;
    }
  },
});

/**
 * Send a new message to a chat
 */
export const sendMessage = mutation({
  args: {
    chatId: v.id("chats"),
    content: v.string(),
  },
  returns: v.id("messages"),
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx);
    if (!auth) throw new Error("Authentication required");

    const userId = auth.subject;
    
    // Get user info to check role
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .unique();
    
    // Verify chat exists
    const chat = await ctx.db.get(args.chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }
    
    // Check if user is a participant or an admin
    const isParticipant = chat.participants.includes(userId);
    const isAdmin = user?.role === "admin"; // Treat undefined role as non-admin
    
    if (!isParticipant && !isAdmin) {
      console.warn(`Security warning: User ${userId} attempted to send message to chat ${args.chatId} without being a participant or admin`);
      throw new Error("You are not a participant in this chat");
    }
    
    // Create the message
    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      content: args.content,
      sender: userId,
      timestamp: Date.now(),
      read: [userId], // Mark as read by the sender
      isAdmin: isAdmin, // Mark as admin message if sent by admin
    });
    
    // Update the chat's updatedAt field
    await ctx.db.patch(args.chatId, {
      updatedAt: Date.now(),
    });
    
    return messageId;
  },
});

/**
 * Set typing status for a user in a chat
 */
export const setTypingStatus = mutation({
  args: {
    chatId: v.id("chats"),
    isTyping: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx);
    if (!auth) throw new Error("Not authenticated");

    const userId = auth.subject;
    
    // Get user info to check role
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .unique();
    
    // Verify chat exists
    const chat = await ctx.db.get(args.chatId);
    if (!chat) throw new Error("Chat not found");
    
    // Check if user is a participant or an admin
    const isParticipant = chat.participants.includes(userId);
    const isAdmin = user?.role === "admin"; // Treat undefined role as non-admin
    
    if (!isParticipant && !isAdmin) {
      throw new Error("Not a participant in this chat");
    }
    
    // Get existing typing status document or create a new one
    const typing = await ctx.db
      .query("typingStatus")
      .withIndex("by_chatId_userId", (q) => 
        q.eq("chatId", args.chatId).eq("userId", userId)
      )
      .unique();
    
    if (typing) {
      // Update existing status
      if (args.isTyping) {
        await ctx.db.patch(typing._id, {
          isTyping: true,
          lastUpdated: Date.now(),
        });
      } else {
        // If not typing, delete the status
        await ctx.db.delete(typing._id);
      }
    } else if (args.isTyping) {
      // Create new typing status
      await ctx.db.insert("typingStatus", {
        chatId: args.chatId,
        userId,
        isTyping: true,
        lastUpdated: Date.now(),
      });
    }
    
    return null;
  },
});

/**
 * Get typing status for a chat
 */
export const getTypingStatus = query({
  args: {
    chatId: v.id("chats"),
  },
  returns: v.array(
    v.object({
      userId: v.string(),
      isTyping: v.boolean(),
      lastUpdated: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx);
    if (!auth) return [];

    const userId = auth.subject;
    
    // Verify user is a participant in the chat
    const chat = await ctx.db.get(args.chatId);
    if (!chat) return [];
    
    if (!chat.participants.includes(userId)) {
      return [];
    }
    
    // Get all typing statuses for this chat
    const typingStatuses = await ctx.db
      .query("typingStatus")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .collect();
    
    // Filter out expired typing statuses (older than 10 seconds)
    const now = Date.now();
    const activeStatuses = typingStatuses.filter(
      status => now - status.lastUpdated < 10000
    );
    
    // Don't include the current user's typing status in the results
    return activeStatuses
      .filter(status => status.userId !== userId)
      .map(status => ({
        userId: status.userId,
        isTyping: status.isTyping,
        lastUpdated: status.lastUpdated,
      }));
  },
});

/**
 * Mark messages in a chat as read
 */
export const markMessagesAsRead = mutation({
  args: {
    chatId: v.id("chats"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx);
    if (!auth) throw new Error("Not authenticated");

    const userId = auth.subject;
    
    // Get user info to check role
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .unique();
    
    // Verify chat exists
    const chat = await ctx.db.get(args.chatId);
    if (!chat) throw new Error("Chat not found");
    
    // Check if user is a participant or an admin
    const isParticipant = chat.participants.includes(userId);
    const isAdmin = user?.role === "admin"; // Treat undefined role as non-admin
    
    if (!isParticipant && !isAdmin) {
      throw new Error("Not a participant in this chat");
    }
    
    // Get all unread messages
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .collect();
    
    // Mark each message as read
    for (const message of messages) {
      const readBy = message.read || [];
      if (!readBy.includes(userId)) {
        await ctx.db.patch(message._id, {
          read: [...readBy, userId],
        });
      }
    }
    
    return null;
  },
});

/**
 * Get all chats for the current user
 */
export const listChats = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("chats"),
      name: v.string(),
      participants: v.array(v.string()),
      participantsInfo: v.array(
        v.object({
          clerkId: v.string(),
          name: v.optional(v.string()),
          email: v.optional(v.string()),
          imageUrl: v.optional(v.string()),
          role: v.optional(v.string()),
        })
      ),
      lastMessage: v.optional(
        v.object({
          content: v.string(),
          timestamp: v.number(),
          sender: v.string(),
          senderName: v.optional(v.string()),
          isAdmin: v.boolean(),
          isSystemMessage: v.boolean(),
        })
      ),
      unreadCount: v.number(),
      updatedAt: v.number(),
      // Admin status flag determined by server
      isUserAdmin: v.boolean(),
      // Add participant flag for clarity
      isUserParticipant: v.boolean(),
      // Add creator flag
      isCreator: v.boolean(),
    })
  ),
  handler: async (ctx) => {
    const auth = await getAuth(ctx);
    if (!auth) return [];

    const userId = auth.subject;
    console.log("[listChats] Fetching chats for user:", userId);
    
    // Get user info to check role
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .unique();
    
    if (!user) {
      console.log("[listChats] User not found in the database:", userId);
      return [];
    }
    
    console.log("[listChats] Found user in database:", user._id, user.name || user.email, "clerkId:", user.clerkId);
    
    // Get admin status - this should only be determined server-side
    const isAdmin = user?.role === "admin"; // Treat undefined role as non-admin
    
    // Get all chats, then we'll filter in memory for more reliable results
    const allChats = await ctx.db.query("chats").collect();
    console.log(`[listChats] Found ${allChats.length} total chats in the database`);
    
    // Filter for user's chats locally for reliability
    let userChats = allChats;
    
    if (!isAdmin) {
      // Non-admin user - only show chats they participate in or created
      userChats = allChats.filter(chat => {
        const isCreator = chat.createdBy === userId;
        const isParticipant = Array.isArray(chat.participants) && chat.participants.includes(userId);
        return isCreator || isParticipant;
      });
    }
    
    console.log(`[listChats] After filtering, found ${userChats.length} chats for user ${userId}`);
    
    // Rest of function to get message details
    if (userChats.length === 0) {
      return [];
    }
    
    // Get all users in one query to avoid N+1 queries
    const allUsers = await ctx.db
      .query("users")
      .collect();
    
    // Create a map of clerkId to user info for quick lookups
    const userMap = new Map();
    for (const u of allUsers) {
      if (u.clerkId) {
        userMap.set(u.clerkId, u);
      }
    }
    
    // For each chat, get the last message and unread count
    const result = await Promise.all(
      userChats.map(async (chat) => {
        // Get the latest message
        const messages = await ctx.db
          .query("messages")
          .withIndex("by_chatId_timestamp", (q) => 
            q.eq("chatId", chat._id)
          )
          .collect();
        
        // Sort messages by timestamp (newest first)
        const sortedMessages = [...messages].sort(
          (a, b) => b.timestamp - a.timestamp
        );
        
        const lastMessage = sortedMessages[0];
        
        // Count unread messages
        const unreadMessages = messages.filter(
          (message) => 
            !message.read || !message.read.includes(userId)
        );
        
        // Get participant info
        const participantsInfo = chat.participants.map(participantId => {
          const participantUser = userMap.get(participantId);
          if (!participantUser) {
            return { clerkId: participantId };
          }
          
          return {
            clerkId: participantId,
            name: participantUser.name,
            email: participantUser.email,
            imageUrl: participantUser.imageUrl,
            role: participantUser.role,
          };
        });
        
        // For admin users, adjust the chat name to show the name of the user who created the chat
        let chatName = chat.name;
        if (isAdmin && userId !== chat.createdBy) {
          const chatCreator = userMap.get(chat.createdBy);
          if (chatCreator) {
            chatName = chatCreator.name || chatCreator.email || "Unknown User";
          }
        }
        
        // Get sender name for last message
        let senderName;
        if (lastMessage && lastMessage.sender) {
          const senderUser = userMap.get(lastMessage.sender);
          senderName = senderUser?.name || senderUser?.email || "Unknown";
        }
        
        const isUserCreator = chat.createdBy === userId;
        const isUserParticipant = chat.participants.includes(userId);
        
        console.log(`[listChats] Chat ${chat._id} - isCreator: ${isUserCreator}, isParticipant: ${isUserParticipant}`);
        
        return {
          _id: chat._id,
          name: chatName,
          participants: chat.participants,
          participantsInfo,
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                timestamp: lastMessage.timestamp,
                sender: lastMessage.sender,
                senderName,
                isAdmin: lastMessage.isAdmin || false,
                isSystemMessage: lastMessage.isSystemMessage || false,
              }
            : undefined,
          unreadCount: unreadMessages.length,
          updatedAt: chat.updatedAt || chat.createdAt || 0,
          // Provide the admin status securely from the server
          isUserAdmin: isAdmin,
          // Add participant flag for clarity
          isUserParticipant: isUserParticipant,
          // Add creator flag
          isCreator: isUserCreator,
        };
      })
    );
    
    // Sort by last message timestamp (most recent first)
    return result.sort((a, b) => {
      const timestampA = a.updatedAt || 0;
      const timestampB = b.updatedAt || 0;
      return timestampB - timestampA;
    });
  },
});

/**
 * Get messages for a specific chat
 */
export const getMessages = query({
  args: {
    chatId: v.id("chats"),
  },
  returns: v.array(
    v.object({
      _id: v.id("messages"),
      content: v.string(),
      sender: v.string(),
      timestamp: v.number(),
      isRead: v.boolean(),
      isAdmin: v.boolean(),
      isSystemMessage: v.optional(v.boolean()),
    })
  ),
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx);
    if (!auth) return [];

    const userId = auth.subject;
    
    // Get user info to check role
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .unique();
    
    // Verify chat exists
    const chat = await ctx.db.get(args.chatId);
    if (!chat) return [];
    
    // Check if user is a participant or an admin
    const isParticipant = chat.participants.includes(userId);
    const isAdmin = user?.role === "admin"; // Treat undefined role as non-admin
    
    if (!isParticipant && !isAdmin) {
      console.warn(`Security warning: User ${userId} attempted to access chat ${args.chatId} without being a participant or admin`);
      return [];
    }
    
    // Get messages
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .collect();
    
    // Sort by timestamp (oldest first for chronological display)
    const sortedMessages = [...messages]
      .sort((a, b) => a.timestamp - b.timestamp);
    
    // Need to get sender info to properly determine if a message was sent by an admin
    const senderIds = new Set(messages.map(m => m.sender));
    const senderUsers = await Promise.all(
      [...senderIds].map(async (senderId) => {
        return await ctx.db
          .query("users")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", senderId))
          .unique();
      })
    );
    
    // Create a map of clerkId to user role for quick lookups
    const userRoleMap = new Map();
    for (const sender of senderUsers) {
      if (sender?.clerkId) {
        userRoleMap.set(sender.clerkId, sender.role);
      }
    }
    
    return sortedMessages.map((message) => {
      // Check if the message sender is an admin based on server data
      const senderRole = userRoleMap.get(message.sender);
      const isAdminSender = senderRole === "admin";
      
      return {
        _id: message._id,
        content: message.content,
        sender: message.sender,
        timestamp: message.timestamp,
        isRead: message.read?.includes(userId) || false,
        // Ensure isAdmin flag is set based on server-validated role
        isAdmin: message.isAdmin || isAdminSender,
        isSystemMessage: message.isSystemMessage || false,
      };
    });
  },
});

/**
 * Get detailed information about a chat
 */
export const getChat = query({
  args: {
    chatId: v.id("chats"),
  },
  returns: v.object({
    _id: v.id("chats"),
    name: v.string(),
    participants: v.array(v.string()),
    participantsInfo: v.array(
      v.object({
        clerkId: v.string(),
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        role: v.optional(v.string()),
      })
    ),
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx);
    if (!auth) throw new Error("Not authenticated");

    const userId = auth.subject;
    
    // Get user info to check role
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .unique();
    
    // Verify chat exists
    const chat = await ctx.db.get(args.chatId);
    if (!chat) throw new Error("Chat not found");
    
    // Check if user is a participant or an admin
    const isParticipant = chat.participants.includes(userId);
    const isAdmin = user?.role === "admin"; // Treat undefined role as non-admin
    
    if (!isParticipant && !isAdmin) {
      throw new Error("Not a participant in this chat");
    }
    
    // Get all users for participants
    const allUserDocs = await ctx.db
      .query("users")
      .collect();
    
    // Create a map of clerkId to user info for quick lookups
    const userMap = new Map();
    for (const u of allUserDocs) {
      if (u.clerkId) {
        userMap.set(u.clerkId, u);
      }
    }
    
    // Map participants to their info
    const participantsInfo = chat.participants.map(participantId => {
      const participantUser = userMap.get(participantId);
      if (!participantUser) {
        return { clerkId: participantId };
      }
      
      return {
        clerkId: participantId,
        name: participantUser.name,
        email: participantUser.email,
        imageUrl: participantUser.imageUrl,
        role: participantUser.role,
      };
    });
    
    return {
      _id: chat._id,
      name: chat.name,
      participants: chat.participants,
      participantsInfo,
      createdBy: chat.createdBy,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt || chat.createdAt,
    };
  },
});

/**
 * Get all chats for the current user, with a direct reliable approach
 */
export const getUserChats = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("chats"),
      name: v.string(),
      createdBy: v.string(),
      participants: v.array(v.string()),
    })
  ),
  handler: async (ctx) => {
    const auth = await getAuth(ctx);
    if (!auth) return [];

    const userId = auth.subject;
    console.log("DIRECT getUserChats query for user:", userId);
    
    // Get all chats - we'll filter manually for reliability
    const allChats = await ctx.db.query("chats").collect();
    
    // Filter for chats where the user is the creator OR a participant
    const userChats = allChats.filter(chat => {
      return chat.createdBy === userId || 
             (chat.participants && chat.participants.includes(userId));
    });
    
    console.log(`Found ${userChats.length} chats for user ${userId} out of ${allChats.length} total`);
    
    // Log the details of each chat for debugging
    userChats.forEach(chat => {
      console.log(`Chat ${chat._id}:`);
      console.log(`  Name: ${chat.name}`);
      console.log(`  Creator: ${chat.createdBy} (matches user: ${chat.createdBy === userId})`);
      console.log(`  Participants: ${JSON.stringify(chat.participants)}`);
      console.log(`  User in participants: ${chat.participants.includes(userId)}`);
    });
    
    return userChats;
  },
});

/**
 * Delete a chat and all its associated messages
 */
export const deleteChat = mutation({
  args: {
    chatId: v.id("chats"),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx);
    if (!auth) throw new Error("Authentication required");

    const userId = auth.subject;
    
    // Get user info to check role
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .unique();
    
    // Verify chat exists
    const chat = await ctx.db.get(args.chatId);
    if (!chat) throw new Error("Chat not found");
    
    // Check if user is the creator or an admin
    const isCreator = chat.createdBy === userId;
    const isAdmin = user?.role === "admin"; // Treat undefined role as non-admin
    
    if (!isCreator && !isAdmin) {
      console.warn(`Security warning: User ${userId} attempted to delete chat ${args.chatId} without being the creator or an admin`);
      throw new Error("You can only delete chats you created");
    }
    
    // Delete all messages in the chat
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .collect();
    
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
    
    // Delete any typing statuses for this chat
    const typingStatuses = await ctx.db
      .query("typingStatus")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .collect();
    
    for (const status of typingStatuses) {
      await ctx.db.delete(status._id);
    }
    
    // Finally, delete the chat itself
    await ctx.db.delete(args.chatId);
    
    return true;
  },
}); 