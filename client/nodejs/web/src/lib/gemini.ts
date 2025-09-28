import { GoogleGenerativeAI } from "@google/generative-ai";

export type ToolsKey = "get_partners" | "get_companies" | "create_partner";

const DEFAULT_MODEL =
  process.env.GEMINI_MODEL || "gemini-1.5-pro-latest";

// Keep one client (server runtime only)
let _client: GoogleGenerativeAI | null = null;
function client(): GoogleGenerativeAI {
  if (!_client) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("Missing GOOGLE_API_KEY");
    _client = new GoogleGenerativeAI(key);
  }
  return _client;
}

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

function buildPrompt(userQuery: string): string {
  const catalog = TOOLS.map(t => `- ${t.key}: ${t.when}`).join("\n");
  const format =
    `Return ONLY this JSON:\n` +
    `{\n  "toolsKey": "<one of: ${TOOLS.map(t => t.key).join(", ")}>"\n}`;
  return [
    `You are a router. Pick the SINGLE best toolsKey for the user's query.`,
    `Return STRICT JSON only (no prose, no markdown).`,
    ``,
    `Tools:`,
    catalog,
    ``,
    `User query:`,
    userQuery,
    ``,
    format,
  ].join("\n");
}

function parseToolsKey(text: string): ToolsKey | null {
  const tryParse = (s: string) => {
    try { return JSON.parse(s) as { toolsKey?: string }; } catch { return null; }
  };
  let parsed = tryParse(text);
  if (!parsed) {
    const i = text.indexOf("{");
    const j = text.lastIndexOf("}");
    if (i >= 0 && j > i) parsed = tryParse(text.slice(i, j + 1));
  }
  const k = parsed?.toolsKey;
  return k === "get_partners" || k === "get_companies" || k === "create_partner" ? k : null;
}

/**
 * Classify a free-form query into a ToolsKey using Gemini.
 * Returns "get_partners" if the model fails (safe default).
 */
export async function classifyToolsKeyGemini(userQuery: string): Promise<ToolsKey> {
  const model = client().getGenerativeModel({ model: DEFAULT_MODEL });

  const prompt = buildPrompt(userQuery);
  const res = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const text = res.response.text().trim();
  return parseToolsKey(text) ?? "get_partners";
}
