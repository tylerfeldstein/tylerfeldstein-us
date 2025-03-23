"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useChatCookieTokens } from "@/hooks/useChatCookieTokens";

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const currentUser = useQuery(api.users.getMe);
  const { hasToken, generateChatTokens } = useChatCookieTokens();

  useEffect(() => {
    // Check if the user is authenticated with Clerk
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in?redirect_url=/messages');
      return;
    }

    // Generate tokens only if we're authenticated and don't have them
    if (isLoaded && isSignedIn && hasToken === false) {
      generateChatTokens();
    }
  }, [isLoaded, isSignedIn, router, hasToken, generateChatTokens]);

  // Show loading state while clerk auth is loading
  if (!isLoaded || hasToken === null) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin h-6 w-6 border-2 border-gray-500 rounded-full border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not signed in or we don't have tokens, don't render children
  if (!isSignedIn || hasToken === false) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">Authentication required</p>
          <button 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            onClick={() => router.push('/sign-in?redirect_url=/messages')}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen fixed inset-0">
      {children}
    </div>
  );
} 