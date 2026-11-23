import { primesUpTo } from './primes.js';
import { numberLabel, plot } from './v2-chart.js';

export function nextPrime(n) {
  if (!Number.isSafeInteger(n) || n < 1 || n > 110_000_000) throw new RangeError('Punto de partida no válido');
  if (n === 1) return 2;
  let candidate = n % 2 === 0 ? n + 1 : n + 2;
  for (;; candidate += 2) {
    let factor = 3;
    while (factor * factor <= candidate && candidate % factor !== 0) factor += 2;
    if (factor * factor > candidate) return candidate;
  }
}

export function gapsUpTo(limit) {
  const primes = primesUpTo(limit);
  return primes.slice(1).map((end, i) => ({ start: primes[i], end, gap: end - primes[i] }));
}

export function peakBuckets(gaps, limit, buckets = 72) {
  const peaks = [];
  for (const pair of gaps) {
    const index = Math.min(buckets - 1, Math.floor(pair.end / limit * buckets));
    if (!peaks[index] || pair.gap > peaks[index].gap) peaks[index] = pair;
  }
  return peaks.filter(Boolean);
}

export function consecutivePrimes(start, count) {
  const primes = [];
  let value = start;
  for (let i = 0; i < count; i += 1) {
    value = nextPrime(value);
    primes.push(value);
  }
  return primes;
}

export function summarizeGaps(pairs) {
  let min = Infinity;
  let max = pairs[0];
  let total = 0;
  for (const pair of pairs) {
    min = Math.min(min, pair.gap);
    if (pair.gap > max.gap) max = pair;
    total += pair.gap;
  }
  return { min, max, mean: total / pairs.length };
}

const decimal = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 });
const name = pair => numberLabel(pair.start) + ' y ' + numberLabel(pair.end);

function describe(pair) {
  const between = pair.gap - 1;
  const inside = between === 0 ? 'Entre ellos no queda ningún entero.'
    : between === 1 ? 'Entre ellos solo está el compuesto ' + numberLabel(pair.start + 1) + '.'
      : 'Entre ellos hay ' + numberLabel(between) + ' enteros compuestos.';
  return 'Primos consecutivos: ' + name(pair) + '. Distancia: ' + numberLabel(pair.end)
    + ' − ' + numberLabel(pair.start) + ' = ' + pair.gap + '. ' + inside;
}

export const gapLimits = Object.freeze([100, 1000, 10000, 100000, 1000000]);

export function gapOverview(limits = gapLimits) {
  return limits.map(limit => ({ limit, ...summarizeGaps(gapsUpTo(limit)) }));
}

export function initPrimeGaps(root) {
  const control = root.querySelector('[data-limit]');
  const entries = gapOverview();
  const meanChart = root.querySelector('[data-mean-chart]');
  const maxChart = root.querySelector('[data-maximum-chart]');
  const ticks = ['100', '1 mil', '10 mil', '100 mil', '1 millón'].map((label, i) => [i, label]);

  function draw() {
    const index = control.selectedIndex;
    const selected = entries[index];
    root.querySelector('[data-mean]').textContent = '≈ ' + decimal.format(selected.mean);
    root.querySelector('[data-maximum]').textContent = selected.max.gap;
    root.querySelector('[data-maximum-pair]').textContent = 'Entre ' + name(selected.max) + '.';
    for (const [figure, key, title, maxY] of [
      [meanChart, entry => entry.mean, 'Distancia media', 16],
      [maxChart, entry => entry.max.gap, 'Mayor distancia', 130],
    ]) {
      const values = entries.map(key);
      plot(figure, {
        series: [{ points: values.map((value, i) => [i, value]), style: 'line-primes' }],
        minX: 0, maxX: 4, maxY, horizontalTicks: ticks,
        xLabel: 'Límite estudiado', yLabel: title, marker: [index, values[index]],
        label: title + ': ' + values.map((value, i) => ticks[i][1] + ', ' + decimal.format(value)).join('; '),
        pointLabels: values.map((value, i) => [i, value, decimal.format(value)]),
        wideTicks: true, ringMarker: true,
      });
    }
  }
  control.addEventListener('change', draw);
  root.hidden = false;
  draw();
  const observer = new ResizeObserver(draw);
  observer.observe(meanChart);
  observer.observe(maxChart);
}

export function nearbyPairs(pairs, index) {
  return pairs.slice(Math.max(0, index - 5), index + 6);
}

export function initPrimeSequence(root) {
  const start = root.querySelector('[data-start]');
  const count = root.querySelector('[data-count]');
  const selector = root.querySelector('[data-pair-select]');
  const more = root.querySelector('[data-more]');
  const nearby = root.querySelector('[data-nearby]');
  const sequence = root.querySelector('[data-sequence]');
  const detail = root.querySelector('[data-pair]');
  let primes;
  let pairs;
  function draw() {
    const index = Number(selector.value);
    const pair = pairs[index];
    const shown = nearbyPairs(pairs, index);
    const maximum = Math.max(...shown.map(item => item.gap));
    nearby.innerHTML = '<ol class="nearby-gaps" aria-label="Parejas próximas y sus distancias">' + shown.map(item => (
      '<li' + (item === pair ? ' aria-current="true"' : '') + '><span>' + numberLabel(item.start) + ' → ' + numberLabel(item.end)
      + '</span><strong>' + item.gap + '</strong><span class="nearby-bar" aria-hidden="true"><span style="width:'
      + (100 * item.gap / maximum) + '%"></span></span></li>'
    )).join('') + '</ol>';
    detail.textContent = describe(pair);
    const first = Math.max(0, Math.min(index - 2, primes.length - 6));
    sequence.replaceChildren(...primes.slice(first, first + 6).map((prime, i, values) => {
      const node = document.createElement('span');
      const emphasis = prime === pair.start || prime === pair.end;
      node.textContent = numberLabel(prime) + (i < values.length - 1 ? ' → ' : '');
      node.classList.toggle('chosen-prime', emphasis);
      return node;
    }));
  }
  function render(selected) {
    pairs = primes.slice(1).map((end, i) => ({ start: primes[i], end, gap: end - primes[i] }));
    const stats = summarizeGaps(pairs);
    root.querySelector('[data-current]').textContent = 'Hemos encontrado ' + primes.length + ' primos consecutivos mayores que '
      + numberLabel(Number(start.value)) + ', desde ' + numberLabel(primes[0]) + ' hasta '
      + numberLabel(primes.at(-1)) + '. Entre ellos hay ' + pairs.length + ' distancias.';
    root.querySelector('[data-stats]').textContent = 'Distancia mínima: ' + stats.min + '. Máxima: ' + stats.max.gap
      + '. Media: ' + decimal.format(stats.mean) + '. La secuencia destaca la pareja seleccionada.';
    selector.replaceChildren(...pairs.map((pair, i) => new Option(name(pair), i)));
    selector.value = selected;
    more.disabled = primes.length >= 500;
    draw();
  }
  function reset() {
    primes = consecutivePrimes(Number(start.value), Number(count.value));
    render(0);
  }
  for (const control of [start, count]) control.addEventListener('change', reset);
  more.addEventListener('click', () => {
    const previous = primes.length;
    primes.push(...consecutivePrimes(primes.at(-1), 10));
    render(previous - 1);
  });
  selector.addEventListener('change', draw);
  root.hidden = false;
  reset();
}
