"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  MoreVertical as MoreVerticalIcon,
  UserPlus as UserPlusIcon,
  Trash2 as Trash2Icon,
  ArrowLeftIcon,
  Settings,
  Info,
} from "lucide-react";

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
  onBackClick?: () => void;
  isMobile?: boolean;
}

export function ChatHeader({ 
  chatId, 
  chatName, 
  participantCount, 
  onDeleteChat, 
  onBackClick, 
  isMobile 
}: ChatHeaderProps) {
  const { user } = useUser();
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  
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
    <div className={cn(
      "h-14 md:h-16 flex items-center justify-between px-3 sm:px-4 py-2 sticky top-0 z-20 backdrop-blur-sm",
      resolvedTheme === "dark" ? "from-[#1a0920]/90 via-[#220a2a]/70 to-transparent" : "from-blue-50/90 via-blue-50/70 to-transparent0"
    )}>
      {/* Mobile back button */}
      {isMobile && (
        <Button variant="ghost" size="icon" onClick={onBackClick} className="mr-2 flex-shrink-0">
          <ArrowLeftIcon className="h-5 w-5" />
        </Button>
      )}
      
      {/* Chat info */}
      <div className="flex items-center space-x-2 min-w-0 flex-1">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm sm:text-base font-semibold truncate">{displayName}</h2>
          <p className="text-xs text-muted-foreground truncate">
            {participantCount} participant{participantCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
      
      {/* Chat actions */}
      <div className="flex items-center gap-0.5 sm:gap-2 flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
              <MoreVerticalIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Chat Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <UserPlusIcon className="mr-2 h-4 w-4" />
              <span>Add People</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Info className="mr-2 h-4 w-4" />
              <span>Chat Info</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive" 
              onClick={handleDeleteChat}
            >
              <Trash2Icon className="mr-2 h-4 w-4" />
              <span>Delete Chat</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
} 