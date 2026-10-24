import { useState } from 'react';
import { Search, User, FileText, Layers, Sparkles } from 'lucide-react';

const searchModes = [
  { id: 'all', label: 'All Fields', icon: Sparkles, placeholder: 'Search quantum papers, topics, authors...' },
  { id: 'author', label: 'Author Name', icon: User, placeholder: 'Enter author name (e.g. Peter Shor, John Martinis, Mikhail Lukin)...' },
  { id: 'title', label: 'Paper Title', icon: FileText, placeholder: 'Enter paper title (e.g. Fault-Tolerant Quantum Computing)...' },
  { id: 'abstract', label: 'Abstract', icon: Layers, placeholder: 'Search in abstracts (e.g. topological qubits, error correction)...' },
];

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  searchType = 'all',
  onChangeSearchType,
  showModes = true,
  className = '',
}) {
  const currentMode = searchModes.find((m) => m.id === searchType) || searchModes[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(value, searchType);
  };

  return (
    <div className={`space-y-2.5 w-full ${className}`}>
      {showModes && (
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mr-1 hidden sm:inline-block font-mono">
            Target:
          </span>
          {searchModes.map((mode) => {
            const Icon = mode.icon;
            const isActive = searchType === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onChangeSearchType && onChangeSearchType(mode.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'border border-white/10 bg-zinc-900/60 text-zinc-400 hover:border-white/20 hover:text-white'
                }`}
              >
                <Icon className={`h-3 w-3 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="relative flex items-center">
          <Search className="absolute left-4 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={currentMode.placeholder}
            className="w-full rounded-2xl border border-white/10 bg-[#0c0e17] py-3.5 pl-11 pr-28 text-sm text-white placeholder-zinc-500 focus:border-blue-500/60 focus:bg-[#0f111d] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all active:scale-95"
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
}
