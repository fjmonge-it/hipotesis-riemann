import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const article = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

function startTag(tag, id) {
  const match = article.match(new RegExp('<' + tag + '\\b[^>]*\\bid="' + id + '"[^>]*>'));
  assert.ok(match, 'Control ausente: ' + id);
  return match[0];
}

function defaultOption(id) {
  const start = startTag('select', id);
  const options = article.slice(article.indexOf(start) + start.length).split('</select>', 1)[0];
  const match = options.match(/<option\b([^>]*\bselected\b[^>]*)>([^<]*)<\/option>/);
  assert.ok(match, 'Opción inicial ausente: ' + id);
  return match[1].match(/\bvalue="([^"]+)"/)?.[1] ?? match[2].trim();
}

test('la hipótesis se explica antes de mostrar desde el principio la recta', () => {
  assert.equal(defaultOption('cantidad-ceros'), '1');
  assert.ok(article.indexOf('id="figura-recta-critica"') < article.indexOf('id="experimento-ceros"'));
  assert.doesNotMatch(article, /id="mostrar-recta"/);
});

test('el recuento comienza en 100 y las gráficas se pueden enfocar', () => {
  assert.equal(defaultOption('limite-distribucion'), '100');
  assert.doesNotMatch(article, /id="(?:x-distribucion|x-exacto)"/);
  assert.match(article, /<svg tabindex="0" role="slider" aria-label="Número estudiado en la gráfica de recuento"/);
});
