import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Trash2, FileText, ExternalLink, Calendar, Users } from 'lucide-react';
import { getBookmarks, removeBookmark } from '../services/api';
import EmptyState from '../components/EmptyState';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const data = await getBookmarks();
      setBookmarks(data || []);
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    try {
      await removeBookmark(id);
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white/90">
            Saved Bookmarks
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Your curated collection of quantum papers
          </p>
        </div>
        <span className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-slate-300">
          {bookmarks.length} saved
        </span>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-2xl border border-white/5 bg-white/[0.02]"
            />
          ))}
        </div>
      ) : bookmarks.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bookmarks.map((paper, i) => {
            const authors = Array.isArray(paper.authors)
              ? paper.authors.join(', ')
              : paper.authors || 'Unknown';

            return (
              <motion.div
                key={paper.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0c0e17] p-5 transition-all duration-200 hover:border-white/20 hover:bg-[#0f111d]"
              >
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-400 font-mono">
                      {paper.category || 'quant-ph'}
                    </span>
                    <button
                      onClick={() => handleRemove(paper.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-400 transition-colors hover:border-rose-500/40 hover:bg-rose-500/20"
                      title="Remove from bookmarks"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <h3 className="line-clamp-2 text-sm sm:text-base font-bold leading-snug text-white group-hover:text-blue-300 transition-colors">
                    {paper.title}
                  </h3>

                  <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400">
                    <Users className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                    <span className="truncate">{authors}</span>
                  </div>

                  {paper.abstract && (
                    <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-zinc-400">
                      {paper.abstract}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs">
                  <div className="flex items-center gap-1 text-zinc-500 text-[11px] font-mono">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {new Date(paper.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  {paper.pdf_link && (
                    <a
                      href={paper.pdf_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:text-white hover:border-white/20 transition"
                    >
                      <FileText className="h-3 w-3 text-blue-400" />
                      <span>PDF</span>
                      <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Bookmark}
          title="No bookmarks yet"
          description="Save papers from the search or home page to access them quickly here."
        />
      )}
    </div>
  );
}
