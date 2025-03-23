"use client";

import { ChatInterface } from "@/components/messages/ChatInterface";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import { useChatCookieTokens } from "@/hooks/useChatCookieTokens";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { LoadingScreen } from "@/components/loaders/LoadingScreen";

export default function MessagesPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  // Get the current user to check their role
  const currentUser = useQuery(api.users.getMe);
  
  // Use our existing hook for JWT token management
  const { hasToken, generateChatTokens, isRefreshing, refreshError } = useChatCookieTokens();
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  
  // Loading state for essential data or initial token check
  const isInitialLoading = !isLoaded || currentUser === undefined || hasToken === null;
  
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
  
  // Cycle through loading messages for a better UX
  useEffect(() => {
    if (isGeneratingToken || (tokenError || refreshError) && !showError) {
      const interval = setInterval(() => {
        setLoadingPhase(prev => (prev + 1) % 3);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isGeneratingToken, tokenError, refreshError, showError]);
  
  // Add a delay before showing the error to prevent flash
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (tokenError || refreshError) {
      // Show error after a delay to prevent flashing
      timeoutId = setTimeout(() => {
        setShowError(true);
      }, 1000);
    } else {
      setShowError(false);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [tokenError, refreshError]);
  
  // Redirect to home if not authenticated
  if (isLoaded && !isSignedIn) {
    router.push("/");
    return null;
  }
  
  // Loading messages for different phases
  const loadingMessages = [
    "Processing secure token...",
    "Setting up encrypted chat...",
    "Finalizing secure connection..."
  ];
  
  // Only handle errors and token generation in the page component - loading handled by layout
  
  // Show error state ONLY if token generation explicitly failed and after delay
  if ((tokenError || refreshError) && showError) {
    return (
      <div className="flex h-full w-full items-center justify-center p-4">
        <LoadingScreen 
          message={tokenError || refreshError || "Authentication error occurred"} 
          title="Authentication Error"
          description="Unable to access secure messaging"
          icon="shield"
          footerText="Please try again or contact support"
          footerIcon="lock"
          speed={0.9}
          fullScreen={false}
          customButton={
            <div className="flex gap-2">
              <Button 
                onClick={() => router.push("/")}
                variant="outline"
                className="text-xs"
                size="sm"
              >
                Return Home
              </Button>
              <Button 
                onClick={() => {
                  setShowError(false);
                  generateChatTokens();
                }}
                size="sm"
                className="text-xs"
              >
                Try Again
              </Button>
            </div>
          }
        />
      </div>
    );
  }
  
  // Show loading for token generation only since initial loading is handled by layout
  if (isGeneratingToken || (tokenError || refreshError) && !showError) {
    return (
      <div className="h-full w-full flex items-center justify-center p-4">
        <LoadingScreen 
          message={loadingMessages[loadingPhase]} 
          description="Setting up your secure session token"
          icon="key"
          footerIcon="lock"
          footerText="Encrypting your connection"
          speed={0.7}
          phase={loadingPhase}
          fullScreen={false}
        />
      </div>
    );
  }
  
  // If we have a token, show the chat interface
  if (hasToken) {
    return (
      <AnimatePresence mode="wait">
        <motion.div 
          key="chat-interface"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full w-full flex"
        >
          <ChatInterface />
        </motion.div>
      </AnimatePresence>
    );
  }
  
  // If we don't have a token and we're not generating one, show a retry button with LoadingScreen
  return (
    <div className="h-full w-full flex items-center justify-center p-4">
      <LoadingScreen 
        message="Your secure session token could not be generated. Please try refreshing your session."
        title="Chat Session Error"
        description="Unable to access secure messaging"
        icon="shield"
        footerText="Session token required"
        footerIcon="lock"
        speed={0.9}
        fullScreen={false}
        customButton={
          <Button 
            onClick={() => generateChatTokens()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Session</span>
          </Button>
        }
      />
    </div>
  );
} 