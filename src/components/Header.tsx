import React from "react";
import { AppSettings } from "../types";
import {
  BookOpen,
  MessageSquare,
  GitBranch,
  BarChart3,
  Settings,
  Database,
  Cpu,
  Layers,
  Sparkles
} from "lucide-react";

interface Props {
  activeTab: "docs" | "chat" | "trace" | "eval";
  setActiveTab: (tab: "docs" | "chat" | "trace" | "eval") => void;
  settings: AppSettings;
  onOpenSettings: () => void;
  serverHealth: { documentsCount: number; chunksCount: number; hasGeminiKey: boolean } | null;
}

export const Header: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  settings,
  onOpenSettings,
  serverHealth
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#050505] border-b border-white/10 text-white px-4 sm:px-8 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter leading-none text-white">
              RAG.OS
            </h1>
            <div className="px-2 py-1 bg-[#00FF41] text-black text-[10px] font-bold tracking-widest uppercase rounded-none">
              Stage 03: Evaluated
            </div>
          </div>
          <p className="text-[10px] text-white/40 uppercase tracking-widest hidden lg:block font-mono">
            Ollama • Chroma • Cohere • Ragas
          </p>
        </div>

        {/* Center Navigation Tabs - Bold Typography Style */}
        <nav className="flex items-center gap-2 sm:gap-6 text-[11px] font-bold uppercase tracking-widest text-white/50 bg-[#0d0d0d] p-1.5 border border-white/10 rounded-none overflow-x-auto">
          <button
            onClick={() => setActiveTab("docs")}
            className={`px-3 py-1.5 transition-all flex items-center gap-1.5 ${
              activeTab === "docs"
                ? "text-[#00FF41] bg-white/5 border border-[#00FF41]/40"
                : "hover:text-white hover:bg-white/5"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>01. Docs</span>
          </button>

          <button
            onClick={() => setActiveTab("chat")}
            className={`px-3 py-1.5 transition-all flex items-center gap-1.5 ${
              activeTab === "chat"
                ? "text-[#00FF41] bg-white/5 border border-[#00FF41]/40"
                : "hover:text-white hover:bg-white/5"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>02. Chat</span>
          </button>

          <button
            onClick={() => setActiveTab("trace")}
            className={`px-3 py-1.5 transition-all flex items-center gap-1.5 ${
              activeTab === "trace"
                ? "text-[#00FF41] bg-white/5 border border-[#00FF41]/40"
                : "hover:text-white hover:bg-white/5"
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>03. Trace</span>
          </button>

          <button
            onClick={() => setActiveTab("eval")}
            className={`px-3 py-1.5 transition-all flex items-center gap-1.5 ${
              activeTab === "eval"
                ? "text-[#00FF41] bg-white/5 border border-[#00FF41]/40"
                : "hover:text-white hover:bg-white/5"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>04. Scorecard</span>
          </button>
        </nav>

        {/* Right Status & Settings */}
        <div className="flex items-center space-x-3 justify-end">
          {/* Active Provider Badge */}
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono uppercase bg-[#0a0a0a] px-3 py-1.5 border border-white/10">
            <Cpu className="w-3.5 h-3.5 text-[#00FF41]" />
            <span className="text-white/80 font-bold">
              {settings.provider === "gemini" ? "GEMINI FLASH" : settings.ollamaModel}
            </span>
          </div>

          {/* Chunks counter */}
          {serverHealth && (
            <div className="hidden md:flex items-center gap-1.5 text-[10px] font-mono text-white/50 bg-[#0a0a0a] px-2.5 py-1.5 border border-white/10">
              <Layers className="w-3 h-3 text-[#00FF41]" />
              <span>{serverHealth.chunksCount} VECTORS</span>
            </div>
          )}

          {/* Config Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-white/70 hover:text-[#00FF41] bg-[#0a0a0a] hover:bg-white/10 transition-colors border border-white/10"
            title="Settings & Config"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
