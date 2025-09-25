// mcp-launcher.ts
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// ⛳️ IMPORTANT: absolute path, and it's **/Users/** not /User/
import { OdxMCPServer } from "/Users/benareli/GitHub/odxproxy-mcpserver/dist/index.js";

function req(name: string, fallback?: string): string {
  const v = process.env[name];
  if (v && v.trim()) return v.trim();
  if (fallback !== undefined) return fallback;
  console.error(`[ODX-MCP] Missing required env: ${name}`);
  process.exit(1);
}

async function main() {
  const clientInfo = {
    instance: {
      url: req("ODX_INSTANCE_URL"),
      user_id: Number(process.env.ODX_INSTANCE_USER_ID || 2),
      db: req("ODX_INSTANCE_DB"),
      api_key: req("ODX_INSTANCE_API_KEY"),
    },
    odx_api_key: req("ODXPROXY_API_KEY"),
    gateway_url: process.env.ODX_GATEWAY_URL?.trim() || "https://gateway.odxproxy.io",
  };

  // Safe non-secret log
  console.error("[ODX-MCP] init", {
    url: clientInfo.instance.url,
    db: clientInfo.instance.db,
    user_id: clientInfo.instance.user_id,
    gateway_url: clientInfo.gateway_url,
  });

  const server = new OdxMCPServer(clientInfo);
  await server.initBaseResource();

  if ((process.env.DRY_RUN || "").trim() === "1") {
    console.error("[ODX-MCP] DRY_RUN=1 -> exiting after init");
    return;
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[ODX-MCP] connected via stdio; awaiting requests…");
}

main().catch((err) => {
  console.error("[ODX-MCP] fatal", err);
  process.exit(1);
});
