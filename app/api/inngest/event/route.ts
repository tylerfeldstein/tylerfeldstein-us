import { NextRequest, NextResponse } from 'next/server';
import { inngest } from '@/inngest/client';

// This endpoint receives events from Convex and forwards them to Inngest
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.name || !body.data) {
      return NextResponse.json({ error: 'Invalid event format' }, { status: 400 });
    }

    console.log(`Received event from Convex: ${body.name}`, body.data);
    
    // Forward the event to Inngest
    await inngest.send({
      name: body.name,
      data: body.data,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error forwarding event to Inngest:', error);
    return NextResponse.json({ error: 'Failed to forward event' }, { status: 500 });
  }
} 