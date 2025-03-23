"use client";

import React, { useEffect, useRef, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import { useTheme } from "next-themes";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { CheckIcon, ClockIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PinWheel } from "@/components/loaders/pinwheel";

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
  senderInfo?: ParticipantInfo;
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
  const messagesResult = useQuery(api.secureMessages.getMessagesSecure, { 
    chatId,
    tokenPayload: {
      userId: user?.id || "",
      userRole: "user", // This will be overridden by server-side check
      exp: 0, // These will be filled by server
      iat: 0,
      jti: "" // This will be filled by server
    }
  });
  const messages = useMemo(() => messagesResult?.messages || [], [messagesResult]);
  const chatQuery = useQuery(api.messages.getChat, { chatId });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  
  // Create a ref for the scroll container
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Function to scroll to bottom smoothly
  const scrollToBottom = ({ behavior = 'smooth' }: { behavior: ScrollBehavior }) => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior });
    }
  };
  
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
        messages.slice(0, 3).forEach((msg: Message, i: number) => {
          console.log(`[MessageList] Message ${i+1}:`);
          console.log(`  - ID: ${msg._id}`);
          console.log(`  - Content: ${msg.content.substring(0, 30)}...`);
          console.log(`  - Sender: ${msg.sender}`);
          console.log(`  - Is from current user: ${msg.sender === user?.id}`);
          console.log(`  - Timestamp: ${new Date(msg.timestamp).toLocaleString()}`);
          
          // Log participant info for this sender
          const senderInfo = participantsInfo.find((p: ParticipantInfo) => p.clerkId === msg.sender);
          console.log(`  - Sender info:`, senderInfo || 'Not found in participants');
        });
      }
    }
  }, [chatId, messages, user?.id, participantsInfo, isAdmin]);

  // Get the last message for auto-scrolling
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  // Auto-scroll when new messages arrive or typing stops
  useEffect(() => {
    if (lastMessage && !typing) {
      scrollToBottom({
        behavior: "smooth"
      });
    }
  }, [messages.length, lastMessage, typing]);

  // Auto-scroll when the component initially mounts with messages
  useEffect(() => {
    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (messages.length > 0) {
        scrollToBottom({
          behavior: "auto" 
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Track loading state changes from query
  useEffect(() => {
    setIsLoading(messagesResult === undefined);
  }, [messagesResult]);

  // Smoother message loading with a small delay to prevent scroll jumps
  useEffect(() => {
    if (isLoading && containerRef.current) {
      const currentScroll = containerRef.current.scrollTop;
      containerRef.current.style.overflow = 'hidden';
      
      return () => {
        if (containerRef.current) {
          containerRef.current.style.overflow = 'auto';
          // Restore scroll position after loading
          setTimeout(() => {
            if (containerRef.current) {
              containerRef.current.scrollTop = currentScroll;
            }
          }, 50);
        }
      };
    }
  }, [isLoading]);

  if (!chatId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-md"
        >
          <p className="text-muted-foreground mb-2">Select a chat or start a new conversation</p>
          <p className="text-xs text-muted-foreground opacity-75">Your messages will appear here</p>
        </motion.div>
      </div>
    );
  }
  
  // If chat query is still loading or failed
  if (!chatQuery) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-4"
        >
          <PinWheel size={35} speed={0.9} />
          <p className="text-muted-foreground mb-2">Loading chat data...</p>
        </motion.div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-md"
        >
          <p className="text-muted-foreground mb-3">No messages yet</p>
          <div className="px-4 py-3 rounded-lg bg-primary/5 border border-primary/10 mb-4">
            <p className="text-xs text-muted-foreground">Messages in this chat are private to participants only</p>
          </div>
          <p className="text-xs text-muted-foreground opacity-75">
            Start by sending a message below
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden" ref={containerRef}>
      <ScrollArea className="h-full p-4 overflow-y-auto" scrollHideDelay={200}>
        <div className="flex flex-col gap-6 pb-24">
          <div className="bg-primary/5 border border-primary/10 rounded-lg px-4 py-2 mb-2 text-center">
            <p className="text-xs text-muted-foreground">Messages in this chat are private to participants only</p>
          </div>
          
          <AnimatePresence initial={false}>
            {messages.map((message: Message, index) => {
              // Determine if this is the current user's message
              // Clerk's user ID might have a different prefix than the message sender ID
              // Try to match the ID part after the last underscore if the full ID doesn't match
              const isUserMessage = user?.id === message.sender || 
                                  (user?.id && message.sender && 
                                  user.id.split('_').pop() === message.sender.split('_').pop());
              
              // Determine if this is a system message and if admin is viewing it
              const isSystemMessage = message.isSystemMessage || false;
              
              // Use isAdmin from the message itself and not from client side checks
              const isAdminMessage = message.isAdmin && !isSystemMessage;
              
              // Check if message is read by the current user
              const isRead = message.read?.includes(user?.id || "");
              
              // For admin view, we want to treat system messages as if they were sent by the admin
              // so they appear on the right side but with a different color
              const isSupportMessageForAdmin = isSystemMessage && isAdmin;
              
              // Get timestamp from the message
              const messageDate = new Date(message.timestamp);
              const formattedTime = format(messageDate, "h:mm a");
              const fullDate = format(messageDate, "MMMM d, yyyy 'at' h:mm a");
              
              // Find sender info in participantsInfo
              const senderInfo = message.senderInfo || participantsInfo.find((p: ParticipantInfo) => 
                p.clerkId === message.sender ||
                (p.clerkId && message.sender && 
                p.clerkId.split('_').pop() === message.sender.split('_').pop())
              );

              // Handle system messages vs user/admin messages
              let senderName;
              if (isSystemMessage) {
                senderName = "Support";
              } else if (isAdminMessage) {
                // For admin messages, try to get the name from multiple sources
                const adminName = senderInfo?.name || 
                          participantsInfo.find((p: ParticipantInfo) => p.role === "admin")?.name ||
                          currentUser?.name ||
                          "Admin";
                senderName = adminName;
              } else {
                senderName = senderInfo?.name || senderInfo?.email || "User";
              }
              
              const senderImage = isSystemMessage ? null : senderInfo?.imageUrl;
              const senderInitial = isSystemMessage ? "S" : senderName.charAt(0).toUpperCase();
              
              // Determine message position - right for current user messages AND system messages for admin view
              const showOnRightSide = isUserMessage || isSupportMessageForAdmin;

              // Check if this is a new day compared to the previous message
              const showDateDivider = index === 0 || (
                index > 0 && 
                new Date(message.timestamp).getDate() !== new Date(messages[index - 1].timestamp).getDate()
              );

              // Animation variables
              const messageVariants = {
                initial: showOnRightSide 
                  ? { opacity: 0, x: 20 } 
                  : { opacity: 0, x: -20 },
                animate: { opacity: 1, x: 0 },
                exit: { opacity: 0 }
              };
              
              return (
                <React.Fragment key={message._id}>
                  {showDateDivider && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-center my-4"
                    >
                      <Badge variant="outline" className="text-xs font-normal bg-background/60 backdrop-blur-sm">
                        {format(messageDate, "EEEE, MMMM d, yyyy")}
                      </Badge>
                    </motion.div>
                  )}
                  
                  <motion.div 
                    variants={messageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                    className={`flex ${
                      showOnRightSide ? "justify-end" : "justify-start"
                    } items-start gap-3 mb-4 group`}
                  >
                    {!showOnRightSide && (
                      <div className="flex-shrink-0 mt-1">
                        <Avatar className="h-8 w-8 border shadow-sm">
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
                    
                    <div className={`flex flex-col max-w-[85%] ${showOnRightSide ? "items-end" : "items-start"}`}>
                      {!showOnRightSide && (
                        <span className="text-xs text-muted-foreground mb-1 flex items-center gap-1 px-1">
                          {senderName}
                          {isAdminMessage && (
                            <Badge variant="destructive" className="text-[10px] px-1 py-0.5 ml-1">
                              Admin
                            </Badge>
                          )}
                        </span>
                      )}
                      {showOnRightSide && isSystemMessage && isAdmin && (
                        <span className="text-xs text-muted-foreground mb-1 px-1">
                          Support
                        </span>
                      )}
                      
                      <TooltipProvider delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "rounded-2xl px-4 py-2.5 shadow-sm group-hover:shadow-md transition-shadow",
                                showOnRightSide
                                  ? isSupportMessageForAdmin
                                    ? resolvedTheme === "dark" 
                                      ? "bg-purple-900/80 text-white" 
                                      : "bg-indigo-400/90 text-white"
                                    : resolvedTheme === "dark" 
                                      ? "bg-[#0c84fe]/95 text-white" 
                                      : "bg-[#0c84fe]/95 text-white"
                                  : resolvedTheme === "dark" 
                                    ? "bg-[#0c84fe]/95 text-white" 
                                    : "bg-[#0c84fe]/95 text-white",
                                showOnRightSide ? "rounded-tr-none" : "rounded-tl-none"
                              )}
                            >
                              <p className="whitespace-pre-wrap break-words">{message.content}</p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs p-2">
                            {fullDate}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <div className={`flex items-center gap-1 mt-1 text-[10px] text-muted-foreground px-1
                        ${showOnRightSide ? "justify-end" : "justify-start"}`}
                      >
                        <span>{formattedTime}</span>
                        {showOnRightSide && !isSystemMessage && (
                          <span className="ml-1">
                            {isRead ? (
                              <CheckIcon className="h-3 w-3 text-primary" />
                            ) : (
                              <ClockIcon className="h-3 w-3" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {showOnRightSide && (
                      <div className="flex-shrink-0 mt-1">
                        <Avatar className="h-8 w-8 border shadow-sm">
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
                  </motion.div>
                </React.Fragment>
              );
            })}
          </AnimatePresence>
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
    </div>
  );
} 