import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { 
  chatMessageNotificationFunction, 
  chatCreatedNotificationFunction 
} from "@/inngest/functions/chat/notifyMessageCreated";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    chatMessageNotificationFunction,
    chatCreatedNotificationFunction,
  ],
});
