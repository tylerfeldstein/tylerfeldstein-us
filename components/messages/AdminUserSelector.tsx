"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X } from "lucide-react";

interface User {
  _id: string;
  clerkId: string;
  name?: string;
  email?: string;
  imageUrl?: string;
  role?: string;
  createdAt?: number;
}

export interface AdminUserSelectorProps {
  selectedUsers: string[];
  onSelectUser: (userId: string) => void;
  onRemoveUser: (userId: string) => void;
}

export function AdminUserSelector({ 
  selectedUsers, 
  onSelectUser,
  onRemoveUser
}: AdminUserSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const currentUser = useQuery(api.users.getMe);
  const users = useQuery(api.users.listUsers);
  
  // Only show the selector if the current user is an admin
  if (currentUser?.role !== "admin") {
    return null;
  }

  // Filter out already selected users and admin users
  const availableUsers = users?.filter((user: User) => {
    return (
      user.clerkId &&
      !selectedUsers.includes(user.clerkId) &&
      user.role !== "admin" &&
      (
        searchQuery === "" ||
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }) || [];

  // Get details for a selected user
  const getUserDetails = (userId: string): User | undefined => {
    return users?.find((user: User) => user.clerkId === userId);
  };

  return (
    <div className="rounded-md border p-2 mb-4 bg-card">
      <label className="text-sm font-medium text-foreground mb-2 block">
        Select Chat Participants
      </label>
      
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedUsers.map((userId) => {
          const user = getUserDetails(userId);
          return user ? (
            <div
              key={userId}
              className="flex items-center gap-1.5 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
            >
              <span>{user.name || user.email}</span>
              <X
                className="h-3.5 w-3.5 cursor-pointer"
                onClick={() => onRemoveUser(userId)}
              />
            </div>
          ) : null;
        })}
      </div>
      
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Search users..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Available users */}
      <ScrollArea className="h-40 border rounded-md p-2">
        {availableUsers.length === 0 ? (
          <div className="text-center text-sm text-gray-500 py-4">
            {searchQuery ? "No matching users found" : "No more users available"}
          </div>
        ) : (
          <div className="space-y-1">
            {availableUsers.map((user: User) => (
              <Button
                key={user.clerkId}
                variant="ghost"
                className="w-full justify-start p-2 h-auto"
                onClick={() => onSelectUser(user.clerkId)}
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.imageUrl} alt={user.name || user.email || "User"} />
                    <AvatarFallback>{getUserInitials(user.name || user.email || "?")}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{user.name || "Unnamed User"}</span>
                    {user.email && <span className="text-xs text-gray-500">{user.email}</span>}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// Helper function to get user initials
function getUserInitials(name: string): string {
  if (!name || name === "?") return "?";
  
  const parts = name.split(" ");
  if (parts.length === 1) return name.substring(0, 1).toUpperCase();
  
  return (parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1)).toUpperCase();
} 