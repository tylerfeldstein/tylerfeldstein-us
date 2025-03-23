import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquarePlus, Settings } from "lucide-react";
import ChatList from "../messages/ChatList";
import { NewChatModal } from "@/components/messages/NewChatModal";

export default function MessagesNav({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const currentUser = useQuery(api.users.getMe);
  
  // Function to handle opening the new chat modal
  const handleNewChat = () => {
    console.log("[MessagesNav] Opening new chat modal");
    setNewChatModalOpen(true);
  };

  return (
    <>
      <Card className={`h-full border-r rounded-none ${isCollapsed ? "w-[70px]" : "w-[280px]"}`}>
        <CardContent className="p-0 h-full flex flex-col">
          <div className="border-b h-16 min-h-16 flex items-center px-4 justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <Image
                  src="/logo.png"
                  width={24}
                  height={24}
                  alt="Logo"
                  className="rounded"
                />
                <h1 className="text-xl font-semibold">Messages</h1>
              </div>
            )}
            
            {/* New Chat button */}
            <Button 
              onClick={handleNewChat} 
              variant="ghost" 
              size="icon" 
              className={`${isCollapsed ? "mx-auto" : ""}`}
            >
              <MessageSquarePlus className="h-5 w-5" />
              <span className="sr-only">New Chat</span>
            </Button>
          </div>
          
          {/* Main content - Chat List */}
          <div className={`flex-1 overflow-auto ${isCollapsed ? "flex flex-col items-center" : ""}`}>
            <ChatList isCollapsed={isCollapsed} />
          </div>
          
          {/* Footer with user profile */}
          <div className="border-t mt-auto p-4 flex items-center justify-between">
            {!isCollapsed && currentUser && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 relative rounded-full overflow-hidden">
                  <Image
                    src={currentUser.imageUrl || "/placeholder-user.jpg"}
                    alt={currentUser.name || "User"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-sm truncate max-w-[140px]">
                  {currentUser.name || currentUser.email || "User"}
                </div>
              </div>
            )}
            
            {isCollapsed && currentUser && (
              <div className="w-10 h-10 mx-auto relative rounded-full overflow-hidden">
                <Image
                  src={currentUser.imageUrl || "/placeholder-user.jpg"}
                  alt={currentUser.name || "User"}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            
            {!isCollapsed && (
              <Link href="/settings">
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* New Chat Modal */}
      <NewChatModal 
        open={newChatModalOpen} 
        onClose={() => setNewChatModalOpen(false)} 
      />
    </>
  );
} 