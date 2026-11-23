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

function onBarClick(figure, getDomain, choose) {
  figure.querySelector('svg').addEventListener('click', event => {
    const svg = event.currentTarget;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(svg.getScreenCTM().inverse());
    const [min, max] = getDomain();
    choose(min + (point.x - 61) / (svg.viewBox.baseVal.width - 91) * (max - min));
  });
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
      [meanChart, entry => entry.mean, 'Distancia media', 15],
      [maxChart, entry => entry.max.gap, 'Mayor distancia', 120],
    ]) {
      const values = entries.map(key);
      plot(figure, {
        series: [{ points: values.map((value, i) => [i, value]), style: 'line-primes' }],
        minX: 0, maxX: 4, maxY, horizontalTicks: ticks,
        xLabel: 'Límite estudiado', yLabel: title, marker: [index, values[index]],
        label: title + ': ' + values.map((value, i) => ticks[i][1] + ', ' + decimal.format(value)).join('; '),
        pointLabels: values.map((value, i) => [i, value, decimal.format(value)]),
        wideTicks: true,
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

export function initPrimeSequence(root) {
  const start = root.querySelector('[data-start]');
  const count = root.querySelector('[data-count]');
  const selector = root.querySelector('[data-pair-select]');
  const more = root.querySelector('[data-more]');
  const figure = root.querySelector('figure');
  const sequence = root.querySelector('[data-sequence]');
  const detail = root.querySelector('[data-pair]');
  let primes;
  let pairs;
  let range;
  function draw() {
    const index = Number(selector.value);
    const pair = pairs[index];
    const from = Math.max(0, Math.min(index - 24, pairs.length - 50));
    const shown = pairs.slice(from, from + 50);
    range = [from + 1, from + shown.length];
    detail.textContent = describe(pair);
    const first = Math.max(0, Math.min(index - 2, primes.length - 6));
    sequence.replaceChildren(...primes.slice(first, first + 6).map((prime, i, values) => {
      const node = document.createElement('span');
      const emphasis = prime === pair.start || prime === pair.end;
      node.textContent = numberLabel(prime) + (i < values.length - 1 ? ' → ' : '');
      node.classList.toggle('chosen-prime', emphasis);
      return node;
    }));
    plot(figure, {
      series: [
        { points: shown.map((p, i) => [from + i + 1, p.gap]), style: 'line-primes', bars: true },
        { points: [[index + 1, pair.gap]], style: 'chosen-bar', bars: true },
      ],
      minX: range[0], maxX: range[1], maxY: Math.max(...shown.map(p => p.gap)),
      xLabel: 'Pareja de primos consecutivos', yLabel: 'Distancia',
      marker: [index + 1, pair.gap], label: 'Distancias en la secuencia. ' + detail.textContent,
    });
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
  onBarClick(figure, () => range, target => {
    selector.value = Math.max(range[0], Math.min(range[1], Math.round(target))) - 1;
    draw();
  });
  root.hidden = false;
  reset();
  new ResizeObserver(draw).observe(figure);
}
