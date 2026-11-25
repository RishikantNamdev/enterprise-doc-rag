import type { DocumentStatus } from "@rag/shared";

const DEFAULT_STATUS: DocumentStatus = "ready";

export function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-xl w-full rounded-xl border border-slate-800 bg-slate-900 p-8 shadow-lg">
        <h1 className="text-2xl font-semibold tracking-tight">
          Enterprise Document Intelligence &amp; RAG System
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Workspace shell ready (default document status:{" "}
          <span className="font-mono text-emerald-400">{DEFAULT_STATUS}</span>).
        </p>
      </div>
    </main>
  );
}

export default App;
