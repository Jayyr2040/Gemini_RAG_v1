import React, { useState, useEffect } from "react";
import { DocumentItem } from "../types";
import { fetchDocuments, addDocument, deleteDocument, fetchChunks, parseDocumentFile } from "../lib/rag-client";
import {
  FileText,
  Plus,
  Trash2,
  Layers,
  Database,
  Hash,
  Upload,
  CheckCircle2,
  RefreshCw,
  Search,
  Sparkles,
  FileType,
  Presentation,
  FileCode
} from "lucide-react";

export const DocumentStudioView: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [chunks, setChunks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [parsingFile, setParsingFile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // New Document Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Architecture");
  const [content, setContent] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const docs = await fetchDocuments();
      const chs = await fetchChunks();
      setDocuments(docs);
      setChunks(chs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsUploading(true);
    try {
      await addDocument({ title, category, content });
      setTitle("");
      setContent("");
      setShowAddForm(false);
      await loadData();
    } catch (e: any) {
      alert(`Failed to add document: ${e?.message || e || "Unknown error"}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Are you sure you want to remove this document and its vector embeddings?")) return;
    try {
      await deleteDocument(docId);
      await loadData();
    } catch (e) {
      alert("Failed to delete document");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsingFile(true);
    const fileName = file.name;
    const docTitle = fileName.replace(/\.[^/.]+$/, "");

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      if (!result) {
        setParsingFile(false);
        return;
      }

      try {
        const parsed = await parseDocumentFile(result, fileName);
        setTitle(docTitle);
        setContent(parsed.extractedText);
        setShowAddForm(true);
      } catch (err: any) {
        alert(`Failed to parse file "${fileName}": ${err?.message || err}`);
      } finally {
        setParsingFile(false);
        e.target.value = "";
      }
    };

    reader.onerror = () => {
      alert("Error reading file.");
      setParsingFile(false);
      e.target.value = "";
    };

    reader.readAsDataURL(file);
  };

  const filteredChunks = chunks.filter(c =>
    c.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.docTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#080808] p-6 border border-white/10 text-white shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 bg-[#00FF41] text-black text-[10px] font-bold uppercase tracking-widest">
              Stage 01
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase text-white">
              Document Studio & Vector Index
            </h1>
          </div>
          <p className="text-xs text-white/50 font-mono">
            Partition PDF, PowerPoint, Word & text documents into chunk vectors indexed with 768-dim <span className="text-[#00FF41] font-bold">nomic-embed-text</span> embeddings in ChromaDB vector store.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="cursor-pointer px-4 py-2 bg-black hover:bg-white/10 text-white border border-white/20 text-xs font-bold uppercase tracking-widest flex items-center space-x-2 transition-all">
            {parsingFile ? (
              <RefreshCw className="w-3.5 h-3.5 text-[#00FF41] animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5 text-[#00FF41]" />
            )}
            <span>{parsingFile ? "Extracting Text..." : "Upload (.pdf / .pptx / .docx / .txt)"}</span>
            <input
              type="file"
              accept=".pdf,.pptx,.ppt,.docx,.doc,.txt,.md,.json,.csv"
              onChange={handleFileUpload}
              disabled={parsingFile}
              className="hidden"
            />
          </label>

          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-[#00FF41] hover:bg-[#00e038] text-black text-xs font-black uppercase tracking-widest flex items-center space-x-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Doc</span>
          </button>
        </div>
      </div>

      {/* Stats Row - Bold Typography Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 bg-[#080808] border border-white/20 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Indexed Documents</p>
            <p className="text-4xl font-black text-white font-mono mt-1">{documents.length}</p>
          </div>
          <FileText className="w-8 h-8 text-[#00FF41]/60" />
        </div>

        <div className="p-6 bg-[#080808] border border-white/20 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Total Vector Chunks</p>
            <p className="text-4xl font-black text-[#00FF41] font-mono mt-1">{chunks.length}</p>
          </div>
          <Layers className="w-8 h-8 text-[#00FF41]" />
        </div>

        <div className="p-6 bg-[#080808] border border-white/20 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Embedding Dimension</p>
            <p className="text-4xl font-black text-white font-mono mt-1">768-dim</p>
          </div>
          <Hash className="w-8 h-8 text-white/40" />
        </div>
      </div>

      {/* Add Document Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/20 p-6 space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-black text-lg uppercase tracking-tight text-white flex items-center space-x-2">
                <FileText className="w-5 h-5 text-[#00FF41]" />
                <span>Ingest & Vectorize Document</span>
              </h3>
              <button onClick={() => setShowAddForm(false)} className="text-white/40 hover:text-white text-xl">
                ×
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 font-mono text-xs">
              {/* File Drop/Upload Zone */}
              <div className="border border-dashed border-white/20 hover:border-[#00FF41] bg-black/60 p-4 text-center transition-colors">
                <label className="cursor-pointer flex flex-col items-center justify-center space-y-1.5">
                  <Upload className="w-5 h-5 text-[#00FF41]" />
                  <span className="text-white text-xs font-bold uppercase tracking-wider">
                    {parsingFile ? "Extracting document text..." : "Click or Drop File to Auto-Extract Text"}
                  </span>
                  <span className="text-white/40 text-[10px]">
                    Supported: PDF (.pdf), PowerPoint (.pptx, .ppt), Word (.docx), Plain Text (.txt, .md, .json)
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.pptx,.ppt,.docx,.doc,.txt,.md,.json,.csv"
                    onChange={handleFileUpload}
                    disabled={parsingFile}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 uppercase tracking-widest block mb-1">
                    Document Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. System Architecture v2"
                    className="w-full px-3.5 py-2.5 bg-black border border-white/20 text-white focus:outline-none focus:border-[#00FF41]"
                  />
                </div>
                <div>
                  <label className="text-white/60 uppercase tracking-widest block mb-1">
                    Category Tag
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-black border border-white/20 text-white focus:outline-none focus:border-[#00FF41]"
                  >
                    <option value="Architecture">Architecture</option>
                    <option value="Database">Database</option>
                    <option value="Evaluation">Evaluation</option>
                    <option value="API Spec">API Spec</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-white/60 uppercase tracking-widest block mb-1">
                  Document Text Content
                </label>
                <textarea
                  required
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste documentation text here..."
                  className="w-full p-3.5 bg-black border border-white/20 text-white focus:outline-none focus:border-[#00FF41]"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-white/60 hover:text-white uppercase font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 bg-[#00FF41] text-black font-black uppercase tracking-widest hover:bg-[#00e038] flex items-center space-x-2"
                >
                  {isUploading && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>Vectorize & Index</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Grid: Documents Table & Chunk Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Document List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center space-x-2">
              <FileText className="w-4 h-4 text-[#00FF41]" />
              <span>Knowledge Base ({documents.length})</span>
            </h2>
            <button
              onClick={loadData}
              className="p-1 text-white/40 hover:text-[#00FF41] transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#00FF41]" : ""}`} />
            </button>
          </div>

          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 bg-[#080808] border border-white/10 hover:border-[#00FF41]/50 transition-all space-y-2 group"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30">
                      {doc.category}
                    </span>
                    <h3 className="text-xs font-bold text-white leading-snug">{doc.title}</h3>
                  </div>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-white/30 hover:text-rose-500 transition-all"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-white/50 line-clamp-2 font-mono">{doc.content}</p>

                <div className="flex items-center justify-between text-[10px] text-white/40 font-mono pt-2 border-t border-white/5">
                  <span className="flex items-center space-x-1 text-[#00FF41]">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{doc.chunkCount} VECTORS</span>
                  </span>
                  <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vector Chunk Inspector */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#00FF41]" />
              <span>Chroma Vector Inspector</span>
            </h2>

            {/* Search Filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter vectors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-black border border-white/20 text-white font-mono focus:outline-none focus:border-[#00FF41]"
              />
            </div>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredChunks.map((chunk) => (
              <div
                key={chunk.id}
                className="p-4 bg-[#080808] text-white border border-white/10 space-y-2 shadow-sm font-mono text-xs"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#00FF41] truncate max-w-[200px]">
                    {chunk.docTitle}
                  </span>
                  <div className="flex items-center space-x-2 text-[10px]">
                    <span className="px-2 py-0.5 bg-white/5 text-white/60 border border-white/10">
                      INDEX #{chunk.chunkIndex}
                    </span>
                    <span className="px-2 py-0.5 bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/20">
                      ~{chunk.tokenCount} TOKENS
                    </span>
                  </div>
                </div>

                <p className="text-xs text-white/80 leading-relaxed bg-black p-3 border border-white/10">
                  "{chunk.text}"
                </p>

                <div className="flex items-center justify-between text-[10px] text-white/40 pt-1">
                  <span>nomic-embed-text: [{chunk.sampleEmbedding?.map((n: number) => n.toFixed(3)).join(", ")}, ...]</span>
                  <span className="text-[#00FF41] font-bold">768-DIM</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
