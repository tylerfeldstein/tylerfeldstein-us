import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { fn } from "@/inngest/functions/agentkittest/testddd";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    fn
    
  ],
});
