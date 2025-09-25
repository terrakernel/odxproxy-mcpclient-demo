"use client";
import { useState } from "react";

type ApiResult = {
  presetKey?: string;
  inputText?: string;
  mcpResponse?: string;
  error?: string;
};

const PRESETS_FOR_UI = [
  { key: "odx_config", label: "Show ODX Config" },
  { key: "companies_all", label: "Get Companies (all)" },
  { key: "companies_by_name", label: "Get Companies by Name" },
  { key: "companies_by_id", label: "Get Company by ID" },
  { key: "partners_by_id", label: "Get Partner by ID" },
  { key: "partners_by_email", label: "Get Partner by Email" },
  { key: "partners_by_name", label: "Get Partners by Name (ilike)" },
  { key: "create_partner_name_only", label: "Create Partner (name only)" },
] as const;

export default function QueryBox() {
  const [loading, setLoading] = useState(false);
  const [presetKey, setPresetKey] =
    useState<(typeof PRESETS_FOR_UI)[number]["key"]>("partners_by_name");
  const [text, setText] = useState("");
  const [out, setOut] = useState<ApiResult>({});

  async function onSend() {
    const reqId = Math.random().toString(36).slice(2, 8);
    console.log("[MCP-DEMO:UI] send.begin", { reqId, presetKey, text });

    if (!text.trim()) {
      setOut({ error: "Please type something first." });
      return;
    }

    setLoading(true);
    try {
      const res: ApiResult = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, presetKey }),
      }).then((r) => r.json());

      console.log("[MCP-DEMO:UI] send.ok", { reqId, hasError: !!res.error });
      setOut(res);
    } catch (e) {
      console.log("[MCP-DEMO:UI] send.err", e);
      const msg = e instanceof Error ? e.message : String(e);
      setOut({ error: msg });
    } finally {
      setLoading(false);
      console.log("[MCP-DEMO:UI] send.done");
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  return (
    <div className="space-y-3 text-left w-full max-w-2xl">
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-sm font-medium">Context</label>
        <select
          value={presetKey}
          onChange={(e) => setPresetKey(e.target.value as typeof presetKey)}
          className="w-full rounded border px-3 py-2 bg-white text-black"
        >
          {PRESETS_FOR_UI.map((p) => (
            <option key={p.key} value={p.key}>{p.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Message</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          className="w-full min-h-[100px] rounded border px-3 py-2 bg-white text-black"
          placeholder="Type your query, e.g. 'Acme' for companies_by_name, '123' for partners_by_id…"
        />
      </div>

      <button
        onClick={onSend}
        disabled={loading}
        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
      >
        {loading ? "Running…" : "Send"}
      </button>

      {out?.error && <div className="text-red-600 text-sm">{out.error}</div>}

      {(out?.inputText || out?.mcpResponse) && (
        <div className="text-sm p-3 border rounded whitespace-pre-wrap">
          {out?.inputText && (
            <>
              <div className="font-medium">You typed:</div>
              {out.inputText}
              <div className="h-2" />
            </>
          )}
          {out?.mcpResponse && (
            <>
              <div className="font-medium">MCP replied:</div>
              {out.mcpResponse}
            </>
          )}
        </div>
      )}
    </div>
  );
}
