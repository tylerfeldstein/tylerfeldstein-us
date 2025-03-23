"use client";

import * as React from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useTheme } from "next-themes";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { useEffect, useState } from "react";
import { isUserAdmin } from "@/actions/auth";

import {
  BotIcon,
  PlusCircleIcon,
  UserIcon,
  LogOutIcon,
  SettingsIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
  MessageSquareIcon,
  MessageSquarePlus,
  PenIcon,
  TrashIcon
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
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import UnreadBadge from "./UnreadBadge";
import NewMessageIndicator from "./NewMessageIndicator";
import { toast } from "sonner";

// Define participant info interface to handle optional nulls
interface ParticipantInfo {
  clerkId: string;
  name?: string;
  email?: string;
  imageUrl?: string;
  role?: string;
}

// Type for participants that can be null from the API
type ParticipantInfoWithNull = ParticipantInfo | null;

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
  const { user } = useUser();
  const clerk = useClerk();
  const { resolvedTheme } = useTheme();
  
  // Check admin status from server action
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // Check admin status using the server action
    const checkAdminStatus = async () => {
      if (!user) return;
      
      try {
        const adminStatus = await isUserAdmin();
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };
    
    checkAdminStatus();
  }, [user]);
  
  // Use secure chat listing to ensure admin access
  const chats = useQuery(api.secureMessages.listChatsSecure, user ? {
    tokenPayload: {
      userId: user.id,
      userRole: "user", // Server will check the actual role from the database
      exp: 0, // These will be filled by server
      iat: 0,
      jti: "" // This will be filled by server
    }
  } : "skip") || [];
  
  // Get unread messages across all chats
  const unreadMessages = useQuery(api.messages.getUnreadMessageCounts) || {};
  
  // Mutations for context menu actions
  const deleteChat = useMutation(api.messages.deleteChat);
  const renameChat = useMutation(api.messages.renameChat);
  
  // States for the rename dialog
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [chatToRename, setChatToRename] = useState<Id<"chats"> | null>(null);
  const [newChatName, setNewChatName] = useState("");
  
  // States for delete confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<Id<"chats"> | null>(null);
  
  // Handle chat rename
  const handleRenameChat = async () => {
    if (!chatToRename || !newChatName.trim()) return;
    
    try {
      await renameChat({ chatId: chatToRename, newName: newChatName.trim() });
      toast.success("Chat renamed successfully");
      setIsRenameDialogOpen(false);
      setChatToRename(null);
      setNewChatName("");
    } catch (error) {
      console.error("Error renaming chat:", error);
      toast.error("Failed to rename chat");
    }
  };
  
  // Handle chat delete
  const handleDeleteChat = async () => {
    if (!chatToDelete) return;
    
    try {
      await deleteChat({ chatId: chatToDelete });
      // If we deleted the currently selected chat, clear the selection
      if (selectedChatId === chatToDelete) {
        if (chats.length > 1) {
          // Find the next available chat
          const nextChat = chats.find(chat => chat._id !== chatToDelete);
          if (nextChat) {
            setSelectedChatId(nextChat._id);
          }
        } else {
          // No chats left
          setSelectedChatId(null as unknown as Id<"chats">); // Type assertion to fix TypeScript error
        }
      }
      toast.success("Chat deleted successfully");
      setIsDeleteDialogOpen(false);
      setChatToDelete(null);
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete chat");
    }
  };
  
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
              <ContextMenu key={chat._id}>
                <ContextMenuTrigger asChild>
                  <Button
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
                          (p: ParticipantInfoWithNull) => p && p.clerkId !== user.id
                        );
                        
                        // Find admin participant as fallback
                        const adminParticipant = chat.participantsInfo?.find(
                          (p: ParticipantInfoWithNull) => p && p.role === "admin"
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
                          {(() => {
                            console.log(`[ChatSidebar] Processing chat ${chat._id}, name: ${chat.name}`);
                            console.log(`[ChatSidebar] Chat has ${chat.participantsInfo?.length || 0} participants info`);
                            
                            // Check if this is a new chat with only a system message
                            const onlyHasCurrentUser = chat.participantsInfo?.length === 1 && 
                              chat.participantsInfo[0]?.clerkId === user.id;
                            
                            const hasSystemMessageOnly = chat.lastMessageContent === "Hello! How can I help you today?";
                            
                            // Always show "New Chat" for chats with only the current user and a system message
                            if (onlyHasCurrentUser && hasSystemMessageOnly) {
                              console.log(`[ChatSidebar] Showing "New Chat" for chat with only system message`);
                              return "New Chat";
                            }
                            
                            // For admin view, prioritize showing participant name
                            if (isAdmin) {
                              // Find other participant (not current user)
                              const otherParticipant = chat.participantsInfo?.find(
                                (p: ParticipantInfoWithNull) => p && p.clerkId !== user.id
                              );
                              
                              // If we found another participant, use their info
                              if (otherParticipant) {
                                console.log(`[ChatSidebar] Found other participant for admin view:`, otherParticipant);
                                return otherParticipant.name || otherParticipant.email || "User";
                              }
                            }
                            
                            // For regular users, show chat name if available
                            if (chat.name !== "New Chat") {
                              return chat.name;
                            }
                            
                            // Otherwise, use other participant's name/email
                            const otherParticipant = chat.participantsInfo?.find(
                              (p: ParticipantInfoWithNull) => p && p.clerkId !== user.id
                            );
                            
                            if (otherParticipant) {
                              return otherParticipant.name || otherParticipant.email || "User";
                            }
                            
                            // Fallback to admin name if it exists
                            const adminParticipant = chat.participantsInfo?.find(
                              (p: ParticipantInfoWithNull) => p && p.role === "admin"
                            );
                            
                            if (adminParticipant) {
                              console.log(`[ChatSidebar] Found admin participant:`, adminParticipant);
                              return adminParticipant.name || adminParticipant.email || "Support";
                            }
                            
                            // Default fallback
                            return "New Chat";
                          })()}
                        </span>
                        
                        {/* Display chat name below user name for admins */}
                        {isAdmin && chat.name && chat.name !== "New Chat" && (
                          <div className="text-xs text-muted-foreground/70 truncate mt-0.5 mb-1">
                            <span className="truncate max-w-[100%] italic">
                              Chat: {chat.name}
                            </span>
                          </div>
                        )}
                        
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
                </ContextMenuTrigger>
                
                <ContextMenuContent className="w-64">
                  <ContextMenuItem
                    onClick={() => {
                      setChatToRename(chat._id);
                      setNewChatName(chat.name || "");
                      setIsRenameDialogOpen(true);
                    }}
                    className="cursor-pointer"
                  >
                    <PenIcon className="mr-2 h-4 w-4" />
                    <span>Rename Chat</span>
                  </ContextMenuItem>
                  
                  <ContextMenuSeparator />
                  
                  <ContextMenuItem
                    onClick={() => {
                      setChatToDelete(chat._id);
                      setIsDeleteDialogOpen(true);
                    }}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <TrashIcon className="mr-2 h-4 w-4" />
                    <span>Delete Chat</span>
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
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

      {/* Rename Chat Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
            <DialogDescription>
              Enter a new name for this conversation.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newChatName}
                onChange={(e) => setNewChatName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Project Discussion"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsRenameDialogOpen(false);
                setChatToRename(null);
                setNewChatName("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleRenameChat} type="submit">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Chat Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this chat? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setChatToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteChat}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 