"use client";

import { useConvexUser } from "@/hooks/use-convex-user";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { syncUser, forceCreateUser } from "@/actions/auth";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function AuthDebugPage() {
  const { user, isLoading, clerkUser, convexUser } = useConvexUser();
  const [syncResult, setSyncResult] = useState<any>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const migrateUserRoles = useMutation(api.users.migrateUserRoles);
  const [migrationResult, setMigrationResult] = useState<number | null>(null);
  const [migrationLoading, setMigrationLoading] = useState(false);
  
  // Perform manual sync
  const handleSync = async () => {
    setSyncLoading(true);
    try {
      const result = await syncUser();
      setSyncResult(result);
      console.log("Manual sync result:", result);
    } catch (error) {
      console.error("Manual sync error:", error);
      setSyncResult({ success: false, error: String(error) });
    } finally {
      setSyncLoading(false);
    }
  };
  
  // Migrate users to have roles
  const handleMigrate = async () => {
    setMigrationLoading(true);
    try {
      const count = await migrateUserRoles();
      setMigrationResult(count);
      console.log(`Migrated ${count} users to have default roles`);
    } catch (error) {
      console.error("Migration error:", error);
      setMigrationResult(null);
    } finally {
      setMigrationLoading(false);
    }
  };
  
  // Force create user
  const handleForceCreate = async () => {
    setSyncLoading(true);
    try {
      const result = await forceCreateUser();
      setSyncResult(result);
      console.log("Force create user result:", result);
    } catch (error) {
      console.error("Force create user error:", error);
      setSyncResult({ success: false, error: String(error) });
    } finally {
      setSyncLoading(false);
    }
  };
  
  return (
    <div className="container py-10 space-y-6">
      <h1 className="text-3xl font-bold">Authentication Debug</h1>
      <p className="text-muted-foreground">This page helps diagnose authentication issues between Clerk and Convex.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Clerk Authentication Status */}
        <Card>
          <CardHeader>
            <CardTitle>Clerk Authentication</CardTitle>
            <CardDescription>Status of your Clerk authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <p>Loading Clerk data...</p>
            ) : clerkUser ? (
              <div className="space-y-2">
                <p className="text-green-600 font-medium">✓ Authenticated with Clerk</p>
                <p><strong>User ID:</strong> {clerkUser.id}</p>
                <p><strong>Email:</strong> {clerkUser.emailAddresses[0]?.emailAddress || 'N/A'}</p>
                <p><strong>Name:</strong> {clerkUser.fullName || clerkUser.username || 'N/A'}</p>
              </div>
            ) : (
              <p className="text-red-600 font-medium">✗ Not authenticated with Clerk</p>
            )}
          </CardContent>
        </Card>
        
        {/* Convex Database Status */}
        <Card>
          <CardHeader>
            <CardTitle>Convex Database</CardTitle>
            <CardDescription>Status of your Convex user record</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <p>Loading Convex data...</p>
            ) : convexUser ? (
              <div className="space-y-2">
                <p className="text-green-600 font-medium">✓ User exists in Convex</p>
                <p><strong>Convex ID:</strong> {convexUser._id}</p>
                <p><strong>Clerk ID:</strong> {convexUser.clerkId}</p>
                <p><strong>Role:</strong> {convexUser.role || 'Not set'}</p>
                <p><strong>Created:</strong> {new Date(convexUser.createdAt).toLocaleString()}</p>
              </div>
            ) : (
              <p className="text-red-600 font-medium">✗ User not found in Convex database</p>
            )}
            
            <div className="pt-4 flex flex-col gap-2">
              <Button 
                onClick={handleSync} 
                disabled={syncLoading || !clerkUser}
                variant="outline"
              >
                {syncLoading ? "Syncing..." : "Force Sync to Convex"}
              </Button>
              
              <Button 
                onClick={handleForceCreate}
                disabled={syncLoading || !clerkUser}
                variant="outline"
                className="mt-2"
              >
                Force Create User
              </Button>
              
              {syncResult && (
                <div className="mt-2 p-2 text-xs bg-muted rounded-md overflow-auto">
                  <pre>{JSON.stringify(syncResult, null, 2)}</pre>
                </div>
              )}
              
              <Button 
                onClick={handleMigrate} 
                disabled={migrationLoading || !convexUser}
                variant="outline"
                className="mt-2"
              >
                {migrationLoading ? "Migrating..." : "Migrate Users (Add Roles)"}
              </Button>
              
              {migrationResult !== null && (
                <div className="mt-2 p-2 text-xs bg-muted rounded-md">
                  Migrated {migrationResult} users to have default roles
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Combined Status */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication Summary</CardTitle>
          <CardDescription>Overview of your authentication status</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading authentication data...</p>
          ) : (
            <div className="space-y-2">
              <p className={clerkUser ? "text-green-600" : "text-red-600"}>
                <strong>Clerk Auth:</strong> {clerkUser ? "Authenticated" : "Not authenticated"}
              </p>
              <p className={convexUser ? "text-green-600" : "text-red-600"}>
                <strong>Convex DB:</strong> {convexUser ? "User exists" : "User not found"}
              </p>
              <p className={user?.isAdmin ? "text-green-600" : "text-yellow-600"}>
                <strong>Admin Status:</strong> {user?.isAdmin ? "Admin user" : "Regular user"}
              </p>
              
              {(!clerkUser || !convexUser) && (
                <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-md">
                  <p className="font-medium">Troubleshooting Tips:</p>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    {!clerkUser && (
                      <>
                        <li>Make sure you're signed in with Clerk</li>
                        <li>Check Clerk configuration in your environment variables</li>
                      </>
                    )}
                    {clerkUser && !convexUser && (
                      <>
                        <li>Try clicking "Force Sync to Convex" above</li>
                        <li>Check Convex connection in your environment variables</li>
                        <li>Verify that the ClerkAuthSync component is in your layout</li>
                      </>
                    )}
                  </ol>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 