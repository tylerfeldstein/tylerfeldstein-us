"use client";

import { useState, useEffect, useRef } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ChatSidebar } from "./ChatSidebar";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useUser } from "@clerk/nextjs";
import { ChevronLeft, ChevronRight, MessageSquareIcon, MessageSquarePlus } from "lucide-react";
import { NewChatModal } from "./NewChatModal";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// Constants for sidebar width
const DEFAULT_SIDEBAR_WIDTH = 350; // Default width in pixels
const MIN_SIDEBAR_WIDTH = 280;     // Minimum width
const MAX_SIDEBAR_WIDTH = 600;     // Maximum width
const COLLAPSED_WIDTH = 70;        // Width when collapsed (just showing avatars)

export function ChatInterface() {
  const { user } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [selectedChatId, setSelectedChatId] = useState<Id<"chats"> | null>(null);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const previousChatIdRef = useRef<Id<"chats"> | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Get chats for the current user
  const chats = useQuery(api.messages.listChats) || [];
  
  // Query the selected chat to verify it exists
  const selectedChat = useQuery(
    api.messages.getChat, 
    selectedChatId ? { chatId: selectedChatId } : "skip"
  );
  
  // Check if the selected chat has been deleted
  useEffect(() => {
    if (selectedChatId && selectedChat === null) {
      // Chat was deleted, reset the selection
      console.log(`[ChatInterface] Selected chat ${selectedChatId} no longer exists, resetting selection`);
      setSelectedChatId(null);
      
      // If there are other chats available, select the first one
      if (chats.length > 0) {
        setSelectedChatId(chats[0]._id);
      }
    }
  }, [selectedChatId, selectedChat, chats]);
  
  // Get current user data to check if they're an admin
  const currentUser = useQuery(api.users.getMe);
  const isAdmin = currentUser?.role === "admin";
  
  // Add debugging for chat loading
  useEffect(() => {
    console.log(`[ChatInterface] Loaded ${chats.length} chats`);
    if (chats.length > 0) {
      console.log(`[ChatInterface] First chat: ${chats[0]?._id}, name: ${chats[0]?.name}`);
      if (chats[0]?.participantIds) {
        console.log(`[ChatInterface] First chat participants: ${chats[0]?.participantIds.length}`);
      }
    }
  }, [chats]);
  
  // Load sidebar width and expanded state from localStorage on mount
  useEffect(() => {
    // Load saved width
    const savedWidth = localStorage.getItem('chat-sidebar-width');
    if (savedWidth) {
      const width = parseInt(savedWidth, 10);
      if (!isNaN(width) && width >= MIN_SIDEBAR_WIDTH && width <= MAX_SIDEBAR_WIDTH) {
        setSidebarWidth(width);
      }
    }
    
    // Load saved expanded state
    const savedExpanded = localStorage.getItem('chat-sidebar-expanded');
    if (savedExpanded !== null) {
      setIsSidebarExpanded(savedExpanded === 'true');
    }
    
    // Handle responsive layout
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // On mobile, sidebar is closed by default
        setIsSidebarOpen(false);
      } else if (window.innerWidth < 1024) {
        // On tablet, sidebar is open but collapsed to icons
        setIsSidebarOpen(true);
        setIsSidebarExpanded(false);
      } else {
        // On desktop, sidebar is open and expanded
        setIsSidebarOpen(true);
      }
    };
    
    // Set initial state based on screen size
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Select most recent chat if none is selected
  useEffect(() => {
    if (chats.length > 0 && !selectedChatId) {
      setSelectedChatId(chats[0]._id);
    }
  }, [chats, selectedChatId]);
  
  // Mark messages as read when user views a chat
  const markAsRead = useMutation(api.secureMessages.markMessagesAsReadSecure);
  
  // Only mark messages as read when the selectedChatId changes
  useEffect(() => {
    if (selectedChatId && user && selectedChatId !== previousChatIdRef.current) {
      markAsRead({ 
        chatId: selectedChatId,
        tokenPayload: {
          userId: user.id,
          userRole: "user", // This will be overridden by server-side check
          exp: 0, // These will be filled by server
          iat: 0,
          jti: "" // This will be filled by server
        }
      });
      previousChatIdRef.current = selectedChatId;
    }
  }, [selectedChatId, user, markAsRead]);
  
  // Create a chat directly for regular users or show modal for admins
  const createChat = useMutation(api.secureMessages.createChatSecure);
  
  const handleNewChat = async () => {
    // For admin users, show the modal to select participants
    if (isAdmin) {
      setIsNewChatModalOpen(true);
      return;
    }
    
    // For regular users, create a chat directly
    if (!user) return;
    
    try {
      const result = await createChat({
        name: "New Chat",
        initialMessage: "Hello! How can I help you today?",
        participantIds: [], // Add empty array for participantIds
        tokenPayload: {
          userId: user.id,
          userRole: "user", // This will be overridden by server-side check
          exp: 0, // These will be filled by server
          iat: 0,
          jti: "" // This will be filled by server
        }
      });
      
      if (result.error) {
        console.error("Failed to create chat:", result.error);
        alert("Failed to create chat. Please try again.");
        return;
      }
      
      if (result.chatId) {
        setSelectedChatId(result.chatId);
        
        // On mobile, close sidebar when creating new chat
        if (window.innerWidth < 768) {
          setIsSidebarOpen(false);
        }
      }
    } catch (error) {
      console.error("Failed to create chat:", error);
      alert("Failed to create chat. Please try again.");
    }
  };
  
  // Handle chat creation via the modal (admins only)
  const handleChatCreated = (chatId: Id<"chats">) => {
    setSelectedChatId(chatId);
    
    // On mobile, close sidebar when creating new chat
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };
  
  // Toggle sidebar expanded/collapsed state
  const toggleSidebarExpanded = () => {
    const newState = !isSidebarExpanded;
    setIsSidebarExpanded(newState);
    localStorage.setItem('chat-sidebar-expanded', newState.toString());
  };

  // Simple resize implementation
  const startResize = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    // Only allow resizing in expanded mode
    if (!isSidebarExpanded) return;
    
    e.preventDefault();
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    
    // Create a visual indicator
    const resizeIndicator = document.createElement('div');
    resizeIndicator.className = 'fixed inset-0 z-50 pointer-events-none';
    resizeIndicator.style.cursor = 'ew-resize';
    document.body.appendChild(resizeIndicator);
    
    // Get initial position
    const startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const startWidth = sidebarRef.current?.clientWidth || sidebarWidth;
    
    const onMouseMove = (e: MouseEvent | TouchEvent) => {
      // Get current position
      const currentX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const delta = currentX - startX;
      const newWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, startWidth + delta));
      
      // Set width directly on the element
      if (sidebarRef.current) {
        sidebarRef.current.style.width = `${newWidth}px`;
      }
    };
    
    const onMouseUp = () => {
      document.body.style.removeProperty('cursor');
      document.body.style.removeProperty('user-select');
      
      // Remove indicator
      document.body.removeChild(resizeIndicator);
      
      // Update state and save to localStorage
      if (sidebarRef.current) {
        const finalWidth = sidebarRef.current.clientWidth;
        setSidebarWidth(finalWidth);
        localStorage.setItem('chat-sidebar-width', finalWidth.toString());
      }
      
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('touchmove', onMouseMove as any);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchend', onMouseUp);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('touchmove', onMouseMove as any, { passive: false });
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchend', onMouseUp);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden main-gradient">
      {/* Sidebar for chats */}
      {isSidebarOpen && (
        <div 
          ref={sidebarRef}
          style={{ width: isSidebarExpanded ? `${sidebarWidth}px` : `${COLLAPSED_WIDTH}px` }}
          className="flex-shrink-0 relative transition-width duration-300 ease-in-out border-r border-border/50"
        >
          <ChatSidebar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            selectedChatId={selectedChatId}
            setSelectedChatId={setSelectedChatId}
            onNewChat={handleNewChat}
            sidebarWidth={sidebarWidth}
            isExpanded={isSidebarExpanded}
          />
          
          {/* Toggle expand/collapse button */}
          <div 
            className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-accent/20 hover:bg-accent/30 rounded-full p-1 cursor-pointer z-50 shadow-md"
            onClick={toggleSidebarExpanded}
          >
            {isSidebarExpanded ? (
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          
          {/* Resizer - only shown when expanded */}
          {isSidebarExpanded && (
            <div
              className="resize-handle"
              onMouseDown={startResize}
              onTouchStart={startResize}
            ></div>
          )}
        </div>
      )}
      
      {/* Toggle button for sidebar on mobile - only shown when sidebar is closed */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-2 left-2 z-50 rounded-full bg-primary/10 p-2 text-primary hover:bg-primary/20"
        >
          <MessageSquareIcon className="h-5 w-5" />
        </button>
      )}
      
      {/* Chat content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Only render chat content if we have a selected chat and it exists in the database */}
        {selectedChatId && selectedChat ? (
          <>
            <ChatHeader
              chatId={selectedChatId}
              chatName={selectedChat.name || "Support Chat"}
              participantCount={selectedChat.participantIds?.length || 0}
              onBackClick={() => setIsSidebarOpen(!isSidebarOpen)}
              isMobile={!isSidebarOpen}
            />
            <MessageList chatId={selectedChatId} />
            <MessageInput chatId={selectedChatId} />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
            <MessageSquarePlus className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Start a conversation</h2>
            <p className="text-muted-foreground mb-6">
              Create a new chat to start messaging
            </p>
            <Button onClick={handleNewChat}>
              New Message
            </Button>
          </div>
        )}
      </div>
      
      {/* New chat modal for admins */}
      {isNewChatModalOpen && (
        <NewChatModal 
          open={isNewChatModalOpen} 
          onClose={() => setIsNewChatModalOpen(false)}
          onChatCreated={handleChatCreated}
        />
      )}
    </div>
  );
} 