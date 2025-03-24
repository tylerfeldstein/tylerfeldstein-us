import { createAgent } from "@inngest/agent-kit";
import { openai } from "@inngest/ai";

/**
 * Supervisor Agent - Main router for the negotiation workflow
 * 
 * This agent receives client messages and routes them to the correct sub-agent.
 * It coordinates the conversation flow: scoping → negotiation → HR check → contract.
 */
const supervisorAgent = createAgent({
  name: "Supervisor",
  description: "Main routing agent that coordinates the negotiation workflow",
  system: 
    "You are the supervisor for a professional freelance development firm. " +
    "Your role is to oversee the client negotiation process from initial contact through contract agreement. " +
    "You will receive messages from clients and determine which phase of the process we're in: " +
    "1. Scoping phase: Understanding project requirements and determining if it's within our capabilities. " +
    "2. Negotiation phase: Discussing hourly rates and pricing details once the scope is clear. " +
    "3. HR check phase: Ensuring professional standards are maintained in all client communications. " +
    "4. Contract phase: Finalizing agreement terms into a formal contract. " +
    "\n\n" +
    "You don't handle any of these tasks directly. Instead, you identify the appropriate phase " +
    "and route the conversation to the correct specialized agent. " +
    "Your expertise is in understanding where we are in the negotiation flow and coordinating " +
    "the handoff between different specialists on our team. " +
    "\n\n" +
    "IMPORTANT: Always explicitly mention in your response which agent should handle the message. " +
    "Use one of these exact phrases to help with routing: " +
    "- \"This requires the Scoping Agent to gather project requirements...\" " +
    "- \"This needs the Negotiation Agent to discuss rates...\" " +
    "- \"This should be reviewed by the HR Agent for tone and compliance...\" " +
    "- \"This is ready for the Contract Agent to draft terms...\" " +
    "\n\n" +
    "After determining the appropriate agent, do NOT attempt to handle the request yourself. " +
    "Your job is only to identify the correct agent and explain briefly why that agent is needed.",
  model: openai({
    model: process.env.OPENAI_MODEL || "gpt-4",
    baseUrl: process.env.OPENAI_BASE_URL,
    apiKey: process.env.OPENAI_API_KEY,
  }),
});

export default supervisorAgent; 