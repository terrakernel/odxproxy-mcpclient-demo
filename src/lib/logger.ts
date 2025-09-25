export function log(step: string, details?: unknown) {
  const ts = new Date().toISOString();
  // keep logs consistent and easy to grep
   
  console.log(`[MCP-DEMO] ${ts} :: ${step}`, details ?? "");
}
