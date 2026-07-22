import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { SettingsModal } from "./components/SettingsModal";
import { DocumentStudioView } from "./components/DocumentStudioView";
import { ChatPlaygroundView } from "./components/ChatPlaygroundView";
import { TraceTimelineView } from "./components/TraceTimelineView";
import { EvaluationScorecardView } from "./components/EvaluationScorecardView";
import { fetchSettings, updateSettings, checkServerHealth } from "./lib/rag-client";
import { AppSettings } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<"docs" | "chat" | "trace" | "eval">("docs");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    ollamaUrl: "http://localhost:11434",
    ollamaModel: "llama3.2",
    cohereApiKey: "",
    cohereModel: "rerank-v3.5",
    similarityThreshold: 0.5,
    maxRewriteAttempts: 2,
    chunkSize: 300,
    chunkOverlap: 50,
    provider: "gemini",
    judgeModel: "gemini-3.1-flash-lite"
  });
  const [serverHealth, setServerHealth] = useState<{ documentsCount: number; chunksCount: number; hasGeminiKey: boolean } | null>(null);

  const loadInitialSettings = async () => {
    try {
      const s = await fetchSettings();
      setSettings(s);
      const h = await checkServerHealth();
      setServerHealth(h);
    } catch (e) {
      console.warn("Server init warning:", e);
    }
  };

  useEffect(() => {
    loadInitialSettings();
  }, []);

  const handleSaveSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const updated = await updateSettings(newSettings);
      setSettings(updated);
    } catch (e) {
      alert("Failed to update settings");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col selection:bg-[#00FF41] selection:text-black">
      {/* Top App Header with Tab Switcher */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        serverHealth={serverHealth}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === "docs" && <DocumentStudioView />}
        {activeTab === "chat" && <ChatPlaygroundView />}
        {activeTab === "trace" && <TraceTimelineView />}
        {activeTab === "eval" && <EvaluationScorecardView />}
      </main>

      {/* Bold Typography Bottom Footer / Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 px-6 py-2.5 bg-white text-black flex justify-between items-center border-t border-white/20 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-[#00FF41] ring-2 ring-black rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest italic">
            System Status: Active & Operational
          </span>
        </div>

        <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-tight">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-mono">PROVIDER:</span>
            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
              {settings.provider === "gemini" ? "GEMINI FLASH" : `OLLAMA / ${settings.ollamaModel.toUpperCase()}`}
            </span>
          </div>
          {serverHealth && (
            <div className="flex items-center gap-2 hidden sm:flex">
              <span className="text-slate-500 font-mono">STORED VECTORS:</span>
              <span className="font-mono font-black text-black">
                {serverHealth.chunksCount} CHUNKS
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-mono">LATENCY:</span>
            <span className="font-mono text-[#008020] font-black">120ms</span>
          </div>
        </div>
      </footer>

      {/* RAG Engine Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
