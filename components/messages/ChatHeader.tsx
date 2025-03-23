"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useUser, useClerk } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { forceLogout } from "@/actions/auth/cookieTokens";
import { useChatCookieTokens } from "@/hooks/useChatCookieTokens";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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
  MenuIcon,
  ArrowLeftIcon,
  Settings,
  LogOut,
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
  const { signOut } = useClerk();
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { clearTokens } = useChatCookieTokens();
  
  // Get chat details
  let displayName = chatName;
  if (!displayName) {
    displayName = "New Message";
  }
  
  // Handle chat deletion
  const handleDeleteChat = () => {
    if (onDeleteChat && chatId) {
      onDeleteChat(chatId);
    }
  };
  
  // Get initials for avatar fallback
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Handle secure logout with JWT token invalidation
  const handleSecureLogout = async () => {
    setIsLoggingOut(true);
    try {
      // First clear the cookies from the client side
      await clearTokens();
      
      // Then invalidate the tokens on the server
      await forceLogout();
      
      // Finally, sign out from Clerk
      await signOut();
      
      // Redirect to home
      router.push('/');
    } catch (error) {
      console.error("Error during logout:", error);
      // Try to sign out from Clerk anyway
      try {
        await signOut();
      } catch (clerkError) {
        console.error("Error signing out from Clerk:", clerkError);
      }
      router.push('/');
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  return (
    <div className={cn(
      "h-14 border-b flex items-center justify-between px-4 py-2",
      resolvedTheme === "dark" ? "bg-zinc-950" : "bg-white"
    )}>
      {/* Mobile back button */}
      {isMobile && (
        <Button variant="ghost" size="icon" onClick={onBackClick} className="mr-2">
          <ArrowLeftIcon className="h-5 w-5" />
        </Button>
      )}
      
      {/* Chat info */}
      <div className="flex items-center space-x-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
          <AvatarFallback>
            {user?.fullName ? getInitials(user.fullName) : "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-sm font-semibold">{displayName}</h2>
          <p className="text-xs text-muted-foreground">
            {participantCount} participant{participantCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
      
      {/* Chat actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          disabled={isLoggingOut}
          onClick={handleSecureLogout}
          className="text-muted-foreground hover:text-foreground"
        >
          {isLoggingOut ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVerticalIcon className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive" 
              onClick={handleDeleteChat}
            >
              <Trash2Icon className="mr-2 h-4 w-4" />
              <span>Delete Chat</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSecureLogout} disabled={isLoggingOut}>
              <LogOut className="mr-2 h-4 w-4" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
} 