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
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx);
    if (!auth) throw new Error("Not authenticated");

    const creatorId = auth.subject;
    console.log(`[createChat] Creating chat "${args.name}" by user ${creatorId}`);
    console.log(`[createChat] User ID exact value: ${JSON.stringify(creatorId)}`);
    
    // Get user info to check if they're an admin
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", creatorId))
      .unique();
    
    const isAdmin = currentUser?.role === "admin";
    console.log(`[createChat] User is admin: ${isAdmin}`);
    
    // Set up participants - always include creator
    let participantIds = args.participantIds ? [...args.participantIds] : [];
    
    // Adding creator as a participant regardless 
    // ALWAYS use the exact ID from auth without modification
    if (!participantIds.includes(creatorId)) {
      participantIds.push(creatorId);
    }
    
    console.log(`[createChat] Chat participants: ${JSON.stringify(participantIds)}`);
    
    // Create the chat (we'll let the chat header handle the display name)
    // Set default name, but it will be displayed based on participants
    const chat = await ctx.db.insert("chats", {
      name: "New Chat",
      createdBy: creatorId,  // Use the exact ID from auth
      participantIds: participantIds,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Add initial message if provided
    if (args.initialMessage) {
      await ctx.db.insert("messages", {
        chatId: chat,
        content: args.initialMessage,
        sender: "support", // Use "support" instead of the user's ID
        timestamp: Date.now(),
        read: [creatorId],  // The creator has read the message
        isSystemMessage: true, // Mark as system message
      });
    }
    
    console.log(`[createChat] Created chat with ID: ${chat}`);
    return chat;
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
    const isParticipant = chat.participantIds.includes(userId);
    const isAdmin = user?.role === "admin"; // Treat undefined role as non-admin
    
    if (!isParticipant && !isAdmin) {
      console.warn(`Security warning: User ${userId} attempted to send message to chat ${args.chatId} without being a participant or admin`);
      throw new Error("You are not a participant in this chat");
    }
    
    // Add security validation for message content
    // Check for potential XSS or script injection
    const suspiciousPatterns = [
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      /javascript:/gi,
      /on\w+=(["'])[\s\S]*?\1/gi,
      /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
      /<img[\s\S]*?onerror[\s\S]*?>/gi
    ];

    const hasSuspiciousContent = suspiciousPatterns.some(pattern => 
      pattern.test(args.content)
    );

    if (hasSuspiciousContent) {
      console.warn(`SECURITY WARNING: User ${userId} attempted to send potentially malicious content to chat ${args.chatId}`);
      throw new Error("Message contains potentially unsafe content");
    }
    
    // Implement basic rate limiting
    // Get recent messages from this user to check for flooding
    const recentTimeWindow = Date.now() - 10000; // Last 10 seconds
    const recentMessages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", q => q.eq("chatId", args.chatId))
      .filter(q => q.eq(q.field("sender"), userId) && q.gt(q.field("timestamp"), recentTimeWindow))
      .collect();

    // If user has sent more than 5 messages in the last 10 seconds, reject the request
    if (recentMessages.length >= 5) {
      console.warn(`SECURITY WARNING: Rate limit exceeded - User ${userId} sent more than 5 messages in 10 seconds`);
      throw new Error("You're sending messages too quickly. Please wait a moment and try again.");
    }
    
    // Create updates object for the chat
    let chatUpdates: any = { updatedAt: Date.now() };
    
    // If the sender is not already in participants, add them
    if (!isParticipant) {
      console.log(`[sendMessage] Adding sender ${userId} to participants for chat ${args.chatId}`);
      chatUpdates.participantIds = [...chat.participantIds, userId];
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
    
    // Update the chat
    await ctx.db.patch(args.chatId, chatUpdates);
    
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
    const isParticipant = chat.participantIds.includes(userId);
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
    
    if (!chat.participantIds.includes(userId)) {
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
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx);
    if (!auth) throw new Error("Not authenticated");

    const userId = auth.subject;
    console.log(`[markMessagesAsRead] Marking messages as read in chat ${args.chatId} for user ${userId}`);
    
    // Verify chat exists and user is a participant
    const chat = await ctx.db.get(args.chatId);
    if (!chat) {
      console.warn(`[markMessagesAsRead] Chat ${args.chatId} not found`);
      throw new Error("Chat not found");
    }
    
    // Check if user is actually a participant in this chat
    const isParticipant = chat.participantIds.includes(userId);
    
    // Get user info to check if they're an admin
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .unique();
    
    const isAdmin = currentUser?.role === "admin";
    
    if (!isParticipant && !isAdmin) {
      console.warn(`SECURITY WARNING: User ${userId} attempted to mark messages as read in chat ${args.chatId} without being a participant`);
      throw new Error("Access denied. You are not a participant in this chat.");
    }
    
    // Get all messages in this chat
    const allMessages = await ctx.db
      .query("messages")
      .withIndex("by_chatId_timestamp", (q) => q.eq("chatId", args.chatId))
      .collect();
    
    console.log(`[markMessagesAsRead] Found ${allMessages.length} total messages in chat`);
    
    // Filter locally for messages that need to be updated
    const messagesToUpdate = allMessages.filter(message => {
      // Skip messages sent by the current user
      if (message.sender === userId) return false;
      
      // Check if read field exists and is an array
      const readField = message.read;
      if (!readField || !Array.isArray(readField)) {
        return true; // Message has no read field or it's not an array, so it needs updating
      }
      
      // Check if user is not in the read array
      return !readField.includes(userId);
    });
    
    console.log(`[markMessagesAsRead] Marking ${messagesToUpdate.length} messages as read by user ${userId}`);
    
    // Update each message to mark as read
    await Promise.all(
      messagesToUpdate.map(async (message) => {
        // Ensure read is always an array
        const read = Array.isArray(message.read) ? message.read : [];
        await ctx.db.patch(message._id, {
          read: [...read, userId],
        });
      })
    );
    
    return null;
  },
});

/**
 * List all chats for the current user
 */
export const listChats = query({
  handler: async (ctx) => {
    const auth = await getAuth(ctx);
    if (!auth) return [];

    const userId = auth.subject;
    console.log(`[listChats] Looking up chats for user: ${userId}`);
    console.log(`[listChats] User ID exact value: ${JSON.stringify(userId)}`);
    
    // Get current user to check if they're an admin
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .unique();
    
    const isAdmin = currentUser?.role === "admin";
    console.log(`[listChats] User is admin: ${isAdmin}`);
    
    let chats;
    
    if (isAdmin) {
      // Admins can see all chats
      console.log(`[listChats] Fetching all chats for admin user`);
      chats = await ctx.db.query("chats").collect();
      console.log(`[listChats] Found ${chats.length} total chats for admin`);
    } else {
      // CRITICAL FIX: We'll query all chats and filter manually to handle potential ID format differences
      console.log(`[listChats] Fetching all chats to manually filter for user ${userId}`);
      const allChats = await ctx.db.query("chats").collect();
      
      // Helper function to check if IDs might match despite format differences
      const isAuthorizedUser = (id: string) => {
        if (!id || !userId) return false;
        return id === userId; // Only exact matches are allowed
      };
      
      // Filter for chats where the user is the creator OR a participant
      chats = allChats.filter(chat => {
        return chat.createdBy === userId || 
               (chat.participantIds && chat.participantIds.includes(userId));
      });
      
      console.log(`[listChats] Found ${chats.length} chats for regular user ${userId} after manual filtering`);
      
      // Log the chats that were found for debugging
      chats.forEach((chat, index) => {
        console.log(`[listChats] Chat ${index + 1}: ID=${chat._id}, Name=${chat.name}`);
        console.log(`[listChats] -- Creator: ${chat.createdBy}`);
        console.log(`[listChats] -- Participants: ${JSON.stringify(chat.participantIds)}`);
      });
    }
    
    // Get all unique participant IDs from all chats
    const allParticipantIds = new Set<string>();
    for (const chat of chats) {
      for (const participantId of chat.participantIds) {
        allParticipantIds.add(participantId);
      }
    }
    
    // Fetch all participants' information in a single query
    const participantsInfo = new Map();
    const userRecords = await Promise.all(
      Array.from(allParticipantIds).map(async (participantId) => {
        // Try to match by exact ID
        const exactMatch = await ctx.db
          .query("users")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", participantId))
          .unique();
        
        if (exactMatch) return exactMatch;
        
        // If no exact match, try to find by the last part of the ID
        // This is a fallback to handle potential ID format differences
        const idPart = participantId.split('_').pop();
        if (!idPart) return null;
        
        const users = await ctx.db.query("users").collect();
        return users.find(u => u.clerkId && u.clerkId.split('_').pop() === idPart) || null;
      })
    );
    
    // Create a map of participant ID to user info
    userRecords.forEach((user) => {
      if (user) {
        participantsInfo.set(user.clerkId, {
          clerkId: user.clerkId,
          name: user.name,
          email: user.email,
          imageUrl: user.imageUrl,
          role: user.role,
        });
      }
    });
    
    // Process each chat to include participant info and last message
    const processedChats = await Promise.all(
      chats.map(async (chat) => {
        // Helper function to check if IDs might match
        const isAuthorizedThisUser = (id: string) => {
          if (!id || !userId) return false;
          return id === userId;
        };
      
        // Get the most recent message for this chat
        const latestMessages = await ctx.db
          .query("messages")
          .withIndex("by_chatId_timestamp", (q) => 
            q.eq("chatId", chat._id)
          )
          .order("desc")
          .take(1);
        
        const lastMessage = latestMessages.length > 0 ? latestMessages[0] : null;
        
        // Format participants info - exclude the current user
        const chatParticipantsInfo = chat.participantIds
          .filter((id) => !isAuthorizedThisUser(id)) // Exclude current user with flexible matching
          .map((id) => {
            // Try to find this participant's info
            const info = participantsInfo.get(id);
            if (info) return info;
            
            // Try matching by the last part of the ID
            const idPart = id.split('_').pop();
            if (!idPart) return null;
            
            for (const [key, value] of participantsInfo.entries()) {
              if (key.split('_').pop() === idPart) {
                return value;
              }
            }
            
            return null;
          });
        
        // For non-admin users viewing threads with admin messages, we need to ensure admin info is included
        if (!isAdmin) {
          // Check if there are any messages and if any admin is already in the participants list
          const hasAdminParticipant = chatParticipantsInfo.some(p => p && p.role === "admin");
          
          if (lastMessage && !hasAdminParticipant) {
            console.log(`[listChats] Chat ${chat._id} has messages but no admin in participants`);
            
            // Get the list of admins from our user records
            const admins = Array.from(participantsInfo.values()).filter(p => p.role === "admin");
            
            if (admins.length > 0) {
              // Get the admin who created this chat or the first admin
              const preferredAdmin = admins.find(admin => admin.clerkId === chat.createdBy) || admins[0];
              
              if (preferredAdmin) {
                console.log(`[listChats] Adding admin ${preferredAdmin.name} to chat ${chat._id} participants for UI display`);
                chatParticipantsInfo.push(preferredAdmin);
              }
            }
          }
        }
        
        // Return the chat with participant info and last message
        return {
          ...chat,
          participantsInfo: chatParticipantsInfo,
          lastMessageContent: lastMessage?.content,
          lastMessageSender: lastMessage?.sender,
          lastMessageTimestamp: lastMessage?.timestamp,
        };
      })
    );
    
    // Sort by most recent activity
    return processedChats.sort((a, b) => {
      const aTime = a.lastMessageTimestamp || a.updatedAt || a.createdAt;
      const bTime = b.lastMessageTimestamp || b.updatedAt || b.createdAt;
      return bTime - aTime;
    });
  },
});

/**
 * Get messages for a chat
 */
export const getMessages = query({
  args: { chatId: v.string() },
  handler: async (ctx, { chatId }) => {
    const auth = await getAuth(ctx);
    if (!auth) return [];

    const userId = auth.subject;
    console.log(`[getMessages] Getting messages for chat ${chatId}, user: ${userId}`);
    console.log(`[getMessages] User ID exact value: ${JSON.stringify(userId)}`);
    
    // Get current user to check if they're an admin
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .unique();
    
    const isAdmin = currentUser?.role === "admin";
    console.log(`[getMessages] User is admin: ${isAdmin}`);
    
    // First, check if chat exists
    const chat = await ctx.db.get(chatId);
    if (!chat) {
      console.log(`[getMessages] Chat ${chatId} not found`);
      return [];
    }
    
    // For non-admins, verify strict access rights
    if (!isAdmin) {
      // For non-admins, check if user is a participant with strict equality
      const userIsParticipant = chat.participantIds.includes(userId);
      const userIsCreator = chat.createdBy === userId;
      
      console.log(`[getMessages] User is participant: ${userIsParticipant}, User is creator: ${userIsCreator}`);
      
      if (!userIsParticipant && !userIsCreator) {
        console.warn(`SECURITY WARNING: User ${userId} attempted to access messages in chat ${chatId} without permission`);
        throw new Error("Access denied. You are not authorized to view this chat.");
      }
    }
    
    // Retrieve messages for the chat
    console.log(`[getMessages] Fetching messages for chat ${chatId}`);
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId_timestamp", (q) => q.eq("chatId", chatId))
      .order("asc")
      .collect();
    
    console.log(`[getMessages] Found ${messages.length} messages for chat ${chatId}`);
    if (messages.length > 0) {
      console.log(`[getMessages] First message: ${messages[0].content}`);
      console.log(`[getMessages] Last message: ${messages[messages.length - 1].content}`);
    }
    
    // Get all unique sender IDs from all messages
    const senderIds = new Set<string>();
    for (const message of messages) {
      senderIds.add(message.sender);
    }
    
    // Fetch all senders' information in a single query
    const sendersInfo = new Map();
    const userRecords = await Promise.all(
      Array.from(senderIds).map(async (senderId) => {
        // Try to match by exact ID
        const exactMatch = await ctx.db
          .query("users")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", senderId))
          .unique();
        
        if (exactMatch) return exactMatch;
        
        // If no exact match, try to find by the last part of the ID
        const idPart = senderId.split('_').pop();
        if (!idPart) return null;
        
        const users = await ctx.db.query("users").collect();
        return users.find(u => u.clerkId && u.clerkId.split('_').pop() === idPart) || null;
      })
    );
    
    // Create a map of sender ID to user info
    userRecords.forEach((user) => {
      if (user) {
        sendersInfo.set(user.clerkId, {
          clerkId: user.clerkId,
          name: user.name,
          email: user.email,
          imageUrl: user.imageUrl,
          role: user.role,
        });
      }
    });
    
    // Return messages with sender info
    return messages.map((message) => {
      const senderInfo = sendersInfo.get(message.sender);
      
      // If no direct match, try to find by ID suffix
      let matchedSenderInfo = senderInfo;
      if (!matchedSenderInfo) {
        const messageSenderIdSuffix = message.sender.split('_').pop();
        for (const [key, value] of sendersInfo.entries()) {
          if (key.split('_').pop() === messageSenderIdSuffix) {
            matchedSenderInfo = value;
            break;
          }
        }
      }
      
      // If still no match and it's an admin, get the current user who's an admin
      if (!matchedSenderInfo && message.isAdmin) {
        // For admin messages with no sender info, try to find an admin user
        for (const [key, value] of sendersInfo.entries()) {
          if (value.role === "admin") {
            matchedSenderInfo = value;
            break;
          }
        }
      }
      
      // Default sender info if all else fails
      const defaultSenderInfo = {
        clerkId: message.sender,
        name: message.isAdmin ? "Admin" : (message.isSystemMessage ? "Support" : "Unknown User"),
        email: "unknown@example.com",
        imageUrl: "",
        role: message.isAdmin ? "admin" : "user",
      };
      
      return {
        ...message,
        senderInfo: matchedSenderInfo || defaultSenderInfo,
        isCurrentUser: message.sender === userId || 
          (message.sender.split('_').pop() === userId.split('_').pop()),
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
  // Dynamically return either null or a chat object
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("chats"),
      name: v.string(),
      participantIds: v.array(v.string()),
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
    })
  ),
  handler: async (ctx, args) => {
    try {
      const auth = await getAuth(ctx);
      if (!auth) return null; // Return null instead of throwing an error

      const userId = auth.subject;
      
      // Get user info to check role
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
        .unique();
      
      // Verify chat exists
      const chat = await ctx.db.get(args.chatId);
      if (!chat) {
        console.warn(`Chat not found: ${args.chatId}`);
        return null; // Return null instead of throwing an error
      }
      
      // Check if user is a participant or an admin with strict equality
      const isParticipant = chat.participantIds.includes(userId);
      const isCreator = chat.createdBy === userId;
      const isAdmin = user?.role === "admin"; // Treat undefined role as non-admin
      
      if (!isParticipant && !isCreator && !isAdmin) {
        console.warn(`SECURITY WARNING: User ${userId} attempted to access chat ${args.chatId} without permission`);
        return null; // Return null instead of throwing an error
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
      
      // Get details for all participants
      const participantsInfo = await Promise.all(
        chat.participantIds.map(async (userId) => {
          const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
            .unique();
          
          if (user) {
            return {
              clerkId: user.clerkId,
              name: user.name,
              email: user.email,
              imageUrl: user.imageUrl,
              role: user.role,
            };
          }
          return {
            clerkId: userId,
          };
        })
      );
      
      // Remove any system fields not in our validator
      const { _creationTime, ...cleanChat } = chat;
      
      return {
        ...cleanChat,
        participantsInfo,
      };
    } catch (error) {
      console.error(`Error in getChat: ${error}`);
      return null; // Return null for any other errors
    }
  },
});

/**
 * Get all chats for the current user (alternative method)
 */
export const getUserChats = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("chats"),
      name: v.string(),
      createdBy: v.string(),
      participantIds: v.array(v.string()),
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
             (chat.participantIds && chat.participantIds.includes(userId));
    });
    
    console.log(`Found ${userChats.length} chats for user ${userId} out of ${allChats.length} total`);
    
    // Log the details of each chat for debugging
    userChats.forEach(chat => {
      console.log(`Chat ${chat._id}:`);
      console.log(`  Name: ${chat.name}`);
      console.log(`  Creator: ${chat.createdBy} (matches user: ${chat.createdBy === userId})`);
      console.log(`  Participants: ${JSON.stringify(chat.participantIds)}`);
      console.log(`  User in participants: ${chat.participantIds.includes(userId)}`);
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
    
    // For security, only the creator or admins can delete chats
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

/**
 * Query to get the count of unread messages for all chats
 * Returns a map of chatId -> unread count 
 */
export const getUnreadMessageCounts = query({
  handler: async (ctx) => {
    const identity = await getAuth(ctx);
    if (!identity) return {};
    
    const userId = identity.subject;
    console.log(`[getUnreadMessageCounts] Checking unread messages for user ${userId}`);
    
    // Get all chats for proper ID matching
    const allChats = await ctx.db.query("chats").collect();
    
    // Helper function to check if IDs might match despite format differences
    const isAuthorizedUser = (id: string) => {
      if (!id || !userId) return false;
      return id === userId; // Only exact matches are allowed
    };
    
    // Filter for chats that include this user (exact match only)
    const chats = allChats.filter(chat => {
      return chat.createdBy === userId || 
             (chat.participantIds && chat.participantIds.includes(userId));
    });
    
    console.log(`[getUnreadMessageCounts] Found ${chats.length} chats for user ${userId}`);
    
    // Initialize result object
    const unreadCounts: Record<Id<"chats">, number> = {};
    
    // Count unread messages for each chat
    for (const chat of chats) {
      // Get all messages in this chat that weren't sent by the current user
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_chatId", (q) => 
          q.eq("chatId", chat._id)
        )
        .collect();
      
      // Count messages that haven't been read by the current user and weren't sent by them
      // Using the suffix matching for both sender and read checks
      const unreadCount = messages.filter(msg => {
        // Check if message was sent by current user (using suffix matching)
        const isSentByUser = isAuthorizedUser(msg.sender);
        if (isSentByUser) return false;
        
        // Check if message has been read by current user
        const readBy = msg.read || [];
        
        // For each ID in the read list, check if it might be the current user
        const hasBeenReadByUser = readBy.some(readId => isAuthorizedUser(readId));
        
        return !hasBeenReadByUser;
      }).length;
      
      if (unreadCount > 0) {
        console.log(`[getUnreadMessageCounts] Chat ${chat._id} has ${unreadCount} unread messages`);
        // Only add to the result if there are unread messages
        unreadCounts[chat._id] = unreadCount;
      }
    }
    
    return unreadCounts;
  },
});

/**
 * Utility to fix and standardize user IDs in the database
 */
export const fixDatabase = mutation({
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
      throw new Error("Only admins can run this utility");
    }
    
    console.log("Starting database ID fix utility...");
    
    // Get all users to build ID mapping
    const users = await ctx.db.query("users").collect();
    console.log(`Found ${users.length} users total`);
    
    // Build a map of ID suffixes to full Clerk IDs
    const idMapping = new Map<string, string>();
    for (const user of users) {
      if (user.clerkId) {
        const idSuffix = user.clerkId.split('_').pop();
        if (idSuffix) {
          idMapping.set(idSuffix, user.clerkId);
        }
      }
    }
    
    console.log(`Created mapping for ${idMapping.size} unique user IDs`);
    
    // Fix chats
    const chats = await ctx.db.query("chats").collect();
    console.log(`Processing ${chats.length} chats...`);
    
    let chatsUpdated = 0;
    for (const chat of chats) {
      let needsUpdate = false;
      const updatedParticipantIds = [...chat.participantIds];
      
      // Check if creator ID needs fixing
      if (chat.createdBy) {
        const creatorSuffix = chat.createdBy.split('_').pop();
        if (creatorSuffix && idMapping.has(creatorSuffix) && idMapping.get(creatorSuffix) !== chat.createdBy) {
          console.log(`Fixing creator ID for chat ${chat._id} from ${chat.createdBy} to ${idMapping.get(creatorSuffix)}`);
          await ctx.db.patch(chat._id, {
            createdBy: idMapping.get(creatorSuffix)
          });
          needsUpdate = true;
        }
      }
      
      // Check if participant IDs need fixing
      for (let i = 0; i < chat.participantIds.length; i++) {
        const participantId = chat.participantIds[i];
        const participantSuffix = participantId.split('_').pop();
        
        if (participantSuffix && idMapping.has(participantSuffix) && idMapping.get(participantSuffix) !== participantId) {
          updatedParticipantIds[i] = idMapping.get(participantSuffix)!;
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        console.log(`Updating participants for chat ${chat._id}`);
        console.log(`Before: ${JSON.stringify(chat.participantIds)}`);
        console.log(`After: ${JSON.stringify(updatedParticipantIds)}`);
        
        await ctx.db.patch(chat._id, {
          participantIds: updatedParticipantIds
        });
        
        chatsUpdated++;
      }
    }
    
    // Fix messages
    const messages = await ctx.db.query("messages").collect();
    console.log(`Processing ${messages.length} messages...`);
    
    let messagesUpdated = 0;
    for (const message of messages) {
      let needsUpdate = false;
      let updatedSender = message.sender;
      const updatedRead = [...(message.read || [])];
      
      // Check if sender ID needs fixing
      if (message.sender) {
        const senderSuffix = message.sender.split('_').pop();
        if (senderSuffix && idMapping.has(senderSuffix) && idMapping.get(senderSuffix) !== message.sender) {
          updatedSender = idMapping.get(senderSuffix)!;
          needsUpdate = true;
        }
      }
      
      // Check if read IDs need fixing
      if (message.read) {
        for (let i = 0; i < message.read.length; i++) {
          const readId = message.read[i];
          const readSuffix = readId.split('_').pop();
          
          if (readSuffix && idMapping.has(readSuffix) && idMapping.get(readSuffix) !== readId) {
            updatedRead[i] = idMapping.get(readSuffix)!;
            needsUpdate = true;
          }
        }
      }
      
      if (needsUpdate) {
        const updates: Record<string, any> = {};
        
        if (updatedSender !== message.sender) {
          updates.sender = updatedSender;
        }
        
        if (JSON.stringify(updatedRead) !== JSON.stringify(message.read)) {
          updates.read = updatedRead;
        }
        
        console.log(`Updating message ${message._id}`);
        await ctx.db.patch(message._id, updates);
        messagesUpdated++;
      }
    }
    
    return {
      success: true,
      chatsUpdated,
      messagesUpdated,
      usersMapped: idMapping.size,
    };
  },
});

/**
 * Get all chats - admin only
 */
export const getAllChats = query({
  handler: async (ctx) => {
    const auth = await getAuth(ctx);
    if (!auth) return [];

    const userId = auth.subject;
    
    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .unique();
    
    // Only admins can list all chats
    if (user?.role !== "admin") {
      console.log("[getAllChats] Non-admin attempted to access all chats:", userId);
      return [];
    }
    
    // For admins, return all chats
    const chats = await ctx.db.query("chats").collect();
    console.log(`[getAllChats] Admin ${userId} retrieved ${chats.length} chats`);
    
    return chats;
  },
});

/**
 * Get all messages - admin only
 */
export const getAllMessages = query({
  handler: async (ctx) => {
    const auth = await getAuth(ctx);
    if (!auth) return [];

    const userId = auth.subject;
    
    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .unique();
    
    // Only admins can list all messages
    if (user?.role !== "admin") {
      console.log("[getAllMessages] Non-admin attempted to access all messages:", userId);
      return [];
    }
    
    // For admins, return all messages
    const messages = await ctx.db.query("messages").collect();
    console.log(`[getAllMessages] Admin ${userId} retrieved ${messages.length} messages`);
    
    return messages;
  },
});

/**
 * Update chat creator - admin only
 */
export const updateChatCreator = mutation({
  args: {
    chatId: v.id("chats"),
    creatorId: v.string(),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx);
    if (!auth) throw new Error("Not authenticated");

    const userId = auth.subject;
    
    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .unique();
    
    // Only admins can update chat creators
    if (user?.role !== "admin") {
      console.log("[updateChatCreator] Non-admin attempted to update chat creator:", userId);
      throw new Error("Admin access required");
    }
    
    // Update chat creator
    await ctx.db.patch(args.chatId, {
      createdBy: args.creatorId,
    });
    
    console.log(`[updateChatCreator] Admin ${userId} updated creator for chat ${args.chatId} to ${args.creatorId}`);
    
    return { success: true };
  },
});

/**
 * Update chat participants - admin only
 */
export const updateChatParticipants = mutation({
  args: {
    chatId: v.id("chats"),
    participantIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx);
    if (!auth) throw new Error("Not authenticated");

    const userId = auth.subject;
    
    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .unique();
    
    // Only admins can update chat participants
    if (user?.role !== "admin") {
      console.log("[updateChatParticipants] Non-admin attempted to update chat participants:", userId);
      throw new Error("Admin access required");
    }
    
    // Update chat participants
    await ctx.db.patch(args.chatId, {
      participantIds: args.participantIds,
    });
    
    console.log(`[updateChatParticipants] Admin ${userId} updated participants for chat ${args.chatId}`);
    
    return { success: true };
  },
});

/**
 * Update message - admin only
 */
export const updateMessage = mutation({
  args: {
    messageId: v.id("messages"),
    updates: v.object({
      sender: v.optional(v.string()),
      read: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    const auth = await getAuth(ctx);
    if (!auth) throw new Error("Not authenticated");

    const userId = auth.subject;
    
    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .unique();
    
    // Only admins can update messages directly
    if (user?.role !== "admin") {
      console.log("[updateMessage] Non-admin attempted to update message:", userId);
      throw new Error("Admin access required");
    }
    
    // Update message
    await ctx.db.patch(args.messageId, args.updates);
    
    console.log(`[updateMessage] Admin ${userId} updated message ${args.messageId}`);
    
    return { success: true };
  },
});

/**
 * Rename a chat
 */
export const renameChat = mutation({
  args: {
    chatId: v.id("chats"),
    newName: v.string(),
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
    
    // Check if user is the creator, a participant, or an admin
    const isCreator = chat.createdBy === userId;
    const isParticipant = chat.participantIds?.includes(userId) || false;
    const isAdmin = user?.role === "admin"; // Treat undefined role as non-admin
    
    // For security, only participants, the creator, or admins can rename chats
    if (!isCreator && !isParticipant && !isAdmin) {
      console.warn(`Security warning: User ${userId} attempted to rename chat ${args.chatId} without being a participant`);
      throw new Error("You can only rename chats you're part of");
    }
    
    // Validate the new name
    if (!args.newName.trim()) {
      throw new Error("Chat name cannot be empty");
    }
    
    // Update the chat with the new name
    await ctx.db.patch(args.chatId, { name: args.newName });
    
    return true;
  },
}); 