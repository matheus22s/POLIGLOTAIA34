import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TranslationView } from './components/TranslationView';
import { TutorView } from './components/TutorView';
import { FlashcardModal } from './components/FlashcardModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { VocabItem } from './types';

const INITIAL_SEED_VOCAB: VocabItem[] = [
  {
    id: 'seed-1',
    word: 'Breakthrough',
    meaning: 'Avanço ou conquista importante e decisiva',
    langCode: 'en',
    savedAt: Date.now() - 3600000,
  },
  {
    id: 'seed-2',
    word: 'Serendipity',
    meaning: 'Ocorrência de felizes coincidências ou descobertas por acaso',
    langCode: 'en',
    savedAt: Date.now() - 7200000,
  },
  {
    id: 'seed-3',
    word: 'Resilient',
    meaning: 'Capaz de se recuperar rapidamente de dificuldades',
    langCode: 'en',
    savedAt: Date.now() - 10800000,
  },
];

export default function App() {
  const [currentTab, setCurrentTab] = useState<'translate' | 'tutor' | 'flashcards'>('translate');
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('polyglot_theme');
      if (saved) return saved === 'dark';
      return true; // Default dark
    } catch {
      return true;
    }
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [savedVocab, setSavedVocab] = useState<VocabItem[]>(() => {
    try {
      const saved = localStorage.getItem('polyglot_vocab');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_SEED_VOCAB;
  });

  // State passed to TutorView when clicking "Explicar com Tutor IA"
  const [tutorPrefillPrompt, setTutorPrefillPrompt] = useState<string>('');
  const [tutorPrefillLang, setTutorPrefillLang] = useState<string>('en');
  const [showFlashcardModal, setShowFlashcardModal] = useState<boolean>(false);

  // Sync theme with HTML root class
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      localStorage.setItem('polyglot_theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      localStorage.setItem('polyglot_theme', 'light');
    }
  }, [isDark]);

  // Sync vocab to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('polyglot_vocab', JSON.stringify(savedVocab));
    } catch {
      // ignore
    }
  }, [savedVocab]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const showToast = (text: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSaveVocab = (word: string, meaning: string, langCode: string) => {
    const cleanWord = word.trim();
    if (!cleanWord) return;

    setSavedVocab((prev) => {
      if (prev.some((item) => item.word.toLowerCase() === cleanWord.toLowerCase())) {
        return prev;
      }
      const newItem: VocabItem = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 4),
        word: cleanWord,
        meaning: meaning.trim(),
        langCode,
        savedAt: Date.now(),
      };
      showToast(`Vocabulário "${cleanWord}" adicionado!`, 'success');
      return [newItem, ...prev];
    });
  };

  const handleRemoveVocab = (id: string) => {
    setSavedVocab((prev) => prev.filter((item) => item.id !== id));
    showToast('Item removido do vocabulário.', 'info');
  };

  // Called from TranslationView "Explicar com Tutor IA"
  const handleSendToTutor = (sourceText: string, translatedText: string, targetLangCode: string) => {
    setTutorPrefillLang(targetLangCode);
    setTutorPrefillPrompt(
      `Professor, acabei de traduzir a frase abaixo no app. Pode me explicar detalhadamente as estruturas gramaticais, o nível de formalidade e me dar exemplos práticos de uso?\n\nOriginal: "${sourceText}"\nTradução: "${translatedText}"`
    );
    setCurrentTab('tutor');
    showToast('Enviado para o Professor IA!', 'info');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 dark:bg-slate-950 light:bg-slate-50 text-slate-100 dark:text-slate-100 light:text-slate-900 transition-colors duration-200">
      <Header
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab === 'flashcards') {
            setShowFlashcardModal(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        isDark={isDark}
        toggleTheme={toggleTheme}
        savedVocabCount={savedVocab.length}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        {currentTab === 'translate' && (
          <TranslationView
            onSendToTutor={handleSendToTutor}
            onSaveVocab={handleSaveVocab}
            showToast={showToast}
            savedVocabList={savedVocab}
          />
        )}

        {currentTab === 'tutor' && (
          <TutorView
            initialPrompt={tutorPrefillPrompt}
            initialLangCode={tutorPrefillLang}
            savedVocabList={savedVocab}
            onSaveVocab={handleSaveVocab}
            onRemoveVocab={handleRemoveVocab}
            onOpenFlashcards={() => setShowFlashcardModal(true)}
            showToast={showToast}
          />
        )}
      </main>

      {/* Flashcard Modal */}
      {showFlashcardModal && (
        <FlashcardModal
          vocabList={savedVocab}
          onClose={() => setShowFlashcardModal(false)}
          showToast={showToast}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Polyglot AI • Tradutor & Professor de Idiomas</span>
          <span>Potencializado por Google Gemini 3.8 Flash</span>
        </div>
      </footer>
    </div>
  );
}
