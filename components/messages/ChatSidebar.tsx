"use client";

import * as React from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
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
  MessageSquareIcon,
  MessageSquarePlus
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
import UnreadBadge from "./UnreadBadge";

// Define participant info interface
interface ParticipantInfo {
  clerkId: string;
  name?: string;
  email?: string;
  imageUrl?: string;
  role?: string;
}

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
  setSelectedChatId: (chatId: Id<"chats">) => void;
  onNewChat: () => void;
  sidebarWidth: number;
  isExpanded: boolean;
}

export function ChatSidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  selectedChatId,
  setSelectedChatId,
  onNewChat,
  sidebarWidth,
  isExpanded,
}: ChatSidebarProps) {
  const chats = useQuery(api.messages.listChats) || [];
  const { user } = useUser();
  const clerk = useClerk();
  const { resolvedTheme } = useTheme();
  
  // Get unread messages across all chats
  const unreadMessages = useQuery(api.messages.getUnreadMessageCounts) || {};
  
  if (!user) {
    return <div className="p-4">Please log in to access chats</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <h2 className={cn(
          "text-xl font-semibold",
          !isExpanded && "sr-only" // Hide title when collapsed
        )}>
          Conversations
        </h2>
      </div>
      
      <ScrollArea className="flex-1">
        <div className={cn(
          "flex",
          isExpanded ? "flex-col space-y-2 px-2" : "flex-col items-center px-1 space-y-3"
        )}>
          {chats.map((chat) => {
            const unreadCount = unreadMessages[chat._id] || 0;
            
            return (
              <Button
                key={chat._id}
                variant={selectedChatId === chat._id ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start relative group", 
                  selectedChatId === chat._id && resolvedTheme === "light" 
                    ? "bg-blue-50 hover:bg-blue-100 text-blue-800" 
                    : "",
                  isExpanded 
                    ? "px-2 py-6" 
                    : "flex-col p-0 h-12 w-12 justify-center items-center m-auto collapsed-avatar",
                )}
                onClick={() => {
                  setSelectedChatId(chat._id);
                  
                  // On mobile, close sidebar after selecting chat
                  if (window.innerWidth < 768) {
                    setIsSidebarOpen(false);
                  }
                }}
              >
                {/* Display avatar of the other participant or admin */}
                <Avatar className={isExpanded ? "mr-2 h-8 w-8" : "h-8 w-8"}>
                  {(() => {
                    // Find the other participant (not the current user)
                    const otherParticipant = chat.participantsInfo?.find(
                      (p: ParticipantInfo) => p && p.clerkId !== user.id
                    );
                    
                    // Find admin participant as fallback
                    const adminParticipant = chat.participantsInfo?.find(
                      (p: ParticipantInfo) => p && p.role === "admin"
                    );
                    
                    // Determine which avatar and fallback to use
                    let avatarUrl = "";
                    let fallbackInitial = "C";
                    
                    if (otherParticipant) {
                      avatarUrl = otherParticipant.imageUrl || "";
                      fallbackInitial = (otherParticipant.name?.[0] || 
                                      otherParticipant.email?.[0] || "C").toUpperCase();
                    } else if (adminParticipant) {
                      avatarUrl = adminParticipant.imageUrl || "";
                      fallbackInitial = (adminParticipant.name?.[0] || 
                                      adminParticipant.email?.[0] || "S").toUpperCase();
                    }
                    
                    return (
                      <>
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {fallbackInitial}
                        </AvatarFallback>
                      </>
                    );
                  })()}
                </Avatar>
                
                {isExpanded && (
                  <div className="flex-1 text-left truncate">
                    <span className="inline-block max-w-[90%] truncate">
                      {/* Format chat name like iOS Messages */}
                      {(() => {
                        console.log(`[ChatSidebar] Processing chat ${chat._id}, name: ${chat.name}`);
                        console.log(`[ChatSidebar] Chat has ${chat.participantsInfo?.length || 0} participants info`);
                        
                        // Priority 1: Find other participant (not current user)
                        if (chat.participantsInfo && chat.participantsInfo.length > 0) {
                          // Find the other participant (not the current user)
                          const otherParticipant = chat.participantsInfo.find(
                            (p: ParticipantInfo) => p && p.clerkId !== user.id
                          );
                          
                          // If we found another participant, use their info
                          if (otherParticipant) {
                            console.log(`[ChatSidebar] Found other participant:`, otherParticipant);
                            return otherParticipant.name || otherParticipant.email || "Chat";
                          }
                          
                          // Priority 2: Look for admin user in participants
                          const adminParticipant = chat.participantsInfo.find(
                            (p: ParticipantInfo) => p && p.role === "admin"
                          );
                          
                          if (adminParticipant) {
                            console.log(`[ChatSidebar] Found admin participant:`, adminParticipant);
                            return adminParticipant.name || adminParticipant.email || "Support";
                          }
                        }
                        
                        // Priority 3: Fall back to support or chat name
                        if (chat.lastMessageContent) {
                          return "Support Chat";
                        }
                        
                        // If this is not a "New Chat", use its name
                        if (chat.name && chat.name !== "New Chat") {
                          return chat.name;
                        }
                        
                        // Default fallback
                        return "New Message";
                      })()}
                    </span>
                    {/* Show last message preview */}
                    {chat.lastMessageContent && (
                      <div className={cn(
                        "text-xs text-muted-foreground truncate mt-0.5 flex justify-between",
                        "group-hover:text-foreground/90 group-hover:font-medium transition-colors",
                        selectedChatId === chat._id 
                          ? resolvedTheme === "dark"
                            ? "text-foreground/80"
                            : "text-foreground/90"
                          : ""
                      )}>
                        <span className="truncate max-w-[80%]">
                          {chat.lastMessageContent.length > 30
                            ? chat.lastMessageContent.substring(0, 27) + "..."
                            : chat.lastMessageContent}
                        </span>
                        {chat.lastMessageTimestamp && (
                          <span className={cn(
                            "text-[10px] tabular-nums",
                            "group-hover:text-foreground/80",
                            selectedChatId === chat._id ? "text-foreground/70" : ""
                          )}>
                            {formatTimestamp(chat.lastMessageTimestamp)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {unreadCount > 0 && (
                  <UnreadBadge count={unreadCount} expanded={isExpanded} />
                )}
              </Button>
            );
          })}
        </div>
      </ScrollArea>
      
      {/* Footer with user profile dropdown and new chat button */}
      <div className={cn(
        "p-4 border-t border-border/50 flex",
        isExpanded ? "justify-between items-center" : "flex-col gap-4 items-center justify-center pb-6"
      )}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "rounded-full",
                isExpanded ? "flex gap-2 items-center h-10 pr-2" : "h-10 w-10 collapsed-avatar"
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.imageUrl} />
                <AvatarFallback>{user.firstName?.[0]?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              {isExpanded && (
                <>
                  <span className="text-sm font-medium truncate max-w-[100px]">
                    {user.fullName || user.username || "User"}
                  </span>
                  <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isExpanded ? "end" : "center"} className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <SettingsIcon className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => clerk.signOut()}>
              <LogOutIcon className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button
          variant="secondary"
          onClick={onNewChat}
          title="New Chat"
          className={cn(
            "rounded-full transition-all",
            isExpanded
              ? "h-10 w-10"
              : "h-10 w-10 collapsed-avatar"
          )}
        >
          <MessageSquarePlus className="h-5 w-5" />
          {isExpanded && (
            <span className="sr-only">New Chat</span>
          )}
        </Button>
      </div>
    </div>
  );
} 