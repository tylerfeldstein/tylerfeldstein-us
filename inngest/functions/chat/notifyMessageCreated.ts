import { inngest } from "../../client";

// Simple hello world function that gets triggered when a chat message is created
export const chatMessageNotificationFunction = inngest.createFunction(
  { 
    id: "chat-message-notification",
    name: "Chat Message Notification" 
  },
  { event: "chat/message.created" },
  async ({ event, step }) => {
    // Log that the function was triggered
    await step.run("log-event", async () => {
      console.log("Chat message notification triggered", { 
        chatId: event.data.chatId,
        messageId: event.data.messageId,
        content: event.data.content
      });
      return { logged: true };
    });

    // Hello World example - just return a success message
    return {
      message: "Hello World! Chat message notification processed successfully",
      data: {
        chatId: event.data.chatId,
        messageId: event.data.messageId,
        content: event.data.content
      }
    };
  }
);

// Simple hello world function that gets triggered when a new chat is created
export const chatCreatedNotificationFunction = inngest.createFunction(
  { 
    id: "chat-created-notification",
    name: "Chat Created Notification" 
  },
  { event: "chat/chat.created" },
  async ({ event, step }) => {
    // Log that the function was triggered
    await step.run("log-event", async () => {
      console.log("Chat created notification triggered", { 
        chatId: event.data.chatId,
        name: event.data.name,
        createdBy: event.data.createdBy
      });
      return { logged: true };
    });

    // Hello World example - just return a success message
    return {
      message: "Hello World! New chat created notification processed successfully",
      data: {
        chatId: event.data.chatId,
        name: event.data.name,
        createdBy: event.data.createdBy
      }
    };
  }
); 