import test from 'node:test';
import assert from 'node:assert/strict';
import { extractVocabFromText, extractCorrectionSection } from './textParser';

test('extractVocabFromText parses single line vocab with lightbulb emoji', () => {
  const text = `
Muito bem! Aqui está o seu feedback.
💡 Vocabulário Útil: Serendipity - Ocorrência de acontecimentos felizes por acaso
Como você usaria essa palavra?
  `;

  const vocab = extractVocabFromText(text);
  assert.equal(vocab.length, 1);
  assert.equal(vocab[0].word, 'Serendipity');
  assert.equal(vocab[0].meaning, 'Ocorrência de acontecimentos felizes por acaso');
});

test('extractVocabFromText parses multiple vocabularies', () => {
  const text = `
💡 Vocabulário Útil: **Resilient** - Capaz de se recuperar rapidamente
💡 Vocabulário Útil: **Flabbergasted** - Extremamente surpreso ou chocado
  `;

  const vocab = extractVocabFromText(text);
  assert.equal(vocab.length, 2);
  assert.equal(vocab[0].word, 'Resilient');
  assert.equal(vocab[1].word, 'Flabbergasted');
});

test('extractVocabFromText deduplicates duplicate words', () => {
  const text = `
💡 Vocabulário Útil: Beacon - Farol ou guia
💡 Vocabulário Útil: beacon - Sinal de luz
  `;

  const vocab = extractVocabFromText(text);
  assert.equal(vocab.length, 1);
  assert.equal(vocab[0].word, 'Beacon');
});

test('extractCorrectionSection extracts correction blocks', () => {
  const text = `
Ótima tentativa!
✏️ Correção Sugerida:
Em vez de "I have 25 years", em inglês dizemos "I am 25 years old".

💡 Vocabulário Útil: Age - Idade
  `;

  const correction = extractCorrectionSection(text);
  assert.ok(correction);
  assert.match(correction, /Em vez de "I have 25 years"/);
});
