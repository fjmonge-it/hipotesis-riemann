function validateLimit(limit) {
  if (!Number.isSafeInteger(limit) || limit < 0 || limit > 1_000_000) {
    throw new RangeError('El límite entero debe estar entre 0 y 1.000.000.');
  }
}

export function primesUpTo(limit) {
  validateLimit(limit);
  const composite = new Uint8Array(limit + 1);
  const primes = [];
  for (let candidate = 2; candidate <= limit; candidate += 1) {
    if (composite[candidate]) continue;
    primes.push(candidate);
    for (let multiple = candidate ** 2; multiple <= limit; multiple += candidate) {
      composite[multiple] = 1;
    }
  }
  return primes;
}

export function primeCount(x) {
  return primesUpTo(Math.floor(x)).length;
}

// For x > 1, li(x) = Ei(log x). The constant is Euler–Mascheroni's constant.
export function logarithmicIntegral(x) {
  if (!Number.isFinite(x) || x < 2 || x > 1_000_000) {
    throw new RangeError('La integral se calcula para 2 ≤ x ≤ 1.000.000.');
  }
  const logX = Math.log(x);
  let result = 0.5772156649015329 + Math.log(logX);
  let factorialTerm = 1;
  // At log(1e6), the positive series tail after 80 terms is below 1e-28.
  for (let k = 1; k <= 80; k += 1) {
    factorialTerm *= logX / k;
    result += factorialTerm / k;
  }
  return result;
}

export function primeDeviation(x) {
  return primeCount(x) - logarithmicIntegral(x);
}

export function primeFactors(n) {
  validateLimit(n);
  if (n < 2) return [];

  let remaining = n;
  const factors = [];
  for (const prime of primesUpTo(Math.floor(Math.sqrt(n)))) {
    if (prime * prime > remaining) break;
    while (remaining % prime === 0) {
      factors.push(prime);
      remaining /= prime;
    }
  }
  if (remaining > 1) factors.push(remaining);
  return factors;
}
