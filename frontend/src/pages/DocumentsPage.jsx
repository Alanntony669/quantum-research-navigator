import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  Trash2,
  Download,
  Tag,
  CheckCircle2,
  AlertCircle,
  FileCode,
  FileSpreadsheet,
  File,
  X,
} from 'lucide-react';
import { getDocuments, uploadDocument, deleteDocument, downloadDocumentUrl } from '../services/api';
import EmptyState from '../components/EmptyState';

const fileIcons = {
  pdf: FileText,
  txt: FileCode,
  md: FileCode,
  docx: FileSpreadsheet,
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await getDocuments();
      setDocuments(data || []);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setMessage(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  });

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (description) formData.append('description', description);
      if (tags) formData.append('tags', tags);

      const newDoc = await uploadDocument(formData);
      setDocuments((prev) => [newDoc, ...prev]);
      setSelectedFile(null);
      setDescription('');
      setTags('');
      setMessage({ type: 'success', text: 'Document uploaded successfully!' });
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      const errText = err.response?.data?.detail || 'Failed to upload document.';
      setMessage({ type: 'error', text: errText });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      setMessage({ type: 'success', text: 'Document deleted.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Delete failed:', err);
      setMessage({ type: 'error', text: 'Failed to delete document.' });
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white/90">
          Research Documents & Notes
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Upload reference notes, paper annotations, and quantum research briefs (PDF, MD, TXT, DOCX)
        </p>
      </div>

      {/* Alert banner */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-3 rounded-xl border p-4 text-sm ${
              message.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0" />
            )}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Box */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#0c0e17] p-6 sm:p-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
          <Upload className="h-4 w-4 text-blue-400" />
          Upload Research Paper or Reference Notes
        </h2>

        <form onSubmit={handleUpload} className="space-y-4">
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
              isDragActive
                ? 'border-blue-500 bg-blue-500/10'
                : selectedFile
                ? 'border-emerald-500/40 bg-emerald-500/5'
                : 'border-white/10 bg-black/20 hover:border-white/25 hover:bg-black/30'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900 border border-white/10 text-blue-400 shadow-sm">
              <Upload className="h-5 w-5" />
            </div>

            {selectedFile ? (
              <div className="mt-4 flex items-center gap-2 text-sm text-emerald-300">
                <FileText className="h-4 w-4" />
                <span className="font-medium">{selectedFile.name}</span>
                <span className="text-xs text-zinc-400">({formatFileSize(selectedFile.size)})</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="ml-2 rounded-full p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="mt-3">
                <p className="text-sm font-medium text-zinc-200">
                  {isDragActive ? 'Drop your document here...' : 'Drag & drop research file, or click to browse'}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Supports PDF, TXT, MD, DOCX up to 10MB
                </p>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">
                Description / Notes
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Summary of Grover search implementation notes"
                className="w-full rounded-xl border border-white/10 bg-zinc-900/60 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. quantum-algorithms, notes, 2026"
                className="w-full rounded-xl border border-white/10 bg-zinc-900/60 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="h-3.5 w-3.5" />
              {uploading ? 'Uploading...' : 'Save Document to Vault'}
            </button>
          </div>
        </form>
      </div>

      {/* Uploaded Documents List */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white/90">
            Uploaded Documents ({documents.length})
          </h2>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-2xl border border-white/5 bg-white/[0.02]"
              />
            ))}
          </div>
        ) : documents.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc, i) => {
              const Icon = fileIcons[doc.file_type] || File;
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-md transition-all duration-300 hover:border-cyan-500/40 hover:bg-white/[0.05]"
                >
                  <div>
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600/20 to-violet-600/20 border border-white/10 text-cyan-300">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="overflow-hidden">
                          <h3 className="truncate text-sm font-semibold text-white/90 group-hover:text-cyan-300 transition-colors" title={doc.original_name}>
                            {doc.original_name}
                          </h3>
                          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                            {doc.file_type} • {formatFileSize(doc.file_size)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-400 transition-colors hover:border-rose-500/40 hover:bg-rose-500/20"
                        title="Delete document"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {doc.description && (
                      <p className="mt-2 text-xs text-slate-300/80 line-clamp-2">
                        {doc.description}
                      </p>
                    )}

                    {doc.tags && doc.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {doc.tags.map((tag, tIndex) => (
                          <span
                            key={tIndex}
                            className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] text-slate-400"
                          >
                            <Tag className="h-2.5 w-2.5 text-cyan-400" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs">
                    <span className="text-slate-500 text-[11px]">
                      {new Date(doc.uploaded_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>

                    <a
                      href={downloadDocumentUrl(doc.id)}
                      download
                      className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-300 transition-all hover:bg-cyan-500/20 hover:text-white"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="No documents yet"
            description="Upload research notes or papers above to keep all your reference material in one place."
          />
        )}
      </div>
    </div>
  );
}
