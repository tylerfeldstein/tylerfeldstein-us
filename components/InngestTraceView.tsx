"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export type InngestTrace = {
  queuedAt?: string;
  startedAt?: string;
  endedAt?: string;
  totalDuration?: number; // in seconds
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
};

// Use a non-memoized component to ensure updates are always reflected
export function InngestTraceView({
  trace,
  className,
}: {
  trace: InngestTrace;
  className?: string;
}) {
  // Keep internal state for the progress to ensure animations work
  const [currentProgress, setCurrentProgress] = useState(trace.progress);
  
  // Update internal progress when trace.progress changes
  useEffect(() => {
    setCurrentProgress(trace.progress);
    console.log("Progress updated in TraceView:", trace.progress);
  }, [trace.progress]);
  
  // Calculate total timeline width
  const totalDuration = trace.totalDuration || 10; // Default to 10s if no duration provided
  
  // Format the progress display text based on status
  const progressText = trace.status === "completed" 
    ? `Completed in ${totalDuration.toFixed(1)}s` 
    : `${currentProgress.toFixed(0)}%`;

  return (
    <div className={cn("space-y-4 border border-border rounded-lg p-4 bg-card", className)}>
      {/* Header information */}
      <div className="grid grid-cols-3 text-sm">
        <div>
          <h4 className="text-muted-foreground font-medium mb-1">Queued at</h4>
          <p className="font-mono">{trace.queuedAt || "Unknown"}</p>
        </div>
        <div>
          <h4 className="text-muted-foreground font-medium mb-1">Started at</h4>
          <p className="font-mono">{trace.startedAt || "Unknown"}</p>
        </div>
        <div>
          <h4 className="text-muted-foreground font-medium mb-1">Ended at</h4>
          <p className="font-mono">{trace.endedAt || "Pending"}</p>
        </div>
      </div>

      {/* Progress section */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Progress</h3>
          <span className="text-sm font-medium">
            {progressText}
          </span>
        </div>
        
        {/* Overall progress bar */}
        <Progress 
          value={currentProgress} 
          className="h-3" 
          // Add key to force re-render when progress changes
          key={`progress-${currentProgress}`}
        />
      </div>
    </div>
  );
}

/**
 * Helper to convert raw job data into trace format
 */
export function createTraceFromJobResult(
  result: Record<string, unknown>
): InngestTrace {
  // Create base trace object with default values
  const trace: InngestTrace = {
    status: ((result.status as string) || "pending") as "pending" | "running" | "completed" | "failed",
    progress: (result.progress as number) || 0,
    totalDuration: 10, // Default 10s
  };
  
  // Extract timestamps if available
  if (result.updatedAt) {
    const timestamp = new Date(result.updatedAt as string);
    trace.startedAt = timestamp.toLocaleString();
    
    // If this is the first update, set the queuedAt time
    if (trace.progress === 0) {
      trace.queuedAt = timestamp.toLocaleString();
    }
    
    // If completed, set the endedAt time
    if (trace.status === "completed") {
      trace.endedAt = timestamp.toLocaleString();
    }
    
    // Calculate duration if processing time is provided
    if (result.processingTime) {
      // Parse the processingTime (e.g., "10s") to get the exact number of seconds
      const processingSecondsMatch = (result.processingTime as string).match(/(\d+(\.\d+)?)/);
      if (processingSecondsMatch) {
        trace.totalDuration = parseFloat(processingSecondsMatch[0]);
      }
    }
  }
  
  // Handle case when timestamp is provided directly
  if (result.timestamp && !trace.startedAt) {
    const timestamp = new Date(result.timestamp as string);
    trace.startedAt = timestamp.toLocaleString();
    
    // Calculate end time if processing time is provided
    if (result.processingTime) {
      // Parse the processingTime (e.g., "10s") to get the exact number of seconds
      const processingSecondsMatch = (result.processingTime as string).match(/(\d+(\.\d+)?)/);
      if (processingSecondsMatch) {
        const processingSeconds = parseFloat(processingSecondsMatch[0]);
        trace.totalDuration = processingSeconds;
        
        if (trace.status === "completed") {
          const endTimestamp = new Date(timestamp.getTime() + processingSeconds * 1000);
          trace.endedAt = endTimestamp.toLocaleString();
        }
        
        trace.queuedAt = timestamp.toLocaleString();
      }
    }
  }

  return trace;
} 