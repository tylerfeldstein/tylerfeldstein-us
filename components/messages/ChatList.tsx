"use client";

import { useEffect } from "react";
import { useQuery } from "convex/react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Id } from "@/convex/_generated/dataModel";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatListProps {
  isCollapsed?: boolean;
}

export default function ChatList({ isCollapsed = false }: ChatListProps) {
  const chats = useQuery(api.messages.listChats);
  const unreadCounts = useQuery(api.messages.getUnreadMessageCounts);
  const router = useRouter();
  const pathname = usePathname();
  const currentChatId = pathname?.split('/').pop();
  
  useEffect(() => {
    if (Array.isArray(chats)) {
      // console.log(`[ChatList] Loaded ${chats.length} chats`);
      
      if (chats.length > 0) {
        // Log details of first few chats
        chats.slice(0, 3).forEach((chat, index) => {
          console.log(`[ChatList] Chat #${index+1}: ID=${chat._id}, Name="${chat.name}"`);
          console.log(`[ChatList] Chat #${index+1} Participants: ${chat.participantIds?.length || 0}`);
          console.log(`[ChatList] Chat #${index+1} ParticipantsInfo:`, chat.participantsInfo || []);
        });
      } else {
        console.log("[ChatList] No chats found");
      }
    } else {
      console.log("[ChatList] Chats data is not an array:", chats);
    }
    
    // Log unread counts
    if (unreadCounts) {
      console.log("[ChatList] Unread counts:", unreadCounts);
    }
  }, [chats, unreadCounts]);
  
  // Go to chat detail page
  const handleChatClick = (chatId: Id<"chats">) => {
    router.push(`/messages/${chatId}`);
  };
  
  // Get first name or email for display
  const getDisplayName = (name?: string, email?: string): string => {
    if (!name && !email) return "Chat";
    if (name) {
      const firstName = name.split(' ')[0];
      return firstName;
    }
    return email?.split('@')[0] || "Chat";
  };
  
  // Get participant initial for avatar
  const getParticipantInitial = (name?: string, email?: string): string => {
    if (name) return name.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return "?";
  };
  
  // Get time display
  const getTimeDisplay = (timestamp: number): string => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };
  
  if (!chats) {
    // Loading state
    return (
      <div className="w-full p-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`flex items-center gap-3 p-2 mb-2 ${isCollapsed ? 'justify-center' : ''}`}>
            <Skeleton className="h-10 w-10 rounded-full" />
            {!isCollapsed && (
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
  
  // If no chats, show empty state
  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4 text-muted-foreground">
        {!isCollapsed && (
          <>
            <p className="mb-1">No chats yet</p>
            <p className="text-sm">Start a new conversation using the button above</p>
          </>
        )}
      </div>
    );
  }
  
  return (
    <div className="w-full">
      {chats.map((chat) => {
        // Get the primary participant for display (excluding current user)
        const primaryParticipant = chat.participantsInfo?.[0];
        const isActive = chat._id === currentChatId;
        const unreadCount = unreadCounts?.[chat._id] || 0;
        
        return (
          <div
            key={chat._id}
            className={`
              ${isCollapsed ? 'px-2 py-3 flex justify-center' : 'p-3'} 
              ${isActive ? 'bg-muted' : 'hover:bg-muted/50'} 
              cursor-pointer transition-colors
            `}
            onClick={() => handleChatClick(chat._id)}
          >
            <div className={`relative ${isCollapsed ? '' : 'flex items-center gap-3'}`}>
              {/* Avatar */}
              <div className="relative">
                <Avatar className={isCollapsed ? "mx-auto" : ""}>
                  <AvatarImage 
                    src={primaryParticipant?.imageUrl} 
                    alt={primaryParticipant?.name || "Chat"} 
                  />
                  <AvatarFallback>
                    {getParticipantInitial(
                      primaryParticipant?.name, 
                      primaryParticipant?.email
                    )}
                  </AvatarFallback>
                </Avatar>
                
                {/* Unread count badge */}
                {unreadCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                    variant="destructive"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </div>
              
              {/* Chat details - only show if not collapsed */}
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium truncate pr-2">
                      {chat.name || getDisplayName(
                        primaryParticipant?.name, 
                        primaryParticipant?.email
                      )}
                    </h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {getTimeDisplay(chat.lastMessageTimestamp || chat.updatedAt || chat.createdAt)}
                    </span>
                  </div>
                  
                  {/* Last message preview */}
                  <p className="text-sm text-muted-foreground truncate">
                    {chat.lastMessageContent 
                      ? chat.lastMessageContent
                      : unreadCount > 0 
                        ? `${unreadCount} new message${unreadCount > 1 ? 's' : ''}` 
                        : 'No messages yet'}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
} 