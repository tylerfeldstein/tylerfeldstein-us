// Define event interface for our application
export interface Events {
  "chat/message.created": {
    data: {
      chatId: string;
      messageId: string;
      senderId: string;
      content: string;
      timestamp: number;
    };
  };
  "chat/chat.created": {
    data: {
      chatId: string;
      name: string;
      createdBy: string;
      participantIds: string[];
      createdAt: number;
    };
  };
  // Add other event types here as needed
} 