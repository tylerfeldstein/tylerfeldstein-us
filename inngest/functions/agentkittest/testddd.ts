import {
  createAgent,
  createNetwork,
  createTool,
  getDefaultRoutingAgent,
} from "@inngest/agent-kit";
import { createServer } from "@inngest/agent-kit/server";
import { EventSchemas, Inngest, openai } from "inngest";
import { z } from "zod";

export const inngest = new Inngest({
  id: "agents",
  schemas: new EventSchemas().fromZod({
    "agent/run": {
      data: z.object({
        input: z.string(),
      }),
    },
  }),
});

export const fn = inngest.createFunction(
  { id: "agent", retries: 0 },
  { event: "agent/run" },
  async ({ event }) => {
    //  1. Single agent
    // Run a single agent as a prompt without a network.
    // await codeWritingAgent.run(event.data.input, {
    //   model,
    // });

    // A network of agents that works together.
    //
    // This uses the defaut agentic router to determine which agent to handle
    // first.  You can optionally specifiy the agent that should execute first,
    // and provide your own logic for handling logic in between agent calls.
    return network.run(event.data.input);
  }
);

const model = openai({
  model: process.env.OPENAI_MODEL || "gpt-4",
  baseUrl: process.env.OPENAI_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt =
  "You are an expert TypeScript programmer.  You can create files with idiomatic TypeScript code, with comments and associated tests.";

const codeWritingAgent = createAgent({
  name: "Code writer",
  // description helps LLM routers choose the right agents to run.
  description: "An expert TypeScript programmer which can write and debug code",
  // system defines a system prompt generated each time the agent is called by a network.
  system: ({ network }) => {
    if (!network?.state) {
      return systemPrompt;
    }

    // Each time this agent runs, it may produce "file" content.  Check if any
    // content has already been produced in an agentic workflow.
    const files = network?.state.kv.get<Record<string, string>>("files");

    if (files === undefined) {
      // Use the default system prompt.
      return systemPrompt;
    }

    // There are files present in the network's state, so add them to the prompt to help
    // provide previous context automatically.
    let prompt = systemPrompt + "The following code already exists:";
    for (const [name, contents] of Object.entries(files)) {
      prompt += `<file name='${name}'>${contents}</file>`;
    }

    return prompt;
  },

  tools: [
    // This tool forces the model to generate file content as structured data.  Other options
    // are to use XML tags in a prompt, eg:
    //   "Do not respond with anything else other than the following XML tags:" +
    //   "- If you would like to write code, add all code within the following tags (replace $filename and $contents appropriately):" +
    //   "  <file name='$filename.ts'>$contents</file>";
    createTool({
      name: "create_files",
      description: "Create files with the given filenames and contents",
      parameters: z
        .object({
          files: z.array(
            z
              .object({
                filename: z.string(),
                content: z.string(),
              })
              .required()
          ),
        })
        .required(),
      handler: (output, { network }) => {
        if (!output?.files || !Array.isArray(output.files)) {
          throw new Error("Missing or invalid 'files' output from model");
        }

        const files =
          network?.state.kv.get<Record<string, string>>("files") || {};

        for (const file of output.files) {
          files[file.filename] = file.content;
        }

        network?.state.kv.set<Record<string, string>>("files", files);
      },
    }),
  ],
});

const executingAgent = createAgent({
  name: "Test execution agent",
  description: "Executes written TypeScript tests",

  lifecycle: {
    enabled: ({ network }) => {
      // Only allow executing of tests if there are files available.
      return network?.state.kv.get("files") !== undefined;
    },
  },

  system: `You are an expert TypeScript engineer that can execute commands, run tests, debug the output, and make modifications to code.
  
  Think carefully about the request that the user is asking for. Do not respond with anything else other than the following XML tags:
  
  - If you would like to write code, add all code within the following tags (replace $filename and $contents appropriately):
  
  <file name="$filename.ts">
      $contents
  </file>
  
  - If you would like to run commands, respond with the following tags:
  
  <command>
    $command
  </command>
  `,
});

const network = createNetwork({
  name: "Code writing network",
  agents: [codeWritingAgent.withModel(model), executingAgent.withModel(model)],
  defaultModel: model,
  maxIter: 4,
  defaultRouter: ({ network }) => {
    if (network.state.kv.has("files")) {
      // Okay, we have some files.  Did an agent run tests?
      return executingAgent;
    }

    return getDefaultRoutingAgent().withModel(model);
  },
});
