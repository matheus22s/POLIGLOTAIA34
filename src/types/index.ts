export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  speechCode: string;
}

export interface TranslationResult {
  translation: string;
  detectedLanguage?: string;
  culturalNotes?: string;
  alternativeExpressions?: string[];
  keyTerms?: { term: string; meaning: string }[];
}

export interface TranslationHistoryItem {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  timestamp: number;
  culturalNotes?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  suggestedCorrection?: string;
  suggestedVocab?: { word: string; meaning: string }[];
}

export interface VocabItem {
  id: string;
  word: string;
  meaning: string;
  langCode: string;
  contextSentence?: string;
  savedAt: number;
}

export type TutorLevel = 'Iniciante (A1-A2)' | 'Intermediário (B1-B2)' | 'Avançado (C1-C2)';

export type TutorStyle =
  | 'encorajador e amigável'
  | 'rigoroso com foco total em gramática'
  | 'conversacional e informal (gírias e expressões do dia a dia)'
  | 'negócios e profissional';
