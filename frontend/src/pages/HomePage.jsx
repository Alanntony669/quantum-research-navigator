import { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass,
  Search,
  BookOpen,
  Upload,
  Bookmark,
  ArrowRight,
  Sparkles,
  TrendingUp,
  GraduationCap,
  Cpu,
  Layers,
  FlaskConical,
  CheckCircle2,
} from 'lucide-react';
import SearchBar from '../components/SearchBar';
import PaperCard from '../components/PaperCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import PaperDetailsModal from '../components/PaperDetailsModal';
import { getTrending, addBookmark, removeBookmark, getBookmarks } from '../services/api';

const corePillars = [
  {
    icon: Compass,
    title: 'Paper Navigator',
    badge: 'Core Engine',
    description: 'Upload any quantum research PDF. Get plain-language explanations, explicit prerequisites, and an ordered study roadmap.',
    actionLabel: 'Launch Navigator',
    path: '/navigator',
    highlight: true,
  },
  {
    icon: GraduationCap,
    title: 'Learn Concepts Lab',
    badge: 'Interactive',
    description: 'Dual explanations (ELI5 vs Rigorous Dirac Math), live Bloch Sphere & Double-Slit simulators, and active recall quizzes.',
    actionLabel: 'Explore Studio',
    path: '/glossary',
    highlight: false,
  },
  {
    icon: Search,
    title: 'arXiv Search Hub',
    badge: 'Real-time',
    description: 'Live query connection to arXiv. Target research by author name (e.g. Peter Shor), paper title, or subject categories.',
    actionLabel: 'Browse arXiv',
    path: '/search',
    highlight: false,
  },
  {
    icon: Upload,
    title: 'Research Notes & Vault',
    badge: 'Storage',
    description: 'Store research briefs, PDF annotations, and study roadmaps with customizable tags and offline downloads.',
    actionLabel: 'Open Vault',
    path: '/documents',
    highlight: false,
  },
];

const sampleSearches = [
  { label: 'Peter Shor', type: 'author', badge: 'Author' },
  { label: 'John Martinis', type: 'author', badge: 'Author' },
  { label: 'Surface Codes', type: 'title', badge: 'Title' },
  { label: 'Quantum Teleportation', type: 'all', badge: 'Topic' },
  { label: 'Superconducting Transmon', type: 'all', badge: 'Hardware' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [selectedPaper, setSelectedPaper] = useState(null);

  useEffect(() => {
    loadTrending();
    loadExistingBookmarks();
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

  const loadTrending = async () => {
    try {
      setLoading(true);
      const data = await getTrending('quant-ph', 6);
      setTrending(data.papers || []);
    } catch (err) {
      console.error('Failed to load trending papers:', err);
      setTrending([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query, type = searchType) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}&type=${encodeURIComponent(type)}`);
    }
  };

  const handleSearchAuthor = (authorName) => {
    navigate(`/search?q=${encodeURIComponent(authorName)}&type=author`);
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
        console.error('Failed to remove bookmark:', err);
      }
    } else {
      try {
        await addBookmark(paper);
        setBookmarkedIds((prev) => new Set(prev).add(id));
      } catch (err) {
        console.error('Failed to add bookmark:', err);
      }
    }
  };

  return (
    <div className="space-y-10 text-zinc-100">
      {/* Hero Section */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#0c0e17] p-6 sm:p-10 relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            Research Paper Learning Assistant
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Deconstruct Intimidating Quantum Papers Into Clear Study Roadmaps.
          </h1>

          <p className="text-sm sm:text-base leading-relaxed text-zinc-300">
            Research papers assume deep mastery of Hilbert spaces, tensor networks, and error models.
            <strong> Quantum Research Navigator</strong> bridges your knowledge gap: upload any paper to extract plain-English summaries, uncover prerequisite concepts, and follow an ordered study plan.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <NavLink
              to="/navigator"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-blue-500 transition shadow-sm"
            >
              <Compass className="h-4 w-4" />
              <span>Launch Paper Navigator</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </NavLink>

            <NavLink
              to="/glossary"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900 px-5 py-3 text-xs sm:text-sm font-semibold text-zinc-200 hover:bg-zinc-800 transition"
            >
              <GraduationCap className="h-4 w-4 text-emerald-400" />
              <span>Learn Concepts & Simulators</span>
            </NavLink>
          </div>

          {/* Quick Search Bar */}
          <div className="pt-6 border-t border-white/[0.08]">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
              Quick Research Paper Search:
            </span>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={handleSearch}
              searchType={searchType}
              onChangeSearchType={setSearchType}
            />

            {/* Popular Searches */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-zinc-500 font-mono">Popular:</span>
              {sampleSearches.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearch(sample.label, sample.type)}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/5 bg-zinc-900/60 px-2 py-0.5 text-xs text-zinc-400 hover:border-white/20 hover:text-white transition"
                >
                  <span className="text-[10px] uppercase font-mono text-blue-400">{sample.badge}:</span>
                  <span>{sample.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Feature Pillars Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {corePillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <div
              key={pillar.title}
              onClick={() => navigate(pillar.path)}
              className={`group flex flex-col justify-between rounded-2xl border p-5 cursor-pointer transition-all ${
                pillar.highlight
                  ? 'border-blue-500/40 bg-blue-500/[0.04] hover:border-blue-500/70'
                  : 'border-white/[0.08] bg-[#0c0e17] hover:border-white/15'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 border border-white/10 text-white">
                    <Icon className="h-4 w-4 text-blue-400" />
                  </div>
                  <span className="rounded-md border border-white/5 bg-zinc-900 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                    {pillar.badge}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                  {pillar.title}
                </h3>
                <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                  {pillar.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-medium text-blue-400">
                <span>{pillar.actionLabel}</span>
                <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Trending Research Papers Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            <h2 className="text-base font-bold text-white">Recent arXiv Quantum Papers</h2>
          </div>
          <NavLink
            to="/search"
            className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-white transition"
          >
            <span>Explore All in arXiv Hub</span>
            <ArrowRight className="h-3 w-3" />
          </NavLink>
        </div>

        {loading ? (
          <LoadingSkeleton count={6} type="paper" />
        ) : trending.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trending.map((paper, i) => (
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
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#0c0e17] p-8 text-center text-xs text-zinc-400">
            No papers loaded. Verify backend connection.
          </div>
        )}
      </section>

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
