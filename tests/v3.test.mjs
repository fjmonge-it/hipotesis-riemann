import assert from 'node:assert/strict';
import { test } from 'node:test';
import { consecutivePrimes, gapsUpTo, nearbyPairs, summarizeGaps } from '../js/prime-gaps.js';
import { zeroGroup } from '../js/complex-experiments.js';
import { nontrivialZeros } from '../js/zeta.js';

test('el explorador empieza estrictamente después del origen y continúa la secuencia', () => {
  const first = consecutivePrimes(150000, 5);
  assert.deepEqual(first, [150001, 150011, 150041, 150053, 150061]);
  assert.deepEqual([...first, ...consecutivePrimes(first.at(-1), 10)], consecutivePrimes(150000, 15));
  assert.equal(consecutivePrimes(150001, 5)[0], 150011);
});

test('las estadísticas abarcan todas las parejas y no solo las barras agrupadas', () => {
  const pairs = gapsUpTo(100);
  const stats = summarizeGaps(pairs);
  assert.equal(stats.min, 1);
  assert.deepEqual(stats.max, { start: 89, end: 97, gap: 8 });
  assert.ok(Math.abs(stats.mean - (97 - 2) / 24) < 1e-12);
});

test('los 50 ceros se reparten de diez en diez sin alterar sus coordenadas', () => {
  const groups = [0, 10, 20, 30, 40].map(zeroGroup);
  assert.deepEqual(groups.flatMap(group => group.points), nontrivialZeros);
  for (const { points, min, max, step } of groups) {
    assert.equal(points.length, 10);
    assert.ok(min <= points[0].imaginary && max >= points.at(-1).imaginary);
    assert.ok((max - min) / step <= 6);
  }
  assert.ok(nontrivialZeros.every((zero, i) => zero.real === .5 && (i === 0 || zero.imaginary > nontrivialZeros[i - 1].imaginary)));
  assert.equal(nontrivialZeros[49].imaginary, 143.111846);
});

test('la ventana conserva hasta cinco vecinos a cada lado y las estadísticas usan todas las parejas', () => {
  const pairs = gapsUpTo(100);
  assert.equal(nearbyPairs(pairs, 0).length, 6);
  assert.deepEqual(nearbyPairs(pairs, 10), pairs.slice(5, 16));
  assert.deepEqual(nearbyPairs(pairs, 23), pairs.slice(18));
  assert.equal(summarizeGaps(nearbyPairs(pairs, 0)).max.gap, 4);
  assert.equal(summarizeGaps(pairs).max.gap, 8);
});
