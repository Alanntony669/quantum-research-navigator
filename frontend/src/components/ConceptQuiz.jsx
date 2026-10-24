import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, CheckCircle2, XCircle, Award, RotateCcw, ArrowRight } from 'lucide-react';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What happens when you measure a single qubit in state (|0⟩ + |1⟩)/√2?",
    options: [
      "You receive 0 and 1 simultaneously.",
      "The state collapses irreversibly to either |0⟩ or |1⟩ with a 50% probability each.",
      "The state remains in superposition undisturbed.",
      "The qubit is immediately erased from memory.",
    ],
    correctAnswer: 1,
    explanation: "According to the Born rule, projective measurement forces the superposition to collapse into one of the measurement eigenstates (|0⟩ or |1⟩). The probability for each is |1/√2|² = 1/2 (50%).",
    category: "Superposition",
  },
  {
    id: 2,
    question: "Why does the No-Cloning Theorem forbid copying an arbitrary unknown quantum state?",
    options: [
      "Hardware memory does not have enough storage bytes.",
      "Unitary quantum operations are linear, and a linear operator cannot satisfy U|ψ⟩|0⟩ = |ψ⟩|ψ⟩ for all states.",
      "Eavesdroppers on the internet intercept the copy.",
      "Copying is allowed, but only at cryogenic temperatures below 10 mK.",
    ],
    correctAnswer: 1,
    explanation: "Because quantum mechanics is strictly linear and unitary, inner product preservation ⟨ψ|φ⟩ = (⟨ψ|φ⟩)² only holds if states are identical or orthogonal. Thus, universal state cloning is mathematically impossible.",
    category: "Quantum Foundations",
  },
  {
    id: 3,
    question: "In a double-slit experiment, what happens to the interference pattern if detectors are placed at the slits to determine which slit each electron passes through?",
    options: [
      "The interference fringes become twice as bright.",
      "The interference fringes disappear, and you observe two classical particle bands.",
      "The electrons reverse direction and bounce backward.",
      "A third slit appears in the middle.",
    ],
    correctAnswer: 1,
    explanation: "Acquiring which-path information destroys the relative phase coherence between the two path amplitudes. Without phase coherence, the cross-term vanishes, leaving the classical sum of two independent distributions.",
    category: "Wave-Particle Duality",
  },
  {
    id: 4,
    question: "How does Shor's algorithm achieve its exponential speedup over classical integer factoring?",
    options: [
      "By guessing every prime number in parallel.",
      "By converting factoring into order finding and using the Quantum Fourier Transform (QFT) to find the period in polynomial time.",
      "By increasing the clock speed of quantum chips to 100 GHz.",
      "By using classical artificial neural networks to predict primes.",
    ],
    correctAnswer: 1,
    explanation: "Factoring an integer N reduces via number theory to finding the period r of a^x mod N. The Quantum Fourier Transform extracts this periodicity in O((log N)³) operations, an exponential speedup over classical algorithms.",
    category: "Algorithms",
  },
  {
    id: 5,
    question: "Why do surface codes arrange physical qubits on a 2D checkerboard lattice with stabilizer measurements?",
    options: [
      "Because 2D checkerboard shapes are easier to package inside a dilution refrigerator.",
      "To detect both bit-flip (X) and phase-flip (Z) errors through local parity checks without measuring or destroying the encoded logical qubit.",
      "To allow qubits to physically collide with each other.",
      "To bypass the laws of thermodynamics.",
    ],
    correctAnswer: 1,
    explanation: "Stabilizers measure multi-qubit parity operators (X and Z plaquettes) rather than individual data qubits. This reveals the error syndrome (where a fault occurred) while keeping the underlying superposition state completely intact.",
    category: "Error Correction",
  },
];

export default function ConceptQuiz() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQ = QUIZ_QUESTIONS[currentIdx];

  const handleSelect = (idx) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    if (idx === currentQ.correctAnswer) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIdx((i) => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  if (quizFinished) {
    return (
      <div className="rounded-3xl border border-white/10 bg-[#0c0e17] p-8 text-center text-white">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border border-white/10">
          <Award className="h-8 w-8 text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold text-white">Concept Challenge Completed!</h3>
        <p className="mt-1 text-sm text-zinc-400">
          You scored <strong className="text-emerald-400 font-mono text-base">{score} / {QUIZ_QUESTIONS.length}</strong> on Quantum Intuition.
        </p>

        <p className="mt-4 text-xs text-zinc-300 max-w-md mx-auto leading-relaxed">
          {score === QUIZ_QUESTIONS.length
            ? "Outstanding! You demonstrate strong conceptual command of quantum states, measurement, algorithms, and error correction."
            : "Great effort! Review the detailed mathematical explanations in the concept library below to reinforce any tricky concepts."}
        </p>

        <button
          onClick={handleRestart}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:opacity-95 transition"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Retry Challenge</span>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0c0e17] p-6 text-white space-y-5">
      {/* Quiz Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 text-xs font-semibold text-blue-400">
            {currentQ.category}
          </span>
          <span className="text-xs text-zinc-400 font-mono">
            Question {currentIdx + 1} of {QUIZ_QUESTIONS.length}
          </span>
        </div>
        <span className="text-xs font-mono text-emerald-400">
          Score: {score} pts
        </span>
      </div>

      {/* Question */}
      <h3 className="text-base sm:text-lg font-semibold text-white leading-snug">
        {currentQ.question}
      </h3>

      {/* Options List */}
      <div className="space-y-2.5">
        {currentQ.options.map((opt, oIdx) => {
          const isSelected = selectedOption === oIdx;
          const isCorrect = oIdx === currentQ.correctAnswer;
          let btnStyle = 'border-white/10 bg-zinc-900/60 text-zinc-300 hover:border-white/20 hover:bg-zinc-800/60';

          if (isAnswered) {
            if (isCorrect) {
              btnStyle = 'border-emerald-500/50 bg-emerald-500/15 text-emerald-200 font-medium';
            } else if (isSelected) {
              btnStyle = 'border-rose-500/50 bg-rose-500/15 text-rose-200';
            } else {
              btnStyle = 'border-white/5 bg-zinc-900/30 text-zinc-500';
            }
          }

          return (
            <button
              key={oIdx}
              disabled={isAnswered}
              onClick={() => handleSelect(oIdx)}
              className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-3 ${btnStyle}`}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-white/10 bg-black/40 text-[11px] font-mono">
                {String.fromCharCode(65 + oIdx)}
              </span>
              <span className="flex-1">{opt}</span>
              {isAnswered && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />}
              {isAnswered && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />}
            </button>
          );
        })}
      </div>

      {/* Explanation & Next */}
      {isAnswered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-3 space-y-3"
        >
          <div className="rounded-xl border border-white/10 bg-black/40 p-3.5 text-xs text-zinc-300 leading-relaxed">
            <strong className="text-cyan-300 block mb-1">Scientific Insight:</strong>
            {currentQ.explanation}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md hover:scale-105 active:scale-95 transition"
            >
              <span>{currentIdx + 1 < QUIZ_QUESTIONS.length ? 'Next Question' : 'View Results'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
