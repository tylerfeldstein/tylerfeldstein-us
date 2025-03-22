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
});
