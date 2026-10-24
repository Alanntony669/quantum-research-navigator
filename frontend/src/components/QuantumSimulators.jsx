import { useState, useId } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Play, RotateCcw, Sparkles, Check, HelpCircle } from 'lucide-react';

/**
 * 1. Interactive Bloch Sphere & State Vector Calculator
 */
export function BlochSphereSimulator() {
  const [theta, setTheta] = useState(1.05); // ~60 degrees
  const [phi, setPhi] = useState(0.78); // ~45 degrees

  const thetaDeg = Math.round((theta * 180) / Math.PI);
  const phiDeg = Math.round((phi * 180) / Math.PI);

  const prob0 = Math.cos(theta / 2) ** 2;
  const prob1 = Math.sin(theta / 2) ** 2;

  // 2D projection coordinates for SVG
  const r = 70;
  const cx = 100;
  const cy = 100;
  const x = cx + r * Math.sin(theta) * Math.cos(phi);
  const y = cy - r * Math.cos(theta); // up is negative in SVG

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c0e17] p-5 text-white">
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div>
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            Interactive Qubit State Vector Simulator
          </h4>
          <p className="text-xs text-zinc-400">
            Rotate angles θ (polar) and φ (phase) to observe state amplitudes & probabilities
          </p>
        </div>
        <span className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 text-[11px] font-mono text-blue-300">
          |ψ⟩ = cos(θ/2)|0⟩ + e^iφ sin(θ/2)|1⟩
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* SVG Bloch Sphere Graphic */}
        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-black/40 border border-white/5">
          <svg width="200" height="200" viewBox="0 0 200 200" className="overflow-visible">
            {/* Sphere outline */}
            <circle cx="100" cy="100" r="70" fill="none" stroke="#27272a" strokeWidth="1.5" />
            {/* Equator ellipse */}
            <ellipse cx="100" cy="100" rx="70" ry="24" fill="none" stroke="#3f3f46" strokeWidth="1" strokeDasharray="3 3" />
            {/* Axes */}
            <line x1="100" y1="20" x2="100" y2="180" stroke="#52525b" strokeWidth="1" />
            <line x1="25" y1="100" x2="175" y2="100" stroke="#52525b" strokeWidth="1" />
            {/* Poles */}
            <text x="100" y="15" textAnchor="middle" fill="#93c5fd" fontSize="11" fontWeight="bold">|0⟩ (North)</text>
            <text x="100" y="195" textAnchor="middle" fill="#f472b6" fontSize="11" fontWeight="bold">|1⟩ (South)</text>
            <text x="185" y="104" fill="#a1a1aa" fontSize="10">+x</text>

            {/* State vector arrow */}
            <line
              x1="100"
              y1="100"
              x2={x}
              y2={y}
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* State vector tip point */}
            <circle cx={x} cy={y} r="5" fill="#38bdf8" className="shadow-lg" />
          </svg>
          <span className="text-[11px] text-zinc-400 font-mono mt-1">
            Current Vector: θ={thetaDeg}°, φ={phiDeg}°
          </span>
        </div>

        {/* Sliders & Probability Bars */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-mono text-zinc-300 mb-1">
              <span>Polar Angle (θ): {thetaDeg}°</span>
              <span className="text-zinc-500">0° (|0⟩) to 180° (|1⟩)</span>
            </div>
            <input
              type="range"
              min="0"
              max={Math.PI}
              step="0.02"
              value={theta}
              onChange={(e) => setTheta(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono text-zinc-300 mb-1">
              <span>Phase Angle (φ): {phiDeg}°</span>
              <span className="text-zinc-500">0° to 360°</span>
            </div>
            <input
              type="range"
              min="0"
              max={2 * Math.PI}
              step="0.04"
              value={phi}
              onChange={(e) => setPhi(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          {/* Probability Meters */}
          <div className="rounded-xl bg-zinc-900/80 border border-white/5 p-3.5 space-y-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">
              Measurement Probabilities (Born Rule):
            </span>
            <div>
              <div className="flex justify-between text-xs font-mono text-blue-300 mb-1">
                <span>P(|0⟩) = |cos(θ/2)|²</span>
                <span className="font-bold">{(prob0 * 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-150"
                  style={{ width: `${prob0 * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-pink-300 mb-1">
                <span>P(|1⟩) = |sin(θ/2)|²</span>
                <span className="font-bold">{(prob1 * 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-150"
                  style={{ width: `${prob1 * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 2. Double-Slit Wave vs Which-Path Measurement Simulator
 */
export function DoubleSlitSimulator() {
  const [detectorOn, setDetectorOn] = useState(false);
  const [wavelength, setWavelength] = useState(1.0); // nm relative

  // Generate intensity pattern curve
  const points = [];
  const width = 360;
  const height = 120;
  const midX = width / 2;

  for (let x = 0; x < width; x += 3) {
    const dist = (x - midX) * 0.08;
    let intensity = 0;

    if (!detectorOn) {
      // Coherent interference: cos^2(k x) * envelope
      const envelope = Math.exp(-(dist ** 2) / 12);
      const interference = Math.cos((dist * Math.PI) / wavelength) ** 2;
      intensity = envelope * interference;
    } else {
      // Which-path measured: sum of two classical gaussian slits without interference term!
      const slitA = Math.exp(-((dist - 1.2) ** 2) / 3.5);
      const slitB = Math.exp(-((dist + 1.2) ** 2) / 3.5);
      intensity = (slitA + slitB) * 0.5;
    }

    const y = height - intensity * (height - 15) - 10;
    points.push(`${x},${y.toFixed(1)}`);
  }

  const pathData = `M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c0e17] p-5 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-3 mb-4 gap-2">
        <div>
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${detectorOn ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
            Double-Slit Wave-Particle Experiment Lab
          </h4>
          <p className="text-xs text-zinc-400">
            Switch between coherent wave interference and which-path particle detection
          </p>
        </div>

        <button
          onClick={() => setDetectorOn(!detectorOn)}
          className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all border ${
            detectorOn
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
          }`}
        >
          {detectorOn ? (
            <>
              <Eye className="h-3.5 w-3.5" />
              <span>Which-Path Detector: ACTIVE (Particle)</span>
            </>
          ) : (
            <>
              <EyeOff className="h-3.5 w-3.5" />
              <span>Which-Path Detector: OFF (Wave)</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Visual Interference Screen */}
        <div className="md:col-span-2 rounded-xl bg-black/60 border border-white/5 p-4 flex flex-col items-center">
          <div className="w-full flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
            <span>Detection Screen Intensity Curve:</span>
            <span className={detectorOn ? 'text-amber-300 font-bold' : 'text-emerald-300 font-bold'}>
              {detectorOn ? 'Two Classical Bands (No Interference)' : 'Interference Fringes Visible'}
            </span>
          </div>

          <svg width="100%" height="130" viewBox={`0 0 ${width} ${height}`} className="w-full">
            <defs>
              <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={detectorOn ? '#f59e0b' : '#10b981'} stopOpacity="0.8" />
                <stop offset="100%" stopColor={detectorOn ? '#f59e0b' : '#10b981'} stopOpacity="0.05" />
              </linearGradient>
            </defs>
            {/* Grid baseline */}
            <line x1="0" y1={height - 5} x2={width} y2={height - 5} stroke="#3f3f46" strokeWidth="1" />
            <line x1={midX} y1="0" x2={midX} y2={height} stroke="#27272a" strokeWidth="1" strokeDasharray="3 3" />
            {/* The curve */}
            <path d={pathData} fill="url(#waveGrad)" stroke={detectorOn ? '#fbbf24' : '#34d399'} strokeWidth="2" />
          </svg>

          {/* Simulated fringe bar */}
          <div className="w-full h-4 mt-2 rounded bg-zinc-900 border border-white/5 overflow-hidden flex">
            {detectorOn ? (
              <div className="w-full flex justify-around items-center px-8">
                <div className="h-3 w-16 bg-amber-400/80 rounded-full blur-[2px]" />
                <div className="h-3 w-16 bg-amber-400/80 rounded-full blur-[2px]" />
              </div>
            ) : (
              <div className="w-full flex justify-between items-center px-4">
                {[...Array(11)].map((_, i) => {
                  const intensity = Math.cos(((i - 5) * Math.PI) / 2.2) ** 2;
                  return (
                    <div
                      key={i}
                      className="h-3 w-2.5 bg-emerald-400 rounded-sm"
                      style={{ opacity: Math.max(0.1, intensity) }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Physics Explanation Box */}
        <div className="rounded-xl bg-zinc-900/80 border border-white/5 p-4 text-xs space-y-2.5">
          <span className="font-semibold text-zinc-300 block uppercase tracking-wider text-[11px]">
            Physical Mechanism:
          </span>
          {detectorOn ? (
            <p className="text-zinc-300 leading-relaxed">
              When a detector measures which slit each electron passes through, the entanglement with the detector irreversibly destroys phase coherence. The interference cross-term disappears, leaving two classical probability humps.
            </p>
          ) : (
            <p className="text-zinc-300 leading-relaxed">
              Without which-path measurement, each electron passes through both slits in a superposition of paths. The probability amplitudes interfere constructively and destructively, producing bright and dark fringes.
            </p>
          )}

          <div className="pt-2 border-t border-white/10 font-mono text-[11px] text-zinc-400">
            {detectorOn
              ? 'P(x) = P₁(x) + P₂(x)'
              : 'P(x) = |ψ₁ + ψ₂|² = P₁ + P₂ + 2√(P₁P₂) cos(δ)'}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 3. Interactive Hadamard Superposition Gate Lab
 */
export function HadamardGateSimulator() {
  const [inputState, setInputState] = useState(0); // 0 or 1
  const [gateApplied, setGateApplied] = useState(false);

  const handleApply = () => {
    setGateApplied(true);
  };

  const handleReset = () => {
    setGateApplied(false);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c0e17] p-5 text-white">
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div>
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            Hadamard Gate & Superposition Generator
          </h4>
          <p className="text-xs text-zinc-400">
            Feed a pure classical state into the Hadamard matrix to inspect how superposition is formed
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-black/40 border border-white/5">
        {/* Input */}
        <div className="flex flex-col items-center">
          <span className="text-[11px] text-zinc-400 uppercase font-semibold mb-2">Input State:</span>
          <div className="flex gap-2">
            <button
              onClick={() => { setInputState(0); setGateApplied(false); }}
              className={`h-10 w-12 rounded-xl font-mono text-sm font-bold border transition-all ${
                inputState === 0
                  ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                  : 'border-white/10 bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              |0⟩
            </button>
            <button
              onClick={() => { setInputState(1); setGateApplied(false); }}
              className={`h-10 w-12 rounded-xl font-mono text-sm font-bold border transition-all ${
                inputState === 1
                  ? 'border-pink-500 bg-pink-500/20 text-pink-300'
                  : 'border-white/10 bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              |1⟩
            </button>
          </div>
        </div>

        {/* Wire & Gate */}
        <div className="flex items-center gap-3">
          <div className="h-0.5 w-10 bg-zinc-700" />
          <button
            onClick={handleApply}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-mono font-bold text-sm shadow-md transition-all ${
              gateApplied
                ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-emerald-500/10'
                : 'border-indigo-500/50 bg-indigo-600/30 text-indigo-200 hover:scale-105 active:scale-95'
            }`}
          >
            <span>[ H ] Gate</span>
          </button>
          <div className="h-0.5 w-10 bg-zinc-700" />
        </div>

        {/* Output */}
        <div className="flex flex-col items-center sm:items-start min-w-[140px]">
          <span className="text-[11px] text-zinc-400 uppercase font-semibold mb-1">Resulting State:</span>
          {gateApplied ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center sm:text-left"
            >
              <div className="font-mono text-sm font-bold text-cyan-300">
                {inputState === 0 ? '(|0⟩ + |1⟩) / √2' : '(|0⟩ - |1⟩) / √2'}
              </div>
              <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                P(0)=50% • P(1)=50%
              </div>
            </motion.div>
          ) : (
            <span className="text-xs font-mono text-zinc-500 italic">
              Click [ H ] to transform
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
