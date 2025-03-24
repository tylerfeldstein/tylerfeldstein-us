# Inngest AgentKit Usage Guide

This document explains how to use Inngest AgentKit with local AI models and environment variables in our project.

## Local AI Configuration

We use the OpenAI adapter from the `@inngest/ai` package, which is compatible with LM Studio and other OpenAI-compatible APIs.

### Environment Variables

The following environment variables control the AI configuration:

```env
# Local Development (LM Studio)
OPENAI_MODEL=deepseek-r1-distill-qwen-14b
OPENAI_BASE_URL=http://localhost:1234/v1
OPENAI_API_KEY=sk-no-key-required

# Production (uncomment and update these for production)
# OPENAI_MODEL=gpt-4-turbo-preview
# OPENAI_BASE_URL=https://api.openai.com/v1
# OPENAI_API_KEY=your-openai-key-here
```

### Agent Configuration

When creating a new agent with AgentKit, follow this pattern:

```typescript
import { createAgent } from "@inngest/agent-kit";
import { createServer } from "@inngest/agent-kit/server";
import { openai } from "@inngest/ai";

const agent = createAgent({
  name: 'Agent Name',
  description: 'Brief description of the agent purpose',
  system: 'Detailed system prompt for the agent',
  model: openai({
    model: process.env.OPENAI_MODEL || 'default-model-name',
    baseUrl: process.env.OPENAI_BASE_URL || 'http://localhost:1234/v1',
    apiKey: process.env.OPENAI_API_KEY || 'sk-no-key-required',
  }),
});
```

## Creating Tools for Agents

Tools extend an agent's capabilities by allowing structured actions or function calls. Use the following pattern to create tools:

```typescript
import { createTool } from "@inngest/agent-kit";
import { z } from "zod";

const searchTool = createTool({
  name: "search_web",
  description: "Search the web for information on a specific topic",
  parameters: z.object({
    query: z.string().describe("The search query to find information"),
  }),
  handler: async ({ query }) => {
    // Implementation of the search functionality
    const results = await performSearch(query);
    return results;
  },
});
```

Then attach tools to an agent:

```typescript
const researchAgent = createAgent({
  name: "Researcher",
  description: "Performs web searches to answer questions",
  system: "You are a research expert who finds information online.",
  model: openai({
    model: process.env.OPENAI_MODEL || 'default-model-name',
    baseUrl: process.env.OPENAI_BASE_URL || 'http://localhost:1234/v1',
    apiKey: process.env.OPENAI_API_KEY || 'sk-no-key-required',
  }),
  tools: [searchTool],
});
```

## Building Multi-Agent Networks

For complex workflows, create networks of specialized agents:

```typescript
import { createNetwork, createState } from "@inngest/agent-kit";

// Define shared state
interface WorkflowState {
  category?: string;
}

const state = createState<WorkflowState>({ category: undefined });

// Create a network with multiple agents
const agentNetwork = createNetwork({
  name: "Q&A Workflow",
  agents: [directorAgent, researchAgent, supportAgent, summaryAgent],
  state,
  defaultModel: openai({
    model: process.env.OPENAI_MODEL || 'gpt-4',
    baseUrl: process.env.OPENAI_BASE_URL || 'http://localhost:1234/v1',
    apiKey: process.env.OPENAI_API_KEY || 'sk-no-key-required',
  }),
  router: ({ network, callCount }) => {
    // Logic to determine which agent to call next
    if (callCount === 0) return directorAgent;
    if (callCount === 1) {
      return network.state.data.category === "technical" 
        ? supportAgent 
        : researchAgent;
    }
    if (callCount === 2) return summaryAgent;
    return undefined; // End the workflow
  },
  maxIter: 5, // Prevent infinite loops
});
```

## Integrating with Inngest Functions

Use Inngest functions to run agent workflows in the background:

```typescript
import { inngest } from "../client";

export const answerQuestionWorkflow = inngest.createFunction(
  { id: "answer-question-workflow", name: "Answer User Question" },
  { event: "app/user.question" },
  async ({ event, step }) => {
    const userQuestion = event.data.question as string;
    
    // Run the agent network
    const result = await step.run("agent_workflow", async () => {
      return await agentNetwork.run(userQuestion);
    });
    
    return { answer: result };
  }
);
```

## Local Development Setup

1. Install and set up LM Studio:
   - Download from [lmstudio.ai](https://lmstudio.ai/)
   - Load the model (e.g., deepseek-r1-distill-qwen-14b)
   - Start the local server on port 1234

2. Configure environment variables in `.env.local`:
   ```env
   OPENAI_MODEL=deepseek-r1-distill-qwen-14b
   OPENAI_BASE_URL=http://localhost:1234/v1
   OPENAI_API_KEY=sk-no-key-required
   ```

3. Run the agent server:
   ```bash
   pnpm run dev:agent
   ```

## Switching to Production

1. Update environment variables in deployment:
   ```env
   OPENAI_MODEL=gpt-4-turbo-preview
   OPENAI_BASE_URL=https://api.openai.com/v1
   OPENAI_API_KEY=your-actual-api-key
   ```

## Agent Design Best Practices

1. **Single Responsibility**: Each agent should focus on one specific task or capability.

2. **Clear System Prompts**: Write concise prompts that specify the agent's role and responsibility.

3. **Modular Tools**: Create reusable tools that can be shared across multiple agents.

4. **Stateless Design**: Don't hardcode information in agents; use the network's shared state.

5. **Appropriate Models**: Use faster models for simple tasks and more powerful ones for complex reasoning.

6. **Structured State**: Define TypeScript interfaces for your state to ensure type safety.

## Troubleshooting

- **Connection issues with LM Studio**: Ensure the local inference server is running and the port matches your configuration.

- **Authentication errors**: Verify API keys are correctly set in environment variables.

- **Model not found**: Confirm the model name in your environment variables matches what's available in LM Studio or OpenAI.

- **Tool execution errors**: Check that your tool handlers have proper error handling and return appropriate data formats.

- **Network routing issues**: Verify your router function logic and ensure state is being properly updated.

## Debugging Agents

- Use `console.log` or `step.log()` to track the flow of execution.
- Test individual agents outside of networks to isolate issues.
- Check network state after each agent run to verify data is being properly shared.
- Monitor tool executions to ensure they're being called as expected. 