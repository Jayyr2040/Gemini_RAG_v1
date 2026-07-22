import {
  DocumentItem,
  TraceLog,
  GoldenQuestion,
  EvaluationReport,
  AppSettings
} from "../types";

async function handleResponse<T>(res: Response, defaultErrorMsg: string): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `${defaultErrorMsg} (HTTP ${res.status})`);
  }
  return res.json();
}

export async function fetchSettings(): Promise<AppSettings> {
  const res = await fetch("/api/settings");
  return handleResponse<AppSettings>(res, "Failed to load settings");
}

export async function updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  const res = await fetch("/api/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings)
  });
  const data = await handleResponse<{ status: string; settings: AppSettings }>(res, "Failed to save settings");
  return data.settings;
}

export async function fetchDocuments(): Promise<DocumentItem[]> {
  const res = await fetch("/api/documents");
  return handleResponse<DocumentItem[]>(res, "Failed to load documents");
}

export async function addDocument(doc: { title: string; category: string; content: string }): Promise<DocumentItem> {
  const res = await fetch("/api/documents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(doc)
  });
  return handleResponse<DocumentItem>(res, "Failed to add document");
}

export async function deleteDocument(docId: string): Promise<void> {
  const res = await fetch(`/api/documents/${docId}`, {
    method: "DELETE"
  });
  await handleResponse<{ success: boolean }>(res, "Failed to delete document");
}

export async function fetchChunks(): Promise<any[]> {
  const res = await fetch("/api/chunks");
  return handleResponse<any[]>(res, "Failed to load vector chunks");
}

export async function queryRAG(query: string): Promise<any> {
  const res = await fetch("/api/rag/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });
  return handleResponse<any>(res, "Failed to query RAG engine");
}

export async function fetchTraces(): Promise<TraceLog[]> {
  const res = await fetch("/api/traces");
  return handleResponse<TraceLog[]>(res, "Failed to load trace logs");
}

export async function fetchGoldenSet(): Promise<GoldenQuestion[]> {
  const res = await fetch("/api/eval/golden-set");
  return handleResponse<GoldenQuestion[]>(res, "Failed to load golden set");
}

export async function addGoldenQuestion(item: { question: string; groundTruth: string; expectedKeywords: string[]; docReference?: string }): Promise<GoldenQuestion> {
  const res = await fetch("/api/eval/golden-set", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  return handleResponse<GoldenQuestion>(res, "Failed to add golden question");
}

export async function runEvaluation(): Promise<EvaluationReport> {
  const res = await fetch("/api/eval/run", {
    method: "POST"
  });
  return handleResponse<EvaluationReport>(res, "Failed to execute evaluation");
}

export async function checkServerHealth(): Promise<any> {
  const res = await fetch("/api/health");
  return handleResponse<any>(res, "Health check failed");
}
