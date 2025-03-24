/**
 * AgenticNegotiator Agents Index
 * 
 * Centralizes exports for all negotiation agents to make imports cleaner
 * when using these agents elsewhere in the application.
 */

import supervisorAgent from './supervisor';
import scopingAgent from './scopingAgent';
import negotiationAgent from './negotiationAgent';
import hrAgent from './hrAgent';
import contractAgent from './contractAgent';

// Export individual agents
export {
  supervisorAgent,
  scopingAgent,
  negotiationAgent,
  hrAgent,
  contractAgent
};

// Export all agents as a group for easier network creation
export const allAgents = [
  supervisorAgent,
  scopingAgent,
  negotiationAgent,
  hrAgent,
  contractAgent
];

// Export default as supervisorAgent since it's the main entry point
export default supervisorAgent; 