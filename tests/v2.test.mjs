import assert from 'node:assert/strict';
import { test } from 'node:test';
import { nextPrime, gapsUpTo, peakBuckets } from '../js/prime-gaps.js';
import { comparisonReading, distributionModel, normalizedEnvelope, relativeEnvelope, relativeOscillation } from '../js/distribution.js';
import { realSeries, zetaEvolution } from '../js/zeta.js';
import { numberLabel } from '../js/v2-chart.js';

test('la búsqueda obtiene primos consecutivos exactos y conserva sus cifras', () => {
  assert.equal(nextPrime(150000), 150001);
  assert.equal(nextPrime(1000000), 1000003);
  assert.equal(nextPrime(25000000), 25000009);
  assert.equal(nextPrime(25000009), 25000033);
  assert.equal(numberLabel(25000009), '25.000.009');
  assert.throws(() => nextPrime(1.5), RangeError);
});

test('los tramos conservan el máximo de cada cubeta y el récord global', () => {
  const pairs = gapsUpTo(1000000);
  assert.deepEqual(pairs.slice(0, 3), [
    { start: 2, end: 3, gap: 1 }, { start: 3, end: 5, gap: 2 }, { start: 5, end: 7, gap: 2 },
  ]);
  const peaks = peakBuckets(pairs, 1000000);
  assert.equal(peaks.length, 72);
  assert.deepEqual(peaks.reduce((max, pair) => pair.gap > max.gap ? pair : max),
    { start: 492113, end: 492227, gap: 114 });
});

test('la serie finita no inventa límites por debajo o en el polo', () => {
  for (const s of [-2, 0, 0.5, 1]) {
    const short = realSeries(s, 500);
    const long = realSeries(s, 10000);
    assert.equal(short.reference, null);
    assert.equal(long.reference, null);
    assert.ok(long.sums.at(-1) > short.sums.at(-1));
  }
  assert.ok(Math.abs(realSeries(.5, 500).sums.at(-1) - 43.283361994182174) < 1e-11);
  assert.equal(realSeries(-2, 10).sums.at(-1), 385);
  assert.ok(Math.abs(realSeries(2, 100000).reference - Math.PI ** 2 / 6) < 1e-14);
  assert.throws(() => realSeries(0, 100001), RangeError);
});

test('s decimal cambia realmente los factores del producto de Euler', () => {
  const a = zetaEvolution(1.2, 100, true);
  const b = zetaEvolution(2.5, 100, true);
  assert.equal(a.factorCount, 25);
  assert.equal(b.products.at(-1).n, 97);
  assert.equal(b.products[0].value, 1 / (1 - 2 ** -2.5));
  assert.ok(b.products.at(-1).value < a.products.at(-1).value);
});

test('los errores conservan signo y escala y la oscilación coincide con su fórmula compleja', () => {
  const { primes } = distributionModel(100);
  const reading = comparisonReading(100, primes);
  assert.equal(reading.count, 25);
  assert.ok(Math.abs(reading.simple - 21.71472409516259) < 1e-13);
  assert.ok(reading.simpleError > 0 && reading.error < 0);
  assert.equal(reading.simpleError, reading.count - reading.simple);
  for (const beta of [.5, .75]) {
    const t = Math.log(20);
    const gamma = 14.134725;
    const direct = Math.exp((beta - 1) * t) *
      (beta * Math.cos(gamma * t) + gamma * Math.sin(gamma * t)) / (beta ** 2 + gamma ** 2);
    assert.ok(Math.abs(relativeOscillation(t, beta, gamma) - direct) < 1e-15);
  }
});

test('las ondas quedan entre las envolventes exactas y la normalización parte del 100 %', () => {
  const start = Math.log(2);
  const gamma = 14.134725;
  for (const beta of [0.5, 0.75]) {
    assert.equal(normalizedEnvelope(start, beta, start), 1);
    for (const x of [2, 10, 100, 1000]) {
      const t = Math.log(x);
      const amplitude = relativeEnvelope(t, beta, gamma);
      assert.ok(Math.abs(relativeOscillation(t, beta, gamma)) <= amplitude);
      assert.ok(Math.abs(amplitude - x ** (beta - 1) / Math.hypot(beta, gamma)) < 1e-15);
      assert.ok(Math.abs(normalizedEnvelope(t, beta, start) - amplitude / relativeEnvelope(start, beta, gamma)) < 1e-15);
    }
  }
  assert.ok(normalizedEnvelope(Math.log(1000), 0.5, start) < normalizedEnvelope(Math.log(1000), 0.75, start));
});
