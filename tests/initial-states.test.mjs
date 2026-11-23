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

test('los ceros se revelan a partir de uno, con banda y sin recta', () => {
  assert.equal(defaultOption('cantidad-ceros'), '1');
  assert.doesNotMatch(article, /id="mostrar-banda"/);
  assert.match(startTag("button", "mostrar-recta"), /aria-expanded="false"/);
  assert.match(article, /<p id="descubrimiento-ceros" data-discovery hidden>/);
});

test('el recuento comienza en 100, con el punto de lectura al final del intervalo', () => {
  assert.equal(defaultOption('limite-distribucion'), '100');
  for (const id of ['x-distribucion', 'x-exacto']) {
    const input = startTag('input', id);
    assert.match(input, /\bmax="100"/);
    assert.match(input, /\bvalue="100"/);
  }
});
