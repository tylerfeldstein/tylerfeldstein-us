import { internalMutation } from "./_generated/server";

/**
 * Clean up expired typing statuses
 * This is called by a scheduled cron job
 */
export const cleanupTypingStatus = internalMutation({
  handler: async (ctx) => {
    // Get all typing statuses
    const typingStatuses = await ctx.db.query("typingStatus").collect();
    
    // Get current timestamp
    const now = Date.now();
    
    // Delete statuses that are older than 10 seconds
    let deletedCount = 0;
    for (const status of typingStatuses) {
      if (now - status.lastUpdated > 10000) {
        await ctx.db.delete(status._id);
        deletedCount++;
      }
    }
    
    return {
      deletedCount,
      timestamp: now
    };
  },
}); 