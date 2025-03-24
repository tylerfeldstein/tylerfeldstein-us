import { createAgent } from "@inngest/agent-kit";
import { createServer } from "@inngest/agent-kit/server";
import { openai } from "@inngest/ai";

// Create the database administrator agent
const dbaAgent = createAgent({
  name: 'Database administrator',
  description: 'Provides expert support for managing PostgreSQL databases',
  system:
    'You are a PostgreSQL expert database administrator. ' +
    'You only provide answers to questions linked to Postgres database schema, indexes, extensions.',
  model: openai({
    model: process.env.OPENAI_MODEL || 'deepseek-r1-distill-qwen-14b',
    baseUrl: process.env.OPENAI_BASE_URL || 'http://localhost:1234/v1',
    apiKey: process.env.OPENAI_API_KEY || 'sk-no-key-required',
  }),
});

// Create the server with our agent
const server = createServer({
  agents: [dbaAgent],
});

// Start listening on port 3000
server.listen(3000, () => {
  console.log("Agent kit running on port 3000!");
  console.log(`Using model: ${process.env.OPENAI_MODEL || "deepseek-r1-distill-qwen-14b"}`);
});
