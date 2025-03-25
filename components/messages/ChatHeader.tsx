"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  Settings2,
  Trash
} from "lucide-react";
import { isUserAdmin } from "@/actions/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ParticipantInfo {
  clerkId: string;
  name?: string;
  email?: string;
  imageUrl?: string;
  role?: string;
}

interface ChatHeaderProps {
  chatId?: Id<"chats">;
  chatName: string;
  participantCount: number;
  onDeleteChat?: (chatId: Id<"chats">) => void;
}

export function ChatHeader({ 
  chatId, 
  chatName, 
  participantCount, 
  onDeleteChat,
}: ChatHeaderProps) {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const adminStatus = await isUserAdmin();
        setIsAdmin(adminStatus);
      }
    };
    checkAdminStatus();
  }, [user]);
  
  // Get chat details and participants information
  const chat = useQuery(api.messages.getChat, chatId ? { chatId } : "skip");
  
  // Get display name - prioritize showing the other participant's name
  let displayName = chatName;
  let avatarUrl = "";
  let avatarFallback = "C";
  
  if (chat?.participantsInfo && chat.participantsInfo.length > 0) {
    // Find the other participant (not the current user)
    const otherParticipant = chat.participantsInfo.find(
      (p: ParticipantInfo) => p && p.clerkId !== user?.id
    );
    
    // Find admin participant as fallback
    const adminParticipant = chat.participantsInfo.find(
      (p: ParticipantInfo) => p && p.role === "admin"
    );
    
    if (otherParticipant) {
      // Use other participant's info
      displayName = otherParticipant.name || otherParticipant.email || "Chat";
      avatarUrl = otherParticipant.imageUrl || "";
      avatarFallback = getInitials(displayName);
    } else if (adminParticipant) {
      // Fallback to admin's info
      displayName = adminParticipant.name || adminParticipant.email || "Support";
      avatarUrl = adminParticipant.imageUrl || "";
      avatarFallback = getInitials(displayName);
    }
  }
  
  // If no participant info found, use chat name
  if (!displayName || displayName === "New Chat") {
    displayName = "Support Chat";
  }
  
  // Handle chat deletion
  const handleDeleteChat = () => {
    if (onDeleteChat && chatId) {
      onDeleteChat(chatId);
    }
  };
  
  // Get initials for avatar fallback
  function getInitials(name: string): string {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }
  
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          {avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          )}
          <AvatarFallback>
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-sm font-semibold">{chatName}</h2>
          <p className="text-xs text-muted-foreground">
            {participantCount} {participantCount === 1 ? 'participant' : 'participants'}
          </p>
        </div>
      </div>
      
      {isAdmin && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-auto">
              <Settings2 className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleDeleteChat} className="text-destructive">
              <Trash className="h-4 w-4 mr-2" />
              Delete Chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
} 