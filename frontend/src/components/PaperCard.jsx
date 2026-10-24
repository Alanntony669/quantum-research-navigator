import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bookmark,
  FileText,
  ExternalLink,
  Calendar,
  Users,
  ChevronDown,
  ChevronUp,
  Maximize2,
  ArrowRight,
} from 'lucide-react';

export default function PaperCard({
  paper,
  index = 0,
  isBookmarked = false,
  onToggleBookmark,
  onSelectPaper,
  onSearchAuthor,
}) {
  const [expanded, setExpanded] = useState(false);

  const title = paper.title || 'Untitled Paper';
  const authorsList = Array.isArray(paper.authors) ? paper.authors : [paper.authors || 'Unknown'];
  const abstract = paper.abstract || 'No abstract available.';
  const publishedDate = paper.published
    ? new Date(paper.published).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Recent';

  const category = Array.isArray(paper.categories) && paper.categories.length > 0
    ? paper.categories[0]
    : paper.category || 'quant-ph';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0c0e17] p-5 transition-all duration-200 hover:border-white/20 hover:bg-[#0f111d]"
    >
      <div>
        {/* Top bar: Category Badge + Action Buttons */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-400 font-mono">
            {category}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSelectPaper && onSelectPaper(paper)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-zinc-900 text-zinc-400 hover:border-white/20 hover:text-white transition-all"
              title="View full paper details & citations"
            >
              <Maximize2 className="h-3 w-3" />
            </button>
            <button
              onClick={() => onToggleBookmark && onToggleBookmark(paper)}
              className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-all ${
                isBookmarked
                  ? 'border-blue-400 bg-blue-600/30 text-blue-300'
                  : 'border-white/10 bg-zinc-900 text-zinc-400 hover:border-white/20 hover:text-white'
              }`}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark paper'}
            >
              <Bookmark className={`h-3 w-3 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3
          onClick={() => onSelectPaper && onSelectPaper(paper)}
          className="line-clamp-2 text-sm sm:text-base font-bold leading-snug text-zinc-100 group-hover:text-blue-300 transition-colors cursor-pointer"
          title="Click to view full research details"
        >
          {title}
        </h3>

        {/* Authors */}
        <div className="mt-2 flex items-start gap-1.5 text-xs text-zinc-400">
          <Users className="h-3 w-3 shrink-0 text-zinc-500 mt-0.5" />
          <div className="flex flex-wrap gap-1">
            {authorsList.slice(0, 3).map((author, aIdx) => (
              <button
                key={aIdx}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSearchAuthor) onSearchAuthor(author);
                }}
                className="hover:text-blue-300 hover:underline transition-colors text-zinc-400"
                title={`Search papers by ${author}`}
              >
                {author}{aIdx < Math.min(authorsList.length - 1, 2) ? ',' : ''}
              </button>
            ))}
            {authorsList.length > 3 && (
              <span
                onClick={() => onSelectPaper && onSelectPaper(paper)}
                className="text-zinc-500 font-medium cursor-pointer hover:underline"
              >
                +{authorsList.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Abstract Preview */}
        <div className="mt-3">
          <p className={`text-xs leading-relaxed text-zinc-400 ${expanded ? '' : 'line-clamp-3'}`}>
            {abstract}
          </p>
          {abstract.length > 180 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1 flex items-center gap-1 text-[11px] font-medium text-blue-400 transition-colors hover:text-blue-300"
            >
              {expanded ? (
                <>
                  Show Less <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  Read More <ChevronDown className="h-3 w-3" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs">
        <div className="flex items-center gap-1 text-zinc-500 text-[11px] font-mono">
          <Calendar className="h-3 w-3" />
          <span>{publishedDate}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectPaper && onSelectPaper(paper)}
            className="text-[11px] font-medium text-zinc-400 hover:text-white transition"
          >
            Details
          </button>
          {paper.pdf_link && (
            <a
              href={paper.pdf_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-900 px-2 py-1 text-[11px] font-medium text-zinc-300 hover:text-white hover:border-white/20 transition"
            >
              <FileText className="h-3 w-3 text-blue-400" />
              <span>PDF</span>
              <ExternalLink className="h-2.5 w-2.5 opacity-60" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
