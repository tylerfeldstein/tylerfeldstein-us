"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useChatCookieTokens } from "@/hooks/useChatCookieTokens";
import MessagesNavbar from "@/components/MessagesNavbar";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingScreen } from "@/components/loaders/LoadingScreen";
import "./mobile-safe-area.css";
import Head from "next/head";

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const { hasToken, generateChatTokens } = useChatCookieTokens();
  const [showLoadingState, setShowLoadingState] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'initial' | 'authenticating' | 'connecting'>('initial');
  const [loadingPhase, setLoadingPhase] = useState(0);

  // Add viewport meta tag to prevent zoom issues on mobile devices
  useEffect(() => {
    // Check if we need to create or update the viewport meta tag
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    
    if (!viewportMeta) {
      // Create a new viewport meta tag if it doesn't exist
      viewportMeta = document.createElement('meta');
      viewportMeta.setAttribute('name', 'viewport');
      document.head.appendChild(viewportMeta);
    }
    
    // Set the content with settings that prevent auto-zoom on input focus
    viewportMeta.setAttribute('content', 
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover');
    
    // Clean up function
    return () => {
      // Optional: restore default viewport settings when component unmounts
      // though typically this isn't necessary for a layout component
    };
  }, []);

  // Cycle through loading messages for a better UX
  useEffect(() => {
    if (showLoadingState) {
      const interval = setInterval(() => {
        setLoadingPhase(prev => (prev + 1) % 3);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [showLoadingState]);

  // Delay showing the loading state to prevent flicker
  useEffect(() => {
    // Only show loading UI after a small delay to prevent flashing for quick loads
    const timer = setTimeout(() => {
      if (!isLoaded || hasToken === null || (!isSignedIn && isLoaded)) {
        setShowLoadingState(true);
        
        // Determine loading stage based on auth state
        if (!isLoaded) {
          setLoadingStage('initial');
        } else if (!isSignedIn) {
          setLoadingStage('authenticating');
        } else if (hasToken === false) {
          setLoadingStage('connecting');
        }
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [isLoaded, isSignedIn, hasToken]);

  useEffect(() => {
    // Check if the user is authenticated with Clerk
    if (isLoaded && !isSignedIn) {
      const currentPath = window.location.pathname + window.location.search;
      const redirectUrl = new URL('/', window.location.origin);
      redirectUrl.searchParams.set('showSignIn', 'true');
      redirectUrl.searchParams.set('returnTo', encodeURIComponent(currentPath));
      router.push(redirectUrl.toString());
      return;
    }

    // Generate tokens only if we're authenticated and don't have them
    if (isLoaded && isSignedIn && hasToken === false) {
      setLoadingStage('connecting');
      generateChatTokens();
    }
    
    // Hide loading state when everything is ready
    if (isLoaded && ((hasToken === true) || !isSignedIn)) {
      setShowLoadingState(false);
    }
  }, [isLoaded, isSignedIn, router, hasToken, generateChatTokens]);

  // Determine if we should show main content
  const showMainContent = isLoaded && isSignedIn && hasToken !== null;

  // Loading messages for each stage
  const loadingMessages = {
    initial: [
      "Initializing secure chat environment...",
      "Loading secure connection...",
      "Preparing your secure chat space..."
    ],
    authenticating: [
      "Verifying your identity...",
      "Authenticating secure connection...",
      "Preparing for secure communication..."
    ],
    connecting: [
      "Establishing encrypted connection...",
      "Setting up secure chat tokens...",
      "Finalizing your secure session..."
    ]
  };

  const stageDescriptions = {
    initial: "Preparing your secure messaging environment",
    authenticating: "Verifying your secure access credentials",
    connecting: "Establishing end-to-end encrypted channel"
  };

  // Show consolidated loading screen
  if (showLoadingState && (!showMainContent)) {
    return (
      <LoadingScreen 
        message={loadingMessages[loadingStage][loadingPhase]}
        description={stageDescriptions[loadingStage]}
        icon={loadingStage === 'connecting' ? 'key' : 'message'}
        footerIcon={loadingStage === 'connecting' ? 'lock' : 'shield'}
        footerText={loadingStage === 'connecting' ? 'Encrypting your connection' : 'End-to-end encrypted'}
        speed={loadingStage === 'connecting' ? 0.7 : 0.9}
        phase={loadingPhase}
      />
    );
  }

  // Hide the content until everything is ready
  if (!showMainContent) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-[#1a0920] dark:via-[#220a2a] dark:to-[#3a0a47]" />
    );
  }

  return (
    <div className="h-screen w-screen fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-[#1a0920] dark:via-[#220a2a] dark:to-[#3a0a47] overflow-hidden flex flex-col">
      <AnimatePresence mode="wait">
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col h-full w-full"
        >
          <div className="sticky top-0 z-30">
            <MessagesNavbar />
          </div>
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 