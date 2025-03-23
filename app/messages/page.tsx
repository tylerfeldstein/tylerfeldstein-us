"use client";

import { ChatInterface } from "@/components/messages/ChatInterface";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function MessagesPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  // Get the current user to check their role
  const currentUser = useQuery(api.users.getMe);
  
  // Redirect to home if not authenticated
  if (isLoaded && !isSignedIn) {
    router.push("/");
    return null;
  }
  
  if (!isLoaded || currentUser === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }
  
  // User role is available in currentUser.role if needed
  // The chat components can use this directly through the useConvexUser hook
  
  return <ChatInterface />;
} 