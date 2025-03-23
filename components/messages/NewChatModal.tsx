"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { AdminUserSelector } from "./AdminUserSelector";
import { Loader2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface NewChatModalProps {
  open: boolean;
  onClose: () => void;
  onChatCreated?: (chatId: Id<"chats">) => void;
}

export function NewChatModal({ open, onClose, onChatCreated }: NewChatModalProps) {
  const [chatName, setChatName] = useState("New Chat");
  const [initialMessage, setInitialMessage] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const createChat = useMutation(api.messages.createChat);
  const router = useRouter();
  const currentUser = useQuery(api.users.getMe);
  const isAdmin = currentUser?.role === "admin";
  
  console.log("[NewChatModal] Current user:", currentUser?.clerkId, "isAdmin:", isAdmin);
  
  const handleCreateChat = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      if (!currentUser) {
        setError("You must be logged in to create a chat");
        return;
      }
      
      if (!chatName.trim()) {
        setError("Please provide a chat name");
        return;
      }
      
      console.log("[NewChatModal] Creating chat with participants:", selectedUsers);
      
      const chatId = await createChat({
        name: chatName,
        initialMessage: initialMessage || "Hello! How can I help you today?",
        participantIds: isAdmin ? selectedUsers : [],
      });
      
      console.log("[NewChatModal] Chat created with ID:", chatId);
      
      if (onChatCreated) {
        onChatCreated(chatId);
      }
      
      onClose();
      router.push(`/messages/${chatId}`);
    } catch (err) {
      console.error("[NewChatModal] Error creating chat:", err);
      setError("Failed to create chat. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Chat</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium mb-1 block">Chat Name</label>
            <Input
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              placeholder="Enter chat name"
            />
          </div>
          
          {isAdmin && (
            <div>
              <label className="text-sm font-medium mb-1 block">Select Users</label>
              <AdminUserSelector 
                selectedUsers={selectedUsers}
                onSelectUser={(userId: string) => {
                  console.log("[NewChatModal] User selected:", userId);
                  setSelectedUsers(prev => [...prev, userId]);
                }}
                onRemoveUser={(userId: string) => {
                  console.log("[NewChatModal] User removed:", userId);
                  setSelectedUsers(prev => prev.filter(id => id !== userId));
                }}
              />
              <div className="mt-2">
                <p className="text-xs text-gray-500">
                  {selectedUsers.length === 0 
                    ? "No users selected" 
                    : `${selectedUsers.length} user(s) selected`}
                </p>
              </div>
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium mb-1 block">Initial Message (optional)</label>
            <Textarea
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              placeholder="Write an initial message"
              className="resize-none"
              rows={3}
            />
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button disabled={isLoading} onClick={handleCreateChat}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Chat"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 