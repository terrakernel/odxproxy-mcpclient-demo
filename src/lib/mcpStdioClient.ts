import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { log } from "./logger";

let client: Client | null = null;

function buildArgs(): string[] {
  const entry = process.env.MCP_SERVER_ENTRY!;
  const extra = (process.env.MCP_SERVER_ARGS || "").trim();
  return [entry, ...(extra ? extra.split(/\s+/) : [])];
}

async function start(): Promise<Client> {
  const command = process.env.MCP_SERVER_COMMAND || "node";
  const args = buildArgs();

  log("MCP spawn.prepare", { command, args });
  log("MCP spawn.env", {
    ODX_INSTANCE_URL: process.env.ODX_INSTANCE_URL,
    ODX_INSTANCE_DB: process.env.ODX_INSTANCE_DB,
    ODX_INSTANCE_USER_ID: process.env.ODX_INSTANCE_USER_ID,
    ODX_GATEWAY_URL: process.env.ODX_GATEWAY_URL,
    // do NOT log API keys
  });

  // StdioClientTransport will spawn your compiled server (dist/index.js)
  const transport = new StdioClientTransport({
    command,
    args,
    env: {
      ...process.env,
      DRY_RUN: "", // ensure your server doesn't exit early
    },
  });

  const c = new Client({ name: "odxproxy-mcpclient-demo", version: "0.1.0" });

  log("MCP client.connect.begin");
  await c.connect(transport);
  log("MCP client.connect.ok");

  // Optional: First run, list tools so you can confirm server wiring
  if (process.env.DEBUG_MCP === "1") {
    try {
      log("MCP listTools.begin");
      const tools = await c.listTools();
      log("MCP listTools.ok", tools);
    } catch (e) {
      log("MCP listTools.err", e);
    }
  }

  client = c;
  return c;
}

export async function getMcpClient(): Promise<Client> {
  if (client) {
    log("MCP client.reuse");
    return client;
  }
  return start();
}
