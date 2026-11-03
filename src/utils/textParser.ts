export interface ExtractedVocab {
  word: string;
  meaning: string;
}

/**
 * Extracts vocabulary pairs from model responses.
 * Matches patterns like:
 * 💡 Vocabulário Útil: [Palavra] - [Significado]
 * or bullet points with: - **Word**: Meaning or Word - Meaning
 */
export function extractVocabFromText(text: string): ExtractedVocab[] {
  const results: ExtractedVocab[] = [];
  const seenWords = new Set<string>();

  // Pattern 1: 💡 Vocabulário Útil: Word - Meaning
  const vocabRegex1 = /💡\s*Vocabulário\s*Útil:\s*\*?([^\n\r-]+?)\*?\s*[-–—:]\s*([^\n\r]+)/gi;
  let match: RegExpExecArray | null;

  while ((match = vocabRegex1.exec(text)) !== null) {
    const rawWord = match[1].replace(/[*_`[\]]/g, '').trim();
    const rawMeaning = match[2].replace(/[*_`]/g, '').trim();
    if (rawWord && rawMeaning && !seenWords.has(rawWord.toLowerCase())) {
      seenWords.add(rawWord.toLowerCase());
      results.push({ word: rawWord, meaning: rawMeaning });
    }
  }

  // Pattern 2: List items under Vocabulário section
  const sectionRegex = /(?:Vocabulário|Vocabulary|Palavras Úteis)[\s\S]*?(?=(?:(?:\r?\n\s*\r?\n)|$|✏️|❓|📘))/i;
  const sectionMatch = text.match(sectionRegex);
  if (sectionMatch) {
    const lines = sectionMatch[0].split('\n');
    for (const line of lines) {
      const lineMatch = line.match(/^\s*[-*•]\s*\*?([^\n\r:–—-]+?)\*?\s*[:–—-]\s*(.+)$/);
      if (lineMatch) {
        const word = lineMatch[1].replace(/[*_`[\]]/g, '').trim();
        const meaning = lineMatch[2].replace(/[*_`]/g, '').trim();
        if (word && meaning && !seenWords.has(word.toLowerCase()) && word.length < 40) {
          seenWords.add(word.toLowerCase());
          results.push({ word, meaning });
        }
      }
    }
  }

  return results;
}

/**
 * Extracts correction sections like ✏️ Correção Sugerida
 */
export function extractCorrectionSection(text: string): string | null {
  const correctionRegex = /(?:✏️|📝)\s*(?:Correção Sugerida|Correction|Feedback)[:\s]*([\s\S]*?)(?=(?:\r?\n\s*\r?\n\s*💡|\r?\n\s*\r?\n\s*❓|\r?\n\s*\r?\n\s*📘|$))/i;
  const match = text.match(correctionRegex);
  if (match && match[1]) {
    return match[1].trim();
  }
  return null;
}

/**
 * Sanitizes and formats markdown text for clean chat presentation
 */
export function formatTutorChatText(text: string): string {
  if (!text) return '';
  return text.trim();
}
