import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

/**
 * Store a new token in the chatTokens table
 */
export const storeToken = mutation({
  args: {
    userId: v.string(),
    tokenId: v.string(),
    refreshTokenId: v.string(),
    issuedAt: v.number(),
    expiresAt: v.number(),
    refreshExpiresAt: v.number(),
    isInvalidated: v.boolean()
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("chatTokens", {
      userId: args.userId,
      tokenId: args.tokenId,
      refreshTokenId: args.refreshTokenId,
      issuedAt: args.issuedAt,
      expiresAt: args.expiresAt,
      refreshExpiresAt: args.refreshExpiresAt,
      isInvalidated: args.isInvalidated
    });
  }
});

/**
 * Get a token by refresh token ID and user ID
 */
export const getByRefreshTokenId = query({
  args: {
    refreshTokenId: v.string(),
    userId: v.string()
  },
  handler: async (ctx, args): Promise<Doc<"chatTokens"> | null> => {
    const tokens = await ctx.db
      .query("chatTokens")
      .filter(q => 
        q.and(
          q.eq(q.field("refreshTokenId"), args.refreshTokenId),
          q.eq(q.field("userId"), args.userId)
        )
      )
      .collect();
    
    return tokens.length > 0 ? tokens[0] : null;
  }
});

/**
 * Update a token's ID and expiration time
 */
export const updateToken = mutation({
  args: {
    id: v.id("chatTokens"),
    newTokenId: v.string(),
    expiresAt: v.number()
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      tokenId: args.newTokenId,
      expiresAt: args.expiresAt
    });
  }
});

/**
 * Invalidate a token by its ID
 */
export const invalidateToken = mutation({
  args: {
    tokenId: v.string()
  },
  handler: async (ctx, args): Promise<Id<"chatTokens"> | null> => {
    const tokens = await ctx.db
      .query("chatTokens")
      .filter(q => q.eq(q.field("tokenId"), args.tokenId))
      .collect();
    
    if (tokens.length === 0) {
      return null;
    }
    
    const tokenId = tokens[0]._id;
    await ctx.db.patch(tokenId, { isInvalidated: true });
    return tokenId;
  }
});

/**
 * Invalidate all tokens for a user
 */
export const invalidateAllUserTokens = mutation({
  args: {
    userId: v.string()
  },
  handler: async (ctx, args): Promise<number> => {
    const tokens = await ctx.db
      .query("chatTokens")
      .filter(q => q.eq(q.field("userId"), args.userId))
      .collect();
    
    for (const token of tokens) {
      await ctx.db.patch(token._id, { isInvalidated: true });
    }
    
    return tokens.length;
  }
});

/**
 * Get a token by token ID and user ID
 */
export const getByTokenId = query({
  args: {
    tokenId: v.string(),
    userId: v.string()
  },
  handler: async (ctx, args): Promise<Doc<"chatTokens"> | null> => {
    const tokens = await ctx.db
      .query("chatTokens")
      .filter(q => 
        q.and(
          q.eq(q.field("tokenId"), args.tokenId),
          q.eq(q.field("userId"), args.userId)
        )
      )
      .collect();
    
    return tokens.length > 0 ? tokens[0] : null;
  }
});

/**
 * Internal function to clean up expired and invalidated tokens
 * Runs on a schedule to prevent token table from growing too large
 */
export const cleanupExpiredTokens = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // Get all tokens that are either:
    // 1. Expired (expiresAt < now)
    // 2. Invalidated (isInvalidated = true)
    // 3. Created more than 30 days ago (as a safety net)
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    
    // Delete tokens in batches to avoid timeout
    const tokensToDelete = await ctx.db
      .query("chatTokens")
      .filter(q => 
        q.or(
          q.lt(q.field("expiresAt"), now),
          q.eq(q.field("isInvalidated"), true),
          q.lt(q.field("_creationTime"), thirtyDaysAgo)
        )
      )
      .collect();
    
    console.log(`[cleanupExpiredTokens] Found ${tokensToDelete.length} tokens to delete`);
    
    // Delete tokens in parallel
    const deletePromises = tokensToDelete.map(token => 
      ctx.db.delete(token._id)
    );
    
    await Promise.all(deletePromises);
    
    return {
      deletedCount: tokensToDelete.length,
      timestamp: now
    };
  },
}); 