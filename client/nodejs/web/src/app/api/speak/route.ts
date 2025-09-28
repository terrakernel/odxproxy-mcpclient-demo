// src/app/api/speak/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { log } from "@/lib/logger";
import { classifyToolsKey } from "@/lib/anthropic";
import { classifyToolsKeyGemini } from "@/lib/gemini";
import { getMcpClient } from "@/lib/mcpStdioClient";

type McpContent = { type: "text"; text: string } | { type: string; [k: string]: unknown };
type McpToolResult = { content?: McpContent[]; [k: string]: unknown };

export async function POST(req: NextRequest) {
  const reqId = Math.random().toString(36).slice(2, 8);
  try {
    log("API /api/speak.begin", { reqId });

    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing 'text' string" }, { status: 400 });
    }

    // ============================
    // ANTHROPIC (default)
    // ============================
    // const toolsKey = await classifyToolsKey(text);

    // ============================
    // GEMINI (fallback/alternative)
    // ============================
    const toolsKey = await classifyToolsKeyGemini(text);

    log("API /api/speak.toolsKey", { reqId, toolsKey, text });
    const client = await getMcpClient();

    const result = await client.callTool({ name: toolsKey, arguments: { name: text } });
    log("API /api/speak.mcpresult", result);
    return NextResponse.json({ toolsKey, inputText: text });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    log("API /api/speak.err", { reqId, msg });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
