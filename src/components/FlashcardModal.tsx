import React, { useState } from 'react';
import { X, Volume2, ArrowLeft, ArrowRight, RotateCw, CheckCircle, BookOpen } from 'lucide-react';
import { VocabItem } from '../types';
import { getLanguageByCode, getSpeechCode } from '../utils/languages';

interface FlashcardModalProps {
  vocabList: VocabItem[];
  onClose: () => void;
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}

export const FlashcardModal: React.FC<FlashcardModalProps> = ({ vocabList, onClose, showToast }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learnedIds, setLearnedIds] = useState<Set<string>>(new Set());

  if (vocabList.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
        <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
          <BookOpen className="w-12 h-12 text-indigo-400 mx-auto" />
          <h3 className="font-bold text-base text-slate-100 dark:text-slate-100 light:text-slate-900">
            Nenhum vocabulário ainda
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Converse com o Professor IA ou faça traduções para adicionar palavras à sua lista de estudos.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const currentItem = vocabList[currentIndex];
  const langObj = getLanguageByCode(currentItem.langCode);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % vocabList.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + vocabList.length) % vocabList.length);
  };

  const toggleLearned = (id: string) => {
    setLearnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        showToast(`"${currentItem.word}" marcado como aprendido!`, 'success');
      }
      return next;
    });
  };

  const speak = (text: string, langCode: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getSpeechCode(langCode);
    window.speechSynthesis.speak(utterance);
  };

  const isLearned = learnedIds.has(currentItem.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 dark:border-slate-800 light:border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-base">{langObj?.flag || '🌐'}</span>
            <span className="text-xs font-bold text-slate-300 dark:text-slate-300 light:text-slate-700">
              Cartão {currentIndex + 1} de {vocabList.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white light:hover:text-slate-900 transition-colors"
            aria-label="Fechar Flashcards"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Flashcard Area */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="cursor-pointer min-h-[220px] rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 dark:from-slate-950 dark:to-indigo-950/40 light:from-indigo-50/50 light:to-white border border-slate-800 dark:border-slate-800 light:border-slate-200 p-6 flex flex-col items-center justify-center text-center relative group transition-all duration-300 shadow-inner"
        >
          <span className="absolute top-3 right-3 text-[10px] text-slate-500 uppercase tracking-widest font-semibold flex items-center gap-1">
            <RotateCw className="w-3 h-3" />
            {isFlipped ? 'Verso (Significado)' : 'Frente (Palavra)'}
          </span>

          {!isFlipped ? (
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
                {currentItem.word}
              </h2>
              <p className="text-xs text-indigo-400 font-medium">Toque para ver a tradução</p>
            </div>
          ) : (
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-indigo-300 dark:text-indigo-300 light:text-indigo-700">
                {currentItem.meaning}
              </h2>
              <p className="text-xs text-slate-400">{langObj?.name || 'Idioma'}</p>
            </div>
          )}

          {/* Pronunciation button inside card */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              speak(currentItem.word, currentItem.langCode);
            }}
            className="absolute bottom-3 left-3 p-2 rounded-xl bg-slate-800/80 dark:bg-slate-800/80 light:bg-slate-200 text-slate-300 light:text-slate-700 hover:text-indigo-400 transition-colors"
            title="Ouvir pronúncia"
            aria-label={`Ouvir pronúncia de ${currentItem.word}`}
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => toggleLearned(currentItem.id)}
            className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors border ${
              isLearned
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-slate-800/60 dark:bg-slate-800/60 light:bg-slate-100 text-slate-400 border-slate-700/50 hover:text-slate-200'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isLearned ? 'Aprendido' : 'Marcar Aprendido'}</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrev}
              className="p-2.5 rounded-xl bg-slate-800 dark:bg-slate-800 light:bg-slate-100 hover:bg-slate-700 text-slate-300 light:text-slate-700 transition-colors"
              aria-label="Cartão anterior"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-md"
              aria-label="Próximo cartão"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
