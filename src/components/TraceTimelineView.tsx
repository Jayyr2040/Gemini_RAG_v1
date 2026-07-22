import React, { useState, useEffect } from "react";
import { fetchTraces } from "../lib/rag-client";
import { TraceLog, TraceStep } from "../types";
import {
  GitBranch,
  Search,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  FileCode,
  Layers,
  ChevronRight,
  Database,
  Cpu,
  Sliders,
  Sparkles
} from "lucide-react";

export const TraceTimelineView: React.FC = () => {
  const [traces, setTraces] = useState<TraceLog[]>([]);
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");

  const loadTracesData = async () => {
    setLoading(true);
    try {
      const data = await fetchTraces();
      setTraces(data);
      if (data.length > 0 && !selectedTraceId) {
        setSelectedTraceId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTracesData();
  }, []);

  const filteredTraces = traces.filter(t =>
    t.query.toLowerCase().includes(filterText.toLowerCase()) ||
    t.modelUsed.toLowerCase().includes(filterText.toLowerCase())
  );

  const selectedTrace = traces.find(t => t.id === selectedTraceId) || traces[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <GitBranch className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-extrabold tracking-tight">Stage 2: Real-time Decision Trace Log</h1>
          </div>
          <p className="text-sm text-slate-300">
            Inspect step-by-step decision telemetry for every RAG execution: vector distance scores, score checks (&lt; 0.5), query rewriting, Cohere reranking, and prompt construction.
          </p>
        </div>

        <button
          onClick={loadTracesData}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-2 transition-all w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
          <span>Refresh Traces</span>
        </button>
      </div>

      {/* Main Grid: Left Traces List, Right Visual Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Traces Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search traces by query..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>

          <div className="space-y-2.5 max-h-[650px] overflow-y-auto pr-1">
            {filteredTraces.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                No decision traces recorded yet. Execute queries in the RAG Playground!
              </div>
            ) : (
              filteredTraces.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTraceId(t.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all space-y-2 ${
                    selectedTraceId === t.id
                      ? "bg-indigo-900 text-white border-indigo-700 ring-2 ring-indigo-500/30 shadow-md"
                      : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] opacity-80">
                    <span className="font-mono">{new Date(t.timestamp).toLocaleTimeString()}</span>
                    <span className="font-bold flex items-center space-x-1">
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>{t.executionTimeMs}ms</span>
                    </span>
                  </div>

                  <p className="text-xs font-bold line-clamp-2 leading-snug">{t.query}</p>

                  <div className="flex items-center justify-between text-[10px] pt-1">
                    <span
                      className={`px-2 py-0.5 rounded font-mono font-bold ${
                        t.initialTopScore >= 0.5
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      Top Similarity: {t.initialTopScore}
                    </span>

                    {t.rewritten && (
                      <span className="bg-amber-400/20 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-400/30">
                        Rewritten
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Interactive Visual Timeline & Decision Nodes */}
        <div className="lg:col-span-8 space-y-6">
          {selectedTrace ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              {/* Trace Header Summary */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 gap-4">
                <div>
                  <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
                    <span className="font-mono">ID: {selectedTrace.id}</span>
                    <span>•</span>
                    <span>{new Date(selectedTrace.timestamp).toLocaleString()}</span>
                  </div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    "{selectedTrace.query}"
                  </h2>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-200">
                    Model: {selectedTrace.modelUsed}
                  </span>
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-200">
                    Latency: {selectedTrace.executionTimeMs}ms
                  </span>
                </div>
              </div>

              {/* Step Node Timeline */}
              <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-200">
                {selectedTrace.steps.map((step, idx) => (
                  <div key={idx} className="relative flex items-start space-x-4 pl-2">
                    {/* Node Dot Icon */}
                    <div
                      className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md flex-shrink-0 ${
                        step.status === "triggered"
                          ? "bg-amber-500 ring-4 ring-amber-100"
                          : step.status === "success"
                          ? "bg-emerald-600 ring-4 ring-emerald-100"
                          : "bg-indigo-600 ring-4 ring-indigo-100"
                      }`}
                    >
                      {step.stepName === "input_embedding" && <Database className="w-4 h-4" />}
                      {step.stepName === "vector_search" && <Layers className="w-4 h-4" />}
                      {step.stepName === "score_check" && <AlertTriangle className="w-4 h-4" />}
                      {step.stepName === "query_rewrite" && <RefreshCw className="w-4 h-4" />}
                      {step.stepName === "cohere_rerank" && <Sliders className="w-4 h-4" />}
                      {step.stepName === "prompt_assembly" && <FileCode className="w-4 h-4" />}
                      {step.stepName === "llm_generation" && <Cpu className="w-4 h-4" />}
                    </div>

                    {/* Step Card Details */}
                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-900">{step.title}</h3>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(step.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600">{step.description}</p>

                      {/* Step Data Inspection Box */}
                      {step.data && (
                        <div className="mt-2 p-3 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono space-y-1 overflow-x-auto">
                          {Object.entries(step.data).map(([key, value]) => (
                            <div key={key} className="flex">
                              <span className="text-indigo-400 font-semibold mr-2">{key}:</span>
                              <span className="text-slate-300">
                                {typeof value === "object" ? JSON.stringify(value, null, 1) : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Rerank Before & After Comparison Table */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <span>Cohere Rerank Before vs After Order</span>
                </h3>

                <div className="space-y-2">
                  {selectedTrace.rerankedChunks.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white border border-slate-200 rounded-lg text-xs flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 block">
                          Rank #{idx + 1}: {item.chunk.docTitle}
                        </span>
                        <p className="text-slate-500 font-mono text-[11px] line-clamp-1">
                          "{item.chunk.text}"
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 font-mono text-[10px] flex-shrink-0">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded">
                          Sim: {item.similarityScore}
                        </span>
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-900 rounded font-bold">
                          Rerank: {item.rerankScore || "N/A"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              Select a trace on the left to inspect its timeline decisions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
