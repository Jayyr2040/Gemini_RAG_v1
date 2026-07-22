export interface DocumentItem {
  id: string;
  title: string;
  category: string;
  content: string;
  uploadedAt: string;
  chunkCount: number;
}

export interface VectorChunk {
  id: string;
  docId: string;
  docTitle: string;
  chunkIndex: number;
  text: string;
  embedding: number[]; // 768 dimensional vector
  tokenCount: number;
}

export interface RetrievalResult {
  chunk: VectorChunk;
  similarityScore: number; // 0.0 to 1.0
  rerankScore?: number;    // 0.0 to 1.0 after reranking
}

export interface TraceStep {
  stepName: 'input_embedding' | 'vector_search' | 'score_check' | 'query_rewrite' | 'cohere_rerank' | 'prompt_assembly' | 'llm_generation';
  title: string;
  description: string;
  timestamp: number;
  data: Record<string, any>;
  status: 'info' | 'warning' | 'success' | 'triggered';
}

export interface TraceLog {
  id: string;
  query: string;
  timestamp: string;
  executionTimeMs: number;
  initialTopScore: number;
  rewritten: boolean;
  rewriteCount: number;
  rewrittenQueries: string[];
  reranked: boolean;
  steps: TraceStep[];
  retrievedChunks: RetrievalResult[];
  rerankedChunks: RetrievalResult[];
  finalPrompt: string;
  answer: string;
  provider: 'ollama' | 'gemini';
  modelUsed: string;
}

export interface GoldenQuestion {
  id: string;
  question: string;
  groundTruth: string;
  expectedKeywords: string[];
  docReference?: string;
}

export interface QuestionEvaluation {
  goldenId: string;
  question: string;
  groundTruth: string;
  generatedAnswer: string;
  retrievedContexts: string[];
  scores: {
    faithfulness: number;     // 0.0 - 1.0
    answerRelevance: number;  // 0.0 - 1.0
    contextPrecision: number; // 0.0 - 1.0
    contextRecall: number;    // 0.0 - 1.0
  };
  reasoning: {
    faithfulnessReason: string;
    answerRelevanceReason: string;
    contextPrecisionReason: string;
    contextRecallReason: string;
  };
}

export interface EvaluationReport {
  timestamp: string;
  totalQuestions: number;
  overallScores: {
    faithfulness: number;
    answerRelevance: number;
    contextPrecision: number;
    contextRecall: number;
    averageScore: number;
  };
  weakestMetric: 'faithfulness' | 'answerRelevance' | 'contextPrecision' | 'contextRecall';
  recommendation: string;
  details: QuestionEvaluation[];
}

export interface AppSettings {
  ollamaUrl: string;
  ollamaModel: string;
  cohereApiKey: string;
  cohereModel: string;
  similarityThreshold: number; // default 0.5
  maxRewriteAttempts: number; // default 2
  chunkSize: number;          // default 300
  chunkOverlap: number;       // default 50
  provider: 'ollama' | 'gemini';
  judgeModel: string;
}
