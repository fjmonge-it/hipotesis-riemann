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

// First 50 positive ordinates, computed at 35 digits with mpmath.zetazero
// and checked by evaluating zeta at the unrounded roots.
export const nontrivialZeros = Object.freeze([
  14.134725, 21.022040, 25.010858, 30.424876, 32.935062,
  37.586178, 40.918719, 43.327073, 48.005151, 49.773832,
  52.970321, 56.446248, 59.347044, 60.831779, 65.112544,
  67.079811, 69.546402, 72.067158, 75.704691, 77.144840,
  79.337375, 82.910381, 84.735493, 87.425275, 88.809111,
  92.491899, 94.651344, 95.870634, 98.831194, 101.317851,
  103.725538, 105.446623, 107.168611, 111.029536, 111.874659,
  114.320221, 116.226680, 118.790783, 121.370125, 122.946829,
  124.256819, 127.516684, 129.578704, 131.087689, 133.497737,
  134.756510, 138.116042, 139.736209, 141.123707, 143.111846,
].map(imaginary => Object.freeze({ real: 0.5, imaginary })));

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

// Finite sums exist even where the infinite series diverges.
export function realSeries(s, limit) {
  if (!Number.isFinite(s) || s < -2 || s > 5 || !Number.isInteger(limit) || limit < 1 || limit > 100000) {
    throw new RangeError('Exponente o número de términos fuera del intervalo de exploración.');
  }
  if (s > 1) return { sums: zetaEvolution(s, limit).sums, reference: zetaReference(s) };
  const sums = [];
  let total = 0;
  for (let n = 1; n <= limit; n += 1) {
    total += n ** -s;
    sums.push(total);
  }
  return { sums, reference: null };
}
