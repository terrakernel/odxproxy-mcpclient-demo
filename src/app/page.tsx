import SpeakButton from "@/components/SpeakButton";

export default function Page() {
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="max-w-xl w-full space-y-4 text-center">
        <h1 className="text-2xl font-bold">odxproxy-mcpclient-demo</h1>
        <p className="text-sm opacity-75">Voice → Gemini STT → MCP (stdio)</p>
        <SpeakButton />
      </div>
    </main>
  );
}
