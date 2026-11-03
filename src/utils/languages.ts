import { Language } from '../types';

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'Inglês', nativeName: 'English', flag: '🇺🇸', speechCode: 'en-US' },
  { code: 'es', name: 'Espanhol', nativeName: 'Español', flag: '🇪🇸', speechCode: 'es-ES' },
  { code: 'pt', name: 'Português (Brasil)', nativeName: 'Português', flag: '🇧🇷', speechCode: 'pt-BR' },
  { code: 'fr', name: 'Francês', nativeName: 'Français', flag: '🇫🇷', speechCode: 'fr-FR' },
  { code: 'de', name: 'Alemão', nativeName: 'Deutsch', flag: '🇩🇪', speechCode: 'de-DE' },
  { code: 'it', name: 'Italiano', nativeName: 'Italiano', flag: '🇮🇹', speechCode: 'it-IT' },
  { code: 'ja', name: 'Japonês', nativeName: '日本語', flag: '🇯🇵', speechCode: 'ja-JP' },
  { code: 'zh', name: 'Mandarim', nativeName: '中文', flag: '🇨🇳', speechCode: 'zh-CN' },
  { code: 'ko', name: 'Coreano', nativeName: '한국어', flag: '🇰🇷', speechCode: 'ko-KR' },
  { code: 'ru', name: 'Russo', nativeName: 'Русский', flag: '🇷🇺', speechCode: 'ru-RU' },
  { code: 'ar', name: 'Árabe', nativeName: 'العربية', flag: '🇸🇦', speechCode: 'ar-SA' },
  { code: 'nl', name: 'Holandês', nativeName: 'Nederlands', flag: '🇳🇱', speechCode: 'nl-NL' },
  { code: 'pl', name: 'Polonês', nativeName: 'Polski', flag: '🇵🇱', speechCode: 'pl-PL' },
  { code: 'tr', name: 'Turco', nativeName: 'Türkçe', flag: '🇹🇷', speechCode: 'tr-TR' },
  { code: 'sv', name: 'Sueco', nativeName: 'Svenska', flag: '🇸🇪', speechCode: 'sv-SE' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', speechCode: 'hi-IN' }
];

export function getLanguageByCode(code: string): Language | undefined {
  if (code === 'auto') return undefined;
  return LANGUAGES.find((lang) => lang.code === code);
}

export function getLanguageName(code: string, fallback = 'Idioma Detectado'): string {
  if (code === 'auto') return '🌐 Detectar Idioma Auto';
  const lang = getLanguageByCode(code);
  return lang ? `${lang.flag} ${lang.name}` : fallback;
}

export function getSpeechCode(code: string): string {
  const lang = getLanguageByCode(code);
  return lang ? lang.speechCode : 'pt-BR';
}

export const POPULAR_LANGUAGE_PAIRS = [
  { source: 'pt', target: 'en', label: '🇧🇷 PT ➔ 🇺🇸 EN' },
  { source: 'en', target: 'pt', label: '🇺🇸 EN ➔ 🇧🇷 PT' },
  { source: 'pt', target: 'es', label: '🇧🇷 PT ➔ 🇪🇸 ES' },
  { source: 'pt', target: 'fr', label: '🇧🇷 PT ➔ 🇫🇷 FR' },
  { source: 'pt', target: 'de', label: '🇧🇷 PT ➔ 🇩🇪 DE' },
  { source: 'pt', target: 'it', label: '🇧🇷 PT ➔ 🇮🇹 IT' },
];

export const SAMPLE_TRANSLATION_PROMPTS = [
  { label: 'Viagem & Hotel', text: 'Gostaria de fazer o check-in antecipado, se possível. Há taxa adicional?' },
  { label: 'Restaurante', text: 'Você tem opções vegetarianas ou sem glúten no cardápio de hoje?' },
  { label: 'Negócios', text: 'Agradeço pelo retorno e gostaria de agendar uma reunião para alinhar os próximos passos.' },
  { label: 'Expressão Cotidiana', text: 'Quebrar o gelo em uma conversa nem sempre é uma tarefa fácil.' },
];
