import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, ChevronLeft, ChevronRight, User, X } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import PaperCard from '../components/PaperCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import PaperDetailsModal from '../components/PaperDetailsModal';
import { searchPapers, addBookmark, removeBookmark, getBookmarks } from '../services/api';

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'quant-ph', label: 'Quantum Physics (quant-ph)' },
  { value: 'cs.QC', label: 'Quantum Computing (cs.QC)' },
  { value: 'cs.AI', label: 'Artificial Intelligence (cs.AI)' },
  { value: 'cs.LG', label: 'Machine Learning (cs.LG)' },
  { value: 'cond-mat', label: 'Condensed Matter (cond-mat)' },
  { value: 'math-ph', label: 'Mathematical Physics (math-ph)' },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialType = searchParams.get('type') || 'all';

  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState(initialType);
  const [category, setCategory] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const perPage = 10;

  useEffect(() => {
    loadExistingBookmarks();
    if (initialQuery) {
      performSearch(initialQuery, initialType, 0);
    }
  }, []);

  const loadExistingBookmarks = async () => {
    try {
      const data = await getBookmarks();
      if (Array.isArray(data)) {
        const ids = new Set(data.map((b) => b.arxiv_id || b.id));
        setBookmarkedIds(ids);
      }
    } catch (e) {
      console.error('Failed to load bookmarks', e);
    }
  };

  const performSearch = async (searchQuery, targetType = searchType, start = 0) => {
    if (!searchQuery.trim()) return;
    try {
      setLoading(true);
      setHasSearched(true);
      setSearchParams({ q: searchQuery, type: targetType });
      const data = await searchPapers(searchQuery, start, perPage, category, targetType);
      setResults(data.papers || []);
      setTotalResults(data.total_results || (data.papers ? data.papers.length : 0));
      setPage(Math.floor(start / perPage));
    } catch (err) {
      console.error('Search failed:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (q, type = searchType) => {
    setPage(0);
    performSearch(q, type, 0);
  };

  const handleSearchAuthor = (authorName) => {
    setQuery(authorName);
    setSearchType('author');
    setPage(0);
    performSearch(authorName, 'author', 0);
  };

  const handlePageChange = (newPage) => {
    performSearch(query, searchType, newPage * perPage);
  };

  const handleToggleBookmark = async (paper) => {
    const id = paper.arxiv_id || paper.id;
    if (bookmarkedIds.has(id)) {
      try {
        await removeBookmark(id);
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        await addBookmark(paper);
        setBookmarkedIds((prev) => new Set(prev).add(id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white/90">Search Quantum Research</h1>
        <p className="mt-1 text-sm text-slate-400">
          Target research by Author Name, Paper Title, Abstract, or Keywords
        </p>
      </div>

      {/* Search Bar with Mode Tabs */}
      <div className="space-y-3">
        <SearchBar
          value={query}
          onChange={setQuery}
          onSubmit={handleSearch}
          searchType={searchType}
          onChangeSearchType={(newType) => {
            setSearchType(newType);
            if (query.trim()) {
              performSearch(query, newType, 0);
            }
          }}
        />

        {/* Filters and Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-slate-500" />
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                if (query.trim()) {
                  performSearch(query, searchType, 0);
                }
              }}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white backdrop-blur-xl transition focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value} className="bg-[#0a0e1a]">
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {totalResults > 0 && (
            <span className="text-xs text-slate-400 font-mono">
              Found {totalResults} research papers
            </span>
          )}
        </div>

        {/* Active Author Filter Pill */}
        {searchType === 'author' && query && (
          <div className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
            <User className="h-3.5 w-3.5" />
            <span>Filtering research by author: <strong>{query}</strong></span>
            <button
              onClick={() => {
                setSearchType('all');
                performSearch(query, 'all', 0);
              }}
              className="ml-1 rounded-full p-0.5 hover:bg-cyan-500/20 text-cyan-200"
              title="Search all fields instead"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {/* Results Grid */}
      {loading ? (
        <LoadingSkeleton count={6} type="paper" />
      ) : results.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((paper, i) => (
              <PaperCard
                key={paper.arxiv_id || paper.id || i}
                paper={paper}
                index={i}
                isBookmarked={bookmarkedIds.has(paper.arxiv_id || paper.id)}
                onToggleBookmark={handleToggleBookmark}
                onSelectPaper={(p) => setSelectedPaper(p)}
                onSearchAuthor={handleSearchAuthor}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 pt-6">
            <button
              disabled={page === 0}
              onClick={() => handlePageChange(page - 1)}
              className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-400 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <span className="px-4 text-xs font-mono text-slate-400">
              Page {page + 1}
            </span>
            <button
              disabled={results.length < perPage}
              onClick={() => handlePageChange(page + 1)}
              className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-400 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </>
      ) : hasSearched ? (
        <EmptyState
          icon={Search}
          title="No research papers found"
          description={`No results matching ${searchType === 'author' ? `author "${query}"` : `query "${query}"`}. Try switching search mode or adjusting keywords.`}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center py-16 text-center"
        >
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-white/10">
            <Search className="h-10 w-10 text-violet-400/40" />
          </div>
          <p className="text-sm text-slate-400">
            Enter an author name (e.g. <em>Peter Shor</em>) or research topic to explore
          </p>
        </motion.div>
      )}

      {/* Paper Details Modal */}
      <PaperDetailsModal
        paper={selectedPaper}
        isOpen={Boolean(selectedPaper)}
        onClose={() => setSelectedPaper(null)}
        isBookmarked={selectedPaper ? bookmarkedIds.has(selectedPaper.arxiv_id || selectedPaper.id) : false}
        onToggleBookmark={handleToggleBookmark}
        onSearchAuthor={handleSearchAuthor}
      />
    </div>
  );
}
