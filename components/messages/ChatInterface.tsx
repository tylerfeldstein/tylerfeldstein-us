"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ChatSidebar } from "./ChatSidebar";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useUser } from "@clerk/nextjs";
import {
  ChevronLeft,
  ChevronRight,
  MessageSquareIcon,
  MessageSquarePlus,
} from "lucide-react";
import { NewChatModal } from "./NewChatModal";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  
  // Get chats for the current user
  const chatsQuery = useQuery(api.messages.listChats);
  const chats = useMemo(() => chatsQuery || [], [chatsQuery]);
  
  // Query the selected chat to verify it exists
  const selectedChat = useQuery(
    api.messages.getChat, 
    selectedChatId ? { chatId: selectedChatId } : "skip"
  );
  
  // Error state for chat query
  const [chatError, setChatError] = useState<string | null>(null);
  
  // Check if the selected chat has been deleted or caused an error
  useEffect(() => {
    // If the query is undefined, it's still loading
    if (selectedChatId && selectedChat === undefined) {
      // Still loading, reset any previous error
      setChatError(null);
      return;
    }
    
    // If the query returned null and we have a selected chat ID, the chat doesn't exist
    if (selectedChatId && selectedChat === null) {
      console.log(`[ChatInterface] Selected chat ${selectedChatId} no longer exists, resetting selection`);
      setChatError("The selected chat has been deleted or is no longer accessible.");
      
      // If there are other chats available, select the first one
      if (chats.length > 0) {
        const nextChat = chats.find(chat => chat._id !== selectedChatId);
        if (nextChat) {
          console.log(`[ChatInterface] Selecting next available chat: ${nextChat._id}`);
          setSelectedChatId(nextChat._id);
        } else {
          // If no other chats exist, clear the selection
          setSelectedChatId(null);
        }
      } else {
        // No chats left
        setSelectedChatId(null);
      }
    } else {
      // Chat exists, clear any previous error
      setChatError(null);
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
    
    // Only prevent default for the specific resize handle touch event
    // Don't block all touch events on the body
    e.preventDefault();
    e.stopPropagation();
    
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
      document.removeEventListener('touchmove', onMouseMove as unknown as EventListener);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchend', onMouseUp);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('touchmove', onMouseMove as unknown as EventListener, { passive: false });
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchend', onMouseUp);
  };

  return (
    <div className="flex h-full w-full overflow-hidden relative pt-0">
      {/* Sidebar for chats */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.div 
            ref={sidebarRef}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            style={{ width: isSidebarExpanded ? `${sidebarWidth}px` : `${COLLAPSED_WIDTH}px` }}
            className="flex-shrink-0 relative transition-all duration-300 ease-in-out border-r border-border/50 h-full bg-background/80 backdrop-blur-sm z-20"
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      boxShadow: [
                        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                      ]
                    }}
                    transition={{ 
                      delay: 0.3,
                      boxShadow: {
                        repeat: 1,
                        duration: 1
                      }
                    }}
                    className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 rounded-full p-2 cursor-pointer z-50 shadow-lg border border-background/20"
                    onClick={toggleSidebarExpanded}
                  >
                    {isSidebarExpanded ? (
                      <ChevronLeft className="h-5 w-5 text-primary-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-primary-foreground" />
                    )}
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Resizer - only shown when expanded */}
            {isSidebarExpanded && (
              <div
                className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-primary/20 transition-colors z-10"
                onMouseDown={startResize}
                onTouchStart={startResize}
              ></div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Toggle button for sidebar on mobile - only shown when sidebar is closed */}
      <AnimatePresence>
        {!isSidebarOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-3 left-3 z-50 rounded-full bg-background/80 backdrop-blur-sm p-2.5 shadow-lg border border-border/50 hover:bg-accent/30 transition-colors h-10 w-10 flex items-center justify-center"
          >
            <MessageSquareIcon className="h-5 w-5 text-foreground" />
          </motion.button>
        )}
      </AnimatePresence>
      
      <div className="flex flex-1 h-full w-full overflow-hidden relative">
        {/* Chat content area with MessageList and MessageInput */}
        <div className={cn(
          "flex-1 h-full flex flex-col overflow-hidden",
          isSidebarOpen ? "relative lg:ml-0" : "ml-0"
        )}>
          {/* Chat content */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col overflow-hidden relative w-full h-full"
          >
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
                <div className="flex-1 overflow-hidden relative h-full">
                  <MessageList chatId={selectedChatId} />
                  {/* MessageInput rendered with z-index to ensure it appears on top */}
                  <MessageInput chatId={selectedChatId} />
                </div>
              </>
            ) : chatError ? (
              // Show error message when chat doesn't exist
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                <div className="max-w-md p-6 bg-background/80 backdrop-blur-md border border-border/50 rounded-lg shadow-lg">
                  <h3 className="text-lg font-medium mb-2 text-primary">Chat Not Available</h3>
                  <p className="text-muted-foreground mb-4">{chatError}</p>
                  <Button 
                    onClick={() => {
                      // If there are chats, select the first one
                      if (chats.length > 0) {
                        setSelectedChatId(chats[0]._id);
                      } else {
                        // Otherwise, open the new chat modal
                        setIsNewChatModalOpen(true);
                      }
                      // Clear the error
                      setChatError(null);
                    }}
                    className="gap-2"
                  >
                    {chats.length > 0 ? (
                      <>
                        <MessageSquareIcon className="h-4 w-4" />
                        <span>View Available Chats</span>
                      </>
                    ) : (
                      <>
                        <MessageSquarePlus className="h-4 w-4" />
                        <span>Start New Chat</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              // Default view when no chat is selected
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                <div className="max-w-md">
                  <h3 className="text-xl font-medium mb-2">Welcome to Messages</h3>
                  <p className="text-muted-foreground mb-6">Select a conversation or start a new one</p>
                  <Button onClick={handleNewChat} className="gap-2">
                    <MessageSquarePlus className="h-4 w-4" />
                    <span>New Message</span>
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
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