import { Inngest } from "inngest";
import { realtimeMiddleware } from "@inngest/realtime";

// Create a client to send and receive events
export const inngest = new Inngest({ 
  id: "tylerfeldstein",
  middleware: [realtimeMiddleware()],
  // Only use the event key in production, local dev doesn't need it
  ...(process.env.NODE_ENV === "production" && process.env.INNGEST_EVENT_KEY ? 
    { eventKey: process.env.INNGEST_EVENT_KEY } : {})
});
