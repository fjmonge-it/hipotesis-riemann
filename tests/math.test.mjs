import assert from 'node:assert/strict';
import { test } from 'node:test';
import { logarithmicIntegral, primeCount, primeDeviation, primesUpTo } from '../js/primes.js';
import { eulerPartialProduct, nontrivialZeros, zetaPartialSum, zetaTailBounds } from '../js/zeta.js';

test('la criba excluye 0 y 1 e incluye los extremos primos', () => {
  assert.deepEqual(primesUpTo(0), []);
  assert.deepEqual(primesUpTo(1), []);
  assert.deepEqual(primesUpTo(11), [2, 3, 5, 7, 11]);
  assert.equal(primeCount(10.99), 4);
  assert.equal(primeCount(11), 5);
  assert.equal(primeCount(100), 25);
  assert.equal(primeCount(1000), 168);
});

test('las sumas parciales respetan las cotas integrales del resto', () => {
  const references = [
    [1.01, 100.5779433384968],
    [1.5, 2.612375348685488],
    [2, Math.PI ** 2 / 6],
    [2.5, 1.341487257250917],
    [4, Math.PI ** 4 / 90],
  ];
  const limit = 1000;
  for (const [s, expected] of references) {
    const sum = zetaPartialSum(s, limit);
    const { lower, upper } = zetaTailBounds(s, limit);
    assert.ok(sum + lower <= expected + 1e-9);
    assert.ok(sum + upper >= expected - 1e-9);
  }
  assert.ok(zetaTailBounds(1.01, limit).lower > 90);
});

test('la serie y el producto rechazan entradas fuera de su dominio', () => {
  for (const calculate of [zetaPartialSum, zetaTailBounds, eulerPartialProduct]) {
    for (const s of [1, 0, -1, Infinity, NaN]) {
      assert.throws(() => calculate(s, 10), RangeError);
    }
    assert.throws(() => calculate(2, 0), RangeError);
    assert.throws(() => calculate(2, 3.5), RangeError);
  }
});

test('el producto incluye exclusivamente los factores primos hasta N', () => {
  const { value, factorCount } = eulerPartialProduct(2, 10);
  const expected = [2, 3, 5, 7].reduce((product, p) => product / (1 - p ** -2), 1);
  assert.ok(Math.abs(value - expected) < 1e-14);
  assert.equal(factorCount, 4);
  assert.equal(eulerPartialProduct(2, 11).factorCount, 5);
  assert.deepEqual(eulerPartialProduct(2, 1), { value: 1, factorCount: 0 });
  assert.ok(value > zetaPartialSum(2, 10));
});

test('el producto se acerca a los valores de referencia al aumentar N', () => {
  for (const [s, expected] of [[2, Math.PI ** 2 / 6], [2.5, 1.341487257250917], [4, Math.PI ** 4 / 90]]) {
    const small = eulerPartialProduct(s, 10).value;
    const large = eulerPartialProduct(s, 1000).value;
    assert.ok(small < large && large < expected);
    assert.ok(expected - large <= zetaTailBounds(s, 1000).upper + 1e-14);
  }
});

test('los ceros no triviales tabulados conservan las coordenadas redondeadas de referencia', () => {
  // NIST DLMF 25.10(i), first three positive ordinates.
  const ordinates = [14.1347251417347, 21.0220396387716, 25.0108575801457];
  assert.equal(nontrivialZeros.length, ordinates.length);
  for (const [index, zero] of nontrivialZeros.entries()) {
    assert.equal(zero.real, 0.5);
    assert.ok(Math.abs(zero.imaginary - ordinates[index]) <= 0.5e-6);
  }
});

test('li utiliza la integral estándar y E conserva el signo de π menos li', () => {
  for (const [x, reference] of [[2, 1.045163780117493], [3, 2.163588594667192],
    [10, 6.165599504787298], [100, 30.12614158407963], [1000, 177.6096579901522]]) {
    assert.ok(Math.abs(logarithmicIntegral(x) - reference) < 1e-11);
    assert.ok(Math.abs(primeDeviation(x) - (primeCount(x) - reference)) < 1e-11);
  }
  assert.ok(primeDeviation(3) < 0);
  assert.throws(() => logarithmicIntegral(1), RangeError);
});
