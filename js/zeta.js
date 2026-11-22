import { primesUpTo } from './primes.js';

function validateInputs(s, limit) {
  if (!Number.isFinite(s) || s <= 1) {
    throw new RangeError('El exponente real debe ser mayor que 1.');
  }
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 1_000_000) {
    throw new RangeError('El límite entero debe estar entre 1 y 1.000.000.');
  }
}

export function zetaPartialSum(s, limit) {
  validateInputs(s, limit);
  let sum = 0;
  for (let n = limit; n >= 1; n -= 1) {
    sum += n ** -s;
  }
  return sum;
}

export function zetaTailBounds(s, limit) {
  validateInputs(s, limit);
  // Integral bounds for the decreasing function t ↦ t^(-s).
  return {
    lower: (limit + 1) ** (1 - s) / (s - 1),
    upper: limit ** (1 - s) / (s - 1),
  };
}

export function eulerPartialProduct(s, limit) {
  validateInputs(s, limit);
  const primes = primesUpTo(limit);
  let logProduct = 0;
  for (const prime of primes) {
    logProduct -= Math.log1p(-(prime ** -s));
  }
  return { value: Math.exp(logProduct), factorCount: primes.length };
}

// Positive ordinates rounded to six decimals, from LMFDB's zeta zero table.
export const nontrivialZeros = Object.freeze([
  Object.freeze({ real: 0.5, imaginary: 14.134725 }),
  Object.freeze({ real: 0.5, imaginary: 21.022040 }),
  Object.freeze({ real: 0.5, imaginary: 25.010858 }),
]);
