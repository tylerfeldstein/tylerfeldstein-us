"use client";

import { useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { syncUser } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useConvexUser } from "@/hooks/use-convex-user";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

/**
 * Debug panel component for troubleshooting Clerk-Convex integration
 * This is only meant to be used during development
 */
export function DebugAuthPanel() {
  const { isLoaded: isClerkLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const { isAuthenticated: isConvexAuthenticated, isLoading: isConvexLoading } = useConvexAuth();
  const { convexUser } = useConvexUser();
  const [syncResult, setSyncResult] = useState<any>(null);
  const [debugResult, setDebugResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Force sync user with Convex
  const handleForceSync = async () => {
    if (!isSignedIn) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const result = await syncUser();
      setSyncResult(result);
      
      if (!result.success) {
        setError(`Sync failed: ${result.error}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setSyncResult({ error: errorMessage });
      setError(`Error during sync: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Call debug endpoint
  const handleDebug = async () => {
    if (!isSignedIn) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/debug");
      if (!res.ok) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      setDebugResult(data);
      
      if (data.result && !data.result.success) {
        setError(`Debug failed: ${data.result.error}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setDebugResult({ error: errorMessage });
      setError(`Error during debug: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClerkLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <div>Not signed in</div>;
  }

  return (
    <Card className="w-full max-w-3xl mx-auto mt-4">
      <CardHeader>
        <CardTitle>Auth Debug Panel</CardTitle>
        <CardDescription>Troubleshoot Clerk-Convex user synchronization</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isSignedIn && !isConvexLoading && !isConvexAuthenticated && (
          <Alert className="mb-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertTitle className="text-yellow-800 dark:text-yellow-300">Convex Not Authenticated</AlertTitle>
            <AlertDescription className="text-yellow-700 dark:text-yellow-400">
              Your Clerk login is successful, but Convex authentication is not established.
              This may indicate an issue with JWT token exchange or Convex configuration.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <h3 className="text-sm font-medium">Clerk Status</h3>
            <Badge variant={isSignedIn ? "default" : "destructive"}>
              {isSignedIn ? "Signed In" : "Not Signed In"}
            </Badge>
            <p className="text-xs mt-1">User ID: {userId || "none"}</p>
            <p className="text-xs mt-1">Email: {user?.emailAddresses[0]?.emailAddress || "none"}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Convex Status</h3>
            <Badge variant={isConvexAuthenticated ? "default" : isConvexLoading ? "outline" : "destructive"}>
              {isConvexLoading ? "Loading" : isConvexAuthenticated ? "Authenticated" : "Not Authenticated"}
            </Badge>
            <p className="text-xs mt-1">User ID: {convexUser?._id || "none"}</p>
            <p className="text-xs mt-1">ClerkId: {convexUser?.clerkId || "none"}</p>
          </div>
        </div>

        {syncResult && (
          <div className="mt-4">
            <h3 className="text-sm font-medium">Sync Result</h3>
            <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto max-h-40">
              {JSON.stringify(syncResult, null, 2)}
            </pre>
          </div>
        )}

        {debugResult && (
          <div className="mt-4">
            <h3 className="text-sm font-medium">Debug Result</h3>
            <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto max-h-40">
              {JSON.stringify(debugResult, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          onClick={handleForceSync}
          disabled={!isSignedIn || isLoading}
          variant="outline"
        >
          Force Sync User
        </Button>
        <Button
          onClick={handleDebug}
          disabled={!isSignedIn || isLoading}
        >
          Run Debug
        </Button>
      </CardFooter>
    </Card>
  );
} 