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
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const previousChatIdRef = useRef<Id<"chats"> | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Get chats for the current user
  const chats = useQuery(api.messages.listChats) || [];
  
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
  const markAsRead = useMutation(api.messages.markMessagesAsRead);
  
  // Only mark messages as read when the selectedChatId changes
  useEffect(() => {
    if (selectedChatId && user && selectedChatId !== previousChatIdRef.current) {
      markAsRead({ chatId: selectedChatId });
      previousChatIdRef.current = selectedChatId;
    }
  }, [selectedChatId, user, markAsRead]);
  
  // Create a new chat
  const createChat = useMutation(api.messages.createChat);
  
  const handleNewChat = async () => {
    if (!user) return;
    
    try {
      const newChatId = await createChat({
        name: "New Chat",
        initialMessage: "Hello! How can I help you today?",
      });
      
      setSelectedChatId(newChatId);
      
      // On mobile, close sidebar when starting new chat
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    } catch (error) {
      console.error("Failed to create chat:", error);
      // Show error to user
      alert("Failed to create chat. Please try again.");
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
      
      {/* Main chat area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {selectedChatId && (
          <>
            <ChatHeader 
              chatId={selectedChatId} 
              onClose={() => setIsSidebarOpen(true)} 
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              showToggle={true}
            />
            
            <div className="flex flex-1 flex-col relative overflow-hidden">
              <MessageList chatId={selectedChatId} />
              <MessageInput chatId={selectedChatId} />
            </div>
          </>
        )}
        
        {!selectedChatId && (
          <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
            <p className="text-muted-foreground mb-4">Select a chat or start a new conversation</p>
            <button
              onClick={handleNewChat}
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              New Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 