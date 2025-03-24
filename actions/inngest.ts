"use server";
import { inngest } from "@/inngest/utils/client";
import { randomUUID } from 'crypto';
import { subscribe } from "@inngest/realtime";

export async function triggerHelloWorld(email: string) {
  try {
    // Create a unique ID for this event for better correlation
    const uniqueId = randomUUID();
    
    // Send the event to trigger the hello-world function
    const result = await inngest.send({
      id: `hello-world-${uniqueId}`, // Using an ID helps with deduplication and correlation
      name: "test/hello.world",
      data: { 
        email,
        correlationId: uniqueId, // Add a correlation ID in the data as well
      },
    });

    return { 
      success: true, 
      eventId: result.ids[0],
      correlationId: uniqueId,
      message: "Event sent successfully" 
    };
  } catch (error) {
    console.error("Error sending Inngest event:", error);
    return { 
      success: false, 
      message: "Failed to send event" 
    };
  }
}

/**
 * Creates a streaming connection to Inngest realtime for a specific correlation ID
 * This server action returns an encoded stream that can be consumed by clients
 */
export async function getInngestStream(correlationId: string): Promise<ReadableStream<Uint8Array> | null> {
  try {
    console.log(`[Server Action] Subscribing to function-results.${correlationId}`);
    
    if (!correlationId) {
      console.log("[Server Action] Missing correlationId");
      return null;
    }
    
    // Subscribe directly to the function results channel for this correlation ID
    const stream = await subscribe(inngest, {
      channel: `function-results.${correlationId}`,
      topics: ["updates"],
    });
    
    console.log("[Server Action] Successfully created subscription stream");
    
    // Return the encoded stream for the client to consume
    return stream.getEncodedStream();
  } catch (error) {
    console.error("[Server Action] Error creating Inngest stream:", error);
    return null;
  }
} 