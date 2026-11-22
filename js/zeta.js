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

function addEulerFactor(logProduct, term) {
  return logProduct - Math.log1p(-term);
}

export function eulerPartialProduct(s, limit) {
  validateInputs(s, limit);
  const primes = primesUpTo(limit);
  let logProduct = 0;
  for (const prime of primes) {
    logProduct = addEulerFactor(logProduct, prime ** -s);
  }
  return { value: Math.exp(logProduct), factorCount: primes.length };
}

// Positive ordinates rounded to six decimals, from LMFDB's zeta zero table.
export const nontrivialZeros = Object.freeze([
  Object.freeze({ real: 0.5, imaginary: 14.134725 }),
  Object.freeze({ real: 0.5, imaginary: 21.022040 }),
  Object.freeze({ real: 0.5, imaginary: 25.010858 }),
  Object.freeze({ real: 0.5, imaginary: 30.424876 }),
  Object.freeze({ real: 0.5, imaginary: 32.935062 }),
]);

// Euler–Maclaurin for the tail starting at n + 1, through the B6 term.
export function zetaReference(s) {
  const n = 128;
  validateInputs(s, n);
  const first = n ** -s;
  const third = s * (s + 1) * (s + 2);
  const fifth = third * (s + 3) * (s + 4);
  return zetaPartialSum(s, n) + first * (
    n / (s - 1) - 1 / 2 + s / (12 * n)
    - third / (720 * n ** 3) + fifth / (30240 * n ** 5)
  );
}

// One forward pass. Index n - 1 holds the partial results at integer n.
export function zetaEvolution(s, limit, compareEuler = false) {
  validateInputs(s, limit);
  const primes = compareEuler ? primesUpTo(limit) : [];
  const sums = [];
  const products = [];
  let total = 0;
  let correction = 0;
  let logProduct = 0;
  let factorCount = 0;

  for (let n = 1; n <= limit; n += 1) {
    const term = n ** -s;
    const adjusted = term - correction;
    const nextTotal = total + adjusted;
    correction = (nextTotal - total) - adjusted;
    total = nextTotal;
    sums.push(total);
    if (compareEuler && n === primes[factorCount]) {
      logProduct = addEulerFactor(logProduct, term);
      factorCount += 1;
      products.push({ n, value: Math.exp(logProduct) });
    }
  }
  return { sums, products, factorCount };
}
