import assert from 'node:assert/strict';
import { test } from 'node:test';
import { consecutivePrimes, gapsUpTo, summarizeGaps } from '../js/prime-gaps.js';
import { zeroScale } from '../js/complex-experiments.js';
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

test('las escalas contienen todos los ceros elegibles con marcas espaciadas', () => {
  let previous = 0;
  for (const count of [1, 3, 5, 10, 20, 50]) {
    const highest = nontrivialZeros[count - 1].imaginary;
    const { step, max } = zeroScale(highest);
    assert.ok(max > highest);
    assert.ok(max >= previous);
    assert.ok(max / step <= 5);
    previous = max;
  }
  assert.ok(nontrivialZeros.every((zero, i) => zero.real === .5 && (i === 0 || zero.imaginary > nontrivialZeros[i - 1].imaginary)));
  assert.equal(nontrivialZeros[49].imaginary, 143.111846);
});
