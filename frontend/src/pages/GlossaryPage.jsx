import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Search,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Tag,
  Cpu,
  Layers,
  HelpCircle,
  FlaskConical,
  GraduationCap,
  Baby,
  ArrowRight,
  ExternalLink,
  Code,
  Check,
} from 'lucide-react';
import { getGlossary, searchGlossary } from '../services/api';
import EmptyState from '../components/EmptyState';
import {
  BlochSphereSimulator,
  DoubleSlitSimulator,
  HadamardGateSimulator,
} from '../components/QuantumSimulators';
import ConceptQuiz from '../components/ConceptQuiz';

export default function GlossaryPage() {
  const [terms, setTerms] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeViewMode, setActiveViewMode] = useState('concepts'); // 'concepts', 'simulators', 'quiz'
  const [explanationModes, setExplanationModes] = useState({}); // termName -> 'intuitive' or 'math'
  const [expandedSimulators, setExpandedSimulators] = useState({});

  useEffect(() => {
    loadGlossary();
  }, []);

  const loadGlossary = async () => {
    try {
      setLoading(true);
      const data = await getGlossary();
      setTerms(data || []);
    } catch (err) {
      console.error('Failed to load glossary:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = async (e) => {
    const val = e.target.value;
    setSearch(val);
    if (!val.trim()) {
      loadGlossary();
      return;
    }
    try {
      setLoading(true);
      const results = await searchGlossary(val.trim());
      setTerms(results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleModeForTerm = (termName, mode) => {
    setExplanationModes((prev) => ({
      ...prev,
      [termName]: mode,
    }));
  };

  const toggleSimulatorForTerm = (termName) => {
    setExpandedSimulators((prev) => ({
      ...prev,
      [termName]: !prev[termName],
    }));
  };

  const categories = ['All', 'Foundations', 'Gates & Circuits', 'Hardware & Physics', 'Algorithms', 'Error Correction', 'Cryptography'];

  const filteredTerms =
    selectedCategory === 'All'
      ? terms
      : terms.filter((t) => t.category?.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="space-y-8 text-white">
      {/* Editorial Header */}
      <div className="border-b border-white/[0.08] pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-0.5 text-xs font-semibold text-blue-400 mb-2">
              <FlaskConical className="h-3.5 w-3.5" />
              Interactive Quantum Learning Lab
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Learn Concepts & Quantum Intuition
            </h1>
            <p className="mt-1 text-sm text-zinc-400 max-w-2xl">
              Bridge the divide between abstract quantum mathematics and physical intuition.
              Toggle between plain-language analogies and rigorous Dirac equations, run interactive simulators, and test your comprehension.
            </p>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900/90 border border-white/10 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setActiveViewMode('concepts')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeViewMode === 'concepts'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Concept Library</span>
            </button>
            <button
              onClick={() => setActiveViewMode('simulators')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeViewMode === 'simulators'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>Interactive Labs</span>
            </button>
            <button
              onClick={() => setActiveViewMode('quiz')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeViewMode === 'quiz'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Concept Quiz</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: CONCEPT LIBRARY */}
      {activeViewMode === 'concepts' && (
        <div className="space-y-6">
          {/* Search and Category Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search concepts (e.g. Superposition, Qubit, Entanglement, Surface Code)..."
                className="w-full rounded-2xl border border-white/10 bg-[#0c0e17] py-3.5 pl-11 pr-4 text-sm text-white placeholder-zinc-500 focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mr-1">
                Domain:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl px-3 py-1 text-xs font-medium transition-all ${
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? 'bg-blue-600/30 border border-blue-500/50 text-blue-300 font-semibold'
                      : 'border border-white/5 bg-zinc-900/60 text-zinc-400 hover:border-white/15 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Concepts Grid */}
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-2xl border border-white/5 bg-zinc-900/40" />
              ))}
            </div>
          ) : filteredTerms.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredTerms.map((term, i) => {
                const termMode = explanationModes[term.name] || 'intuitive';
                const hasDemo = Boolean(term.interactive_demo_type);
                const isDemoExpanded = expandedSimulators[term.name];

                return (
                  <motion.div
                    key={term.name}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.03 }}
                    className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0c0e17] p-5 sm:p-6 transition-all hover:border-white/15"
                  >
                    <div>
                      {/* Top Meta Bar */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-400">
                          {term.category}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span className="rounded-md border border-white/10 bg-zinc-900 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                            {term.prerequisite_level || 'Beginner'}
                          </span>
                        </div>
                      </div>

                      {/* Term Name */}
                      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                        {term.name}
                      </h3>

                      {/* Standard definition */}
                      <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                        {term.definition}
                      </p>

                      {/* Dual Mode Switcher Pill */}
                      {(term.intuitive_analogy || term.mathematical_formulation) && (
                        <div className="mt-4 pt-3 border-t border-white/[0.06]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                              Explanation Depth:
                            </span>
                            <div className="flex rounded-lg bg-zinc-900 p-0.5 border border-white/5">
                              <button
                                onClick={() => toggleModeForTerm(term.name, 'intuitive')}
                                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-all ${
                                  termMode === 'intuitive'
                                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                                    : 'text-zinc-400 hover:text-white'
                                }`}
                              >
                                <Baby className="h-3 w-3" />
                                <span>Intuitive (ELI5)</span>
                              </button>
                              <button
                                onClick={() => toggleModeForTerm(term.name, 'math')}
                                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-all ${
                                  termMode === 'math'
                                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                                    : 'text-zinc-400 hover:text-white'
                                }`}
                              >
                                <GraduationCap className="h-3 w-3" />
                                <span>Rigorous Math</span>
                              </button>
                            </div>
                          </div>

                          {/* Dynamic Content based on selected mode */}
                          {termMode === 'intuitive' && term.intuitive_analogy && (
                            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3.5 text-xs text-blue-200 leading-relaxed">
                              <strong className="text-blue-300 block mb-1 font-semibold">
                                Relatable Analogy:
                              </strong>
                              {term.intuitive_analogy}
                            </div>
                          )}

                          {termMode === 'math' && (
                            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3.5 text-xs font-mono text-indigo-200 leading-relaxed overflow-x-auto">
                              <strong className="text-indigo-300 block mb-1 font-sans font-semibold">
                                Exact Mathematical State Formulation:
                              </strong>
                              {term.mathematical_formulation || term.definition}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Real-World Use */}
                      {term.real_world_use && (
                        <div className="mt-3 text-[11px] text-zinc-400 flex items-start gap-1.5">
                          <span className="text-emerald-400 font-semibold shrink-0">Real-World:</span>
                          <span className="line-clamp-2">{term.real_world_use}</span>
                        </div>
                      )}

                      {/* Interactive Simulator Embed Toggle */}
                      {hasDemo && (
                        <div className="mt-4">
                          <button
                            onClick={() => toggleSimulatorForTerm(term.name)}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-all"
                          >
                            <Cpu className="h-3.5 w-3.5" />
                            <span>
                              {isDemoExpanded ? 'Hide Interactive Demonstration' : 'Launch Interactive Lab Demonstration'}
                            </span>
                            {isDemoExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </button>

                          <AnimatePresence>
                            {isDemoExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 overflow-hidden"
                              >
                                {term.interactive_demo_type === 'bloch_sphere' && <BlochSphereSimulator />}
                                {term.interactive_demo_type === 'hadamard_gate' && <HadamardGateSimulator />}
                                {term.interactive_demo_type !== 'bloch_sphere' && term.interactive_demo_type !== 'hadamard_gate' && (
                                  <DoubleSlitSimulator />
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>

                    {/* Footer Related Terms */}
                    {term.related_terms && term.related_terms.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-white/[0.06] flex flex-wrap gap-1 items-center">
                        <span className="text-[10px] text-zinc-500 uppercase font-semibold mr-1">Related:</span>
                        {term.related_terms.map((rt, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSearch(rt);
                              handleSearchChange({ target: { value: rt } });
                            }}
                            className="rounded-md border border-white/5 bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-400 hover:text-white hover:border-white/20 transition"
                          >
                            {rt}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="No concepts found"
              description="Try adjusting your search query or selecting a different domain filter."
            />
          )}
        </div>
      )}

      {/* VIEW MODE 2: INTERACTIVE SIMULATOR LABS */}
      {activeViewMode === 'simulators' && (
        <div className="space-y-8">
          <div className="rounded-2xl border border-white/10 bg-[#0c0e17] p-6 text-zinc-300">
            <h2 className="text-lg font-bold text-white mb-1">
              Visual Quantum Experimentation Labs
            </h2>
            <p className="text-xs text-zinc-400">
              Manipulate wavefunctions, rotate state vectors, and observe measurement collapse through accurate theoretical mathematical models.
            </p>
          </div>

          <div className="space-y-6">
            <BlochSphereSimulator />
            <DoubleSlitSimulator />
            <HadamardGateSimulator />
          </div>
        </div>
      )}

      {/* VIEW MODE 3: ACTIVE RECALL CONCEPT QUIZ */}
      {activeViewMode === 'quiz' && (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-white">
              Active Recall & Intuition Check
            </h2>
            <p className="text-xs text-zinc-400">
              Test your understanding of core quantum mechanics and quantum computing principles.
            </p>
          </div>

          <ConceptQuiz />
        </div>
      )}
    </div>
  );
}
