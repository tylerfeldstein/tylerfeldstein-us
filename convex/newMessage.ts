"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * Action to trigger Inngest when a new customer message is detected
 * Only triggers for the first message in a chat thread (from a user)
 */
export const processNewMessage = action({
  args: {
    chatId: v.id("chats"),
    messageId: v.id("messages"),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    try {
      // Get chat and message details
      const chat = await ctx.runQuery(internal.newMessageQueries.getChatDetails, {
        chatId: args.chatId
      });
      
      if (!chat) {
        console.error(`[processNewMessage] Chat ${args.chatId} not found`);
        return false;
      }
      
      const message = await ctx.runQuery(internal.newMessageQueries.getMessageDetails, {
        messageId: args.messageId
      });
      
      if (!message) {
        console.error(`[processNewMessage] Message ${args.messageId} not found`);
        return false;
      }
      
      // Skip if this is a system or admin message
      if (message.isSystemMessage || message.isAdmin) {
        return false;
      }
      
      // Count existing non-system messages in this chat
      const messageCount = await ctx.runQuery(internal.newMessageQueries.getMessageCount, {
        chatId: args.chatId
      });
      
      // Only trigger for the first user message in a chat
      if (messageCount !== 1) {
        return false;
      }
      
      // Get sender info
      const senderName = await ctx.runQuery(internal.newMessageQueries.getSenderName, {
        senderId: message.sender
      });
      
      // Trigger Inngest event for lead detection
      const result = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/inngest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "chat/new-customer-message",
          data: {
            chatId: args.chatId,
            messageContent: message.content,
            senderName: senderName || "Unknown User",
            timestamp: message.timestamp || Date.now(),
          },
        }),
      });
      
      if (!result.ok) {
        console.error(`[processNewMessage] Failed to trigger Inngest event: ${result.status}`);
        return false;
      }
      
      console.log(`[processNewMessage] Successfully triggered lead detection for chat ${args.chatId}`);
      return true;
    } catch (error) {
      console.error("[processNewMessage] Error:", error);
      return false;
    }
  },
});
