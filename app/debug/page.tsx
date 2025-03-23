import { DebugAuthPanel } from "@/components/debug-auth-panel";

export const metadata = {
  title: "Debug - Auth Sync",
  description: "Debug page for auth synchronization issues",
};

/**
 * Debug page for troubleshooting auth synchronization issues
 * This page should not be accessible in production
 */
export default function DebugPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-4">Auth Debug</h1>
      <p className="text-gray-500 mb-6">
        This page helps troubleshoot Clerk-Convex authentication synchronization issues.
      </p>
      
      <DebugAuthPanel />
      
      <div className="mt-8 text-sm text-gray-500">
        <h2 className="font-semibold mb-2">Troubleshooting Tips:</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Make sure your Clerk JWT template is set up correctly with name "convex"</li>
          <li>Verify that NEXT_PUBLIC_CONVEX_URL is set in your .env.local file</li>
          <li>Check that the Clerk domain in convex/auth.config.ts matches your Clerk app</li>
          <li>Ensure the ClerkAuthSync component is included in your root layout</li>
          <li>Look for error messages in both browser and server console logs</li>
        </ol>
      </div>
    </div>
  );
} 