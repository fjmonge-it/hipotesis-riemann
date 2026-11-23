import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { comparisonReading, estimateCurve, estimateError, normalizedEnvelope } from '../js/distribution.js';
import { zetaTerms, numericFraction, eulerFactor } from '../js/math-format.js';
import { formatInteger } from '../js/distribution-chart.js';
import { gapOverview } from '../js/prime-gaps.js';
import { primesUpTo } from '../js/primes.js';

test('la recta termina en el 23 y cada distancia se mide en una escala uniforme', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const figure = html.split('id="figura-primos"')[1].split('</figure>')[0];
  assert.doesNotMatch(figure, />24<|al 24/);
  const dots = [...figure.matchAll(/<circle class="example-point" cx="(\d+)".*?<text[^>]*>(\d+)<\/text>/g)];
  assert.deepEqual(dots.map(dot => Number(dot[2])), primesUpTo(23));
  assert.ok(dots.every(dot => (Number(dot[2]) - 1) * 13 + 19 === Number(dot[1])));
  assert.match(html, /ζ\(−2\) = 0/);
});

test('media y máxima se calculan sobre todas las parejas de cada intervalo', () => {
  const overview = gapOverview();
  assert.deepEqual(overview.map(row => row.max), [
    { start: 89, end: 97, gap: 8 }, { start: 887, end: 907, gap: 20 },
    { start: 9551, end: 9587, gap: 36 }, { start: 31397, end: 31469, gap: 72 },
    { start: 492113, end: 492227, gap: 114 },
  ]);
  assert.deepEqual(overview.map(row => row.mean.toFixed(2)), ['3.96', '5.96', '8.12', '10.43', '12.74']);
});

test('las fracciones de la zeta conservan los denominadores y sus valores', () => {
  assert.deepEqual(zetaTerms(2).map(n => n.denominator), [4, 9, 16]);
  assert.deepEqual(zetaTerms(3).map(n => n.term), [1 / 8, 1 / 27, 1 / 64]);
  assert.equal(zetaTerms(-2)[0].term, 4);
  assert.match(numericFraction(4, 3), /<mfrac><mn>4<\/mn><mn>3<\/mn><\/mfrac>/);
  assert.match(eulerFactor(2, '2,5'), /<msup><mn>2<\/mn><mn>2,5<\/mn><\/msup>/);
});

test('los errores se calculan antes de redondear y pueden aumentar entre 12 y 13', () => {
  const primes = primesUpTo(1000000);
  const [a, b, c, d] = [12, 13, 100000, 1000000].map(x => comparisonReading(x, primes));
  assert.deepEqual([a.count, b.count, c.count, d.count], [5, 6, 9592, 78498]);
  assert.deepEqual([c.simple, c.estimate].map(formatInteger), ['8.686', '9.630']);
  assert.deepEqual([a, b, c].map(row => (100 * estimateError(row.count, row.simple).relative).toFixed(2)), ['3.42', '15.53', '9.45']);
  assert.equal((100 * estimateError(c.count, c.estimate).relative).toFixed(2), '0.39');
  assert.equal(Math.round(estimateError(c.count, c.simple).absolute), 906);
  assert.equal(Math.round(estimateError(c.count, c.estimate).absolute), 38);
  assert.equal(estimateCurve(100, primes).sampled, false);
  const curve = estimateCurve(1000000, primes);
  assert.equal(curve.sampled, true);
  assert.equal(curve.samples.at(-1).count, d.count);
});

test('la comparación conceptual conserva el 4,47 % y el 21,15 % a mil', () => {
  const start = Math.log(2);
  assert.deepEqual([.5, .75].map(beta => (100 * normalizedEnvelope(Math.log(1000), beta, start)).toFixed(2)), ['4.47', '21.15']);
});
