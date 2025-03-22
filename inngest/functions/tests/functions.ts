import { inngest } from "@/inngest/client";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

// Create Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");

/**
 * Helper function to send realtime updates during function execution
 */
async function sendRealtimeUpdate({ 
  publish, 
  eventId, 
  correlationId, 
  step, 
  status, 
  progress, 
  message, 
  result = {} 
}: { 
  publish: (payload: {
    channel: string;
    topic: string;
    data: Record<string, unknown>;
  }) => Promise<Record<string, unknown>>;
  eventId?: string;
  correlationId?: string;
  step: string;
  status: string;
  progress: number;
  message: string;
  result?: Record<string, unknown>;
}) {
  if (!correlationId || !eventId) return;
  
  try {
    await publish({
      channel: `function-results.${correlationId}`,
      topic: "updates",
      data: {
        eventId,
        correlationId,
        function: "hello-world",
        result: {
          ...result,
          status,
          progress,
          message,
          updatedAt: new Date().toISOString(),
        },
        step,
        convexId: null, // Will be filled for final step
        timestamp: Date.now(),
      },
    });
    
    console.log(`Published ${status} update (${progress}%) for correlationId: ${correlationId}`);
  } catch (error) {
    console.error("Failed to publish realtime update:", error);
  }
}

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step, publish }) => {
    // Log detailed information about the event for debugging
    console.log("Inngest function running with:", {
      eventId: event.id,
      correlationId: event.data.correlationId,
      email: event.data.email
    });
    
    // Send initial update (0%)
    await step.run("send-initial-update", async () => {
      await sendRealtimeUpdate({
        publish,
        eventId: event.id,
        correlationId: event.data.correlationId,
        step: "initializing",
        status: "running",
        progress: 0,
        message: "Function started, initializing...",
      });
    });
    
    // Step 1: Preparation (25%)
    await step.sleep("preparing-resources", "2s");
    await step.run("send-preparing-update", async () => {
      await sendRealtimeUpdate({
        publish,
        eventId: event.id,
        correlationId: event.data.correlationId,
        step: "preparing",
        status: "running",
        progress: 25,
        message: "Preparing resources...",
        result: {
          step: "preparation",
          email: event.data.email,
        }
      });
    });
    
    // Step 2: Processing (50%)
    await step.sleep("processing-data", "3s");
    await step.run("send-processing-update", async () => {
      await sendRealtimeUpdate({
        publish,
        eventId: event.id,
        correlationId: event.data.correlationId,
        step: "processing",
        status: "running",
        progress: 50,
        message: "Processing data...",
        result: {
          step: "processing",
          email: event.data.email,
          processingStarted: new Date().toISOString(),
        }
      });
    });
    
    // Step 3: Analyzing (75%)
    await step.sleep("analyzing-results", "3s");
    await step.run("send-analyzing-update", async () => {
      await sendRealtimeUpdate({
        publish,
        eventId: event.id,
        correlationId: event.data.correlationId,
        step: "analyzing",
        status: "running",
        progress: 75,
        message: "Analyzing results...",
        result: {
          step: "analyzing",
          email: event.data.email,
          analysisStarted: new Date().toISOString(),
        }
      });
    });
    
    // Final Step: Completion (100%)
    await step.sleep("finalizing", "2s");
    
    // Generate the final result
    const finalResult = { 
      message: `Hello ${event.data.email}!`,
      timestamp: new Date().toISOString(),
      correlationId: event.data.correlationId,
      eventId: event.id,
      status: "completed",
      progress: 100,
      processingTime: "10s",
      steps: ["initializing", "preparing", "processing", "analyzing", "completed"]
    };
    
    // Store the result in Convex
    const storedId = await step.run("store-result", async () => {
      if (!event.id) {
        console.error("Missing event ID in Inngest event");
        return null;
      }
      
      // Store the result with both eventId and correlationId for better tracking
      const id = await convex.mutation(api.inngestResults.storeInngestResult, {
        eventId: event.id,
        correlationId: event.data.correlationId,
        function: "hello-world",
        result: finalResult,
      });
      
      console.log("Stored final result in Convex:", {
        convexId: id,
        eventId: event.id,
        correlationId: event.data.correlationId
      });
      
      return id;
    });

    // Send final update (100%)
    await step.run("send-final-update", async () => {
      try {
        await publish({
          channel: `function-results.${event.data.correlationId}`,
          topic: "updates",
          data: {
            eventId: event.id,
            correlationId: event.data.correlationId,
            function: "hello-world",
            result: finalResult,
            convexId: storedId,
            timestamp: Date.now(),
            step: "completed",
            status: "completed",
            progress: 100,
          },
        });
        console.log("Published final update for correlationId:", event.data.correlationId);
      } catch (error) {
        console.error("Failed to publish final update:", error);
      }
    });
    
    return {
      ...finalResult,
      convexId: storedId
    };
  },
);
