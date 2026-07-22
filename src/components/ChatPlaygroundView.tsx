import React, { useState } from "react";
import { queryRAG } from "../lib/rag-client";
import { TraceLog } from "../types";
import {
  Send,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  RefreshCcw,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileText,
  Sliders,
  Zap,
  HelpCircle
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  trace?: TraceLog;
  timestamp: string;
}

export const ChatPlaygroundView: React.FC = () => {
  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Hello! I am your Local RAG assistant. Ask me anything about your knowledge base documents. I will retrieve context, perform similarity score checks, auto-rewrite queries if needed (< 0.5 similarity), rerank with Cohere rerank-v3, and provide accurate answers with source attributions.",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>(null);

  const sampleQueries = [
    "What is Ollama and what are its benefits?",
    "How does ChromaDB operate in embedded mode?",
    "What role does Cohere Rerank v3 play in advanced RAG?",
    "Explain the four core Ragas metrics."
  ];

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery("");
    setIsLoading(true);

    try {
      const res = await queryRAG(q);
      const assistantMsg: ChatMessage = {
        id: `msg_ast_${Date.now()}`,
        sender: "assistant",
        text: res.answer,
        trace: res.trace,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          sender: "assistant",
          text: `⚠️ Error executing RAG query: ${err.message || "Unknown error"}`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Welcome / Sample Pills */}
      <div className="bg-[#080808] border border-white/10 p-6 space-y-3">
        <div className="flex items-center space-x-2 text-[#00FF41] font-black text-xs uppercase tracking-widest">
          <Sparkles className="w-4 h-4 text-[#00FF41]" />
          <span>Stage 01 & 02: Interactive RAG Playground</span>
        </div>
        <p className="text-xs text-white/60 font-mono">
          Execute queries against your vectorized knowledge base. The pipeline automatically checks top vector similarity (<span className="text-[#00FF41] font-bold">0.5 threshold</span>), triggers bounded query rewriting if low, and re-ranks top chunks.
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          {sampleQueries.map((sq, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(sq)}
              className="px-3 py-1.5 bg-black hover:bg-white/10 text-white/80 hover:text-[#00FF41] text-xs font-mono border border-white/10 transition-all flex items-center space-x-1"
            >
              <HelpCircle className="w-3 h-3 text-white/40" />
              <span>{sq}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat History Box */}
      <div className="space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex space-x-3.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.sender === "assistant" && (
              <div className="w-9 h-9 bg-[#00FF41] text-black font-black flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5" />
              </div>
            )}

            <div
              className={`max-w-3xl border p-5 space-y-4 ${
                msg.sender === "user"
                  ? "bg-white text-black border-white"
                  : "bg-[#080808] text-white border-white/20"
              }`}
            >
              <div
                className={`flex items-center justify-between text-[10px] font-mono uppercase tracking-widest pb-2 border-b ${
                  msg.sender === "user" ? "border-black/20 text-black/60 font-bold" : "border-white/10 text-white/40"
                }`}
              >
                <span>{msg.sender === "user" ? "USER QUERY" : "RAG.OS AGENT"}</span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Message Content */}
              <div className="text-xs leading-relaxed whitespace-pre-wrap font-mono">
                {msg.text}
              </div>

              {/* Trace Summary & Source Attributions Card */}
              {msg.trace && (
                <div className="pt-3 space-y-3 border-t border-white/10 font-mono">
                  {/* Pipeline Badges Row */}
                  <div className="flex flex-wrap items-center gap-2 text-[10px]">
                    <span className="px-2.5 py-1 bg-white/5 text-white/80 border border-white/10 flex items-center space-x-1">
                      <Zap className="w-3 h-3 text-[#00FF41]" />
                      <span>{msg.trace.executionTimeMs}MS</span>
                    </span>

                    {/* Top Similarity Score Badge */}
                    <span
                      className={`px-2.5 py-1 font-bold border flex items-center space-x-1 ${
                        msg.trace.initialTopScore >= 0.5
                          ? "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30"
                          : "bg-amber-400/10 text-amber-400 border-amber-400/30"
                      }`}
                    >
                      <span>SIMILARITY: {msg.trace.initialTopScore}</span>
                    </span>

                    {/* Rewrite Triggered Badge */}
                    {msg.trace.rewritten && (
                      <span className="px-2.5 py-1 bg-amber-400/10 text-amber-300 border border-amber-400/30 font-bold flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        <span>REWRITTEN ({msg.trace.rewriteCount}X)</span>
                      </span>
                    )}

                    {/* Rerank Badge */}
                    <span className="px-2.5 py-1 bg-white/5 text-white/80 border border-white/10 font-bold flex items-center space-x-1">
                      <Sliders className="w-3 h-3 text-[#00FF41]" />
                      <span>COHERE RERANKED</span>
                    </span>
                  </div>

                  {/* Rewritten query info */}
                  {msg.trace.rewrittenQueries && msg.trace.rewrittenQueries.length > 0 && (
                    <div className="p-3 bg-black border border-amber-400/40 text-xs space-y-1">
                      <span className="font-bold text-amber-400 text-[10px] uppercase block">
                        Query Rewritten to Improve Recall:
                      </span>
                      <p className="font-mono text-white/80 text-[11px]">
                        "{msg.trace.rewrittenQueries[msg.trace.rewrittenQueries.length - 1]}"
                      </p>
                    </div>
                  )}

                  {/* Sources Attribution Toggle */}
                  <div>
                    <button
                      onClick={() =>
                        setExpandedTraceId(expandedTraceId === msg.trace?.id ? null : msg.trace?.id || null)
                      }
                      className="text-xs font-bold text-[#00FF41] hover:underline uppercase tracking-widest flex items-center space-x-1 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>
                        Retrieved Context ({msg.trace.rerankedChunks.length} Chunks)
                      </span>
                      {expandedTraceId === msg.trace.id ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Expanded Sources list */}
                    {expandedTraceId === msg.trace.id && (
                      <div className="mt-2 space-y-2">
                        {msg.trace.rerankedChunks.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-black border border-white/10 space-y-1.5 text-xs"
                          >
                            <div className="flex items-center justify-between text-white/80">
                              <span className="font-bold text-[#00FF41]">
                                #{idx + 1} {item.chunk.docTitle}
                              </span>
                              <div className="flex items-center space-x-2 text-[10px]">
                                <span className="bg-white/5 px-2 py-0.5 text-white/60">
                                  SIM: {item.similarityScore}
                                </span>
                                {item.rerankScore && (
                                  <span className="bg-[#00FF41]/20 text-[#00FF41] px-2 py-0.5 font-bold">
                                    RERANK: {item.rerankScore}
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-white/70 text-[11px] leading-relaxed">
                              "{item.chunk.text}"
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {msg.sender === "user" && (
              <div className="w-9 h-9 bg-white text-black font-black flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-3 text-[#00FF41] text-xs font-mono uppercase tracking-widest p-4 bg-[#080808] border border-white/20 w-fit animate-pulse">
            <RefreshCcw className="w-4 h-4 animate-spin" />
            <span>Embedding → Vector Check → Rerank → Generating Response...</span>
          </div>
        )}
      </div>

      {/* Query Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="sticky bottom-14 bg-[#080808] p-2 border border-white/20 flex items-center space-x-2 shadow-2xl"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask a question against your knowledge base..."
          className="flex-1 px-4 py-3 text-xs focus:outline-none bg-transparent font-mono text-white placeholder-white/40"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isLoading}
          className="p-3 bg-[#00FF41] hover:bg-[#00e038] disabled:opacity-30 text-black transition-all flex items-center justify-center font-black uppercase"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
