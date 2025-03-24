// Local AI adapter for Inngest agent-kit 
// Supports Ollama and LM Studio for local LLMs

import { type AiAdapter } from "./adapter";

/**
 * Creates a compatible model adapter for Inngest agent-kit using local LLMs.
 * Can be used directly with createAgent, createNetwork, etc.
 * 
 * @param options Configuration options for the local LLM
 * @returns A model adapter compatible with agent-kit
 */

interface Message {
  role: string;
  content: string;
}

interface InferOptions {
  temperature?: number;
  max_tokens?: number;
}

export const localAI = (options: any = {}): AiAdapter.Any => {
  const modelName = options.model || process.env.LOCAL_LLM_NAME || "llama3";
  const temperature = options.temperature || 0.7;
  const max_tokens = options.max_tokens || 1000;
  const url = process.env.LOCAL_LLM_URL || "http://localhost:1234/v1/chat/completions";

  return {
    format: "openai-chat",
    options: {
      model: modelName,
      temperature,
      max_tokens,
      ...options
    },
    url,
    headers: {
      "Content-Type": "application/json"
    },
    authKey: process.env.LOCAL_LLM_KEY || "",
    "~types": {
      input: {} as { messages: Message[] },
      output: {} as {
        id: string;
        model: string;
        choices: Array<{
          message: { content: string; role: string };
          finish_reason: string;
        }>;
        usage: { total_tokens: number };
      }
    },
    onCall: async (model: AiAdapter, body: { messages: Message[] }) => {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            ...(model.headers || {})
          },
          body: JSON.stringify({
            model: modelName,
            messages: body.messages,
            temperature,
            max_tokens,
            stream: false
          })
        });
        
        if (!res.ok) {
          throw new Error(`Local LLM request failed: ${res.status} ${await res.text()}`);
        }
        
        const data = await res.json();
        return {
          id: data.id || `local-${Date.now()}`,
          model: modelName,
          choices: data.choices,
          usage: data.usage
        };
      } catch (error) {
        console.error("Error calling local LLM:", error);
        throw error;
      }
    }
  };
}; 