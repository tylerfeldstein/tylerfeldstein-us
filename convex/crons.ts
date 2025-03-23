import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

// Schedule cron jobs
const crons = cronJobs();

// Clean up expired chat tokens daily
crons.interval(
  "clean expired chat tokens",
  { hours: 24 }, // Run once per day
  internal.chatTokens.cleanupExpiredTokens,
);

// Clean up expired typing statuses every minute
crons.interval(
  "clean expired typing statuses",
  { seconds: 60 }, // Run once every minute
  internal.maintenance.cleanupTypingStatus
);

export default crons; 