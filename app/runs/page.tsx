"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import {
  Authenticated,
  Unauthenticated,
  useQuery,
} from "convex/react";
import { api } from "@/convex/_generated/api";
import { SignUpButton } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { triggerHelloWorld } from "@/actions/inngest";
import { useInngestRealtime } from "@/hooks/useInngestRealtime";
import { InngestTraceView, createTraceFromJobResult } from "@/components/InngestTraceView";
import { Metadata } from "next";

// Lazy load the InngestResultsTable component
const InngestResultsTable = lazy(() => import("@/components/InngestResultsTable"));

// Note: This metadata export won't work in a client component
// This is left as a comment - we need to create a separate layout.tsx for this route
/*
export const metadata: Metadata = {
  title: "AI Projects | Tyler Feldstein - AI Engineer & Cybersecurity Architect",
  description: "Explore AI security projects demonstrating machine learning for threat detection, cloud security automation, and zero trust architecture implementations.",
  openGraph: {
    title: "AI Projects | Tyler Feldstein - AI Engineer & Cybersecurity Architect",
    description: "Explore AI security projects demonstrating machine learning for threat detection, cloud security automation, and zero trust architecture implementations.",
  },
  twitter: {
    title: "AI Projects | Tyler Feldstein - AI Engineer & Cybersecurity Architect",
    description: "Explore AI security projects demonstrating machine learning for threat detection, cloud security automation, and zero trust architecture implementations.",
  }
};
*/

export default function Home() {
  return (
    <main className="p-8 flex flex-col gap-8">
      <h1 className="text-4xl font-bold text-center">
        Landing Page and Demo
      </h1>
      <Authenticated>
        <Content />
      </Authenticated>
      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>
    </main>
  );
}

function SignInForm() {
  return (
    <div className="flex flex-col gap-8 w-96 mx-auto">
      <p>Log in to see the demo</p>
      <SignInButton mode="modal">
        <button className="bg-foreground text-background px-4 py-2 rounded-md">
          Sign in
        </button>
      </SignInButton>
      <SignUpButton mode="modal">
        <button className="bg-foreground text-background px-4 py-2 rounded-md">
          Sign up
        </button>
      </SignUpButton>
    </div>
  );
}

function Content() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [eventId, setEventId] = useState<string | null>(null);
  const [correlationId, setCorrelationId] = useState<string | null>(null);
  const [latestResult, setLatestResult] = useState<Record<string, unknown> | null>(null);
  const [debugInfo, setDebugInfo] = useState<{
    success?: boolean;
    eventId?: string;
    correlationId?: string;
    message?: string;
    error?: string;
  } | null>(null);
  
  // Use our realtime hook to get streaming updates
  const { results, isConnected } = useInngestRealtime(correlationId);
  
  // Get the correlation result for completion detection
  const correlationResult = useQuery(
    api.inngestResults.getResultByCorrelationId,
    correlationId ? { correlationId } : "skip"
  );

  // Store intermediate results for real-time updates
  useEffect(() => {
    // Find the most recent result for our current job
    const currentJobResult = results.find(r => 
      r.correlationId === correlationId && r.eventId === eventId
    );
    
    if (currentJobResult) {
      console.log("Got updated result from stream:", currentJobResult.result, 
        "Step:", currentJobResult.result.step, 
        "Progress:", currentJobResult.result.progress);
      
      // Force a new object reference to ensure the component re-renders
      // Use a unique timestamp to ensure React detects the change
      setLatestResult({
        ...currentJobResult.result,
        _updateKey: Date.now() // Add a unique key to force React to detect the change
      });
      
      // If we have a completed result, stop loading
      if (currentJobResult.result.status === "completed") {
        setIsLoading(false);
      }
    } else if (isLoading && correlationId && correlationResult) {
      // Backup - if we have a completed result from Convex but no streaming updates
      console.log("Using Convex result as fallback:", correlationResult.result);
      setLatestResult({
        ...correlationResult.result,
        _updateKey: Date.now()
      });
      setIsLoading(false);
    }
  }, [results, correlationId, eventId, correlationResult, isLoading]);

  async function handleTriggerInngest() {
    if (!user?.emailAddresses[0].emailAddress) return;
    
    setIsLoading(true);
    setDebugInfo(null);
    setEventId(null);
    setCorrelationId(null);
    setLatestResult(null);
    
    try {
      const response = await triggerHelloWorld(user.emailAddresses[0].emailAddress);
      console.log("Inngest trigger response:", response);
      setDebugInfo(response);
      
      if (response.success) {
        if (response.eventId) {
          console.log("Setting eventId to:", response.eventId);
          setEventId(response.eventId);
        }
        if (response.correlationId) {
          console.log("Setting correlationId to:", response.correlationId);
          setCorrelationId(response.correlationId);
          
          // Set initial result state (0%) immediately
          setLatestResult({
            status: "running",
            progress: 0,
            step: "initializing",
            message: "Function started, initializing...",
            updatedAt: new Date().toISOString(),
            processingTime: "10s" // Default expected processing time
          });
        }
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error triggering Inngest function:", error);
      setDebugInfo({ error: String(error) });
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Trigger form section */}
      <div className="bg-card dark:bg-card p-6 rounded-lg shadow-md border border-border">
        <h2 className="text-xl font-bold mb-4">Inngest Demo</h2>
        <p className="mb-4 text-muted-foreground">
          Click the button below to trigger an Inngest function. The function will run in
          the background and stream real-time updates as it progresses.
        </p>
        
        <button
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md mb-6 flex items-center justify-center"
          onClick={handleTriggerInngest}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="inline-block animate-spin mr-2">⟳</span>
          ) : null}
          {isLoading ? "Processing..." : "Run Inngest Function"}
        </button>

        {debugInfo && (
          <div className="mt-4 mb-4 space-y-4">
            <div className="p-2 bg-muted dark:bg-muted rounded">
              <p className="text-sm font-mono">Event ID: {debugInfo.eventId}</p>
              <p className="text-sm font-mono">Correlation ID: {debugInfo.correlationId}</p>
              
              {/* Show connection status */}
              {correlationId && (
                <div className="mt-2 flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                  <span className="text-sm font-mono">
                    {isConnected ? "Stream connected" : "Waiting for connection..."}
                  </span>
                </div>
              )}
            </div>
            
            {/* Show trace view for streaming progress */}
            {latestResult && (
              <InngestTraceView 
                trace={createTraceFromJobResult(latestResult)}
                key={`trace-${latestResult._updateKey || latestResult.progress}`}
              />
            )}
            
            {isLoading && !latestResult && (
              <p className="text-sm mt-2 italic text-muted-foreground">
                Waiting for function to start...
              </p>
            )}
          </div>
        )}
      </div>

      {/* Results table section */}
      <div className="mt-4">
        <Suspense fallback={<div className="text-center p-4 text-muted-foreground">Loading results table...</div>}>
          <InngestResultsTable />
        </Suspense>
      </div>
    </div>
  );
}
