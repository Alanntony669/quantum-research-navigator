import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Upload,
  FileText,
  BookOpen,
  ListOrdered,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Bookmark,
  Share2,
  ExternalLink,
  Code,
  Tag,
  Eye,
  Check,
  GraduationCap,
  Network,
  GitFork,
  ShieldCheck,
  Award,
  RotateCcw,
  Clock,
  CheckSquare,
  HelpCircle as QuizIcon,
  Info,
} from 'lucide-react';
import {
  getNavigatorSamples,
  getNavigatorSample,
  analyzePaperPdf,
  uploadDocument,
} from '../services/api';

const tabs = [
  { id: 'explainer', label: '1. Paper Explainer', icon: BookOpen },
  { id: 'prerequisites', label: '2. Prerequisite Guide', icon: Layers },
  { id: 'graph', label: '3. Dependency Graph', icon: Network },
  { id: 'roadmap', label: '4. Study Roadmap', icon: ListOrdered },
  { id: 'quiz', label: '5. Comprehension Quiz', icon: Award },
];

export default function NavigatorPage() {
  const navigate = useNavigate();
  const [samples, setSamples] = useState([]);
  const [selectedSampleId, setSelectedSampleId] = useState(null);
  const [activeTab, setActiveTab] = useState('explainer');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState(0);
  const [error, setError] = useState(null);
  const [revealedAnswers, setRevealedAnswers] = useState(new Set());
  const [revealedReqAnswers, setRevealedReqAnswers] = useState(new Set());
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Graph state
  const [graphViewMode, setGraphViewMode] = useState('graph'); // 'graph' or 'list'
  const [selectedGraphNode, setSelectedGraphNode] = useState(null);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    loadSamples();
  }, []);

  const loadSamples = async () => {
    try {
      const data = await getNavigatorSamples();
      setSamples(data || []);
      // Automatically load Shor's algorithm as initial showcase
      if (data && data.length > 0) {
        handleSelectSample(data[0].sample_id);
      }
    } catch (e) {
      console.error('Failed to load samples', e);
    }
  };

  const handleSelectSample = async (sampleId) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedSampleId(sampleId);
      setQuizAnswers({});
      setQuizSubmitted(false);
      setSelectedGraphNode(null);
      simulateSteps();
      const data = await getNavigatorSample(sampleId);
      setTimeout(() => {
        setAnalysis(data);
        setLoading(false);
      }, 700);
    } catch (e) {
      setError('Failed to load sample paper analysis.');
      setLoading(false);
    }
  };

  const simulateSteps = () => {
    setAnalyzingStep(1);
    setTimeout(() => setAnalyzingStep(2), 250);
    setTimeout(() => setAnalyzingStep(3), 500);
    setTimeout(() => setAnalyzingStep(4), 700);
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];

    // Check size limit: 20MB
    if (file.size > 20 * 1024 * 1024) {
      setError('File size exceeds the 20MB limit. Please upload a smaller research paper.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSelectedSampleId(null);
      setQuizAnswers({});
      setQuizSubmitted(false);
      setSelectedGraphNode(null);
      simulateSteps();
      const data = await analyzePaperPdf(file);
      setAnalysis(data);
    } catch (err) {
      console.error('Analysis failed', err);
      const detail = err.response?.data?.detail || 'Failed to analyze PDF paper. Ensure the file contains readable text (not a flat image scan).';
      setError(detail);
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'application/pdf': ['.pdf'],
    },
  });

  const toggleRoadmapAnswer = (stepIndex) => {
    setRevealedAnswers((prev) => {
      const next = new Set(prev);
      if (next.has(stepIndex)) {
        next.delete(stepIndex);
      } else {
        next.add(stepIndex);
      }
      return next;
    });
  };

  const toggleReqAnswer = (idx) => {
    setRevealedReqAnswers((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const handleQuizSelect = (questionId, optionIndex) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
  };

  const handleQuizReset = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const calculateQuizScore = () => {
    if (!analysis || !analysis.paper_quiz) return { correct: 0, total: 0 };
    let correct = 0;
    analysis.paper_quiz.forEach((q) => {
      if (quizAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return { correct, total: analysis.paper_quiz.length };
  };

  const handleSaveToNotes = async () => {
    if (!analysis) return;
    try {
      const title = analysis.paper_meta.title;
      const content = JSON.stringify(analysis, null, 2);
      const blob = new Blob([content], { type: 'text/markdown' });
      const file = new File([blob], `${title.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}_roadmap.md`, { type: 'text/markdown' });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', `Study Roadmap & Prerequisite Guide for ${title}`);
      formData.append('tags', 'quantum-navigator, study-roadmap, AI-analysis');

      await uploadDocument(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (e) {
      console.error('Failed to save roadmap to notes', e);
    }
  };

  const quizScore = calculateQuizScore();

  return (
    <div className="space-y-8 text-zinc-100">
      {/* Top Hero Banner */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#0c0e17] p-6 sm:p-8">
        <div className="max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            AI Paper Deconstruction & Prerequisite Architecture
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Quantum Paper Navigator & Roadmap Engine
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">
            Transforms dense quantum computing papers into structured, step-by-step learning pathways.
            Upload any research paper (PDF) or select a landmark study to deconstruct mathematical dependencies, cross-verify evidence quotes, and generate an ordered study plan.
          </p>

          {/* Landmark Papers Selector */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mr-1 font-mono">
              ⚡ Landmark Papers:
            </span>
            {samples.map((s) => (
              <button
                key={s.sample_id}
                onClick={() => handleSelectSample(s.sample_id)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedSampleId === s.sample_id
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'border border-white/10 bg-zinc-900 text-zinc-300 hover:border-white/20 hover:text-white'
                }`}
              >
                <span>{s.title.split(':')[0]}</span>
                <span className="rounded bg-black/40 px-1 text-[10px] text-zinc-400 font-mono">
                  {s.year}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-xl">
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
            isDragActive
              ? 'border-blue-400 bg-blue-500/10'
              : 'border-white/10 bg-white/[0.01] hover:border-blue-500/40 hover:bg-white/[0.03]'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600/30 to-violet-600/30 border border-white/10 text-blue-300 shadow-md">
            <Upload className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-semibold text-white">
            {isDragActive ? 'Drop your research paper PDF here...' : 'Upload any Quantum Computing Paper (PDF)'}
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Drag & drop or click to browse. Max size 20MB. Automatically extracts page text, formulas, and prerequisite hierarchy.
          </p>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Steps Animation */}
      {loading && (
        <div className="rounded-3xl border border-white/10 bg-[#0c101d] p-8 text-center space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <h3 className="text-base font-semibold text-white">
            Deconstructing Research Paper...
          </h3>
          <div className="max-w-md mx-auto grid grid-cols-4 gap-2 text-[11px] font-mono text-zinc-400 pt-2">
            <div className={analyzingStep >= 1 ? 'text-blue-400 font-semibold' : ''}>1. Text Parsing</div>
            <div className={analyzingStep >= 2 ? 'text-blue-400 font-semibold' : ''}>2. Evidence Audit</div>
            <div className={analyzingStep >= 3 ? 'text-blue-400 font-semibold' : ''}>3. DAG Graph</div>
            <div className={analyzingStep >= 4 ? 'text-blue-400 font-semibold' : ''}>4. Roadmap & Quiz</div>
          </div>
        </div>
      )}

      {/* Analysis Result Dashboard */}
      {!loading && analysis && (
        <div className="space-y-6">
          {/* Header Bar: Paper Title, Metadata, AI Mode Indicator & Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-[#0c0d14] p-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="rounded-lg border border-blue-500/40 bg-blue-500/20 px-2.5 py-0.5 text-xs font-semibold text-blue-300">
                  {analysis.paper_meta?.is_sample ? 'Landmark Breakthrough' : 'Uploaded PDF'}
                </span>
                <span className="rounded-lg border border-white/10 bg-zinc-900 px-2 py-0.5 text-xs font-mono text-zinc-300">
                  {analysis.paper_meta?.pages || 1} Pages
                </span>
                {/* AI / Demo Mode Indicator Badge */}
                <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-300 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{analysis.ai_mode_label || 'Verified Benchmark Dataset (Demo Mode)'}</span>
                </div>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                {analysis.paper_meta?.title}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Authors: {Array.isArray(analysis.paper_meta?.authors) ? analysis.paper_meta.authors.join(', ') : 'Unknown'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleSaveToNotes}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-200 hover:border-blue-400/50 hover:bg-blue-500/10 hover:text-blue-300 transition"
              >
                {saveSuccess ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400">Saved to Research Notes!</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4 text-zinc-400" />
                    <span>Save Roadmap to Notes</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.08] pb-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'border border-white/10 bg-zinc-900/60 text-zinc-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Explainer */}
          {activeTab === 'explainer' && analysis.explainer && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* In Plain English Card */}
              <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-950/20 via-[#0a0c16] to-zinc-950 p-6 shadow-xl">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">
                  <Sparkles className="h-4 w-4" />
                  <span>In Plain English (Beginner-Friendly Explanation)</span>
                </div>
                <p className="text-sm leading-relaxed text-zinc-200 font-normal">
                  {analysis.explainer.plain_language_summary}
                </p>
              </div>

              {/* Evidence Checking & Grounding Box */}
              {analysis.explainer.evidence_status && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/10 p-5">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Evidence Grounding & Source Verification
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                        analysis.explainer.evidence_status.is_verified
                          ? 'border border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                          : 'border border-amber-500/40 bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {analysis.explainer.evidence_status.is_verified ? '✓ ' : '⚠ '}
                      {analysis.explainer.evidence_status.status_label || 'Verified Source Quote'}
                    </span>
                  </div>
                  <blockquote className="border-l-2 border-emerald-500/40 pl-3.5 my-2 text-xs italic text-zinc-300 leading-relaxed font-serif">
                    &ldquo;{analysis.explainer.evidence_status.supporting_quote}&rdquo;
                  </blockquote>
                  <p className="text-[11px] text-zinc-400">
                    Cross-referenced directly against paper text (Page {analysis.explainer.evidence_status.matched_page || 1}).
                  </p>
                </div>
              )}

              {/* Research Problem & Objective */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/40 p-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
                    Research Problem
                  </h3>
                  <p className="text-xs leading-relaxed text-zinc-300">
                    {analysis.explainer.research_problem}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/40 p-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">
                    Research Objective & Target
                  </h3>
                  <p className="text-xs leading-relaxed text-zinc-300">
                    {analysis.explainer.research_objective}
                  </p>
                </div>
              </div>

              {/* Core Methodology */}
              <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/40 p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                  Core Methodology & Mathematical Mechanics
                </h3>
                <p className="text-xs leading-relaxed text-zinc-300">
                  {analysis.explainer.core_methodology}
                </p>

                {/* Key Equations Detected */}
                {analysis.explainer.key_equations_and_math && analysis.explainer.key_equations_and_math.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/[0.06]">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block mb-2 font-mono">
                      Key Formulas & Quantum Equations:
                    </span>
                    <div className="space-y-1.5 font-mono text-xs text-blue-300">
                      {analysis.explainer.key_equations_and_math.map((eq, i) => (
                        <div key={i} className="rounded-lg bg-black/60 border border-white/5 p-2.5 overflow-x-auto">
                          {eq}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Terms */}
                {analysis.explainer.key_terms && analysis.explainer.key_terms.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/[0.06]">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block mb-2 font-mono">
                      Key Scientific Terms:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.explainer.key_terms.map((term, tIdx) => (
                        <span
                          key={tIdx}
                          className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-zinc-300"
                        >
                          <Tag className="h-3 w-3 text-blue-400" />
                          {term}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Limitations & Scientific Caveats */}
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Scientific Limitations & Hardware Requirements</span>
                </div>
                <p className="text-xs leading-relaxed text-zinc-300">
                  {analysis.explainer.results_and_limitations}
                </p>
              </div>
            </motion.div>
          )}

          {/* Tab 2: Prerequisite Guide */}
          {activeTab === 'prerequisites' && analysis.prerequisites && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Prerequisite Knowledge Guide
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Distinguishes explicitly mentioned prerequisites from concepts inferred by the system, with verified citations.
                  </p>
                </div>
                <span className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-1 text-xs font-mono text-zinc-300 self-start sm:self-auto">
                  {analysis.prerequisites.length} Concepts Identified
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {analysis.prerequisites.map((req, i) => {
                  const isReqRevealed = revealedReqAnswers.has(i);
                  return (
                    <div
                      key={i}
                      className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-zinc-900/40 p-5 backdrop-blur-md"
                    >
                      <div>
                        {/* Header Badges */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-300">
                            {req.category}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                                req.type === 'Explicit'
                                  ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                                  : 'border border-violet-500/30 bg-violet-500/10 text-violet-300'
                              }`}
                            >
                              {req.type}
                            </span>
                            <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[10px] text-zinc-400">
                              {req.importance}
                            </span>
                          </div>
                        </div>

                        <h4 className="text-base font-semibold text-white mt-1">
                          {req.name}
                        </h4>
                        <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                          {req.explanation}
                        </p>

                        {/* Why it matters */}
                        <div className="mt-3 rounded-xl border border-white/5 bg-black/30 p-3 text-xs">
                          <span className="font-semibold text-blue-300 block mb-0.5">
                            Why it matters for this paper:
                          </span>
                          <span className="text-zinc-400 leading-relaxed">
                            {req.why_it_matters}
                          </span>
                        </div>

                        {/* Learning Objective */}
                        {req.learning_objective && (
                          <div className="mt-2.5 rounded-xl border border-white/5 bg-zinc-900/60 p-3 text-xs">
                            <span className="font-semibold text-emerald-300 block mb-0.5 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                              Learning Objective:
                            </span>
                            <span className="text-zinc-300 leading-relaxed">
                              {req.learning_objective}
                            </span>
                          </div>
                        )}

                        {/* Grounded Citation / Evidence */}
                        {req.supporting_quote && (
                          <div className="mt-2.5 rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-2.5 text-[11px]">
                            <div className="flex items-center gap-1 text-emerald-400 font-semibold mb-1">
                              <ShieldCheck className="h-3 w-3" />
                              <span>{req.verification_badge || 'Source Evidence'}</span>
                            </div>
                            <p className="text-zinc-300 italic font-serif">
                              &ldquo;{req.supporting_quote}&rdquo;
                            </p>
                          </div>
                        )}

                        {/* Concept Practice Question */}
                        {req.practice_question && (
                          <div className="mt-3 rounded-xl border border-white/10 bg-black/40 p-3 text-xs">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-semibold text-zinc-300 flex items-center gap-1">
                                <HelpCircle className="h-3 w-3 text-blue-400" />
                                Practice Check:
                              </span>
                              <button
                                onClick={() => toggleReqAnswer(i)}
                                className="text-[11px] text-blue-400 hover:text-blue-300 font-medium transition"
                              >
                                {isReqRevealed ? 'Hide Answer' : 'Reveal Solution'}
                              </button>
                            </div>
                            <p className="text-zinc-300">{req.practice_question}</p>
                            {isReqRevealed && (
                              <div className="mt-2 pt-2 border-t border-white/5 text-[11px] text-emerald-300 font-mono">
                                <strong>Answer: </strong> {req.practice_answer}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/5 text-[11px]">
                        {req.page_reference ? (
                          <span className="text-zinc-500 font-mono">Ref: {req.page_reference}</span>
                        ) : (
                          <span />
                        )}
                        <button
                          onClick={() => navigate('/glossary')}
                          className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium transition"
                        >
                          <GraduationCap className="h-3 w-3" />
                          <span>Simulate in Concept Lab</span>
                          <ArrowRight className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Tab 3: Prerequisite Dependency Graph */}
          {activeTab === 'graph' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Header and Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Prerequisite Dependency Graph (DAG)
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Visualize concept dependencies from foundational math to the paper&apos;s ultimate contribution.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-zinc-900 p-1">
                  <button
                    onClick={() => setGraphViewMode('graph')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      graphViewMode === 'graph'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Visual Flowchart
                  </button>
                  <button
                    onClick={() => setGraphViewMode('list')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      graphViewMode === 'list'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Readable List Fallback
                  </button>
                </div>
              </div>

              {graphViewMode === 'graph' ? (
                /* Visual Flowchart Mode */
                <div className="rounded-3xl border border-white/[0.08] bg-[#090b14] p-6 space-y-6">
                  {analysis.dependency_graph?.levels?.map((lvl, lIdx) => (
                    <div key={lIdx} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600/30 border border-blue-500/40 text-[10px] font-mono font-bold text-blue-300">
                          {lvl.level}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                          Level {lvl.level}: {lvl.label}
                        </span>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {lvl.nodes?.map((nodeName, nIdx) => {
                          const isSelected = selectedGraphNode === nodeName;
                          return (
                            <button
                              key={nIdx}
                              onClick={() => setSelectedGraphNode(isSelected ? null : nodeName)}
                              className={`text-left rounded-2xl border p-4 transition-all ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-950/30 ring-1 ring-blue-500 shadow-md'
                                  : 'border-white/10 bg-zinc-900/60 hover:border-white/20 hover:bg-zinc-900'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="text-xs font-semibold text-white">
                                  {nodeName}
                                </span>
                                <GitFork className="h-3 w-3 text-zinc-500" />
                              </div>
                              <p className="text-[11px] text-zinc-400">
                                Click to inspect dependencies & relationships
                              </p>
                            </button>
                          );
                        })}
                      </div>

                      {/* Visual downward connector arrow if not last level */}
                      {lIdx < (analysis.dependency_graph?.levels?.length || 0) - 1 && (
                        <div className="flex justify-center py-1">
                          <ChevronDown className="h-4 w-4 text-zinc-600 animate-pulse" />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Edges & Relationship Drawer / Explanation */}
                  <div className="mt-6 pt-5 border-t border-white/[0.08]">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-3 font-mono">
                      Dependency Links & Transitions:
                    </span>
                    <div className="space-y-2">
                      {analysis.dependency_graph?.edges?.map((edge, eIdx) => {
                        const isHighlighted =
                          selectedGraphNode &&
                          (edge.from.includes(selectedGraphNode) || edge.to.includes(selectedGraphNode));
                        return (
                          <div
                            key={eIdx}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border p-3 text-xs transition ${
                              isHighlighted
                                ? 'border-blue-500/50 bg-blue-950/20 text-white'
                                : 'border-white/5 bg-black/30 text-zinc-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 font-mono">
                              <span className="font-semibold text-blue-300">{edge.from}</span>
                              <ArrowRight className="h-3 w-3 text-zinc-500 shrink-0" />
                              <span className="font-semibold text-emerald-300">{edge.to}</span>
                            </div>
                            <span className="text-[11px] text-zinc-400 italic">
                              {edge.type}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* Structured Readable List Fallback */
                <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/40 p-6 space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
                    Linear Concept Dependency Hierarchy:
                  </h4>
                  <div className="divide-y divide-white/5">
                    {analysis.dependency_graph?.levels?.map((lvl, lIdx) => (
                      <div key={lIdx} className="py-3 first:pt-0 last:pb-0">
                        <div className="text-xs font-bold text-blue-400 mb-1">
                          Level {lvl.level} — {lvl.label}
                        </div>
                        <ul className="list-disc list-inside text-xs text-zinc-300 space-y-1 pl-2">
                          {lvl.nodes?.map((node, nIdx) => (
                            <li key={nIdx} className="leading-relaxed">
                              <strong className="text-white">{node}</strong>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Tab 4: Study Roadmap */}
          {activeTab === 'roadmap' && analysis.study_roadmap && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-base font-semibold text-white">
                  Personalized Study Roadmap
                </h3>
                <p className="text-xs text-zinc-400">
                  Follow this sequential learning plan. Clearly distinguishes essential foundations from advanced optional modules.
                </p>
              </div>

              <div className="space-y-4">
                {analysis.study_roadmap.map((stage, idx) => {
                  const isRevealed = revealedAnswers.has(idx);
                  const isRequired = stage.category?.includes('Required');
                  return (
                    <div
                      key={idx}
                      className="relative rounded-2xl border border-white/[0.08] bg-zinc-900/40 p-5 sm:p-6 backdrop-blur-md"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white shadow-xs">
                            {stage.step}
                          </span>
                          <h4 className="text-base font-bold text-white">
                            {stage.stage_name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Required vs Optional Tag */}
                          <span
                            className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                              isRequired
                                ? 'border border-blue-500/30 bg-blue-500/10 text-blue-300'
                                : 'border border-zinc-700 bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {stage.category || (isRequired ? 'Required Background' : 'Optional Advanced')}
                          </span>
                          {stage.estimated_time && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-zinc-900 px-2 py-0.5 text-[11px] font-mono text-zinc-400">
                              <Clock className="h-3 w-3" />
                              {stage.estimated_time}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Learning Objective */}
                      <div className="mt-4">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400 block mb-1">
                          Learning Objective
                        </span>
                        <p className="text-xs text-zinc-200 leading-relaxed font-medium">
                          {stage.objective}
                        </p>
                      </div>

                      {/* Why this step first */}
                      <div className="mt-3">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1 font-mono">
                          Why learn this first?
                        </span>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          {stage.why_first}
                        </p>
                      </div>

                      {/* Concepts Covered */}
                      {stage.concepts_covered && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {stage.concepts_covered.map((c, cIdx) => (
                            <span
                              key={cIdx}
                              className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] text-zinc-300"
                            >
                              <Tag className="h-2.5 w-2.5 text-blue-400" />
                              {c}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Practice Check Question */}
                      {stage.practice_question && (
                        <div className="mt-5 rounded-2xl border border-white/10 bg-black/40 p-4">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                              <HelpCircle className="h-3.5 w-3.5" />
                              Active Recall Intuition Check
                            </span>
                            <button
                              onClick={() => toggleRoadmapAnswer(idx)}
                              className="text-xs font-medium text-blue-400 hover:text-blue-300 transition"
                            >
                              {isRevealed ? 'Hide Solution' : 'Check Answer'}
                            </button>
                          </div>
                          <p className="text-xs text-zinc-200 font-medium">
                            {stage.practice_question}
                          </p>

                          <AnimatePresence>
                            {isRevealed && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 pt-3 border-t border-white/10 text-xs text-emerald-300 font-mono bg-emerald-500/10 rounded-xl p-3"
                              >
                                <strong>Answer: </strong>
                                {stage.practice_answer}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Tab 5: Paper Comprehension Quiz */}
          {activeTab === 'quiz' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <Award className="h-5 w-5 text-blue-400" />
                    Paper Comprehension & Retention Quiz
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Verify your understanding of this paper&apos;s core thesis, methodology, and limitations before moving on.
                  </p>
                </div>

                {quizSubmitted && (
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl border border-blue-500/40 bg-blue-500/10 px-3 py-1.5 text-xs font-mono font-semibold text-blue-300">
                      Score: {quizScore.correct} / {quizScore.total} ({Math.round((quizScore.correct / (quizScore.total || 1)) * 100)}%)
                    </div>
                    <button
                      onClick={handleQuizReset}
                      className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 hover:text-white transition"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Retake</span>
                    </button>
                  </div>
                )}
              </div>

              {analysis.paper_quiz && analysis.paper_quiz.length > 0 ? (
                <div className="space-y-6">
                  {analysis.paper_quiz.map((q, qIdx) => {
                    const selectedOpt = quizAnswers[q.id];
                    const isAnswered = selectedOpt !== undefined;
                    const isCorrect = isAnswered && selectedOpt === q.correctAnswer;
                    const showFeedback = quizSubmitted;

                    return (
                      <div
                        key={q.id || qIdx}
                        className={`rounded-2xl border p-5 sm:p-6 transition-all ${
                          showFeedback
                            ? isCorrect
                              ? 'border-emerald-500/40 bg-emerald-950/10'
                              : 'border-rose-500/40 bg-rose-950/10'
                            : 'border-white/[0.08] bg-zinc-900/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <h4 className="text-sm font-semibold text-white">
                            <span className="font-mono text-zinc-500 mr-2">Q{qIdx + 1}.</span>
                            {q.question}
                          </h4>
                          {showFeedback && (
                            <span
                              className={`rounded-md px-2 py-0.5 text-[11px] font-semibold shrink-0 ${
                                isCorrect
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                            </span>
                          )}
                        </div>

                        {/* Options */}
                        <div className="space-y-2 mt-4">
                          {q.options?.map((opt, optIdx) => {
                            const isChosen = selectedOpt === optIdx;
                            const isThisCorrect = optIdx === q.correctAnswer;

                            let optStyle = 'border-white/10 bg-zinc-900 hover:border-white/20 text-zinc-300';
                            if (showFeedback) {
                              if (isThisCorrect) {
                                optStyle = 'border-emerald-500 bg-emerald-500/20 text-emerald-200 font-semibold';
                              } else if (isChosen && !isThisCorrect) {
                                optStyle = 'border-rose-500 bg-rose-500/20 text-rose-200';
                              } else {
                                optStyle = 'border-white/5 bg-zinc-900/40 text-zinc-500';
                              }
                            } else if (isChosen) {
                              optStyle = 'border-blue-500 bg-blue-600/20 text-white font-medium';
                            }

                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleQuizSelect(q.id, optIdx)}
                                disabled={quizSubmitted}
                                className={`w-full text-left rounded-xl border p-3 text-xs transition flex items-center justify-between ${optStyle}`}
                              >
                                <span>{opt}</span>
                                {showFeedback && isThisCorrect && (
                                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation reveal upon submission */}
                        {showFeedback && (
                          <div className="mt-4 pt-3 border-t border-white/10 text-xs text-zinc-300 space-y-1">
                            <p className="leading-relaxed">
                              <strong className="text-white">Explanation: </strong>
                              {q.explanation}
                            </p>
                            {q.concept_to_review && (
                              <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[11px] text-blue-300">
                                <Info className="h-3 w-3" />
                                <span>Concept to Review: <strong>{q.concept_to_review}</strong></span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Submit Bar */}
                  {!quizSubmitted && (
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleQuizSubmit}
                        disabled={Object.keys(quizAnswers).length === 0}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-500 disabled:opacity-50 transition"
                      >
                        <CheckSquare className="h-4 w-4" />
                        <span>Submit Answers & Check Score</span>
                      </button>
                    </div>
                  )}

                  {/* Post-Quiz Concept Review Panel */}
                  {quizSubmitted && (
                    <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono">
                        Targeted Concept Review Plan:
                      </h4>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {analysis.paper_quiz.map((q, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between rounded-xl border border-white/5 bg-black/40 p-3 text-xs"
                          >
                            <span className="text-zinc-300 font-medium">{q.concept_to_review}</span>
                            <button
                              onClick={() => setActiveTab('roadmap')}
                              className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold"
                            >
                              Open in Roadmap →
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState
                  icon={Award}
                  title="No Quiz Available"
                  description="Comprehension quizzes are automatically generated when analyzing landmark breakthroughs or verified PDFs."
                />
              )}
            </motion.div>
          )}

          {/* Scientific Safeguards and Adversarial Protection Disclosure Footer */}
          <div className="rounded-2xl border border-white/5 bg-zinc-900/30 p-4 text-[11px] text-zinc-400 flex items-center gap-3">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Scientific Grounding & Safeguards Active:</strong> Uploaded PDF text is sanitized against adversarial prompt injections and directives. Supporting quotes are validated against source page indices.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}