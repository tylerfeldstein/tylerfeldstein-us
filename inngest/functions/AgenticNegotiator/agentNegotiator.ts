import { createNetwork, createState, openai } from "@inngest/agent-kit";
import { createServer } from "@inngest/agent-kit/server";
import {
  supervisorAgent,
  scopingAgent,
  negotiationAgent,
  hrAgent,
  contractAgent,
} from "./agents";

// Define the type for our negotiation state
interface NegotiatorState {
  currentPhase: "scoping" | "negotiation" | "hr-check" | "contract" | null;
  projectRequirements?: string;
  projectViable?: boolean;
  agreedRate?: number;
}

// Create a state instance for our negotiation workflow
const negotiatorState = createState<NegotiatorState>({
  currentPhase: null,
});

// Create the network with a proper delegation router
const agenticNegotiator = createNetwork({
  name: "Agentic Negotiator",
  agents: [
    supervisorAgent,
    scopingAgent,
    negotiationAgent,
    hrAgent,
    contractAgent
  ],
  defaultModel: openai({
    model: process.env.OPENAI_MODEL || "gpt-4",
    baseUrl: process.env.OPENAI_BASE_URL,
    apiKey: process.env.OPENAI_API_KEY || "sk-no-key-required",
  }),
  // Router that delegates based on supervisor's explicit routing phrases
  router: ({ callCount, lastResult, network }) => {
    // First turn always goes to supervisor
    if (callCount === 0) {
      // Reset phase at the start of a conversation
      network.state.data.currentPhase = null;
      return supervisorAgent;
    }
    
    // Check the lastResult text to determine which agent to delegate to
    if (lastResult) {
      const lastMessage = lastResult.output?.find(msg => msg.type === "text");
      const text = lastMessage?.content?.toString() || "";
      
      // Look for specific phrases in the supervisor's response
      if (text.includes("Scoping Agent")) {
        console.log("Routing to Scoping Agent");
        network.state.data.currentPhase = "scoping";
        return scopingAgent;
      } 
      else if (text.includes("Negotiation Agent")) {
        console.log("Routing to Negotiation Agent");
        network.state.data.currentPhase = "negotiation";
        return negotiationAgent;
      }
      else if (text.includes("HR Agent")) {
        console.log("Routing to HR Agent");
        network.state.data.currentPhase = "hr-check";
        return hrAgent;
      }
      else if (text.includes("Contract Agent")) {
        console.log("Routing to Contract Agent");
        network.state.data.currentPhase = "contract";
        return contractAgent;
      }
      else {
        // If no explicit routing phrase is found, continue with current phase
        const currentPhase = network.state.data.currentPhase;
        console.log(`No explicit routing detected, continuing with ${currentPhase || "Scoping Agent"}`);
        
        switch (currentPhase) {
          case "scoping": return scopingAgent;
          case "negotiation": return negotiationAgent;
          case "hr-check": return hrAgent;
          case "contract": return contractAgent;
          default: 
            // Default to scoping if no phase is set
            network.state.data.currentPhase = "scoping";
            return scopingAgent;
        }
      }
    }
    
    // If we couldn't determine which agent to use, stop routing
    return undefined;
  },
  maxIter: 15, // Allow for a longer conversation to develop
});

// Handle incoming user messages with state
async function handleUserMessage(message: string): Promise<any> {
  // Run the network with our state
  const result = await agenticNegotiator.run(message, { state: negotiatorState });
  
  // Log current phase after processing
  console.log(`Current negotiation phase: ${negotiatorState.data.currentPhase}`);
  
  return result;
}

// Create server with all agents and the network
const server = createServer({
  agents: [
    supervisorAgent,
    scopingAgent,
    negotiationAgent,
    hrAgent,
    contractAgent,
  ],
  networks: [agenticNegotiator],
});

// Log a message showing how to test with the state
console.log(`
To test with state management:
1. Connect to the server
2. Send a message to start the conversation
3. The network will use the negotiatorState object to track the phase
4. You can call handleUserMessage("your message") to test manually
`);

// Start the server
server.listen(3000, () => {
  console.log('Agent kit running!');
  console.log(`Using model: ${process.env.OPENAI_MODEL || "gpt-4"}`);
  console.log(`Base URL: ${process.env.OPENAI_BASE_URL || "default OpenAI"}`);
  console.log('State management enabled for negotiation workflow');
});
