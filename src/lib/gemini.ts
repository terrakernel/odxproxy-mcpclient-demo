import { GoogleGenerativeAI } from "@google/generative-ai";
import { log } from "./logger";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function audioBase64ToText(base64: string, mime = "audio/webm") {
  log("Gemini.generateContent.begin", { mime, payloadBytes: Math.round((base64.length * 3) / 4) });
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const res = await model.generateContent([{ inlineData: { mimeType: mime, data: base64 } }]);
  const text = res.response.text();
  log("Gemini.generateContent.ok", { textPreview: text.slice(0, 120) });
  return text;
}
