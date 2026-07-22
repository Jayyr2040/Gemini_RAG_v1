import React, { useState } from "react";
import { AppSettings } from "../types";
import { Settings, X, Cpu, Key, Sliders, Server, Zap } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: Partial<AppSettings>) => void;
}

export const SettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-xl bg-[#0a0a0a] border border-white/20 text-white overflow-hidden font-mono shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#080808] border-b border-white/10">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-[#00FF41]" />
            <h2 className="text-lg font-black uppercase tracking-tight text-white">
              RAG Engine Configuration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/40 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="text-white/70 uppercase tracking-widest flex items-center space-x-1.5 font-bold">
              <Cpu className="w-4 h-4 text-[#00FF41]" />
              <span>LLM Provider Engine</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, provider: "gemini" })}
                className={`flex items-center justify-center space-x-2 p-3 border font-bold uppercase tracking-wider transition-all ${
                  formData.provider === "gemini"
                    ? "border-[#00FF41] bg-[#00FF41]/10 text-[#00FF41]"
                    : "border-white/10 bg-black text-white/60 hover:border-white/30"
                }`}
              >
                <Zap className="w-4 h-4 text-[#00FF41]" />
                <span>Gemini 3.6 Flash</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, provider: "ollama" })}
                className={`flex items-center justify-center space-x-2 p-3 border font-bold uppercase tracking-wider transition-all ${
                  formData.provider === "ollama"
                    ? "border-[#00FF41] bg-[#00FF41]/10 text-[#00FF41]"
                    : "border-white/10 bg-black text-white/60 hover:border-white/30"
                }`}
              >
                <Server className="w-4 h-4 text-white/80" />
                <span>Local Ollama</span>
              </button>
            </div>
          </div>

          {/* Ollama Settings (if selected) */}
          {formData.provider === "ollama" && (
            <div className="p-4 bg-black border border-white/20 space-y-3">
              <div>
                <label className="text-white/60 uppercase tracking-widest block mb-1">
                  Ollama Base Endpoint
                </label>
                <input
                  type="text"
                  value={formData.ollamaUrl}
                  onChange={(e) => setFormData({ ...formData, ollamaUrl: e.target.value })}
                  placeholder="http://localhost:11434"
                  className="w-full px-3 py-2 bg-black border border-white/20 text-white focus:outline-none focus:border-[#00FF41]"
                />
              </div>
              <div>
                <label className="text-white/60 uppercase tracking-widest block mb-1">
                  Ollama Model Name
                </label>
                <input
                  type="text"
                  value={formData.ollamaModel}
                  onChange={(e) => setFormData({ ...formData, ollamaModel: e.target.value })}
                  placeholder="llama3.2"
                  className="w-full px-3 py-2 bg-black border border-white/20 text-white focus:outline-none focus:border-[#00FF41]"
                />
              </div>
            </div>
          )}

          {/* Stage 2 Cohere Rerank API Key */}
          <div className="space-y-1.5">
            <label className="text-white/70 uppercase tracking-widest flex items-center space-x-1.5 font-bold">
              <Key className="w-4 h-4 text-[#00FF41]" />
              <span>Cohere Rerank API Key (Stage 2)</span>
            </label>
            <input
              type="password"
              value={formData.cohereApiKey}
              onChange={(e) => setFormData({ ...formData, cohereApiKey: e.target.value })}
              placeholder="Paste optional Cohere API Key for cohere-rerank-v3"
              className="w-full px-3.5 py-2.5 bg-black border border-white/20 text-white focus:outline-none focus:border-[#00FF41]"
            />
            <p className="text-[11px] text-white/40">
              If omitted, the engine uses a local cross-encoder reranking fallback algorithm.
            </p>
          </div>

          {/* Stage 2 Score Threshold (< 0.5) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-white/70 uppercase tracking-widest flex items-center space-x-1.5 font-bold">
                <Sliders className="w-4 h-4 text-[#00FF41]" />
                <span>Rewrite Score Check Threshold</span>
              </label>
              <span className="text-xs font-bold text-[#00FF41] bg-white/5 border border-white/10 px-2.5 py-1">
                {formData.similarityThreshold}
              </span>
            </div>
            <input
              type="range"
              min="0.2"
              max="0.8"
              step="0.05"
              value={formData.similarityThreshold}
              onChange={(e) => setFormData({ ...formData, similarityThreshold: parseFloat(e.target.value) })}
              className="w-full accent-[#00FF41]"
            />
            <p className="text-[11px] text-white/40">
              Retrieval similarity top scores below this limit trigger bounded query rewriting and retry search.
            </p>
          </div>

          {/* Chunking Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/60 uppercase tracking-widest block mb-1">
                Chunk Size (chars)
              </label>
              <input
                type="number"
                value={formData.chunkSize}
                onChange={(e) => setFormData({ ...formData, chunkSize: parseInt(e.target.value) || 300 })}
                className="w-full px-3 py-2 bg-black border border-white/20 text-white focus:outline-none focus:border-[#00FF41]"
              />
            </div>
            <div>
              <label className="text-white/60 uppercase tracking-widest block mb-1">
                Chunk Overlap (chars)
              </label>
              <input
                type="number"
                value={formData.chunkOverlap}
                onChange={(e) => setFormData({ ...formData, chunkOverlap: parseInt(e.target.value) || 50 })}
                className="w-full px-3 py-2 bg-black border border-white/20 text-white focus:outline-none focus:border-[#00FF41]"
              />
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-white/60 hover:text-white uppercase font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#00FF41] hover:bg-[#00e038] text-black font-black uppercase tracking-widest transition-all"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
