import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Schema for the inngestResults table
export const storeInngestResult = mutation({
  args: {
    eventId: v.string(),
    correlationId: v.optional(v.string()),
    result: v.any(),
    function: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("inngestResults", {
      eventId: args.eventId,
      correlationId: args.correlationId,
      result: args.result,
      function: args.function,
      timestamp: Date.now(),
    });
    return id;
  },
});

// Get an Inngest result by eventId
export const getResultByEventId = query({
  args: {
    eventId: v.string(),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("inngestResults")
      .filter((q) => q.eq(q.field("eventId"), args.eventId))
      .first();
    return result;
  },
});

// Get an Inngest result by correlationId
export const getResultByCorrelationId = query({
  args: {
    correlationId: v.string(),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("inngestResults")
      .filter((q) => q.eq(q.field("correlationId"), args.correlationId))
      .first();
    return result;
  },
});

// Get the latest Inngest result for a function
export const getLatestResult = query({
  args: {
    function: v.string(),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("inngestResults")
      .filter((q) => q.eq(q.field("function"), args.function))
      .order("desc")
      .first();
    return result;
  },
});

// Get all Inngest results, sorted by timestamp (newest first)
export const getAllResults = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.limit) {
      return await ctx.db
        .query("inngestResults")
        .order("desc")
        .take(args.limit);
    }
    
    return await ctx.db
      .query("inngestResults")
      .order("desc");
  },
}); 