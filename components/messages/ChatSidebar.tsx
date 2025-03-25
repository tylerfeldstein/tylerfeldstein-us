"use client";

import * as React from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { format, isToday, isYesterday } from "date-fns";
import { useEffect, useState, useMemo } from "react";
import { isUserAdmin } from "@/actions/auth";
import { useMediaQuery } from "@/hooks/use-media-query";

import {
  MessageSquarePlus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// Helper function to format timestamp like iPhone messages
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);

  if (isToday(date)) {
    return format(date, "h:mm a"); // Today: "3:45 PM"
  } else if (isYesterday(date)) {
    return "Yesterday";
  } else if (date.getFullYear() === new Date().getFullYear()) {
    return format(date, "MMM d"); // Same year: "Jun 15"
  } else {
    return format(date, "MM/dd/yy"); // Different year: "06/15/22"
  }
}

interface ChatSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  selectedChatId: Id<"chats"> | null;
  setSelectedChatId: (chatId: Id<"chats">) => void;
  onNewChat: () => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

export function ChatSidebar({
  setIsSidebarOpen,
  selectedChatId,
  setSelectedChatId,
  onNewChat,
  isExpanded,
  setIsExpanded
}: ChatSidebarProps) {
  const { user } = useUser();

  const chatsQuery = useQuery(api.messages.listChats);
  const chats = useMemo(() => chatsQuery || [], [chatsQuery]);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const unreadMessages = useQuery(api.messages.getUnreadMessageCounts) || {};

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
          const nextChat = chats.find((chat) => chat._id !== chatToDelete);
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between p-4 border-b border-border/50",
        (!isExpanded || isMobile) && "flex-col items-center gap-2"
      )}>
        {isExpanded && !isMobile ? (
          <>
            <h2 className="text-lg font-semibold">Messages</h2>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={onNewChat}>
                <MessageSquarePlus className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <Button variant="ghost" size="icon" onClick={onNewChat}>
              <MessageSquarePlus className="h-5 w-5" />
            </Button>
            {!isMobile && (
              <Button variant="ghost" size="icon" onClick={() => setIsExpanded(true)}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}
          </>
        )}
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto py-2">
        {chats.map((chat) => {
          const unreadCount = unreadMessages[chat._id] || 0;
          const lastMessage = chat.lastMessageContent || "No messages yet";
          const lastMessageTime = chat.lastMessageTimestamp ? 
            formatTimestamp(chat.lastMessageTimestamp) : "";

          return (
            <div
              key={chat._id}
              className={cn(
                "group w-full flex items-center gap-3 py-2 transition-colors cursor-pointer",
                (!isExpanded || isMobile) ? "px-2 justify-center" : "px-4",
                selectedChatId === chat._id && "bg-accent"
              )}
              onClick={() => {
                setSelectedChatId(chat._id);
                if (isMobile) setIsSidebarOpen(false);
              }}
            >
              <div className={cn(
                "relative flex items-center justify-center",
                "h-10 w-10 rounded-full bg-primary text-primary-foreground"
              )}>
                <span className="text-sm font-medium">
                  {chat.name?.[0]?.toUpperCase() || "C"}
                </span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              {isExpanded && !isMobile && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{chat.name}</p>
                    {lastMessageTime && (
                      <span className="text-xs text-muted-foreground ml-2">
                        {lastMessageTime}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {lastMessage}
                  </p>
                </div>
              )}
              {isAdmin && isExpanded && !isMobile && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      setChatToRename(chat._id);
                      setNewChatName(chat.name || "");
                      setIsRenameDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setChatToDelete(chat._id);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
            <DialogDescription>
              Enter a new name for this chat.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newChatName}
            onChange={(e) => setNewChatName(e.target.value)}
            placeholder="Enter new chat name"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameChat}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this chat? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteChat}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
