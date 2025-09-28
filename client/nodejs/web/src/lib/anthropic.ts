import Anthropic from "@anthropic-ai/sdk";

export type ToolsKey = "get_partners" | "get_companies" | "create_partner";

const DEFAULT_MODEL =
  process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";

// Keep one client (server runtime only)
let _client: Anthropic | null = null;
function client(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

const SYSTEM = `You are a router. Pick the SINGLE best toolsKey for the user's query.
Return STRICT JSON only (no prose, no markdown).`;

// Short, purpose-focused catalog
const TOOLS: Array<{ key: ToolsKey; when: string }> = [
  {
    key: "get_partners",
    when:
      "User wants to look up contacts/customers/vendors (res.partner) by id, email, or name; or asks if such a contact exists.",
  },
  {
    key: "get_companies",
    when:
      "User asks about companies/organisations (not individuals): listing, searching by company name, or company details.",
  },
  {
    key: "create_partner",
    when:
      "User intends to create/add a new contact/customer/vendor (res.partner).",
  },
];

function buildBlocks(userQuery: string): Anthropic.Messages.ContentBlockParam[] {
  const catalog = TOOLS.map(t => `- ${t.key}: ${t.when}`).join("\n");
  const format = `Return ONLY this JSON:\n{\n  "toolsKey": "<one of: ${TOOLS.map(t => t.key).join(", ")}>"\n}`;
  return [{ type: "text", text: `Tools:\n${catalog}\n\nUser query:\n${userQuery}\n\n${format}` }];
}

function parseToolsKey(text: string): ToolsKey | null {
  const safeParse = (s: string) => {
    try { return JSON.parse(s) as { toolsKey?: string }; } catch { return null; }
  };
  let parsed = safeParse(text);
  if (!parsed) {
    const i = text.indexOf("{");
    const j = text.lastIndexOf("}");
    if (i >= 0 && j > i) parsed = safeParse(text.slice(i, j + 1));
  }
  const k = parsed?.toolsKey;
  return k === "get_partners" || k === "get_companies" || k === "create_partner" ? k : null;
}

/**
 * Classify a free-form query into a ToolsKey.
 * Returns "get_partners" if the model fails (safe default).
 */
export async function classifyToolsKey(userQuery: string): Promise<ToolsKey> {
  const msg = await client().messages.create({
    model: DEFAULT_MODEL,
    system: SYSTEM,
    temperature: 0,
    max_tokens: 120,
    messages: [{ role: "user", content: buildBlocks(userQuery) }],
  });

  const text = msg.content
    .filter((b): b is Anthropic.Messages.TextBlock => b.type === "text")
    .map(b => b.text)
    .join("\n")
    .trim();

  return parseToolsKey(text) ?? "get_partners";
}
