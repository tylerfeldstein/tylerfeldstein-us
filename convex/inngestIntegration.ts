import { v } from "convex/values";
import { action } from "./_generated/server";

/**
 * Send an event to Inngest via Next.js API
 * This action takes an event name and data and forwards it to Inngest through the Next.js API
 */
export const sendInngestEvent = action({
  args: {
    eventName: v.string(),
    eventData: v.any(),
  },
  handler: async (ctx, args) => {
    try {
      // Get the base URL from environment variables
      // Will use the NEXT_PUBLIC_URL env var if set, otherwise fall back to development URL
      const baseUrl = process.env.NEXT_PUBLIC_URL || "http://host.docker.internal:3000";
      
      console.log(`Sending event ${args.eventName} to ${baseUrl}/api/inngest/event`);
      
      // Create the fetch request to the Next.js API endpoint
      const response = await fetch(`${baseUrl}/api/inngest/event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: args.eventName,
          data: args.eventData,
        }),
      });

      // Check if the request was successful
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send event to Inngest: ${response.status} ${response.statusText} - ${errorText}`);
      }

      console.log(`Successfully sent ${args.eventName} event to Inngest via Next.js API`);
      return { success: true };
    } catch (error) {
      console.error(`Error sending ${args.eventName} event to Inngest:`, error);
      
      // Return detailed error information for debugging
      return { 
        success: false, 
        error: String(error),
        eventName: args.eventName,
        data: args.eventData 
      };
    }
  },
}); 