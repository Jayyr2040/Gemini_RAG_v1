import React, { useState, useEffect } from "react";
import { fetchGoldenSet, addGoldenQuestion, runEvaluation } from "../lib/rag-client";
import { GoldenQuestion, EvaluationReport } from "../types";
import {
  BarChart3,
  Play,
  CheckCircle2,
  AlertTriangle,
  Award,
  HelpCircle,
  FileCheck,
  Zap,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Plus,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Target,
  Search,
  BookOpen
} from "lucide-react";

export const EvaluationScorecardView: React.FC = () => {
  const [goldenSet, setGoldenSet] = useState<GoldenQuestion[]>([]);
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  // Add Question Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newGroundTruth, setNewGroundTruth] = useState("");
  const [newKeywords, setNewKeywords] = useState("");

  const loadGoldenData = async () => {
    try {
      const data = await fetchGoldenSet();
      setGoldenSet(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadGoldenData();
  }, []);

  const handleRunEvaluation = async () => {
    setIsEvaluating(true);
    setProgress(10);

    const interval = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 15 : prev));
    }, 800);

    try {
      const evalReport = await runEvaluation();
      setReport(evalReport);
      setProgress(100);
    } catch (err: any) {
      alert(`Evaluation error: ${err.message || "Failed to execute evaluation"}`);
    } finally {
      clearInterval(interval);
      setIsEvaluating(false);
    }
  };

  const handleAddQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newGroundTruth.trim()) return;

    try {
      const kw = newKeywords.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
      await addGoldenQuestion({
        question: newQuestion,
        groundTruth: newGroundTruth,
        expectedKeywords: kw,
        docReference: "Custom Test Doc"
      });
      setNewQuestion("");
      setNewGroundTruth("");
      setNewKeywords("");
      setShowAddModal(false);
      await loadGoldenData();
    } catch (e) {
      alert("Failed to add question to golden set");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Top Section / Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-[#00FF41] text-black text-[10px] font-bold uppercase tracking-widest">
              Stage 03
            </span>
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">
              Ragas Benchmark
            </span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-white">
            SCORECARD
          </h1>
          <p className="text-white/40 text-xs sm:text-sm mt-2 uppercase tracking-widest font-mono">
            Golden Set: 10 Questions / Judge: Gemini 3.6 Flash
          </p>
        </div>

        <div className="flex flex-col md:items-end gap-3">
          {report && (
            <div className="text-left md:text-right">
              <div className="text-6xl sm:text-8xl font-black leading-none tracking-tighter text-[#00FF41]">
                {(
                  ((report.overallScores.faithfulness +
                    report.overallScores.answerRelevance +
                    report.overallScores.contextPrecision +
                    report.overallScores.contextRecall) /
                    4) *
                  10
                ).toFixed(1)}
              </div>
              <div className="text-[10px] uppercase font-bold text-white/50 tracking-widest font-mono mt-1">
                Overall Ragas Quality Score
              </div>
            </div>
          )}

          <button
            onClick={handleRunEvaluation}
            disabled={isEvaluating}
            className="px-6 py-3 bg-[#00FF41] hover:bg-[#00e038] disabled:opacity-50 text-black font-black text-xs uppercase tracking-widest flex items-center space-x-2 transition-all w-fit rounded-none shadow-lg shadow-[#00FF41]/10"
          >
            {isEvaluating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>BENCHMARKING ({progress}%)...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-black" />
                <span>RUN BENCHMARK EVALUATION</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress bar during eval */}
      {isEvaluating && (
        <div className="w-full bg-white/10 h-2 overflow-hidden">
          <div
            className="bg-[#00FF41] h-2 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Metrics Grid Cards */}
      {report && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Faithfulness */}
            <div className="p-6 border border-white/20 bg-[#080808] space-y-2">
              <div className="text-3xl font-black text-white font-mono">
                {report.overallScores.faithfulness.toFixed(2)}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/50 flex items-center justify-between">
                <span>Faithfulness</span>
                <span className="text-[#00FF41] font-mono">
                  {(report.overallScores.faithfulness * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-[11px] text-white/40 leading-snug pt-2 border-t border-white/10 font-mono">
                Detects hallucinations by verifying claims match context.
              </p>
            </div>

            {/* Answer Relevance */}
            <div className="p-6 border border-white/20 bg-[#080808] space-y-2">
              <div className="text-3xl font-black text-white font-mono">
                {report.overallScores.answerRelevance.toFixed(2)}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/50 flex items-center justify-between">
                <span>Answer Relevancy</span>
                <span className="text-[#00FF41] font-mono">
                  {(report.overallScores.answerRelevance * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-[11px] text-white/40 leading-snug pt-2 border-t border-white/10 font-mono">
                Measures directness in addressing user intent.
              </p>
            </div>

            {/* Context Precision */}
            <div className="p-6 border border-white/20 bg-[#080808] space-y-2">
              <div className="text-3xl font-black text-white font-mono">
                {report.overallScores.contextPrecision.toFixed(2)}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/50 flex items-center justify-between">
                <span>Precision</span>
                <span className="text-amber-400 font-mono">
                  {(report.overallScores.contextPrecision * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-[11px] text-white/40 leading-snug pt-2 border-t border-white/10 font-mono">
                Signal-to-noise ratio in retrieved context chunks.
              </p>
            </div>

            {/* Context Recall */}
            <div className="p-6 border border-[#00FF41] bg-[#00FF41]/10 space-y-2">
              <div className="text-3xl font-black text-[#00FF41] font-mono">
                {report.overallScores.contextRecall.toFixed(2)}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/70 flex items-center justify-between">
                <span>Recall</span>
                <span className="text-[#00FF41] font-mono">
                  {(report.overallScores.contextRecall * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-[11px] text-white/60 leading-snug pt-2 border-t border-[#00FF41]/20 font-mono">
                Verifies ground truth facts were successfully retrieved.
              </p>
            </div>
          </div>

          {/* WEAKEST METRIC CALLOUT BANNER */}
          <div className="p-6 bg-white/5 border border-white/20 space-y-3">
            <div className="flex items-center space-x-2 text-[#00FF41] font-black text-xs uppercase tracking-widest">
              <AlertTriangle className="w-4 h-4 text-[#00FF41]" />
              <span>Diagnostic Analysis: Weakest Metric Identified</span>
            </div>

            <p className="text-xs text-white/80 leading-relaxed font-mono">
              {report.recommendation}
            </p>
          </div>
        </div>
      )}

      {/* Per-Question Detailed Breakdown */}
      {report && report.details && (
        <div className="bg-[#080808] border border-white/10 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-xl font-black tracking-tight text-white uppercase flex items-center space-x-2">
              <Award className="w-5 h-5 text-[#00FF41]" />
              <span>Detailed Breakdown ({report.details.length})</span>
            </h2>
            <span className="text-[10px] uppercase font-mono text-white/40 tracking-widest">
              Judge Evaluation
            </span>
          </div>

          <div className="space-y-3">
            {report.details.map((q, idx) => (
              <div
                key={idx}
                className="p-4 border border-white/10 bg-[#0d0d0d] space-y-3 hover:border-[#00FF41]/50 transition-all"
              >
                <div
                  onClick={() =>
                    setExpandedQuestionId(expandedQuestionId === q.goldenId ? null : q.goldenId)
                  }
                  className="flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer gap-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-[#00FF41] bg-white/5 px-2 py-0.5 border border-white/10">
                        GS-00{idx + 1}
                      </span>
                      <h3 className="text-xs font-bold text-white">{q.question}</h3>
                    </div>
                  </div>

                  {/* Individual Scores Row */}
                  <div className="flex items-center space-x-2 text-[10px] font-mono flex-shrink-0">
                    <span className="px-2 py-1 bg-white/5 text-white/80 border border-white/10">
                      FAITH: {q.scores.faithfulness}
                    </span>
                    <span className="px-2 py-1 bg-white/5 text-white/80 border border-white/10">
                      REL: {q.scores.answerRelevance}
                    </span>
                    <span className="px-2 py-1 bg-white/5 text-white/80 border border-white/10">
                      PREC: {q.scores.contextPrecision}
                    </span>
                    <span className="px-2 py-1 bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 font-bold">
                      REC: {q.scores.contextRecall}
                    </span>
                    {expandedQuestionId === q.goldenId ? (
                      <ChevronUp className="w-4 h-4 text-white/40" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-white/40" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedQuestionId === q.goldenId && (
                  <div className="pt-3 border-t border-white/10 text-xs space-y-3 font-mono">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 bg-black border border-white/10 space-y-1">
                        <span className="font-bold text-[#00FF41] text-[10px] uppercase block">
                          Ground Truth:
                        </span>
                        <p className="text-white/70 text-[11px]">{q.groundTruth}</p>
                      </div>

                      <div className="p-3 bg-black border border-white/10 space-y-1">
                        <span className="font-bold text-white text-[10px] uppercase block">
                          Generated Answer:
                        </span>
                        <p className="text-white/70 text-[11px]">{q.generatedAnswer}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-white/5 border border-white/10 space-y-1 text-[11px]">
                      <span className="font-bold text-[#00FF41] text-[10px] uppercase block">
                        Ragas Judge Commentary:
                      </span>
                      <p className="text-white/80">• Faithfulness: {q.reasoning.faithfulnessReason}</p>
                      <p className="text-white/80">• Relevance: {q.reasoning.answerRelevanceReason}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Golden Set Dataset Inspector */}
      <div className="bg-[#080808] border border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center space-x-2">
              <FileCheck className="w-5 h-5 text-[#00FF41]" />
              <span>10-Question Golden Evaluation Set ({goldenSet.length})</span>
            </h2>
            <p className="text-xs text-white/40 font-mono mt-0.5">
              Target questions and ground truths used for automated Ragas benchmarking.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-white hover:bg-slate-200 text-black text-xs font-black uppercase tracking-widest flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>

        <div className="space-y-3">
          {goldenSet.map((item, idx) => (
            <div key={item.id} className="p-4 bg-black border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#00FF41] font-mono">#{idx + 1} {item.docReference}</span>
                <span className="text-white/40 font-mono text-[11px]">ID: {item.id}</span>
              </div>
              <h4 className="text-xs font-bold text-white">{item.question}</h4>
              <p className="text-xs text-white/60 font-mono">
                <span className="font-semibold text-white/80">Ground Truth: </span>
                {item.groundTruth}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Add Golden Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg bg-[#0a0a0a] border border-white/20 p-6 space-y-4 text-white">
            <h3 className="text-lg font-black uppercase tracking-tight text-white border-b border-white/10 pb-3">
              Add Question to Golden Set
            </h3>

            <form onSubmit={handleAddQuestionSubmit} className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-white/60 uppercase tracking-widest block mb-1">
                  Question
                </label>
                <input
                  type="text"
                  required
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="e.g. What is nomic-embed-text?"
                  className="w-full px-3.5 py-2.5 bg-black border border-white/20 text-white focus:outline-none focus:border-[#00FF41]"
                />
              </div>

              <div>
                <label className="text-white/60 uppercase tracking-widest block mb-1">
                  Ground Truth Expected Answer
                </label>
                <textarea
                  required
                  rows={3}
                  value={newGroundTruth}
                  onChange={(e) => setNewGroundTruth(e.target.value)}
                  placeholder="Exact factual answer expected..."
                  className="w-full p-3 bg-black border border-white/20 text-white focus:outline-none focus:border-[#00FF41]"
                />
              </div>

              <div>
                <label className="text-white/60 uppercase tracking-widest block mb-1">
                  Expected Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={newKeywords}
                  onChange={(e) => setNewKeywords(e.target.value)}
                  placeholder="e.g. 768-dim, embeddings, nomic"
                  className="w-full px-3.5 py-2.5 bg-black border border-white/20 text-white focus:outline-none focus:border-[#00FF41]"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-white/60 hover:text-white uppercase font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00FF41] text-black font-black uppercase tracking-widest hover:bg-[#00e038]"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
