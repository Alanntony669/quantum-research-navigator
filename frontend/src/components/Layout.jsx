import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Search,
  Grid3X3,
  Bookmark,
  FileText,
  BookOpen,
  Atom,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Cpu,
  GraduationCap,
  ExternalLink,
  ShieldCheck,
  Command,
} from 'lucide-react';

const navItems = [
  { path: '/navigator', label: 'Paper Navigator', icon: Compass, badge: 'Core' },
  { path: '/glossary', label: 'Learn Concepts', icon: GraduationCap, badge: 'Studio' },
  { path: '/search', label: 'arXiv Research', icon: Search },
  { path: '/categories', label: 'Domains & Fields', icon: Grid3X3 },
  { path: '/bookmarks', label: 'Reading Library', icon: Bookmark },
  { path: '/documents', label: 'Notes & Uploads', icon: FileText },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Determine breadcrumb label
  const currentNav = navItems.find((item) => item.path === location.pathname) || {
    label: location.pathname === '/' ? 'Home Dashboard' : 'Workspace',
  };

  return (
    <div className="relative flex min-h-screen bg-[#08090d] text-zinc-100 font-sans selection:bg-blue-500/30 selection:text-white">
      {/* Mobile hamburger button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-3 left-3 z-50 flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#0e1017] text-zinc-300 shadow-md lg:hidden"
        aria-label="Toggle Navigation"
      >
        {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/70 backdrop-blur-xs lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-white/[0.08] bg-[#0c0d14] transition-transform duration-200 lg:sticky lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.06]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
            <Atom className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-white">Quantum</span>
              <span className="text-sm font-light text-blue-400">Navigator</span>
            </div>
            <p className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
              Research Assistant
            </p>
          </div>
        </div>

        {/* Section Heading */}
        <div className="px-5 pt-4 pb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Navigation
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-0.5 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-zinc-800/80 text-white border-l-2 border-blue-500 shadow-xs'
                    : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
                }`}
              >
                <Icon
                  className={`h-4 w-4 transition-colors ${
                    isActive ? 'text-blue-400' : 'text-zinc-400 group-hover:text-zinc-300'
                  }`}
                />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider font-mono ${
                      isActive
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-zinc-800 text-zinc-400 border border-white/5'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer Status */}
        <div className="border-t border-white/[0.06] p-4 text-[11px] text-zinc-400 space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              arXiv API Live
            </span>
            <span className="font-mono text-[10px] text-zinc-400">v1.4</span>
          </div>
          <div className="rounded-lg bg-zinc-900/60 border border-white/5 p-2 text-[10px] text-zinc-400 leading-tight">
            Academic Edition for Researchers & Students
          </div>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Control Bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-white/[0.06] bg-[#0c0d14]/90 px-4 sm:px-8 backdrop-blur-md">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs pl-8 lg:pl-0">
            <span className="text-zinc-400 font-mono">Navigator</span>
            <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
            <span className="font-semibold text-zinc-200">{currentNav.label}</span>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3">
            <NavLink
              to="/navigator"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300 hover:bg-blue-500/20 transition"
            >
              <Sparkles className="h-3 w-3 text-blue-400" />
              <span>Analyze Paper</span>
            </NavLink>

            <NavLink
              to="/glossary"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition"
            >
              <GraduationCap className="h-3.5 w-3.5 text-emerald-400" />
              <span>Learn Concepts</span>
            </NavLink>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
