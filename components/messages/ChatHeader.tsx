"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useUser } from "@clerk/nextjs";

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
  MoreVerticalIcon,
  UserPlusIcon,
  Trash2Icon,
  MenuIcon,
  ArrowLeftIcon,
} from "lucide-react";

interface ChatHeaderProps {
  chatId: Id<"chats">;
  onClose: () => void;
  onToggleSidebar?: () => void;
  showToggle?: boolean;
}

export function ChatHeader({ 
  chatId, 
  onClose, 
  onToggleSidebar, 
  showToggle = false 
}: ChatHeaderProps) {
  const { user } = useUser();
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  
  // Get chat details
  const chat = useQuery(api.messages.getChat, { chatId });
  
  // Delete chat mutation
  const deleteChat = useMutation(api.messages.deleteChat);
  
  // Handle chat deletion
  const handleDeleteChat = async () => {
    try {
      await deleteChat({ chatId });
      // Redirect to home page after deletion
      router.push("/");
    } catch (error) {
      console.error("Failed to delete chat:", error);
      alert("Failed to delete chat. Please try again.");
    }
  };
  
  // Determine if this is a group chat (more than 2 participants)
  const isGroupChat = chat?.participantsInfo && chat.participantsInfo.length > 2;
  
  // Find the other participants in the chat (excluding current user)
  const otherParticipants = chat?.participantsInfo?.filter(
    (p) => p.clerkId !== user?.id
  ) || [];
  
  // Get the primary participant to show
  const primaryParticipant = otherParticipants[0];
  
  // Format display name - default to chat name for group chats
  const displayName = isGroupChat 
    ? chat?.name || "Group Chat" 
    : primaryParticipant?.name || 
      primaryParticipant?.email || 
      "Chat";
  
  return (
    <div className={cn(
      "flex items-center h-14 px-4 border-b",
      resolvedTheme === "dark" ? "border-white/10" : "border-black/10"
    )}>
      {/* Toggle sidebar button on small screens */}
      {showToggle && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="mr-2 md:hidden"
        >
          <MenuIcon className="h-5 w-5" />
        </Button>
      )}
      
      {/* Back button (only visible on mobile) */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="md:hidden mr-2"
      >
        <ArrowLeftIcon className="h-5 w-5" />
      </Button>
      
      {/* Chat name/participant */}
      <div className="flex-1 min-w-0">
        <h2 className="text-base font-medium truncate">{displayName}</h2>
      </div>
      
      {/* Chat actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVerticalIcon className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Chat Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <UserPlusIcon className="mr-2 h-4 w-4" />
            <span>Add People</span>
          </DropdownMenuItem>
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
  );
} 