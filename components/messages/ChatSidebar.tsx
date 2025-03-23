"use client";

import * as React from "react";
import { useClerk } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { useEffect } from "react";

import {
  BotIcon,
  PlusCircleIcon,
  UserIcon,
  LogOutIcon,
  SettingsIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
  MessageSquareIcon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu,
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuLabel,  
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

// Helper function to format timestamp like iPhone messages
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  
  if (isToday(date)) {
    return format(date, 'h:mm a'); // Today: "3:45 PM"
  } else if (isYesterday(date)) {
    return 'Yesterday'; 
  } else if (date.getFullYear() === new Date().getFullYear()) {
    return format(date, 'MMM d'); // Same year: "Jun 15"
  } else {
    return format(date, 'MM/dd/yy'); // Different year: "06/15/22"
  }
}

interface ChatSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  selectedChatId: Id<"chats"> | null;
  setSelectedChatId: (id: Id<"chats"> | null) => void;
  onNewChat: () => void;
  sidebarWidth?: number;
  isExpanded?: boolean;
}

export function ChatSidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  selectedChatId,
  setSelectedChatId,
  onNewChat,
  sidebarWidth = 260,
  isExpanded = true
}: ChatSidebarProps) {
  const { isSignedIn, user } = useUser();
  const clerk = useClerk();
  const { resolvedTheme } = useTheme();
  
  // Get chats for the current user - use the regular query
  const chats = useQuery(api.messages.listChats) || [];
  
  // Get user ID safely
  const userId = user?.id || "";
  
  // Check if user is admin - this should come from server data, not client metadata
  // Get the current user from Convex to verify admin status securely
  const currentUser = useQuery(api.users.getMe);
  const isAdmin = currentUser?.role === "admin";
  
  // Filter chats to only show those the user is participating in or created
  const visibleChats = chats.filter(chat => chat.isUserParticipant || chat.isCreator);
  
  // Log chat data for debugging
  useEffect(() => {
    if (chats.length > 0) {
      console.log(`Got ${chats.length} chats from server, ${visibleChats.length} visible to user ${userId}`);
      chats.forEach(chat => {
        console.log(`Chat ${chat._id}: name=${chat.name}, isParticipant=${chat.isUserParticipant}, isCreator=${chat.isCreator}`);
      });
    }
  }, [chats, visibleChats.length, userId]);
  
  return (
    <div className={cn(
      "flex flex-col h-full transition-all duration-300",
      isSidebarOpen ? "w-full" : "w-0",
      resolvedTheme === "dark" 
        ? "bg-black/40 backdrop-blur-md" 
        : "bg-white/40 backdrop-blur-md"
    )}>
      {/* Sidebar header */}
      <div className="h-14 px-3 border-b flex items-center justify-between border-border/50">
        {isExpanded ? (
          <h1 className={cn(
            "font-semibold text-sm",
            resolvedTheme === "dark" ? "text-white/90" : "text-black/90"
          )}>
            Messages
          </h1>
        ) : (
          <div className="flex justify-center w-full">
            <MessageSquareIcon className="h-5 w-5 text-primary" />
          </div>
        )}
        {/* {isExpanded && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:flex hidden text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className={cn("h-4 w-4 transition-transform", !isSidebarOpen && "rotate-180")} />
          </Button>
        )} */}
      </div>
      
      {/* New chat button - ChatGPT style */}
      <div className="p-2">
        <Button
          onClick={onNewChat}
          className={cn(
            "w-full rounded-md border text-sm h-10",
            resolvedTheme === "dark" 
              ? "border-white/20 bg-transparent hover:bg-[#2A2B32] text-white/90" 
              : "border-black/20 bg-white hover:bg-gray-50 text-black/90",
            !isExpanded && "justify-center p-2 aspect-square"
          )}
          variant="outline"
        >
          <PlusCircleIcon className={cn("h-4 w-4", isExpanded && "mr-2")} />
          {isExpanded && <span>New chat</span>}
        </Button>
      </div>
      
      {/* Chat list - Updated to match iPhone chat style */}
      <ScrollArea className="flex-1 pt-2">
        <div className={cn(
          "px-2 space-y-1",
          !isExpanded && "flex flex-col items-center"
        )}>
          {visibleChats.map((chat) => {
            // Find the other participant(s) in the chat (excluding current user)
            const otherParticipants = chat.participantsInfo?.filter(
              (p) => p.clerkId !== userId
            ) || [];
            
            // Get the primary participant to show (first non-admin if possible)
            const primaryParticipant = otherParticipants.find(p => p.role !== "admin") || 
                                        otherParticipants[0];
            
            // Format display name - use participant name for non-admins, or chat name for admins
            // Use server-provided admin status for security
            const displayName = 
              isSignedIn && chat.isUserAdmin
                ? chat.name 
                : primaryParticipant?.name || 
                  primaryParticipant?.email || 
                  "Chat";
            
            // Get avatar for the primary participant
            const avatarUrl = primaryParticipant?.imageUrl;
            const avatarFallback = displayName.charAt(0).toUpperCase();
            
            return (
              <Button
                key={chat._id}
                variant="ghost"
                className={cn(
                  "relative text-sm",
                  isExpanded 
                    ? "w-full justify-start gap-3 py-3 px-3 h-auto" 
                    : "flex-col p-0 h-12 w-12 justify-center items-center m-auto collapsed-avatar",
                  resolvedTheme === "dark"
                    ? "text-white/90 hover:bg-[#2A2B32]"
                    : "text-black/90 hover:bg-gray-100",
                  selectedChatId === chat._id && (
                    resolvedTheme === "dark"
                      ? "bg-[#343541] hover:bg-[#343541]"
                      : "bg-gray-100 hover:bg-gray-100"
                  )
                )}
                onClick={() => {
                  setSelectedChatId(chat._id);
                  // On mobile, close sidebar when selecting a chat
                  if (window.innerWidth < 768) {
                    setIsSidebarOpen(false);
                  }
                }}
              >
                <div className={cn(
                  "flex-shrink-0", 
                  isExpanded ? "" : "flex justify-center"
                )}>
                  <Avatar className={cn("h-9 w-9", !isExpanded && "h-8 w-8")}>
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt={displayName} />
                    ) : (
                      <AvatarFallback className={cn(
                        "text-white font-semibold",
                        resolvedTheme === "dark" ? "bg-blue-600" : "bg-blue-500"
                      )}>
                        {avatarFallback}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
                {!isExpanded && chat.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-xs bg-primary text-white rounded-full min-w-5 h-5 flex items-center justify-center px-1">
                    {chat.unreadCount}
                  </span>
                )}
                {isExpanded && (
                  <div className="flex-1 overflow-hidden text-left">
                    <div className="flex justify-between items-baseline space-x-1">
                      <span className="truncate font-medium max-w-[60%]">{displayName}</span>
                      {chat.lastMessage && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0 min-w-[60px] text-right">
                          {formatTimestamp(chat.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    {chat.lastMessage && (
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        {/* Show who sent the message */}
                        {chat.lastMessage.sender === userId ? (
                          <span className="text-muted-foreground mr-1 flex-shrink-0">You: </span>
                        ) : chat.lastMessage.sender === "system_admin" ? (
                          <span className="text-muted-foreground mr-1 flex-shrink-0">Support: </span>
                        ) : chat.lastMessage.isAdmin ? (
                          <span className="text-muted-foreground mr-1 flex-shrink-0">{chat.lastMessage.senderName || "Admin"}: </span>
                        ) : null}
                        <span className="truncate">{chat.lastMessage.content}</span>
                      </div>
                    )}
                  </div>
                )}
                {isExpanded && chat.unreadCount > 0 && (
                  <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {chat.unreadCount}
                  </div>
                )}
              </Button>
            );
          })}
          
          {visibleChats.length === 0 && (
            <div className={cn(
              "flex flex-col items-center justify-center text-center p-4 text-muted-foreground text-sm",
              !isExpanded && "p-2"
            )}>
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <BotIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              {isExpanded && (
                <>
                  <p>No conversations yet</p>
                  <p>Start a new chat to begin</p>
                </>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* User info - Updated for ChatGPT style */}
      <div className={cn(
        "p-3 border-t border-border/50",
        !isExpanded && "flex justify-center p-2"
      )}>
        {isSignedIn && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "h-9 justify-start gap-2 px-2 rounded-md",
                  !isExpanded && "w-9 p-0 justify-center",
                  resolvedTheme === "dark"
                    ? "hover:bg-[#2A2B32] text-white/90"
                    : "hover:bg-gray-100 text-black/90"
                )}
              >
                <Avatar className="h-7 w-7">
                  {user.imageUrl ? (
                    <AvatarImage src={user.imageUrl} alt={user.fullName || "User"} />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {user.firstName?.[0] || user.username?.[0] || "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
                {isExpanded && (
                  <div className="flex-1 overflow-hidden text-sm">
                    <div className="truncate font-medium">
                      {user.fullName || user.username || "User"}
                    </div>
                  </div>
                )}
                {isExpanded && <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className={cn(
                "w-56 border",
                resolvedTheme === "dark"
                  ? "bg-[#202123] border-[#444654]/50 text-white/90"
                  : "bg-white border-gray-200 text-black/90"
              )}
            >
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className={resolvedTheme === "dark" ? "bg-[#444654]/50" : "bg-gray-200"} />
              <DropdownMenuItem className={cn(
                "focus:text-accent-foreground",
                resolvedTheme === "dark" ? "focus:bg-[#2A2B32]" : "focus:bg-gray-100"
              )}>
                <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className={cn(
                "focus:text-accent-foreground",
                resolvedTheme === "dark" ? "focus:bg-[#2A2B32]" : "focus:bg-gray-100"
              )}>
                <SettingsIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className={resolvedTheme === "dark" ? "bg-[#444654]/50" : "bg-gray-200"} />
              <DropdownMenuItem 
                onClick={() => clerk.signOut()}
                className={cn(
                  "focus:text-accent-foreground",
                  resolvedTheme === "dark" ? "focus:bg-[#2A2B32]" : "focus:bg-gray-100"
                )}
              >
                <LogOutIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="ghost"
            className={cn(
              "h-9 justify-start gap-2 px-2 rounded-md",
              !isExpanded && "w-9 p-0 justify-center",
              resolvedTheme === "dark"
                ? "hover:bg-[#2A2B32] text-white/90"
                : "hover:bg-gray-100 text-black/90"
            )}
            onClick={() => clerk.openSignIn()}
          >
            <UserIcon className="h-5 w-5 text-primary" />
            {isExpanded && <span>Sign In</span>}
          </Button>
        )}
      </div>
    </div>
  );
} 