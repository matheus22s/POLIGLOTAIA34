import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeftRight,
  Mic,
  Volume2,
  Copy,
  Trash2,
  Sparkles,
  Lightbulb,
  Check,
  Plus,
  Loader2,
  History,
  BookMarked,
} from 'lucide-react';
import { LANGUAGES, POPULAR_LANGUAGE_PAIRS, SAMPLE_TRANSLATION_PROMPTS, getSpeechCode } from '../utils/languages';
import { TranslationResult, TranslationHistoryItem, VocabItem } from '../types';

interface TranslationViewProps {
  onSendToTutor: (sourceText: string, translatedText: string, targetLangCode: string) => void;
  onSaveVocab: (word: string, meaning: string, langCode: string) => void;
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
  savedVocabList: VocabItem[];
}

export const TranslationView: React.FC<TranslationViewProps> = ({
  onSendToTutor,
  onSaveVocab,
  showToast,
  savedVocabList,
}) => {
  const [sourceLang, setSourceLang] = useState<string>('auto');
  const [targetLang, setTargetLang] = useState<string>('en');
  const [inputText, setInputText] = useState<string>('');
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [copiedInput, setCopiedInput] = useState<boolean>(false);
  const [copiedOutput, setCopiedOutput] = useState<boolean>(false);
  const [history, setHistory] = useState<TranslationHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('polyglot_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('polyglot_history', JSON.stringify(history.slice(0, 20)));
    } catch {
      // ignore
    }
  }, [history]);

  // Handle translation fetch
  const handleTranslate = async (textToTranslate: string, src: string, tgt: string) => {
    const trimmed = textToTranslate.trim();
    if (!trimmed) {
      setTranslationResult(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: trimmed,
          sourceLang: src,
          targetLang: tgt,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha na resposta do servidor.');
      }

      const data: TranslationResult = await response.json();
      setTranslationResult(data);

      // Append to history
      const newHistoryItem: TranslationHistoryItem = {
        id: Date.now().toString(),
        sourceText: trimmed,
        translatedText: data.translation,
        sourceLang: src,
        targetLang: tgt,
        timestamp: Date.now(),
        culturalNotes: data.culturalNotes,
      };

      setHistory((prev) => [
        newHistoryItem,
        ...prev.filter((h) => h.sourceText.toLowerCase() !== trimmed.toLowerCase()),
      ].slice(0, 20));
    } catch (err) {
      console.error(err);
      showToast('Erro ao realizar tradução. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced translation trigger
  const handleInputChange = (text: string) => {
    setInputText(text);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!text.trim()) {
      setTranslationResult(null);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      handleTranslate(text, sourceLang, targetLang);
    }, 600);
  };

  // Language swapping
  const swapLanguages = () => {
    if (sourceLang === 'auto') {
      showToast('Selecione um idioma de origem específico para inverter.', 'info');
      return;
    }

    const currentSource = sourceLang;
    const currentTarget = targetLang;
    setSourceLang(currentTarget);
    setTargetLang(currentSource);

    if (translationResult?.translation) {
      setInputText(translationResult.translation);
      handleTranslate(translationResult.translation, currentTarget, currentSource);
    } else if (inputText) {
      handleTranslate(inputText, currentTarget, currentSource);
    }
  };

  // Web Speech API - Recognition
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Reconhecimento de voz não suportado neste navegador.', 'error');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = sourceLang === 'auto' ? 'pt-BR' : getSpeechCode(sourceLang);

      recognition.onstart = () => {
        setIsListening(true);
        showToast('Ouvindo... pode falar!', 'info');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputText(transcript);
        handleInputChange(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        showToast('Erro ao capturar áudio.', 'error');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
      showToast('Não foi possível iniciar o microfone.', 'error');
    }
  };

  // Web Speech API - Synthesis
  const speakText = (text: string, langCode: string) => {
    if (!text || text.trim() === '') return;

    if (!('speechSynthesis' in window)) {
      showToast('Síntese de voz não suportada pelo navegador.', 'error');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getSpeechCode(langCode);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  // Copy helper
  const copyToClipboard = async (text: string, isInput: boolean) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      if (isInput) {
        setCopiedInput(true);
        setTimeout(() => setCopiedInput(false), 2000);
      } else {
        setCopiedOutput(true);
        setTimeout(() => setCopiedOutput(false), 2000);
      }
      showToast('Texto copiado com sucesso!', 'success');
    } catch {
      showToast('Erro ao copiar para a área de transferência.', 'error');
    }
  };

  // Clear inputs
  const clearInput = () => {
    setInputText('');
    setTranslationResult(null);
  };

  const isWordSaved = (word: string) => {
    return savedVocabList.some((v) => v.word.toLowerCase() === word.toLowerCase());
  };

  return (
    <div className="flex-1 flex flex-col space-y-4 max-w-7xl w-full mx-auto">
      {/* Quick Language Pair Chips */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1 pb-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 mr-1 hidden sm:inline">Pares Populares:</span>
          {POPULAR_LANGUAGE_PAIRS.map((pair) => (
            <button
              key={`${pair.source}-${pair.target}`}
              onClick={() => {
                setSourceLang(pair.source);
                setTargetLang(pair.target);
                if (inputText.trim()) {
                  handleTranslate(inputText, pair.source, pair.target);
                }
              }}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                sourceLang === pair.source && targetLang === pair.target
                  ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50 font-medium'
                  : 'bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-100 text-slate-400 hover:text-slate-200 light:text-slate-600 border-slate-800 dark:border-slate-800 light:border-slate-200'
              }`}
            >
              {pair.label}
            </button>
          ))}
        </div>

        {history.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-900/60 dark:bg-slate-900 light:bg-slate-100 text-slate-300 light:text-slate-700 hover:text-indigo-400 border border-slate-800 dark:border-slate-800 light:border-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            <span>Histórico ({history.length})</span>
          </button>
        )}
      </div>

      {/* Language Selector Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/70 dark:bg-slate-900/70 light:bg-white p-3 rounded-2xl border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-sm backdrop-blur-sm">
        {/* Source Language */}
        <div className="flex-1 min-w-[150px]">
          <label htmlFor="source-lang-select" className="sr-only">Idioma de Origem</label>
          <select
            id="source-lang-select"
            value={sourceLang}
            onChange={(e) => {
              const val = e.target.value;
              setSourceLang(val);
              if (inputText.trim()) handleTranslate(inputText, val, targetLang);
            }}
            className="w-full bg-slate-950 dark:bg-slate-950 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-200 dark:text-slate-200 light:text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="auto">🌐 Detectar Idioma Auto</option>
            {LANGUAGES.map((lang) => (
              <option key={`src-${lang.code}`} value={lang.code}>
                {lang.flag} {lang.name} ({lang.nativeName})
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <button
          onClick={swapLanguages}
          className="p-2.5 rounded-xl bg-slate-800 dark:bg-slate-800 light:bg-slate-100 hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-slate-200 text-slate-300 light:text-slate-700 transition-all active:scale-95 shadow-sm border border-slate-700/50 dark:border-slate-700/50 light:border-slate-200"
          title="Inverter Idiomas"
          aria-label="Inverter Idiomas de Origem e Destino"
        >
          <ArrowLeftRight className="w-5 h-5 text-indigo-400" />
        </button>

        {/* Target Language */}
        <div className="flex-1 min-w-[150px]">
          <label htmlFor="target-lang-select" className="sr-only">Idioma de Destino</label>
          <select
            id="target-lang-select"
            value={targetLang}
            onChange={(e) => {
              const val = e.target.value;
              setTargetLang(val);
              if (inputText.trim()) handleTranslate(inputText, sourceLang, val);
            }}
            className="w-full bg-slate-950 dark:bg-slate-950 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-200 dark:text-slate-200 light:text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            {LANGUAGES.map((lang) => (
              <option key={`tgt-${lang.code}`} value={lang.code}>
                {lang.flag} {lang.name} ({lang.nativeName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dual Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-[380px]">
        {/* Input Panel */}
        <div className="flex flex-col bg-slate-900/50 dark:bg-slate-900/50 light:bg-white rounded-2xl border border-slate-800 dark:border-slate-800 light:border-slate-200 p-4 shadow-sm relative focus-within:border-indigo-500/60 transition-all">
          <div className="flex items-center justify-between mb-2 text-xs text-slate-400 font-medium">
            <span id="char-count">{inputText.length} / 2500 caracteres</span>
            {inputText && (
              <button
                onClick={clearInput}
                className="hover:text-rose-400 text-slate-400 flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded"
                aria-label="Limpar texto digitado"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar</span>
              </button>
            )}
          </div>

          <textarea
            value={inputText}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Digite ou fale aqui para traduzir em tempo real com precisão do Gemini..."
            className="flex-1 bg-transparent border-0 resize-none text-slate-100 dark:text-slate-100 light:text-slate-800 text-base sm:text-lg focus:outline-none placeholder-slate-500 leading-relaxed font-normal min-h-[160px]"
            aria-label="Texto a ser traduzido"
          />

          {/* Sample Prompts */}
          {!inputText && (
            <div className="py-2 flex flex-wrap gap-1.5 border-t border-slate-800/40 dark:border-slate-800/40 light:border-slate-100">
              <span className="text-[11px] text-slate-500 self-center">Sugestões:</span>
              {SAMPLE_TRANSLATION_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputText(prompt.text);
                    handleTranslate(prompt.text, sourceLang, targetLang);
                  }}
                  className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-800/60 dark:bg-slate-800/60 light:bg-slate-100 text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          )}

          {/* Action Tools Input */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 dark:border-slate-800/60 light:border-slate-100">
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleSpeechRecognition}
                className={`p-2.5 rounded-xl border transition-colors relative ${
                  isListening
                    ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                    : 'bg-slate-800 dark:bg-slate-800 light:bg-slate-100 text-slate-300 light:text-slate-700 border-slate-700/50 hover:text-indigo-400 hover:bg-slate-700'
                }`}
                title={isListening ? 'Parar Gravação' : 'Falar via Microfone'}
                aria-label="Gravar fala para traduzir"
              >
                <Mic className="w-4 h-4" />
                {isListening && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                )}
              </button>

              <button
                onClick={() => speakText(inputText, sourceLang)}
                disabled={!inputText}
                className="p-2.5 rounded-xl bg-slate-800 dark:bg-slate-800 light:bg-slate-100 text-slate-300 light:text-slate-700 border border-slate-700/50 hover:text-indigo-400 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 transition-colors"
                title="Ouvir Pronúncia Original"
                aria-label="Ouvir texto original em voz alta"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => copyToClipboard(inputText, true)}
              disabled={!inputText}
              className="p-2.5 rounded-xl bg-slate-800 dark:bg-slate-800 light:bg-slate-100 text-slate-300 light:text-slate-700 border border-slate-700/50 hover:text-indigo-400 hover:bg-slate-700 disabled:opacity-40 transition-colors"
              title="Copiar Texto Original"
              aria-label="Copiar texto de origem"
            >
              {copiedInput ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="flex flex-col bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-50/90 rounded-2xl border border-slate-800 dark:border-slate-800 light:border-slate-200 p-4 shadow-sm relative">
          <div className="flex items-center justify-between mb-2 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5 font-semibold text-indigo-400">
              <Sparkles className="w-3.5 h-3.5" />
              Tradução
              {translationResult?.detectedLanguage && (
                <span className="text-[11px] font-normal text-slate-400">
                  ({translationResult.detectedLanguage})
                </span>
              )}
            </span>

            {isLoading && (
              <div className="flex items-center space-x-1.5 text-indigo-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="text-xs">Traduzindo...</span>
              </div>
            )}
          </div>

          <div
            id="output-text"
            className="flex-1 text-slate-100 dark:text-slate-100 light:text-slate-900 text-base sm:text-lg overflow-y-auto whitespace-pre-wrap font-normal leading-relaxed min-h-[160px]"
          >
            {translationResult?.translation ? (
              translationResult.translation
            ) : (
              <span className="text-slate-500 italic text-base">
                A tradução gerada pela IA aparecerá instantaneamente aqui...
              </span>
            )}
          </div>

          {/* Action Tools Output */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 dark:border-slate-800/60 light:border-slate-200">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => speakText(translationResult?.translation || '', targetLang)}
                disabled={!translationResult?.translation}
                className="p-2.5 rounded-xl bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-300 light:text-slate-700 border border-slate-700/50 hover:text-indigo-400 hover:bg-slate-700 disabled:opacity-40 transition-colors"
                title="Ouvir Tradução"
                aria-label="Ouvir texto traduzido"
              >
                <Volume2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (inputText && translationResult?.translation) {
                    onSendToTutor(inputText, translationResult.translation, targetLang);
                  }
                }}
                disabled={!translationResult?.translation}
                className="px-3 py-2 rounded-xl bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
                aria-label="Explicar com o Tutor IA"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Explicar com Tutor IA</span>
              </button>
            </div>

            <button
              onClick={() => copyToClipboard(translationResult?.translation || '', false)}
              disabled={!translationResult?.translation}
              className="p-2.5 rounded-xl bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-300 light:text-slate-700 border border-slate-700/50 hover:text-indigo-400 hover:bg-slate-700 disabled:opacity-40 transition-colors"
              title="Copiar Tradução"
              aria-label="Copiar texto traduzido"
            >
              {copiedOutput ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300 light:text-slate-700" />}
            </button>
          </div>
        </div>
      </div>

      {/* Cultural & Grammatical Insights Card */}
      {translationResult?.culturalNotes && (
        <div
          id="nuance-card"
          className="bg-indigo-950/30 dark:bg-indigo-950/30 light:bg-indigo-50/80 border border-indigo-800/40 dark:border-indigo-800/40 light:border-indigo-200 rounded-2xl p-4 text-sm space-y-2 transition-all animate-in fade-in duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-indigo-400 light:text-indigo-700 font-semibold text-xs uppercase tracking-wider">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Notas Gramaticais & Contexto Cultural</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 dark:text-slate-300 light:text-slate-700 leading-relaxed">
            {translationResult.culturalNotes}
          </p>

          {/* Key terms if available */}
          {translationResult.keyTerms && translationResult.keyTerms.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-2">
              {translationResult.keyTerms.map((term, idx) => {
                const saved = isWordSaved(term.term);
                return (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-900/40 dark:bg-indigo-900/40 light:bg-white border border-indigo-700/40 dark:border-indigo-700/40 light:border-indigo-200 text-xs text-slate-200 light:text-slate-800"
                  >
                    <span className="font-semibold text-indigo-300 light:text-indigo-600">{term.term}:</span>
                    <span className="text-slate-300 dark:text-slate-300 light:text-slate-600">{term.meaning}</span>
                    <button
                      onClick={() => onSaveVocab(term.term, term.meaning, targetLang)}
                      className={`ml-1 p-0.5 rounded transition-colors ${
                        saved ? 'text-emerald-400' : 'text-slate-400 hover:text-indigo-300'
                      }`}
                      title={saved ? 'Salvo no Vocabulário' : 'Salvar no Vocabulário'}
                      aria-label={`Salvar termo ${term.term}`}
                    >
                      {saved ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* History Drawer */}
      {showHistory && (
        <div className="bg-slate-900/80 dark:bg-slate-900/80 light:bg-white rounded-2xl border border-slate-800 dark:border-slate-800 light:border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" />
              Histórico Recente de Traduções
            </h3>
            <button
              onClick={() => {
                setHistory([]);
                localStorage.removeItem('polyglot_history');
                showToast('Histórico limpo.', 'info');
              }}
              className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors"
            >
              Limpar Histórico
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setInputText(item.sourceText);
                  setSourceLang(item.sourceLang);
                  setTargetLang(item.targetLang);
                  setTranslationResult({
                    translation: item.translatedText,
                    culturalNotes: item.culturalNotes,
                  });
                }}
                className="p-2.5 rounded-xl bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-200 hover:border-indigo-500/50 cursor-pointer transition-all text-xs space-y-1"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>
                    {item.sourceLang.toUpperCase()} ➔ {item.targetLang.toUpperCase()}
                  </span>
                  <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="text-slate-200 dark:text-slate-200 light:text-slate-800 font-medium truncate">
                  {item.sourceText}
                </div>
                <div className="text-indigo-400 dark:text-indigo-300 light:text-indigo-600 truncate">
                  {item.translatedText}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
