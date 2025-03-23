"use client";

import { ChatInterface } from "@/components/messages/ChatInterface";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import { useChatCookieTokens } from "@/hooks/useChatCookieTokens";

export default function MessagesPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  // Get the current user to check their role
  const currentUser = useQuery(api.users.getMe);
  
  // Use our existing hook for JWT token management
  const { hasToken, generateChatTokens, isRefreshing, refreshError } = useChatCookieTokens();
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  
  // Handle token generation when user is authenticated but has no token
  useEffect(() => {
    const generateTokenIfNeeded = async () => {
      if (isLoaded && isSignedIn && currentUser && hasToken === false && !isGeneratingToken) {
        setIsGeneratingToken(true);
        setTokenError(null);
        
        try {
          // Generate new chat tokens
          const success = await generateChatTokens();
          if (!success) {
            setTokenError("Failed to generate secure chat token. Please try again.");
          }
        } catch (error) {
          console.error("Error generating chat tokens:", error);
          setTokenError("An error occurred while generating secure chat token.");
        } finally {
          setIsGeneratingToken(false);
        }
      }
    };
    
    generateTokenIfNeeded();
  }, [isLoaded, isSignedIn, currentUser, hasToken, isGeneratingToken, generateChatTokens]);
  
  // Redirect to home if not authenticated
  if (isLoaded && !isSignedIn) {
    router.push("/");
    return null;
  }
  
  // Show loading state only when we're still loading essential data
  if (!isLoaded || currentUser === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin h-6 w-6 border-2 border-gray-500 rounded-full border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading secure chat...</p>
        </div>
      </div>
    );
  }
  
  // Show error state if token generation failed
  if (tokenError || refreshError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center p-6 border border-red-200 rounded-lg bg-red-50">
          <div className="text-red-500 text-xl">⚠️</div>
          <h2 className="text-lg font-semibold">Secure Chat Authentication Error</h2>
          <p className="text-sm text-muted-foreground">{tokenError || refreshError}</p>
          <button 
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors text-sm"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }
  
  // Show loading state only during initial token generation
  if (isGeneratingToken) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin h-6 w-6 border-2 border-gray-500 rounded-full border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Setting up secure chat connection...</p>
        </div>
      </div>
    );
  }
  
  // If we have a token and we're not refreshing, show the chat interface
  // Note: We allow the interface to show during refresh to prevent flicker
  if (hasToken) {
    return <ChatInterface />;
  }
  
  // If we don't have a token and we're not generating one, show a retry button
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4 max-w-md text-center p-6">
        <h2 className="text-lg font-semibold">Unable to Access Secure Chat</h2>
        <p className="text-sm text-muted-foreground">Please try refreshing your session.</p>
        <button 
          onClick={() => generateChatTokens()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
        >
          Refresh Session
        </button>
      </div>
    </div>
  );
} 