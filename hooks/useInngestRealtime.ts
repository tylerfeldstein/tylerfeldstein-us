"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getInngestStream } from "@/actions/inngest";

export type InngestResult = {
  _id: Id<"inngestResults">;
  _creationTime: number;
  eventId: string;
  correlationId?: string;
  function: string;
  result: Record<string, unknown>;
  timestamp: number;
};

export type RealtimeUpdateData = {
  eventId: string;
  correlationId: string;
  function: string;
  result: Record<string, unknown>;
  convexId?: string;
  timestamp: number;
  step?: string;
  status?: string;
  progress?: number;
};

export function useInngestRealtime(correlationId: string | null, limit: number = 100) {
  // Store all results we're tracking
  const [results, setResults] = useState<InngestResult[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial results from Convex
  const queryResults = useQuery(api.inngestResults.getAllResults, { limit });

  // Function to connect to the SSE stream directly
  const connectToRealtimeStream = useCallback(async (cid: string) => {
    try {
      // Clean up any existing connection
      if (window.inngestEventSource) {
        window.inngestEventSource.close();
        window.inngestEventSource = undefined;
      }
      
      setError(null);
      console.log(`Connecting to realtime stream for correlationId: ${cid}`);
      
      // Get the stream URL via server action
      const streamResponse = await getInngestStream(cid);
      
      if (!streamResponse) {
        throw new Error('Failed to get stream from server action');
      }
      
      // Create a TextDecoder to decode the stream data
      const decoder = new TextDecoder();
      
      // Create a reader for the stream
      const reader = streamResponse.getReader();
      
      // Function to process the stream
      const processStream = async () => {
        try {
          setIsConnected(true);
          
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              console.log('Stream complete');
              setIsConnected(false);
              break;
            }
            
            // Decode the chunk
            const chunk = decoder.decode(value, { stream: true });
            console.log('Received stream chunk:', chunk);
            
            // Process each line (event) in the chunk
            const lines = chunk.split('\n\n');
            for (const line of lines) {
              if (line.startsWith('data:')) {
                try {
                  // Extract the JSON data
                  const jsonStr = line.substring(5).trim();
                  const data = JSON.parse(jsonStr);
                  
                  if (data && data.data) {
                    const updateData = data.data as RealtimeUpdateData;
                    
                    // PRIORITY: Immediately apply progress updates for better UI responsiveness
                    if (updateData.progress !== undefined) {
                      console.log('Received progress update:', updateData.progress);
                      
                      // Fast path update for progress
                      setResults(prevResults => {
                        const existingIndex = prevResults.findIndex(
                          r => r.correlationId === updateData.correlationId && r.eventId === updateData.eventId
                        );
                        
                        if (existingIndex >= 0) {
                          const updatedResults = [...prevResults];
                          // Only update the progress value for faster processing
                          updatedResults[existingIndex] = {
                            ...updatedResults[existingIndex],
                            result: {
                              ...updatedResults[existingIndex].result,
                              progress: updateData.progress,
                              _updateTimestamp: Date.now()
                            }
                          };
                          return updatedResults;
                        }
                        return prevResults;
                      });
                    }
                    
                    // Format the data to match our InngestResult type
                    const newResult: InngestResult = {
                      _id: updateData.convexId ? (updateData.convexId as Id<"inngestResults">) : (("temp-" + Date.now()) as unknown as Id<"inngestResults">),
                      _creationTime: updateData.timestamp,
                      eventId: updateData.eventId,
                      correlationId: updateData.correlationId,
                      function: updateData.function,
                      result: {
                        ...updateData.result,
                        // Add step and progress directly if available
                        ...(updateData.step && { step: updateData.step }),
                        ...(updateData.progress !== undefined && { progress: updateData.progress }),
                        ...(updateData.status && { status: updateData.status }),
                      },
                      timestamp: updateData.timestamp,
                    };
                    
                    console.log('Processing realtime update:', newResult);
                    
                    // Use a functional update to ensure we're working with the latest state
                    setResults(prevResults => {
                      // Check if we already have a result with this event ID
                      const existingIndex = prevResults.findIndex(
                        r => r.eventId === newResult.eventId && r.correlationId === newResult.correlationId
                      );
                      
                      if (existingIndex >= 0) {
                        // Update the existing result
                        const updatedResults = [...prevResults];
                        
                        // Create a new object with updated properties to force re-render
                        updatedResults[existingIndex] = {
                          ...updatedResults[existingIndex],
                          // Update timestamp for sorting
                          timestamp: updateData.timestamp,
                          // Create a new result object to ensure reference changes
                          result: {
                            ...updatedResults[existingIndex].result,
                            ...newResult.result,
                            // Ensure progress and step are updated immediately
                            progress: updateData.progress !== undefined ? updateData.progress : updatedResults[existingIndex].result.progress,
                            step: updateData.step || updatedResults[existingIndex].result.step,
                            status: updateData.status || updatedResults[existingIndex].result.status,
                            // Add a timestamp to force React to detect the change
                            _updateTimestamp: Date.now()
                          }
                        };
                        
                        console.log('Updated result with progress:', updatedResults[existingIndex].result.progress);
                        return updatedResults;
                      } else {
                        // Add the new result to the start
                        return [newResult, ...prevResults];
                      }
                    });
                  }
                } catch (e) {
                  console.error('Failed to parse SSE data:', e, line);
                }
              }
            }
          }
        } catch (e) {
          console.error('Error processing stream:', e);
          setIsConnected(false);
          setError('Stream processing error: ' + (e instanceof Error ? e.message : String(e)));
        }
      };
      
      // Start processing the stream
      processStream();
      
      // Clean up function
      return () => {
        console.log('Closing stream');
        reader.cancel();
        setIsConnected(false);
      };
    } catch (e) {
      console.error('Failed to connect to realtime stream:', e);
      setIsConnected(false);
      setError('Connection error: ' + (e instanceof Error ? e.message : String(e)));
    }
  }, []);

  // Connect when the correlationId changes
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    if (correlationId) {
      // Connect and store the cleanup function
      connectToRealtimeStream(correlationId)
        .then(cleanupFn => {
          cleanup = cleanupFn;
        })
        .catch(err => {
          console.error('Failed to set up stream connection:', err);
        });
    } else {
      setIsConnected(false);
      
      // Clean up any existing EventSource connection (legacy cleanup)
      if (window.inngestEventSource) {
        window.inngestEventSource.close();
        window.inngestEventSource = undefined;
      }
    }
    
    // Return cleanup function
    return () => {
      if (cleanup) cleanup();
      
      // Also clean up any existing EventSource (legacy cleanup)
      if (window.inngestEventSource) {
        window.inngestEventSource.close();
        window.inngestEventSource = undefined;
      }
    };
  }, [correlationId, connectToRealtimeStream]);

  // Process initial query results
  useEffect(() => {
    if (queryResults && Array.isArray(queryResults)) {
      // Merge with any realtime updates we've received
      setResults(prevResults => {
        // Create a map of existing results by ID
        const existingResultsMap = new Map(
          prevResults.map(result => [result._id.toString(), result])
        );
        
        // Add any query results that aren't already in our state
        const newResults = [...prevResults];
        for (const result of queryResults) {
          if (!existingResultsMap.has(result._id.toString())) {
            newResults.push(result);
          }
        }
        
        // Sort by timestamp, newest first
        return newResults.sort((a, b) => b.timestamp - a.timestamp);
      });
    }
  }, [queryResults]);

  return {
    results,
    isConnected,
    error,
  };
}

// Extend the Window interface to store our EventSource cleanup function (for legacy support)
declare global {
  interface Window {
    inngestEventSource?: EventSource;
  }
} 