import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Cpu,
  Binary,
  Shield,
  Activity,
  Brain,
  Layers,
  Server,
  Zap,
  Radio,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { getCategories } from '../services/api';
import EmptyState from '../components/EmptyState';

const categoryIcons = {
  'quantum-computing': Cpu,
  'quantum-information': Binary,
  'quantum-cryptography': Shield,
  'quantum-error-correction': Activity,
  'quantum-machine-learning': Brain,
  'quantum-simulation': Layers,
  'quantum-hardware': Server,
  'quantum-algorithms': Zap,
  'quantum-communication': Radio,
  'quantum-sensing': Compass,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCategory = (cat) => {
    navigate(`/search?q=${encodeURIComponent(cat.name)}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white/90">
          Research Categories
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Explore specialized subfields in quantum physics and quantum computation
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl border border-white/5 bg-white/[0.02]"
            />
          ))}
        </div>
      ) : categories.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, i) => {
            const Icon = categoryIcons[cat.slug] || Cpu;
            return (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                onClick={() => handleSelectCategory(cat)}
                className="group relative cursor-pointer rounded-2xl border border-white/[0.08] bg-[#0c0e17] p-5 transition-all duration-200 hover:border-white/20 hover:bg-[#0f111d]"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 border border-white/10 text-blue-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-md border border-white/10 bg-zinc-900 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                    {cat.arxiv_category || 'quant-ph'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-400 line-clamp-2">
                  {cat.description}
                </p>

                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-400 group-hover:translate-x-1 transition-transform">
                  <span>Browse research papers</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Cpu}
          title="No categories found"
          description="Categories are currently unavailable. Ensure the backend is running."
        />
      )}
    </div>
  );
}
