"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import { useTheme } from "next-themes";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";

interface MessageListProps {
  chatId: Id<"chats">;
}

// Define the message structure based on the actual API response
interface Message {
  _id: Id<"messages">;
  chatId: Id<"chats">;
  sender: string;
  content: string;
  timestamp: number;
  read?: string[];
  isAdmin?: boolean;
  isSystemMessage?: boolean;
}

// Define participant info structure
interface ParticipantInfo {
  clerkId: string;
  name?: string;
  email?: string;
  imageUrl?: string;
  role?: string;
}

export function MessageList({ chatId }: MessageListProps) {
  const { user } = useUser();
  const { resolvedTheme } = useTheme();
  const messagesResult = useQuery(api.messages.getMessages, { chatId });
  const messages = useMemo(() => messagesResult || [], [messagesResult]);
  const chatQuery = useQuery(api.messages.getChat, { chatId });
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Get participants info from the chat
  const participantsInfo = chatQuery?.participantsInfo || [];
  
  // Get current user role info securely from server
  const currentUser = useQuery(api.users.getMe);
  const isAdmin = currentUser?.role === "admin";
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  // Log chat and message data for debugging
  useEffect(() => {
    if (chatId) {
      console.log(`[MessageList] Chat ID: ${chatId}`);
      console.log(`[MessageList] Messages loaded: ${messages.length}`);
      console.log(`[MessageList] Current user ID: ${user?.id}`);
      console.log(`[MessageList] Is admin: ${isAdmin}`);
      
      if (messages.length === 0) {
        console.log("[MessageList] No messages found for this chat");
      } else {
        // Log message sender details to debug issues
        messages.slice(0, 3).forEach((msg: any, i: number) => {
          console.log(`[MessageList] Message ${i+1}:`);
          console.log(`  - ID: ${msg._id}`);
          console.log(`  - Content: ${msg.content.substring(0, 30)}...`);
          console.log(`  - Sender: ${msg.sender}`);
          console.log(`  - Is from current user: ${msg.sender === user?.id}`);
          console.log(`  - Timestamp: ${new Date(msg.timestamp).toLocaleString()}`);
          
          // Log participant info for this sender
          const senderInfo = participantsInfo.find(p => p.clerkId === msg.sender);
          console.log(`  - Sender info:`, senderInfo || 'Not found in participants');
        });
      }
    }
  }, [chatId, messages, user?.id, participantsInfo, isAdmin]);

  if (!chatId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <p className="text-muted-foreground">Select a chat or start a new conversation</p>
      </div>
    );
  }
  
  // If chat query is still loading or failed
  if (!chatQuery) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <p className="text-muted-foreground">Loading chat data...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <p className="text-muted-foreground">No messages yet</p>
        <p className="text-xs text-muted-foreground mt-2">Messages in this chat are private to participants only</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 p-4 overflow-y-auto">
      <div className="flex flex-col gap-6 pb-24">
        <p className="text-xs text-muted-foreground text-center">Messages in this chat are private to participants only</p>
        {messages.map((message: Message) => {
          // Determine if this is the current user's message
          // Clerk's user ID might have a different prefix than the message sender ID
          // Try to match the ID part after the last underscore if the full ID doesn't match
          const isUserMessage = user?.id === message.sender || 
                               (user?.id && message.sender && 
                               user.id.split('_').pop() === message.sender.split('_').pop());
          
          // Determine if this is a system message and if admin is viewing it
          const isSystemMessage = message.isSystemMessage || false;
          
          // Check if message is read by the current user
          const isRead = message.read?.includes(user?.id || "");
          
          // For admin view, we want to treat system messages as if they were sent by the admin
          // so they appear on the right side but with a different color
          const isSupportMessageForAdmin = isSystemMessage && isAdmin;
          
          // Get timestamp from the message
          const messageDate = new Date(message.timestamp);
          const formattedTime = format(messageDate, "h:mm a");
          
          // Find sender info in participantsInfo
          const senderInfo = participantsInfo.find((p: ParticipantInfo) => 
            p.clerkId === message.sender ||
            (p.clerkId && message.sender && 
             p.clerkId.split('_').pop() === message.sender.split('_').pop())
          );
          const senderName = isSystemMessage ? "Support" : (senderInfo?.name || senderInfo?.email || "User");
          const senderImage = isSystemMessage ? null : senderInfo?.imageUrl;
          const senderInitial = isSystemMessage ? "S" : senderName.charAt(0).toUpperCase();
          
          // Use isAdmin from the message itself and not from client side checks
          const isAdminMessage = message.isAdmin && !isSystemMessage;
          
          // Determine message position - right for current user messages AND system messages for admin view
          const showOnRightSide = isUserMessage || isSupportMessageForAdmin;
          
          return (
            <div 
              key={message._id} 
              className={`flex ${
                showOnRightSide ? "justify-end" : "justify-start"
              } items-start gap-3 mb-4`}
            >
              {!showOnRightSide && (
                <div className="flex-shrink-0 mt-1">
                  <Avatar className="h-8 w-8">
                    {senderImage ? (
                      <AvatarImage src={senderImage} alt={senderName} />
                    ) : (
                      <AvatarFallback className={cn(
                        "text-white font-medium",
                        isSystemMessage
                          ? "bg-gradient-to-br from-indigo-500 to-purple-600" 
                          : isAdminMessage 
                            ? "bg-destructive" 
                            : "bg-primary"
                      )}>
                        {senderInitial}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
              )}
              
              <div className={`flex flex-col max-w-[80%] ${showOnRightSide ? "items-end" : "items-start"}`}>
                {!showOnRightSide && (
                  <span className="text-xs text-muted-foreground mb-1">
                    {senderName}
                    {isAdminMessage && (
                      <span className="ml-1 text-[10px] text-destructive">(Admin)</span>
                    )}
                  </span>
                )}
                {showOnRightSide && isSystemMessage && isAdmin && (
                  <span className="text-xs text-muted-foreground mb-1">
                    Support
                  </span>
                )}
                <div
                  className={`rounded-lg px-4 py-2 ${
                    showOnRightSide
                      ? isSupportMessageForAdmin
                        ? resolvedTheme === "dark" 
                          ? "bg-indigo-600/80 text-white" 
                          : "bg-indigo-500/80 text-white"
                        : resolvedTheme === "dark" 
                          ? "bg-primary/90 text-primary-foreground" 
                          : "bg-primary/90 text-primary-foreground"
                      : resolvedTheme === "dark" 
                        ? "bg-muted/90" 
                        : "bg-muted/90"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {formattedTime}
                  {!isUserMessage && isRead && (
                    <span className="ml-2 text-[10px]">✓ Read</span>
                  )}
                </span>
              </div>
              
              {showOnRightSide && (
                <div className="flex-shrink-0 mt-1">
                  <Avatar className="h-8 w-8">
                    {isSupportMessageForAdmin ? (
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium">
                        S
                      </AvatarFallback>
                    ) : user?.imageUrl ? (
                      <AvatarImage src={user.imageUrl} alt={user?.fullName || ""} />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary/80">
                        {user?.firstName?.charAt(0) || user?.username?.charAt(0) || "U"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
              )}
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>
    </ScrollArea>
  );
} 