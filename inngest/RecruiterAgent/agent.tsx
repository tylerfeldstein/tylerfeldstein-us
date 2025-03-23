import { createNetwork, openai } from '@inngest/agent-kit';

// searchAgent and summaryAgent definitions...

// Create a network with two agents.
const network = createNetwork({
  agents: [searchAgent, summaryAgent],
});

// Run the network with a user prompt
await network.run('What happened in the 2024 Super Bowl?');