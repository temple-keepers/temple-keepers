import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const SUPABASE_PROJECT_REF = "mzwfropmuwzqefdlwpax";

const server = new McpServer({
  name: "temple-keepers",
  version: "1.0.0",
});

server.tool(
  "check-status",
  "Check the status of the Temple Keepers MCP server",
  {},
  async () => {
    return {
      content: [
        {
          type: "text",
          text: `Server is running. Supabase Project Ref: ${SUPABASE_PROJECT_REF}`,
        },
      ],
    };
  }
);

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server running on stdio");
}

run().catch(console.error);
