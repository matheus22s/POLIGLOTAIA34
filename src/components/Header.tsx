import React from 'react';
import { Languages, ArrowLeftRight, GraduationCap, BookOpen, Sun, Moon, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentTab: 'translate' | 'tutor' | 'flashcards';
  setCurrentTab: (tab: 'translate' | 'tutor' | 'flashcards') => void;
  isDark: boolean;
  toggleTheme: () => void;
  savedVocabCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  isDark,
  toggleTheme,
  savedVocabCount,
}) => {
  return (
    <header className="border-b border-slate-800 dark:border-slate-800 light:border-slate-200 sticky top-0 z-40 bg-slate-950/85 dark:bg-slate-950/85 light:bg-white/90 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('translate')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg leading-tight bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200 bg-clip-text text-transparent">
                Polyglot AI
              </h1>
              <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Sparkles className="w-2.5 h-2.5 mr-1" />
                Gemini 3.8
              </span>
            </div>
            <p className="text-xs text-slate-400">Tradução & Tutor Inteligente</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center bg-slate-900/90 dark:bg-slate-900 light:bg-slate-100 p-1 rounded-xl border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-inner">
          <button
            onClick={() => setCurrentTab('translate')}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-2 ${
              currentTab === 'translate'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 light:hover:text-slate-800'
            }`}
            aria-label="Aba Tradutor"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span className="hidden sm:inline">Tradutor</span>
          </button>

          <button
            onClick={() => setCurrentTab('tutor')}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-2 relative ${
              currentTab === 'tutor'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 light:hover:text-slate-800'
            }`}
            aria-label="Aba Professor IA"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Professor IA</span>
            <span className="relative flex h-2 w-2 ml-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('flashcards')}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 ${
              currentTab === 'flashcards'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 light:hover:text-slate-800'
            }`}
            aria-label="Aba Flashcards de Vocabulário"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden md:inline">Flashcards</span>
            {savedVocabCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-400/20 text-indigo-300">
                {savedVocabCount}
              </span>
            )}
          </button>
        </nav>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-slate-100 text-slate-400 hover:text-white light:hover:text-slate-900 border border-slate-800 dark:border-slate-800 light:border-slate-200 transition-colors focus:outline-none"
            title={isDark ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            aria-label="Alternar tema claro e escuro"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </div>
    </header>
  );
};
