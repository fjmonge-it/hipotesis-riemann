import { logarithmicIntegral, primesUpTo } from './primes.js';

export function distributionReading(x, primes) {
  let low = 0;
  let high = primes.length;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (primes[middle] <= x) low = middle + 1;
    else high = middle;
  }
  const estimate = logarithmicIntegral(x);
  return { x, count: low, estimate, error: low - estimate };
}

export function distributionModel(limit) {
  const primes = primesUpTo(limit);
  // Include every jump and enough intermediate nodes for the continuous li curve.
  const stride = Math.max(1, Math.floor((limit - 2) / 320));
  const positions = new Set(primes);
  for (let x = 2; x < limit; x += stride) positions.add(x);
  positions.add(limit);

  let count = 0;
  const samples = [...positions].sort((a, b) => a - b).map(x => {
    const jump = x === primes[count] ? 1 : 0;
    count += jump;
    const estimate = logarithmicIntegral(x);
    return { x, count, estimate, error: count - estimate, jump };
  });
  return { limit, primes, samples };
}

export function simpleEstimate(x) {
  return x / Math.log(x);
}

export function comparisonReading(x, primes) {
  const reading = distributionReading(x, primes);
  const simple = simpleEstimate(x);
  return { ...reading, simple, simpleError: reading.count - simple };
}

export function relativeEnvelope(t, beta, gamma) {
  return Math.exp((beta - 1) * t) / Math.hypot(beta, gamma);
}

export function normalizedEnvelope(t, beta, start) {
  return Math.exp((beta - 1) * (t - start));
}

// Relative real part of x^rho / rho, with x as the normalization.
export function relativeOscillation(t, beta, gamma) {
  const phase = gamma * t - Math.atan2(gamma, beta);
  return relativeEnvelope(t, beta, gamma) * Math.cos(phase);
}
