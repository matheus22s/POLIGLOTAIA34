import test from 'node:test';
import assert from 'node:assert/strict';
import { LANGUAGES, getLanguageByCode, getLanguageName, getSpeechCode } from './languages';

test('languages list contains major world languages', () => {
  assert.ok(LANGUAGES.length >= 10);
  const en = LANGUAGES.find((l) => l.code === 'en');
  const pt = LANGUAGES.find((l) => l.code === 'pt');
  const es = LANGUAGES.find((l) => l.code === 'es');
  assert.ok(en);
  assert.ok(pt);
  assert.ok(es);
});

test('getLanguageByCode returns correct language or undefined for auto', () => {
  assert.equal(getLanguageByCode('en')?.code, 'en');
  assert.equal(getLanguageByCode('pt')?.speechCode, 'pt-BR');
  assert.equal(getLanguageByCode('auto'), undefined);
  assert.equal(getLanguageByCode('xyz'), undefined);
});

test('getLanguageName returns formatted name with flag', () => {
  assert.match(getLanguageName('en'), /🇺🇸/);
  assert.match(getLanguageName('auto'), /Detectar/);
});

test('getSpeechCode returns valid locale string', () => {
  assert.equal(getSpeechCode('es'), 'es-ES');
  assert.equal(getSpeechCode('fr'), 'fr-FR');
  assert.equal(getSpeechCode('unknown'), 'pt-BR');
});
