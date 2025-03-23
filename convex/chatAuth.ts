import { DatabaseReader } from "./_generated/server";
import { ConvexError } from "convex/values";
import { JWTPayload } from "./types/jwt";

/**
 * Authenticate a user's chat access using a pre-verified token payload
 * @param ctx Convex database context
 * @param tokenPayload JWT token payload that was verified by NextJS
 * @returns User information from the token if valid
 * @throws ConvexError if token is invalid or expired
 */
export async function authenticateChatAccess(ctx: { db: DatabaseReader }, tokenPayload: JWTPayload) {
  // Check if the token has been invalidated
  const tokenRecord = await ctx.db
    .query("chatTokens")
    .filter(q => 
      q.eq(q.field("tokenId"), tokenPayload.jti) && 
      q.eq(q.field("userId"), tokenPayload.userId)
    )
    .first();
  
  if (!tokenRecord) {
    throw new ConvexError({
      code: 401,
      message: "Token not found in database"
    });
  }
  
  if (tokenRecord.isInvalidated) {
    throw new ConvexError({
      code: 401,
      message: "Token has been invalidated"
    });
  }
  
  // Return the user information from the token
  return {
    userId: tokenPayload.userId,
    userRole: tokenPayload.userRole,
  };
}

/**
 * Check if a user has admin privileges
 * @param userRole User role from token
 * @returns true if user is an admin
 */
export function isAdmin(userRole: string) {
  return userRole === "admin";
}

/**
 * Verify a user has access to a specific chat
 * @param ctx Convex database context
 * @param userId User ID
 * @param chatId Chat ID
 * @param userRole User role
 * @returns true if user has access
 * @throws ConvexError if user does not have access
 */
export async function verifyChatAccess(
  ctx: { db: DatabaseReader }, 
  userId: string, 
  chatId: any, 
  userRole: string
) {
  // Admins always have access to all chats
  if (isAdmin(userRole)) {
    return true;
  }
  
  // Check if the chat exists
  const chat = await ctx.db.get(chatId);
  if (!chat) {
    throw new ConvexError({
      code: 404,
      message: "Chat not found"
    });
  }
  
  // Use a proper type guard to check that this is a chat document
  if (!('participantIds' in chat) || !('createdBy' in chat)) {
    throw new ConvexError({
      code: 500,
      message: "Invalid document type"
    });
  }
  
  // Now TypeScript knows these properties exist
  const participantIds = chat.participantIds;
  const createdBy = chat.createdBy;
  
  const isParticipant = participantIds.includes(userId);
  const isCreator = createdBy === userId;
  
  if (!isParticipant && !isCreator) {
    throw new ConvexError({
      code: 403,
      message: "You do not have access to this chat"
    });
  }
  
  return true;
}

/**
 * Extract JWT token from headers
 * @param headers HTTP headers
 * @returns JWT token if present
 */
export function extractTokenFromHeaders(headers: Headers) {
  const authHeader = headers.get("authorization");
  if (!authHeader) {
    return undefined;
  }
  
  // Extract the token from the 'Bearer <token>' format
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return undefined;
  }
  
  return parts[1];
}
