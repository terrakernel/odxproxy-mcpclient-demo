import { NextRequest, NextResponse } from "next/server";
import { getMcpClient } from "@/lib/mcpStdioClient";
import { log } from "@/lib/logger";
import { PRESETS, PresetKey } from "@/lib/presets";

export const runtime = "nodejs";

type McpContent = { type: "text"; text: string } | { type: string; [k: string]: unknown };
type McpToolResult = { content?: McpContent[]; [k: string]: unknown };

export async function POST(req: NextRequest) {
  const reqId = Math.random().toString(36).slice(2, 8);
  try {
    log("API /api/speak.begin", { reqId });

    const body = (await req.json()) as {
      text?: string;
      presetKey?: PresetKey;
    };

    const { text = "", presetKey = "partners_by_name" } = body;

    if (!text.trim()) {
      log("API /api/speak.badRequest", { reqId });
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    // Resolve preset + build args from typed text
    const preset = PRESETS.find((p) => p.key === presetKey) ?? PRESETS[0];
    const toolName = preset.tool;
    const args = preset.buildArgs(text);

    // Guard rails for inputs required by specific presets
    if (preset.key === "partners_by_id" && typeof args["id"] !== "number") {
      return NextResponse.json({ error: "Please provide a numeric partner ID." }, { status: 400 });
    }
    if (preset.key === "companies_by_id" && typeof args["id"] !== "number") {
      return NextResponse.json({ error: "Please provide a numeric company ID." }, { status: 400 });
    }
    if (preset.key === "partners_by_email" && !String(args["email"] || "").includes("@")) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }
    if (preset.key === "create_partner_name_only" && !String(args["name"] || "").trim()) {
      return NextResponse.json({ error: "Please provide the partner name." }, { status: 400 });
    }

    // MCP call
    log("API /api/speak.mcp.connect", { reqId });
    const c = await getMcpClient();

    log("API /api/speak.mcp.call.begin", { reqId, toolName, args });
    const res = (await c.callTool({
      name: toolName,
      arguments: args,
    })) as McpToolResult;

    const raw = res?.content?.find((x) => x.type === "text" && "text" in x);
    const mcpText: string = typeof raw?.text === "string" ? raw.text : "No text";

    log("API /api/speak.mcp.call.ok", { reqId, mcpTextPreview: mcpText.slice(0, 120) });
    log("API /api/speak.done", { reqId });

    return NextResponse.json({ presetKey, inputText: text, mcpResponse: mcpText });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    log("API /api/speak.err", { reqId, msg });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
