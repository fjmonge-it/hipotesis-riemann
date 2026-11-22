import assert from 'node:assert/strict';
import { test } from 'node:test';
import { complexLabel, criticalStrip, project } from '../js/coordinates.js';
import { distributionModel, distributionReading } from '../js/distribution.js';
import { logarithmicIntegral, primeCount, primeDeviation } from '../js/primes.js';
import { nontrivialZeros } from '../js/zeta.js';

test('el plano proyecta correctamente positivos, negativos y ceros', () => {
  const bounds = { xMin: -4, xMax: 4, yMin: -4, yMax: 4 };
  const frame = { left: 10, top: 20, width: 80, height: 80 };
  assert.deepEqual(project(0, 0, bounds, frame), { x: 50, y: 60 });
  assert.deepEqual(project(2, 3, bounds, frame), { x: 70, y: 30 });
  assert.deepEqual(project(-2, -3, bounds, frame), { x: 30, y: 90 });
  assert.equal(complexLabel(2, -3), '2 − 3i');
  assert.equal(complexLabel(-2, 0), '−2');
  assert.equal(complexLabel(0, 3), '3i');
  assert.equal(complexLabel(0, -3), '−3i');
  assert.equal(complexLabel(0, 0), '0');
  assert.equal(complexLabel(0.5, 21.02204, 6), '0,5 + 21,022040i');
});

test('la recta crítica proyectada ocupa el centro de la banda y atraviesa los cinco puntos', () => {
  const bounds = { xMin: -0.25, xMax: 1.25, yMin: 0, yMax: 36 };
  const frame = { left: 43, top: 22, width: 266, height: 242 };
  assert.deepEqual(criticalStrip, { left: 0, right: 1, line: 0.5 });
  const left = project(criticalStrip.left, 0, bounds, frame).x;
  const right = project(criticalStrip.right, 0, bounds, frame).x;
  const middle = project(criticalStrip.line, 0, bounds, frame).x;
  assert.equal(middle, (left + right) / 2);
  for (const zero of nontrivialZeros) assert.equal(project(zero.real, zero.imaginary, bounds, frame).x, middle);
});

test('los recuentos y lecturas coinciden con la integral logarítmica estándar', () => {
  assert.equal(primeCount(10), 4);
  assert.ok(Math.abs(logarithmicIntegral(2) - 1.045163780117493) < 1e-14);
  for (const [x, count, estimate] of [
    [100, 25, 30.12614158407963], [1000, 168, 177.60965799015223],
    [10000, 1229, 1246.1372158993885], [100000, 9592, 9629.809001050798],
  ]) {
    const model = distributionModel(x);
    const reading = distributionReading(x, model.primes);
    assert.equal(reading.count, count);
    assert.ok(Math.abs(reading.estimate - estimate) < 8 * Number.EPSILON * estimate);
    assert.equal(reading.error, primeDeviation(x));
    assert.equal(reading.error, reading.count - reading.estimate);
    assert.ok(reading.error < 0);
    const { jump, ...lastSample } = model.samples.at(-1);
    assert.equal(jump, 0);
    assert.deepEqual(lastSample, reading);
  }
});

test('los datos de ambas gráficas saltan solo en los primos y conservan la desviación', () => {
  const model = distributionModel(100);
  assert.deepEqual(model.samples.filter(sample => sample.jump).map(sample => sample.x), model.primes);
  for (const { jump, ...sample } of model.samples) {
    assert.deepEqual(sample, distributionReading(sample.x, model.primes));
  }
  const before = distributionReading(12, model.primes);
  const after = distributionReading(13, model.primes);
  assert.equal(after.count, before.count + 1);
  assert.ok(after.estimate > before.estimate);
  assert.ok(after.error > before.error);
});
