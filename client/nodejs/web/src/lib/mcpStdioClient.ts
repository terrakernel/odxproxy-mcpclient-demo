import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { log } from "@/lib/logger";

let client: Client | null = null;

function buildArgs() {
  const entry = process.env.MCP_SERVER_ENTRY!;
  const extra = (process.env.MCP_SERVER_ARGS || "").trim();
  return [entry, ...(extra ? extra.split(/\s+/) : [])];
}

async function start(): Promise<Client> {
  const command = process.env.MCP_SERVER_COMMAND || "node";
  const args = buildArgs();

  log("MCP spawn.prepare", { command, args });

  const transport = new StdioClientTransport({
    command,
    args,
    env: {
      ...process.env,
      DRY_RUN: "", // ensure server doesn't exit early
    },
  });

  const c = new Client({ name: "odxproxy-mcpclient-demo", version: "0.1.0" });
  log("MCP client.connect.begin");
  await c.connect(transport);
  log("MCP client.connect.ok");

  if (process.env.DEBUG_MCP === "1") {
    try {
      log("MCP preflight.listTools.begin");
      const tools = await c.listTools();
      log("MCP preflight.listTools.ok", tools);
    } catch (err) {
      log("MCP preflight.listTools.err", err);
      throw err;
    }
  }

  client = c;
  return c;
}

export async function getMcpClient() {
  if (client) {
    log("MCP client.reuse");
    return client;
  }
  return start();
}
