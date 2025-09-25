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

export default function SpeakButton() {
  const [loading, setLoading] = useState(false);
  const [presetKey, setPresetKey] =
    useState<(typeof PRESETS_FOR_UI)[number]["key"]>("partners_by_name");
  const [out, setOut] = useState<ApiResult>({});

  async function recordAndSend() {
    const reqId = Math.random().toString(36).slice(2, 8);
    console.log("[MCP-DEMO:UI] record.begin", { reqId, presetKey });

    setLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("[MCP-DEMO:UI] mic.ok", { reqId });

      const rec = new MediaRecorder(stream, { mimeType: "audio/webm" });
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (e) => e.data && chunks.push(e.data);
      rec.start();
      console.log("[MCP-DEMO:UI] record.started", { reqId });
      await new Promise((r) => setTimeout(r, 3000));
      rec.stop();
      console.log("[MCP-DEMO:UI] record.stopped", { reqId });

      const blob: Blob = await new Promise((resolve) => {
        rec.onstop = () => resolve(new Blob(chunks, { type: "audio/webm" }));
      });

      const buf = await blob.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      console.log("[MCP-DEMO:UI] audio.base64.ready", { reqId, bytes: base64.length });

      console.log("[MCP-DEMO:UI] api.post.begin", { reqId, presetKey });
      const res: ApiResult = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioBase64: base64, mimeType: "audio/webm", presetKey }),
      }).then((r) => r.json());

      console.log("[MCP-DEMO:UI] api.post.ok", { reqId, hasError: !!res.error });
      setOut(res);
    } catch (e) {
      console.log("[MCP-DEMO:UI] err", e);
      const msg = e instanceof Error ? e.message : String(e);
      setOut({ error: msg });
    } finally {
      setLoading(false);
      console.log("[MCP-DEMO:UI] done");
    }
  }

  return (
    <div className="space-y-3 text-left w-full max-w-xl">
      <label className="block text-sm font-medium">Context</label>
      <select
        value={presetKey}
        onChange={(e) => setPresetKey(e.target.value as typeof presetKey)}
        className="w-full rounded border px-3 py-2 bg-white text-black"
      >
        {PRESETS_FOR_UI.map((p) => (
          <option key={p.key} value={p.key}>{p.label}</option>
        ))}
      </select>

      <button
        onClick={recordAndSend}
        disabled={loading}
        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
      >
        {loading ? "Processing…" : "Speak"}
      </button>

      {out?.error && <div className="text-red-600 text-sm">{out.error}</div>}

      {out?.inputText && (
        <div className="text-sm p-3 border rounded whitespace-pre-wrap">
          <div className="font-medium">You said:</div>
          {out.inputText}
          <div className="mt-2 font-medium">MCP replied:</div>
          {out.mcpResponse}
        </div>
      )}
    </div>
  );
}
