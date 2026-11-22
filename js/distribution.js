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
