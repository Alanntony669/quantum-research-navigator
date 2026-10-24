import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Users,
  FileText,
  ExternalLink,
  Bookmark,
  Share2,
  Check,
  BookOpen,
  Tag,
  Sparkles,
  Link as LinkIcon,
  Search,
} from 'lucide-react';

export default function PaperDetailsModal({
  paper,
  isOpen,
  onClose,
  isBookmarked,
  onToggleBookmark,
  onSearchAuthor,
}) {
  const [copiedType, setCopiedType] = useState(null);

  if (!isOpen || !paper) return null;

  const title = paper.title || 'Untitled Paper';
  const authors = Array.isArray(paper.authors) ? paper.authors : [paper.authors || 'Unknown'];
  const abstract = paper.abstract || 'No abstract available.';
  const publishedDate = paper.published
    ? new Date(paper.published).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Unknown date';
  const updatedDate = paper.updated
    ? new Date(paper.updated).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  const categories = paper.categories || (paper.category ? [paper.category] : ['quant-ph']);
  const primaryCategory = paper.primary_category || categories[0];
  const arxivId = paper.arxiv_id || paper.id || '';
  const arxivUrl = arxivId ? `https://arxiv.org/abs/${arxivId}` : null;

  // Citation helpers
  const getBibtex = () => {
    const firstAuthor = authors[0]?.split(' ').pop()?.toLowerCase() || 'author';
    const year = paper.published ? new Date(paper.published).getFullYear() : '2026';
    return `@article{${firstAuthor}${year},\n  title={${title}},\n  author={${authors.join(' and ')}},\n  journal={arXiv preprint arXiv:${arxivId}},\n  year={${year}}\n}`;
  };

  const getApa = () => {
    const year = paper.published ? new Date(paper.published).getFullYear() : '2026';
    return `${authors.join(', ')} (${year}). ${title}. arXiv:${arxivId}.`;
  };

  const handleCopyCitation = (type) => {
    const text = type === 'bibtex' ? getBibtex() : getApa();
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0c0e17] p-6 sm:p-8 shadow-2xl text-white"
        >
          {/* Header Action Bar */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-2">
              <span className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-400 font-mono">
                {primaryCategory}
              </span>
              {arxivId && (
                <span className="rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-1 text-xs font-mono text-zinc-300">
                  arXiv:{arxivId}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleBookmark && onToggleBookmark(paper)}
                className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
                  isBookmarked
                    ? 'border-blue-400 bg-blue-600/30 text-blue-300 shadow-md'
                    : 'border-white/10 bg-zinc-900 text-zinc-400 hover:border-white/20 hover:text-white'
                }`}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark paper'}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 text-zinc-400 hover:border-white/20 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Title */}
          <h2 className="mt-5 text-xl sm:text-2xl font-bold leading-snug text-white">
            {title}
          </h2>

          {/* Authors List with Quick-Search */}
          <div className="mt-4">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <Users className="h-3.5 w-3.5 text-cyan-400" />
              <span>Authors & Researchers (Click any author to see their research)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {authors.map((author, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (onSearchAuthor) {
                      onSearchAuthor(author);
                      onClose();
                    }
                  }}
                  className="group inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-200 transition-all hover:border-cyan-400/50 hover:bg-cyan-500/10 hover:text-cyan-300 hover:shadow-sm"
                  title={`Search all research papers by ${author}`}
                >
                  <Search className="h-3 w-3 text-cyan-400 opacity-60 group-hover:opacity-100" />
                  <span className="font-medium">{author}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Published Metadata Grid */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Published</span>
              <span className="font-semibold text-slate-200">{publishedDate}</span>
            </div>
            {updatedDate && (
              <div>
                <span className="text-slate-400 block mb-1">Updated</span>
                <span className="font-semibold text-slate-200">{updatedDate}</span>
              </div>
            )}
            {paper.journal_ref && (
              <div className="col-span-2">
                <span className="text-slate-400 block mb-1">Journal Reference</span>
                <span className="font-semibold text-cyan-300 line-clamp-1">{paper.journal_ref}</span>
              </div>
            )}
            {paper.comment && (
              <div className="col-span-2">
                <span className="text-slate-400 block mb-1">Comments</span>
                <span className="font-semibold text-slate-300 line-clamp-1">{paper.comment}</span>
              </div>
            )}
          </div>

          {/* Full Abstract */}
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-violet-400" />
              Research Abstract
            </h3>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 text-sm leading-relaxed text-slate-300">
              {abstract}
            </div>
          </div>

          {/* Subject Categories */}
          {categories.length > 0 && (
            <div className="mt-5">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Categories & Subject Fields
              </span>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-slate-300 font-mono"
                  >
                    <Tag className="h-3 w-3 text-violet-400" />
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Links & Citations */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-5">
            {/* Citation Copy Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyCitation('bibtex')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-300 hover:border-violet-500/40 hover:bg-white/[0.08] hover:text-white transition"
              >
                {copiedType === 'bibtex' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">BibTeX Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5 text-slate-400" />
                    <span>Copy BibTeX</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleCopyCitation('apa')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-300 hover:border-violet-500/40 hover:bg-white/[0.08] hover:text-white transition"
              >
                {copiedType === 'apa' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">APA Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5 text-slate-400" />
                    <span>Copy APA</span>
                  </>
                )}
              </button>
            </div>

            {/* External Links */}
            <div className="flex items-center gap-3">
              {arxivUrl && (
                <a
                  href={arxivUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-slate-200 hover:border-white/20 hover:text-white transition"
                >
                  <LinkIcon className="h-3.5 w-3.5 text-slate-400" />
                  <span>arXiv Page</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              )}

              {paper.pdf_link && (
                <a
                  href={paper.pdf_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2 text-xs font-semibold text-white shadow-sm transition"
                >
                  <FileText className="h-4 w-4" />
                  <span>Read Full PDF</span>
                  <ExternalLink className="h-3 w-3 opacity-80" />
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
