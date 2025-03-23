import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),
  
  // New table for Inngest results
  inngestResults: defineTable({
    eventId: v.string(),
    correlationId: v.optional(v.string()),
    function: v.string(),
    result: v.any(),
    timestamp: v.number(),
  }).index("by_eventId", ["eventId"])
    .index("by_function", ["function"])
    .index("by_correlationId", ["correlationId"]),
  
  // Users table for Clerk authentication
  users: defineTable({
    clerkId: v.string(), // The Clerk user ID
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    role: v.optional(v.string()), // User role: "user" or "admin" - optional for backward compatibility
    lastLoginAt: v.number(), // Timestamp of last login
    createdAt: v.number(), // Timestamp of user creation
    // Add any other user fields you need here
  }).index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),
  
  // Chat schemas
  chats: defineTable({
    name: v.string(),
    participantIds: v.array(v.string()), // Array of user IDs
    createdBy: v.string(), // User ID of the creator
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_participants", ["participantIds"])
    .index("by_createdBy", ["createdBy"])
    .index("by_createdAt", ["createdAt"]),
  
  messages: defineTable({
    chatId: v.id("chats"),
    content: v.string(),
    sender: v.string(), // User ID of sender
    timestamp: v.number(),
    read: v.optional(v.array(v.string())), // Array of user IDs who have read this message
    isAdmin: v.optional(v.boolean()), // Flag to identify admin messages
    isSystemMessage: v.optional(v.boolean()), // Flag to identify placeholder/system messages
  })
    .index("by_chatId", ["chatId"])
    .index("by_chatId_timestamp", ["chatId", "timestamp"]),

  // Typing status table
  typingStatus: defineTable({
    chatId: v.id("chats"),
    userId: v.string(), // User ID who is typing
    isTyping: v.boolean(),
    lastUpdated: v.number(), // Timestamp of last update
  })
    .index("by_chatId", ["chatId"])
    .index("by_chatId_userId", ["chatId", "userId"]),
    
  // Telegram thread mappings
  telegramThreadMappings: defineTable({
    chatId: v.id("chats"),
    telegramThreadId: v.number(),
    telegramAdminId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_chatId", ["chatId"])
    .index("by_telegramThreadId", ["telegramThreadId"]),
});
