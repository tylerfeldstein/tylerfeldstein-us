# Server Actions

This directory contains Next.js 15 Server Actions for the application. Server Actions are server functions that can be called directly from client components, providing a streamlined way to handle server-side operations without needing API routes.

## Available Server Actions

### Inngest Actions (`inngest.ts`)

#### `triggerHelloWorld(email: string)`

Triggers the hello-world Inngest function with the provided email.

**Parameters:**
- `email`: The email to use in the triggered function

**Returns:**
```ts
{
  success: boolean;
  eventId?: string;
  correlationId?: string;
  message: string;
}
```

**Example:**
```tsx
import { triggerHelloWorld } from "@/app/actions/inngest";

// In a client component
const handleSubmit = async (email: string) => {
  const result = await triggerHelloWorld(email);
  if (result.success) {
    console.log(`Event triggered with ID: ${result.eventId}`);
  }
};
```

#### `getInngestStream(correlationId: string)`

Creates a streaming connection to Inngest real-time for a specific correlation ID.

**Parameters:**
- `correlationId`: The correlation ID to subscribe to for real-time updates

**Returns:**
- `ReadableStream<Uint8Array> | null`: An encoded stream that can be consumed by clients

**Notes:**
- This server action is designed to be used with the `useInngestRealtime` hook
- The stream follows the Server-Sent Events (SSE) protocol
- Each message in the stream is a JSON object with event data

**Example:**
```tsx
// This is handled internally by the useInngestRealtime hook
import { getInngestStream } from "@/app/actions/inngest";

// This would be used in a custom streaming implementation
const stream = await getInngestStream("some-correlation-id");
if (stream) {
  // Process the stream...
}
```

## Using Server Actions with Streaming

The `getInngestStream` server action is designed to work with streaming responses, which is an advanced pattern in Next.js 15. The key points:

1. The server action returns a `ReadableStream` object
2. The client can read this stream incrementally, processing data as it arrives
3. This enables real-time updates without polling or WebSockets

The client-side implementation in `hooks/useInngestRealtime.ts` demonstrates how to consume this streaming server action. 