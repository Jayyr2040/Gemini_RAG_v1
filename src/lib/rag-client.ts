import {
  DocumentItem,
  TraceLog,
  GoldenQuestion,
  EvaluationReport,
  AppSettings
} from "../types";

export async function fetchSettings(): Promise<AppSettings> {
  const res = await fetch("/api/settings");
  if (!res.ok) throw new Error("Failed to load settings");
  return res.json();
}

export async function updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  const res = await fetch("/api/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings)
  });
  if (!res.ok) throw new Error("Failed to save settings");
  const data = await res.json();
  return data.settings;
}

export async function fetchDocuments(): Promise<DocumentItem[]> {
  const res = await fetch("/api/documents");
  if (!res.ok) throw new Error("Failed to load documents");
  return res.json();
}

export async function addDocument(doc: { title: string; category: string; content: string }): Promise<DocumentItem> {
  const res = await fetch("/api/documents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(doc)
  });
  if (!res.ok) throw new Error("Failed to add document");
  return res.json();
}

export async function deleteDocument(docId: string): Promise<void> {
  const res = await fetch(`/api/documents/${docId}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Failed to delete document");
}

export async function fetchChunks(): Promise<any[]> {
  const res = await fetch("/api/chunks");
  if (!res.ok) throw new Error("Failed to load vector chunks");
  return res.json();
}

export async function queryRAG(query: string): Promise<any> {
  const res = await fetch("/api/rag/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to query RAG engine");
  }
  return res.json();
}

export async function fetchTraces(): Promise<TraceLog[]> {
  const res = await fetch("/api/traces");
  if (!res.ok) throw new Error("Failed to load trace logs");
  return res.json();
}

export async function fetchGoldenSet(): Promise<GoldenQuestion[]> {
  const res = await fetch("/api/eval/golden-set");
  if (!res.ok) throw new Error("Failed to load golden set");
  return res.json();
}

export async function addGoldenQuestion(item: { question: string; groundTruth: string; expectedKeywords: string[]; docReference?: string }): Promise<GoldenQuestion> {
  const res = await fetch("/api/eval/golden-set", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Failed to add golden question");
  return res.json();
}

export async function runEvaluation(): Promise<EvaluationReport> {
  const res = await fetch("/api/eval/run", {
    method: "POST"
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to execute evaluation");
  }
  return res.json();
}

export async function checkServerHealth(): Promise<any> {
  const res = await fetch("/api/health");
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}
