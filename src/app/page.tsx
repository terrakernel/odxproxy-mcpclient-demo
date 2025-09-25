import QueryBox from "@/components/SpeakButton"; // same file, new component

export default function Page() {
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="max-w-2xl w-full space-y-4">
        <h1 className="text-2xl font-bold">odxproxy-mcpclient-demo</h1>
        <p className="text-sm opacity-75">Type → MCP via stdio (with context presets)</p>
        <QueryBox />
      </div>
    </main>
  );
}
