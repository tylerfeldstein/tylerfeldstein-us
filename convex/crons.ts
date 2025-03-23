import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run token cleanup every hour
crons.interval(
  "cleanup expired tokens",
  { hours: 1 }, // Run every hour
  internal.chatTokens.cleanupExpiredTokens,
);

export default crons; 