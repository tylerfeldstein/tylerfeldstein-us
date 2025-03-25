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

  MessageSquareIcon,
  MessageSquarePlus,
  MessageSquare,
  X,
} from "lucide-react";
import { NewChatModal } from "./NewChatModal";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useChatCookieTokens } from "@/hooks/useChatCookieTokens";
import { DropdownMenuItem, DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/ModeToggle";
import { useTheme } from "next-themes";
import { toast } from "sonner";
// Constants for sidebar width
const DEFAULT_SIDEBAR_WIDTH = 350; // Default width in pixels
const MIN_SIDEBAR_WIDTH = 280;     // Minimum width
const MAX_SIDEBAR_WIDTH = 600;     // Maximum width
const COLLAPSED_WIDTH = 70;        // Width when collapsed (just showing avatars)

export function ChatInterface() {
  const { theme, setTheme } = useTheme();
  const { user } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [selectedChatId, setSelectedChatId] = useState<Id<"chats"> | null>(null);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const previousChatIdRef = useRef<Id<"chats"> | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { hasToken, refreshToken, generateChatTokens } = useChatCookieTokens();
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const EDGE_THRESHOLD = 50; // Increased edge detection area
  const SWIPE_THRESHOLD = 100; // Increased swipe distance for better UX
  const TIME_THRESHOLD = 300; // maximum time for swipe in ms
  
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
  
  // // Get current user data to check if they're an admin
  // const currentUser = useQuery(api.users.getMe);
  
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
      } else {
        // On desktop, sidebar is open
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
  const deleteChat = useMutation(api.messages.deleteChat);
  
  const handleDeleteChat = async (chatId: Id<"chats">) => {
    try {
      await deleteChat({ chatId });
      // If we deleted the currently selected chat, clear the selection
      if (selectedChatId === chatId) {
        if (chats.length > 1) {
          // Find the next available chat
          const nextChat = chats.find((chat) => chat._id !== chatId);
          if (nextChat) {
            setSelectedChatId(nextChat._id);
          }
        } else {
          // No chats left
          setSelectedChatId(null);
        }
      }
      toast.success("Chat deleted successfully");
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete chat");
    }
  };
  
  const handleNewChat = async () => {
    // For regular users, create a chat directly
    if (!user) return;
    
    try {
      // First verify we have a valid token
      if (!hasToken) {
        console.log("No valid token found, generating new tokens...");
        const success = await generateChatTokens();
        if (!success) {
          alert("Unable to establish secure connection. Please try refreshing the page.");
          return;
        }
      }

      // Get fresh tokens to ensure we have valid ones
      await generateChatTokens();

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
      
      if (result.error === "Token has been invalidated") {
        console.log("Token invalidated, attempting refresh...");
        // Try to refresh the token
        const refreshResult = await refreshToken();
        if (refreshResult) {
          console.log("Token refreshed successfully, retrying chat creation...");
          // Retry the operation with the new token
          const retryResult = await createChat({
            name: "New Chat",
            initialMessage: "Hello! How can I help you today?",
            participantIds: [],
            tokenPayload: {
              userId: user.id,
              userRole: "user",
              exp: 0,
              iat: 0,
              jti: ""
            }
          });
          
          if (retryResult.error) {
            console.error("Failed to create chat after token refresh:", retryResult.error);
            // If we still get token invalidation after refresh, try generating new tokens
            if (retryResult.error === "Token has been invalidated") {
              console.log("Token still invalid after refresh, generating new tokens...");
              const newTokens = await generateChatTokens();
              if (newTokens) {
                console.log("New tokens generated, making final attempt...");
                const finalAttempt = await createChat({
                  name: "New Chat",
                  initialMessage: "Hello! How can I help you today?",
                  participantIds: [],
                  tokenPayload: {
                    userId: user.id,
                    userRole: "user",
                    exp: 0,
                    iat: 0,
                    jti: ""
                  }
                });
                
                if (finalAttempt.chatId) {
                  setSelectedChatId(finalAttempt.chatId);
                  if (window.innerWidth < 768) {
                    setIsSidebarOpen(false);
                  }
                  return;
                }
              }
            }
            alert("Failed to create chat. Please try refreshing the page.");
            return;
          }
          
          if (retryResult.chatId) {
            setSelectedChatId(retryResult.chatId);
            if (window.innerWidth < 768) {
              setIsSidebarOpen(false);
            }
            return;
          }
        }
      }
      
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

  useEffect(() => {
    // Set CSS variables for dimensions
    document.documentElement.style.setProperty('--collapsed-sidebar-width', `${COLLAPSED_WIDTH}px`);
  }, []);

  // Add touch handlers for edge swipe
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;
      touchStartTime.current = Date.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isMobile || isSidebarOpen) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX.current;
      const deltaY = Math.abs(touch.clientY - touchStartY.current);
      const deltaTime = Date.now() - touchStartTime.current;

      // Only allow horizontal scrolling if started from edge
      if (touchStartX.current <= EDGE_THRESHOLD && deltaY < deltaX) {
        e.preventDefault(); // Prevent vertical scroll while swiping

        // If we've met the threshold, open the sidebar
        if (deltaX > SWIPE_THRESHOLD && deltaTime < TIME_THRESHOLD) {
          setIsSidebarOpen(true);
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isMobile, isSidebarOpen, setIsSidebarOpen]);

  // Update sidebar width CSS variable when expanded state changes
  useEffect(() => {
    const width = isSidebarExpanded ? sidebarWidth : COLLAPSED_WIDTH;
    document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
    
    return () => {
      document.documentElement.style.removeProperty('--sidebar-width');
    };
  }, [isSidebarExpanded, sidebarWidth]);

  return (
    <div className="flex h-full w-full overflow-hidden relative pt-0">
      {/* Floating sidebar toggle button for mobile */}
      <AnimatePresence>
        {isMobile && !isSidebarOpen && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={() => setIsSidebarOpen(true)}
            className={cn(
              "fixed left-0 top-1/2 -translate-y-1/2 z-50",
              "h-12 w-12 flex items-center justify-center",
              "bg-background dark:text-white text-black",
              "hover:bg-accent hover:text-accent-foreground",
              "transition-colors shadow-lg",
              "rounded-r-xl border border-l-0 border-border"
            )}
          >
            <MessageSquare className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.div 
            ref={sidebarRef}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            style={{ width: isMobile ? COLLAPSED_WIDTH : (isSidebarExpanded ? sidebarWidth : COLLAPSED_WIDTH) }}
            className={cn(
              "flex-shrink-0 relative h-full bg-background/80 backdrop-blur-sm z-50",
              "border-r border-border/50",
              isMobile ? "fixed left-0 top-0" : "relative"
            )}
          >
            <ChatSidebar
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
              selectedChatId={selectedChatId}
              setSelectedChatId={setSelectedChatId}
              onNewChat={handleNewChat}
              isExpanded={isSidebarExpanded}
              setIsExpanded={setIsSidebarExpanded}
            />

            {/* Close button for mobile */}
            {isMobile && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "absolute top-4 right-0 translate-x-1/2",
                  "rounded-full bg-background shadow-lg border border-border/50",
                  "p-1.5 hover:bg-accent/30 transition-colors"
                )}
              >
                <X className="h-4 w-4" />
              </motion.button>
            )}

            {/* Resizer - only shown on desktop */}
            {!isMobile && (
              <div
                className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-primary/20 transition-colors z-10"
                onMouseDown={startResize}
                onTouchStart={startResize}
              />
            )}

            {/* Show theme toggle in dropdown for mobile */}
            {isMobile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <ModeToggle inline />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                    <div className="flex items-center w-full">
                      <ModeToggle inline />
                      <span className="ml-2">Theme</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className={cn(
        "flex-1 h-full w-full overflow-hidden relative",
        isSidebarOpen && !isMobile ? "ml-0" : "ml-0"
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
            <div className="flex flex-col h-full overflow-hidden">
              <ChatHeader
                chatId={selectedChatId || undefined}
                chatName={selectedChat?.name || "New Chat"}
                participantCount={selectedChat?.participantIds?.length || 0}
                onDeleteChat={handleDeleteChat}
              />
              <div className="flex-1 relative overflow-hidden">
                <MessageList chatId={selectedChatId} />
                <MessageInput chatId={selectedChatId} />
              </div>
            </div>
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
      
      {/* Backdrop for mobile sidebar */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

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