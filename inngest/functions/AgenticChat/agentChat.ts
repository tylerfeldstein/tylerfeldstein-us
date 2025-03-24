import { localAI } from "@/inngest/sharedModels/localAi";
import { createAgent } from "@inngest/agent-kit";
import { createServer } from "@inngest/agent-kit/server";

// Create the database administrator agent
const dbaAgent = createAgent({
    name: 'Database administrator',
    description: 'Provides expert support for managing PostgreSQL databases',
    system:
      'You are a PostgreSQL expert database administrator. ' +
      'You only provide answers to questions linked to Postgres database schema, indexes, extensions.',
    model: localAI({
      model: 'claude-3-5-haiku-latest',
      defaultParameters: {
        max_tokens: 1000,
      },
    }),
  });

// Create the server with our agent
const server = createServer({
  agents: [dbaAgent],
});

// Start listening on port 3000
server.listen(3000, () => {
  console.log("Agent kit running on port 3000!");
  console.log(`Using model: ${process.env.LOCAL_LLM_NAME || "deepseek-r1-distill-qwen-14b"}`);
});
