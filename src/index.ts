#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { search } from '@/domains/sumologic/client.js';
import * as Sumo from '@/lib/sumologic/client.js';

// Check for required environment variables
const { SUMO_ENDPOINT, SUMO_ACCESS_ID, SUMO_ACCESS_KEY } = process.env;

if (!SUMO_ENDPOINT || !SUMO_ACCESS_ID || !SUMO_ACCESS_KEY) {
  console.error(
    'Error: Missing required environment variables. Please set SUMO_ENDPOINT, SUMO_ACCESS_ID, and SUMO_ACCESS_KEY.',
  );
  process.exit(1);
}

const sumoClient = Sumo.client({
  endpoint: SUMO_ENDPOINT,
  sumoApiId: SUMO_ACCESS_ID,
  sumoApiKey: SUMO_ACCESS_KEY,
});

// Create an MCP server
const server = new McpServer({
  name: 'mcp-sumologic',
  version: '1.0.0',
});

// Add a search tool
server.tool(
  'search_sumologic',
  {
    query: z.string(),
    from: z.string().optional(),
    to: z.string().optional(),
    timeZone: z.string().optional(),
  },
  async ({ query, from, to, timeZone }) => {
    try {
      // remove any new lines in the query
      const cleanedQuery = query.replace(/\n/g, '');
      const results = await search(
        sumoClient,
        cleanedQuery,
        { from, to },
        timeZone,
      );

      // Safely stringify the results, handling potential circular references
      const safeStringify = (obj: any) => {
        const seen = new WeakSet();
        return JSON.stringify(
          obj,
          (key, value) => {
            if (typeof value === 'object' && value !== null) {
              if (seen.has(value)) {
                return '[Circular Reference]';
              }
              seen.add(value);
            }
            return value;
          },
          2,
        );
      };

      return {
        content: [
          {
            type: 'text',
            text: safeStringify(results),
          },
        ],
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,
          },
        ],
      };
    }
  },
);

// Start receiving messages on stdin and sending messages on stdout
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

runServer().catch(console.error);

process.stdin.on('close', () => {
  console.error('Sumologic MCP Server closed');
  server.close();
});
