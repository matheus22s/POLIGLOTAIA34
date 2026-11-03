import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Mic,
  RotateCcw,
  Sliders,
  BookOpen,
  Volume2,
  Trash2,
  Sparkles,
  Loader2,
  Check,
  Plus,
  HelpCircle,
  FileCheck2,
  MessageSquare,
  Play,
} from 'lucide-react';
import { LANGUAGES, getLanguageByCode, getSpeechCode } from '../utils/languages';
import { extractVocabFromText, extractCorrectionSection } from '../utils/textParser';
import { ChatMessage, VocabItem, TutorLevel, TutorStyle } from '../types';

interface TutorViewProps {
  initialPrompt?: string;
  initialLangCode?: string;
  savedVocabList: VocabItem[];
  onSaveVocab: (word: string, meaning: string, langCode: string) => void;
  onRemoveVocab: (id: string) => void;
  onOpenFlashcards: () => void;
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}

export const TutorView: React.FC<TutorViewProps> = ({
  initialPrompt,
  initialLangCode,
  savedVocabList,
  onSaveVocab,
  onRemoveVocab,
  onOpenFlashcards,
  showToast,
}) => {
  const [tutorLangCode, setTutorLangCode] = useState<string>(initialLangCode || 'en');
  const [tutorLevel, setTutorLevel] = useState<TutorLevel>('Intermediário (B1-B2)');
  const [tutorStyle, setTutorStyle] = useState<TutorStyle>('encorajador e amigável');
  const [tutorScenario, setTutorScenario] = useState<string>('Livre / Conversação Geral');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const currentLang = getLanguageByCode(tutorLangCode) || LANGUAGES[0];

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Initial welcome message when changing settings or on mount
  useEffect(() => {
    initWelcomeMessage();
  }, [tutorLangCode, tutorLevel, tutorStyle, tutorScenario]);

  // Handle external incoming prompt from translation "Explicar com Tutor IA"
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      sendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  const initWelcomeMessage = () => {
    const langObj = getLanguageByCode(tutorLangCode) || LANGUAGES[0];
    const scenarioText = tutorScenario !== 'Livre / Conversação Geral' ? ` Cenário atual: **${tutorScenario}**.` : '';

    const welcome: ChatMessage = {
      id: 'welcome-' + Date.now(),
      role: 'model',
      text: `Olá! Sou seu professor e tutor dedicado de **${langObj.name}** (${langObj.flag}).
Estou configurado no nível **${tutorLevel}** com estilo **${tutorStyle}**.${scenarioText}

Podemos bater um papo descontraído, esclarecer dúvidas gramaticais, expandir seu vocabulário ou simular situações reais. Sobre o que gostaria de conversar?`,
      timestamp: Date.now(),
    };
    setMessages([welcome]);
  };

  const handleResetChat = () => {
    initWelcomeMessage();
    showToast('Conversa com o tutor reiniciada!', 'info');
  };

  const sendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      text: content,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          history: messages.slice(-10).map((m) => ({ role: m.role, text: m.text })),
          langCode: tutorLangCode,
          langName: currentLang.name,
          level: tutorLevel,
          style: tutorStyle,
          scenario: tutorScenario,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha na resposta do tutor.');
      }

      const data = await response.json();
      const replyText = data.reply || '';

      // Extract vocab suggestions and corrections
      const extractedVocab = extractVocabFromText(replyText);
      const correction = extractCorrectionSection(replyText);

      // Auto-save discovered vocab
      extractedVocab.forEach((item) => {
        onSaveVocab(item.word, item.meaning, tutorLangCode);
      });

      const modelMsg: ChatMessage = {
        id: 'model-' + Date.now(),
        role: 'model',
        text: replyText,
        timestamp: Date.now(),
        suggestedCorrection: correction || undefined,
        suggestedVocab: extractedVocab.length > 0 ? extractedVocab : undefined,
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err) {
      console.error(err);
      showToast('Erro ao receber resposta do tutor.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Speech Recognition
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
      recognition.lang = getSpeechCode(tutorLangCode);

      recognition.onstart = () => {
        setIsListening(true);
        showToast(`Fale agora em ${currentLang.name}...`, 'info');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputText(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        showToast('Erro ao capturar microfone.', 'error');
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

  // Web Speech synthesis
  const speakText = (text: string) => {
    if (!text || text.trim() === '') return;
    if (!('speechSynthesis' in window)) {
      showToast('Síntese de voz não suportada pelo navegador.', 'error');
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown formatting before speaking
    const clean = text.replace(/[*_#`[\]]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = getSpeechCode(tutorLangCode);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const isWordSaved = (word: string) => {
    return savedVocabList.some((v) => v.word.toLowerCase() === word.toLowerCase());
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-4 max-w-7xl w-full mx-auto h-[calc(100vh-140px)] min-h-[550px]">
      {/* Left Sidebar: Tutor Controls & Vocab List */}
      <aside className="w-full md:w-80 flex flex-col gap-4 overflow-y-auto">
        {/* Tutor Configuration Card */}
        <div className="bg-slate-900/70 dark:bg-slate-900/70 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl p-4 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm flex items-center gap-2 text-indigo-400">
              <Sliders className="w-4 h-4" />
              <span>Configurações da Aula</span>
            </h2>
            <button
              onClick={handleResetChat}
              className="text-xs text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition-colors"
              title="Reiniciar Conversa"
              aria-label="Reiniciar conversa com o professor"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar</span>
            </button>
          </div>

          {/* Practice Language */}
          <div>
            <label htmlFor="tutor-lang-select" className="block text-xs font-medium text-slate-400 mb-1">
              Idioma de Prática
            </label>
            <select
              id="tutor-lang-select"
              value={tutorLangCode}
              onChange={(e) => setTutorLangCode(e.target.value)}
              className="w-full bg-slate-950 dark:bg-slate-950 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 dark:text-slate-200 light:text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              {LANGUAGES.map((lang) => (
                <option key={`tutor-lang-${lang.code}`} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Proficiency Level */}
          <div>
            <label htmlFor="tutor-level-select" className="block text-xs font-medium text-slate-400 mb-1">
              Seu Nível Atual
            </label>
            <select
              id="tutor-level-select"
              value={tutorLevel}
              onChange={(e) => setTutorLevel(e.target.value as TutorLevel)}
              className="w-full bg-slate-950 dark:bg-slate-950 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 dark:text-slate-200 light:text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="Iniciante (A1-A2)">Iniciante (A1-A2)</option>
              <option value="Intermediário (B1-B2)">Intermediário (B1-B2)</option>
              <option value="Avançado (C1-C2)">Avançado (C1-C2)</option>
            </select>
          </div>

          {/* Teaching Persona */}
          <div>
            <label htmlFor="tutor-style-select" className="block text-xs font-medium text-slate-400 mb-1">
              Estilo Pedagógico
            </label>
            <select
              id="tutor-style-select"
              value={tutorStyle}
              onChange={(e) => setTutorStyle(e.target.value as TutorStyle)}
              className="w-full bg-slate-950 dark:bg-slate-950 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 dark:text-slate-200 light:text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="encorajador e amigável">😊 Encorajador e Paciente</option>
              <option value="rigoroso com foco total em gramática">✏️ Foco Gramatical Rigoroso</option>
              <option value="conversacional e informal (gírias e expressões do dia a dia)">
                🗣️ Conversação Informal & Gírias
              </option>
              <option value="negócios e profissional">💼 Negócios & Corporativo</option>
            </select>
          </div>

          {/* Scenario */}
          <div>
            <label htmlFor="tutor-scenario-select" className="block text-xs font-medium text-slate-400 mb-1">
              Cenário de Prática
            </label>
            <select
              id="tutor-scenario-select"
              value={tutorScenario}
              onChange={(e) => setTutorScenario(e.target.value)}
              className="w-full bg-slate-950 dark:bg-slate-950 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 dark:text-slate-200 light:text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="Livre / Conversação Geral">🌐 Livre / Conversação Geral</option>
              <option value="🍽️ Fazendo pedido em restaurante">🍽️ Fazendo pedido em restaurante</option>
              <option value="✈️ Aeroporto e controle de imigração">✈️ Aeroporto e imigração</option>
              <option value="🏨 Check-in e atendimento em hotel">🏨 Check-in em hotel</option>
              <option value="💼 Entrevista de emprego e carreira">💼 Entrevista de emprego</option>
              <option value="🩺 Consulta médica e sintomas de saúde">🩺 Consulta médica</option>
            </select>
          </div>
        </div>

        {/* Vocabulary Saved Cards Section */}
        <div className="flex-1 bg-slate-900/70 dark:bg-slate-900/70 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl p-4 flex flex-col overflow-hidden shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-xs flex items-center gap-1.5 text-slate-300 dark:text-slate-300 light:text-slate-700">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Vocabulário Salvo</span>
            </h3>
            <span className="bg-indigo-600/20 text-indigo-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
              {savedVocabList.length}
            </span>
          </div>

          {savedVocabList.length > 0 && (
            <button
              onClick={onOpenFlashcards}
              className="w-full mb-3 py-1.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm hover:brightness-110 transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Praticar Flashcards</span>
            </button>
          )}

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
            {savedVocabList.length === 0 ? (
              <div className="text-slate-500 dark:text-slate-500 light:text-slate-400 text-center py-6 italic text-[11px] leading-relaxed">
                Nenhum vocabulário destacado ainda. Durante a aula, o professor sugerirá termos úteis que você pode salvar!
              </div>
            ) : (
              savedVocabList.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950/70 dark:bg-slate-950/70 light:bg-slate-50 p-2.5 rounded-xl border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 flex items-center justify-between group hover:border-indigo-500/40 transition-colors"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="font-semibold text-indigo-400 text-xs truncate">{item.word}</div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-600 truncate">
                      {item.meaning}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => speakText(item.word)}
                      className="p-1 text-slate-400 hover:text-indigo-400 transition-colors"
                      title="Ouvir Pronúncia"
                      aria-label={`Ouvir pronúncia de ${item.word}`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onRemoveVocab(item.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors opacity-70 group-hover:opacity-100"
                      title="Excluir"
                      aria-label={`Remover ${item.word}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <section className="flex-1 bg-slate-900/50 dark:bg-slate-900/50 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
        {/* Chat Top Bar */}
        <div className="p-3.5 border-b border-slate-800 dark:border-slate-800 light:border-slate-200 bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-indigo-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-200 dark:text-slate-200 light:text-slate-800 flex items-center gap-1.5">
                <span>Prof. Polyglot</span>
                <span className="text-xs text-slate-400 font-normal">
                  ({currentLang.flag} {currentLang.name})
                </span>
              </h3>
              <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Online • Correção em tempo real</span>
              </div>
            </div>
          </div>

          {/* Quick Action Chips */}
          <div className="hidden lg:flex items-center space-x-2 text-xs">
            <button
              onClick={() => sendMessage('Por favor, corrija meu último texto de forma detalhada e aponte melhorias.')}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 dark:bg-slate-800/80 light:bg-slate-100 hover:bg-slate-700 text-slate-300 light:text-slate-700 border border-slate-700/50 transition-colors flex items-center gap-1"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Corrigir Texto</span>
            </button>
            <button
              onClick={() => sendMessage('Me explique uma regra gramatical essencial para este idioma com exemplos claros.')}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 dark:bg-slate-800/80 light:bg-slate-100 hover:bg-slate-700 text-slate-300 light:text-slate-700 border border-slate-700/50 transition-colors flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Regra do Dia</span>
            </button>
            <button
              onClick={() => sendMessage('Faça um quiz rápido de múltipla escolha com 3 perguntas para testar meus conhecimentos!')}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 dark:bg-slate-800/80 light:bg-slate-100 hover:bg-slate-700 text-slate-300 light:text-slate-700 border border-slate-700/50 transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Quiz Rápido</span>
            </button>
          </div>
        </div>

        {/* Chat Messages Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-sm" id="chat-messages-container">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[88%] sm:max-w-[78%] rounded-2xl p-4 shadow-sm space-y-2.5 ${
                    isUser
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-none'
                      : 'bg-slate-800/90 dark:bg-slate-800/90 light:bg-slate-100 text-slate-100 dark:text-slate-100 light:text-slate-800 rounded-bl-none border border-slate-700/50 dark:border-slate-700/50 light:border-slate-200'
                  }`}
                >
                  {/* Message Header */}
                  <div className="flex items-center justify-between text-[11px] opacity-75 border-b border-white/10 dark:border-white/10 light:border-slate-200 pb-1.5">
                    <span className="font-semibold">{isUser ? 'Você' : `Prof. Polyglot (${currentLang.flag})`}</span>
                    {!isUser && (
                      <button
                        onClick={() => speakText(msg.text)}
                        className="hover:text-indigo-400 p-1 transition-colors rounded"
                        title="Ouvir em Voz Alta"
                        aria-label="Ouvir mensagem do professor em voz alta"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Message Body */}
                  <div className="whitespace-pre-wrap leading-relaxed text-sm">
                    {msg.text}
                  </div>

                  {/* Correction Callout Card */}
                  {msg.suggestedCorrection && (
                    <div className="mt-2 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 light:text-amber-900 text-xs space-y-1">
                      <div className="font-semibold flex items-center gap-1.5 text-amber-400">
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>✏️ Correção Sugerida:</span>
                      </div>
                      <div className="whitespace-pre-wrap text-[11px] leading-relaxed">
                        {msg.suggestedCorrection}
                      </div>
                    </div>
                  )}

                  {/* Suggested Vocabulary Chips */}
                  {msg.suggestedVocab && msg.suggestedVocab.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/10 dark:border-white/10 light:border-slate-200 space-y-1.5">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-300 light:text-indigo-600 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        <span>Vocabulário da Mensagem:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedVocab.map((voc, vIdx) => {
                          const saved = isWordSaved(voc.word);
                          return (
                            <button
                              key={vIdx}
                              onClick={() => onSaveVocab(voc.word, voc.meaning, tutorLangCode)}
                              className={`text-[11px] px-2 py-0.5 rounded-lg border flex items-center gap-1 transition-colors ${
                                saved
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : 'bg-slate-900/60 dark:bg-slate-900/60 light:bg-white text-indigo-300 light:text-indigo-600 border-indigo-500/30 hover:border-indigo-400'
                              }`}
                              title={saved ? 'Já salvo no seu vocabulário' : 'Clique para salvar'}
                            >
                              <span>{voc.word}</span>
                              <span className="opacity-75">({voc.meaning})</span>
                              {saved ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Plus className="w-2.5 h-2.5" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800/90 dark:bg-slate-800/90 light:bg-slate-100 rounded-2xl rounded-bl-none p-3.5 border border-slate-700/50 dark:border-slate-700/50 light:border-slate-200">
                <div className="flex items-center space-x-2 text-indigo-400 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>O professor está formulando a resposta personalizada...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Controls */}
        <div className="p-3 border-t border-slate-800 dark:border-slate-800 light:border-slate-200 bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`p-2.5 rounded-xl border transition-colors relative ${
                isListening
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                  : 'bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-300 light:text-slate-700 border-slate-700/50 hover:text-indigo-400 hover:bg-slate-700'
              }`}
              title={isListening ? 'Parar Gravação' : `Falar em ${currentLang.name}`}
              aria-label="Gravar fala para enviar ao tutor"
            >
              <Mic className="w-4 h-4" />
              {isListening && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
              )}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Escreva ou pratique sua mensagem em ${currentLang.name}...`}
              disabled={isLoading}
              className="flex-1 bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-xl px-4 py-2.5 text-slate-100 dark:text-slate-100 light:text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm leading-relaxed"
              aria-label="Mensagem para o tutor"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white transition-all shadow-md active:scale-95 flex items-center justify-center"
              aria-label="Enviar mensagem"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
