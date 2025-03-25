"use client";

import React, { useEffect, useRef, useMemo, useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { CheckIcon, ClockIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PinWheel } from "@/components/loaders/pinwheel";
import NewMessageIndicator from "./NewMessageIndicator";
import TypingIndicator from "./TypingIndicator";

// Import the TypingUser interface for correct typing
interface TypingUser {
  userId: string;
  name?: string;
  email?: string;
  imageUrl?: string;
  lastUpdated: number;
}

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

// Type for participants that can be null from the API
type ParticipantInfoWithNull = ParticipantInfo | null;

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
  
  // Fetch typing status
  const typingStatus = useQuery(api.secureMessages.getTypingStatusSecure, chatId ? {
    chatId,
    tokenPayload: {
      userId: user?.id || "",
      userRole: "user", // This will be overridden by server-side check
      exp: 0, // These will be filled by server
      iat: 0,
      jti: "" // This will be filled by server
    }
  } : "skip");
  
  // Mutation to mark messages as read
  const markMessagesAsRead = useMutation(api.secureMessages.markMessagesAsReadSecure);

  const messages = useMemo(() => messagesResult?.messages || [], [messagesResult]);
  const chatQuery = useQuery(api.messages.getChat, { chatId });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // State to track if user has scrolled up and isn't at the bottom
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewUnreadMessages, setHasNewUnreadMessages] = useState(false);
  
  // Track the previous message count to detect new messages
  const prevMessageCountRef = useRef(0);
  
  // Track when messages were last marked as read
  const lastMarkAsReadRef = useRef(0);
  
  // Create a ref for the scroll container
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Function to mark messages as read, with debouncing
  const markMessagesAsReadIfNeeded = useCallback(() => {
    if (!chatId || !user?.id) return;
    
    // Debounce marking as read (don't mark more often than every 2 seconds)
    const now = Date.now();
    if (now - lastMarkAsReadRef.current < 2000) return;
    
    // Update last mark as read timestamp
    lastMarkAsReadRef.current = now;
    
    // Call the mutation to mark messages as read
    markMessagesAsRead({
      chatId,
      tokenPayload: {
        userId: user.id,
        userRole: "user", // This will be overridden by server-side check
        exp: 0, // These will be filled by server
        iat: 0,
        jti: "" // This will be filled by server
      }
    }).then(() => {
      console.log("[MessageList] Marked messages as read");
    }).catch(error => {
      console.error("[MessageList] Error marking messages as read:", error);
    });
  }, [chatId, user?.id, markMessagesAsRead]);
  
  // Function to scroll to bottom smoothly
  const scrollToBottom = useCallback(({ behavior = 'smooth' }: { behavior: ScrollBehavior }) => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior });
      setIsAtBottom(true);
      setHasNewUnreadMessages(false);
      
      // When scrolling to bottom, update the previous message count
      // to prevent false "new messages" notifications
      prevMessageCountRef.current = messages.length;
      
      // Mark messages as read when scrolling to bottom
      markMessagesAsReadIfNeeded();
    }
  }, [messages.length, markMessagesAsReadIfNeeded]);

  // Function to check if user is at bottom of chat
  const checkIfAtBottom = useCallback(() => {
    if (containerRef.current) {
      // Look for the first direct child that has overflow-y-auto
      const scrollableElement = containerRef.current.querySelector('.overflow-y-auto');
      if (scrollableElement) {
        const { scrollTop, scrollHeight, clientHeight } = scrollableElement as HTMLElement;
        // Consider "at bottom" if within 100px of the bottom
        const atBottom = scrollHeight - scrollTop - clientHeight < 100;
        
        // Only update state if the value has changed to avoid re-renders
        if (atBottom !== isAtBottom) {
          setIsAtBottom(atBottom);
          
          // If user manually scrolled to the bottom, clear the new messages notification
          if (atBottom) {
            setHasNewUnreadMessages(false);
            
            // Mark messages as read when user scrolls to bottom
            markMessagesAsReadIfNeeded();
          }
        }
        
        return atBottom;
      }
    }
    return true;
  }, [isAtBottom, markMessagesAsReadIfNeeded]);
  
  // Handle scroll events to detect if user has scrolled up
  const handleScroll = useCallback(() => {
    checkIfAtBottom();
  }, [checkIfAtBottom]);
  
  // Get participants info from the chat
  const participantsInfo = useMemo(() => chatQuery?.participantsInfo || [], [chatQuery?.participantsInfo]);
  
  // Get current user role info securely from server
  const currentUser = useQuery(api.users.getMe);
  const isAdmin = currentUser?.role === "admin";
  
  // Auto-scroll to bottom when new messages arrive, but only if user is already at the bottom
  useEffect(() => {
    // Only scroll automatically if there are messages and the user is already at the bottom
    // We also need to ensure we're not scrolling on every render, only when new messages arrive
    const messageCount = messages.length;
    
    if (messageCount > 0 && isAtBottom) {
      // Use a small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        scrollToBottom({ behavior: "smooth" });
        
        // Mark messages as read when at bottom and new messages arrive
        markMessagesAsReadIfNeeded();
      }, 50);
      return () => clearTimeout(timer);
    } else if (messageCount > 0 && !isAtBottom) {
      // Only set hasNewUnreadMessages if there are actually new messages (count increased)
      if (messageCount > prevMessageCountRef.current) {
        setHasNewUnreadMessages(true);
      }
    }
    
    // Update the previous message count after checking
    prevMessageCountRef.current = messageCount;
  }, [messages.length, isAtBottom, markMessagesAsReadIfNeeded, scrollToBottom]);
  
  // Mark messages as read when component mounts if at bottom
  useEffect(() => {
    if (chatId && isAtBottom && messages.length > 0) {
      markMessagesAsReadIfNeeded();
    }
  }, [chatId, isAtBottom, messages.length, markMessagesAsReadIfNeeded]);
  
  // Auto-scroll when the component initially mounts with messages - only once on mount or when messages change
  useEffect(() => {
    // If this is the first time messages are loaded or messages have changed
    if (messages.length > 0) {
      // Add a small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        // Only scroll if we're already at the bottom or this is the first load
        if (isAtBottom) {
          scrollToBottom({
            behavior: "auto" 
          });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [chatId, isAtBottom, scrollToBottom, messages.length]);

  // Log chat and message data for debugging
  useEffect(() => {
    if (chatId) {
      // console.log(`[MessageList] Chat ID: ${chatId}`);
      // console.log(`[MessageList] Messages loaded: ${messages.length}`);
      // console.log(`[MessageList] Current user ID: ${user?.id}`);
      // console.log(`[MessageList] Is admin: ${isAdmin}`);
      
      if (messages.length === 0) {
        // console.log("[MessageList] No messages found for this chat");
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
          // const senderInfo = participantsInfo.find((p: ParticipantInfo) => p.clerkId === msg.sender);
          // console.log(`[MessageList] Sender info:`, senderInfo || 'Not found in participants');
        });
      }
    }
  }, [chatId, messages, user?.id, participantsInfo, isAdmin]);

  // Track loading state changes from query
  useEffect(() => {
    setIsLoading(messagesResult === undefined);
  }, [messagesResult]);

  // Smoother message loading with a small delay to prevent scroll jumps
  useEffect(() => {
    if (isLoading && containerRef.current) {
      // Don't lock scrolling as it prevents manual scrolling
      // Just store the current scroll position to restore it if needed
      const currentContainer = containerRef.current;
      const scrollableElement = currentContainer.querySelector('.overflow-y-auto');
      const currentScroll = scrollableElement ? (scrollableElement as HTMLElement).scrollTop : 0;
      
      return () => {
        // After loading completes, try to maintain the scroll position
        setTimeout(() => {
          if (currentContainer) {
            const scrollableElement = currentContainer.querySelector('.overflow-y-auto');
            if (scrollableElement && !isAtBottom) {
              (scrollableElement as HTMLElement).scrollTop = currentScroll;
            }
          }
        }, 50);
      };
    }
  }, [isLoading, isAtBottom]);

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
  
  // If chat not found or no longer exists
  if (chatQuery === null) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-md p-6 bg-background/80 backdrop-blur-md border border-border/50 rounded-lg shadow-lg"
        >
          <h3 className="text-lg font-medium mb-2 text-destructive">Chat Not Available</h3>
          <p className="text-muted-foreground mb-3">This chat may have been deleted or you no longer have access to it.</p>
          <div className="px-4 py-3 rounded-lg bg-primary/5 border border-primary/10 mb-4">
            <p className="text-xs text-muted-foreground">Try selecting another chat from the sidebar</p>
          </div>
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
    <div 
      ref={containerRef}
      className="relative h-full flex flex-col overflow-hidden"
      onScroll={handleScroll}
    >
      <div className="overflow-y-auto flex-1 h-full pt-2 sm:pt-4 px-2 sm:px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence initial={false}>
            {isLoading && !messages.length && (
              <motion.div
                className="flex h-full w-full items-center justify-center p-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <PinWheel size={40} />
              </motion.div>
            )}
            
            {messages.map((message, index) => {
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

              
              // Get timestamp from the message
              const messageDate = new Date(message.timestamp);
              const formattedTime = format(messageDate, "h:mm a");
              const fullDate = format(messageDate, "MMMM d, yyyy 'at' h:mm a");
              
              // Find sender info in participantsInfo
              const senderInfo = message.senderInfo || participantsInfo.find((p: ParticipantInfoWithNull) => 
                p && (
                  p.clerkId === message.sender ||
                  (p.clerkId && message.sender && 
                  p.clerkId.split('_').pop() === message.sender.split('_').pop())
                )
              );

              // Debug log for admin messages
              if (message.isAdmin && !isSystemMessage) {
                console.log(`[MessageList] Admin message from: ${message.sender}`);
                console.log(`[MessageList] Admin senderInfo:`, senderInfo);
                console.log(`[MessageList] All participants:`, participantsInfo);
              }

              // Handle system messages vs user/admin messages
              let senderName;
              if (isSystemMessage) {
                senderName = "Support";
              } else if (isAdminMessage) {
                // For admin messages, try multiple sources to get the admin name
                const adminInfo = senderInfo || participantsInfo.find((p: ParticipantInfoWithNull) => p && p.role === "admin");
                senderName = adminInfo?.name || currentUser?.name || "Admin";
                
                // Log which source we're using for the admin name
                if (senderInfo) {
                  console.log(`[MessageList] Using direct senderInfo for admin name: ${senderName}`);
                } else if (adminInfo) {
                  console.log(`[MessageList] Using admin participant for name: ${senderName}`);
                } else {
                  console.log(`[MessageList] Using fallback name for admin: ${senderName}`);
                }
              } else {
                senderName = senderInfo?.name || senderInfo?.email || "User";
              }
              
              // Ensure we have the correct sender image
              let senderImage = null;
              if (isSystemMessage) {
                senderImage = null; // System messages don't have images
              } else if (isAdminMessage) {
                // For admin messages, try to find an image from the admin user
                const adminInfo = senderInfo || participantsInfo.find((p: ParticipantInfoWithNull) => p && p.role === "admin");
                senderImage = adminInfo?.imageUrl || null;
                
                if (senderImage) {
                  console.log(`[MessageList] Using admin image URL: ${senderImage}`);
                }
              } else {
                // For regular user messages
                senderImage = senderInfo?.imageUrl || null;
              }
              
              // Define the initial for avatar fallback
              const senderInitial = isSystemMessage 
                ? "S" 
                : isAdminMessage 
                  ? (senderName?.charAt(0).toUpperCase() || "A")
                  : (senderName?.charAt(0).toUpperCase() || "U");
              
              // Determine message position
              // - User messages should show on the right
              // - Admin messages should show on the right for the admin user
              // - System messages should always appear on the left for users
              // - System messages can appear on the right for admins only if they aren't marked as system messages
              const showOnRightSide = (isUserMessage && !isSystemMessage) || 
                                     (isAdminMessage && isAdmin);

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
                      className="flex justify-center my-3 sm:my-4"
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
                    } items-start gap-2 sm:gap-3 mb-3 sm:mb-4 group`}
                  >
                    {!showOnRightSide && (
                      <div className="flex-shrink-0 mt-1">
                        <Avatar className="h-7 w-7 sm:h-8 sm:w-8 border shadow-sm">
                          {senderImage ? (
                            // Show sender's avatar if available
                            <AvatarImage src={senderImage} alt={senderName || "User"} />
                          ) : isSystemMessage ? (
                            // System message avatar - Support icon with special styling
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium">
                              S
                            </AvatarFallback>
                          ) : isAdminMessage ? (
                            // Admin avatar fallback
                            <AvatarFallback className="bg-destructive text-white font-medium">
                              {senderInitial}
                            </AvatarFallback>
                          ) : (
                            // Regular user fallback
                            <AvatarFallback className="bg-primary text-white font-medium">
                              {senderInitial}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </div>
                    )}
                    
                    <div className={`flex flex-col max-w-[75%] sm:max-w-[85%] ${showOnRightSide ? "items-end" : "items-start"}`}>
                      {!showOnRightSide && (
                        <span className="text-xs text-muted-foreground mb-1 flex items-center gap-1 px-1">
                          {isSystemMessage ? (
                            <>
                              <span>Support</span>
                              <Badge variant="secondary" className="text-[10px] px-1 py-0.5 ml-1">
                                System
                              </Badge>
                            </>
                          ) : senderName}
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
                                "rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 shadow-sm group-hover:shadow-md transition-shadow text-sm sm:text-base",
                                isAdminMessage 
                                  ? "bg-[#0084ff]/95 text-white" // Admin messages are always blue
                                  : showOnRightSide
                                    ? isSystemMessage
                                      ? resolvedTheme === "dark" 
                                        ? "bg-indigo-700/95 text-white" 
                                        : "bg-indigo-500/95 text-white"
                                      : resolvedTheme === "dark" 
                                        ? "bg-[#0084ff]/95 text-white" 
                                        : "bg-[#0084ff]/95 text-white"
                                    : isSystemMessage
                                      ? resolvedTheme === "dark"
                                        ? "bg-indigo-800/95 text-white"
                                        : "bg-indigo-600/95 text-white"
                                      : resolvedTheme === "dark" 
                                        ? "bg-[#303030]/95 text-white" 
                                        : "bg-[#e9e9eb]/95 text-black",
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
                        <Avatar className="h-7 w-7 sm:h-8 sm:w-8 border shadow-sm">
                          {isUserMessage && user?.imageUrl ? (
                            // Current user's avatar for messages sent by them
                            <AvatarImage src={user.imageUrl} alt={user.fullName || "You"} />
                          ) : isSystemMessage ? (
                            // Support/system message avatar
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium">
                              S
                            </AvatarFallback>
                          ) : isAdminMessage && senderImage ? (
                            // Admin's avatar if available
                            <AvatarImage src={senderImage} alt={senderName || "Admin"} />
                          ) : (
                            // Fallback avatar with appropriate styling
                            <AvatarFallback className={cn(
                              "text-white font-medium",
                              isSystemMessage
                                ? "bg-gradient-to-br from-indigo-500 to-purple-600" 
                                : isAdminMessage 
                                  ? "bg-destructive" 
                                  : "bg-primary"
                            )}>
                              {isUserMessage ? (user?.fullName?.[0] || "Y").toUpperCase() : senderInitial}
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
          
          {/* Add spacer for mobile input */}
          <div className="h-28 md:h-32" aria-hidden="true"></div>
          
          {/* Typing indicator */}
          <AnimatePresence>
            {typingStatus && 
             !typingStatus.error && 
             typingStatus.typingUsers && 
             typingStatus.typingUsers.length > 0 && (
              <TypingIndicator 
                users={typingStatus.typingUsers.filter(Boolean) as unknown as TypingUser[]} 
                className="absolute bottom-32 md:bottom-28 left-4" 
              />
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* New Messages Indicator with scroll to bottom button */}
      <AnimatePresence>
        {hasNewUnreadMessages && !isAtBottom && (
          <div className="absolute bottom-36 md:bottom-32 left-1/2 transform -translate-x-1/2">
            <NewMessageIndicator
              onClick={() => scrollToBottom({ behavior: "smooth" })}
              variant="button"
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
} 