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

export function initPrimeGaps(root) {
  const limit = root.querySelector('select');
  const selector = root.querySelector('input');
  const status = root.querySelector('[role=status]');
  const figure = root.querySelector('figure');
  let pairs;
  let maximum;
  let mean;
  let peaks;
  function update() {
    const pair = peaks[selector.valueAsNumber];
    selector.setAttribute('aria-valuetext', pair.start + ' a ' + pair.end);
    status.textContent = 'De ' + numberLabel(pair.start) + ' a ' + numberLabel(pair.end) + ': ' + pair.gap +
      ' pasos. Media en este intervalo: ' + numberLabel(mean) + '. Récord: ' + maximum.gap +
      ' pasos, de ' + numberLabel(maximum.start) + ' a ' + numberLabel(maximum.end) + '.';
    plot(figure, {
      series: [{ points: peaks.map(p => [p.end, p.gap]), style: 'line-primes', bars: true }],
      minX: 2, maxX: Number(limit.value), maxY: maximum.gap,
      xLabel: 'Segundo primo', yLabel: 'Distancia', marker: [pair.end, pair.gap],
      label: 'Distancias entre primos. ' + status.textContent,
    });
  }
  function changeLimit() {
    pairs = gapsUpTo(Number(limit.value));
    peaks = pairs.length <= 72 ? pairs : peakBuckets(pairs, Number(limit.value));
    maximum = peaks.reduce((best, pair) => pair.gap > best.gap ? pair : best);
    mean = (pairs.at(-1).end - 2) / pairs.length;
    selector.max = peaks.length - 1;
    selector.value = peaks.indexOf(maximum);
    update();
  }
  limit.addEventListener('change', changeLimit);
  selector.addEventListener('input', update);
  figure.querySelector('svg').addEventListener('click', event => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left - 61) / (rect.width - 91);
    const target = 2 + ratio * (Number(limit.value) - 2);
    selector.value = peaks.reduce((best, pair, index) => Math.abs(pair.end - target) < Math.abs(peaks[best].end - target) ? index : best, 0);
    update();
  });
  root.hidden = false;
  changeLimit();
  new ResizeObserver(update).observe(figure);
}

export function initPrimeGame(root) {
  const form = root.querySelector('form');
  const start = form.elements.inicio;
  const preset = form.elements.preset;
  const mode = form.elements.modo;
  const guess = form.elements.prediccion;
  const status = root.querySelector('[role=status]');
  const current = root.querySelector('[data-current]');
  const history = root.querySelector('[data-history]');
  const figure = root.querySelector('figure');
  const batches = root.querySelectorAll('[data-batch]');
  let prime;
  let pairs;
  function readPair() {
    const p = pairs[Number(history.value)];
    root.querySelector('[data-pair]').textContent = p ? numberLabel(p.start) + ' → ' + numberLabel(p.end) + ': ' + p.gap + ' pasos.' : '';
    if (!p) return;
    const offset = Math.max(0, Number(history.value) - 99);
    const window = pairs.slice(offset, offset + 100);
    plot(figure, {
      series: [{ points: window.map((pair, i) => [offset + i + 1, pair.gap]), style: 'line-primes', bars: true }],
      minX: offset + 1, maxX: offset + window.length, maxY: Math.max(...window.map(pair => pair.gap)),
      xLabel: 'Número de salto', yLabel: 'Distancia', marker: [Number(history.value) + 1, p.gap],
      label: 'Últimos saltos de la secuencia. ' + root.querySelector('[data-pair]').textContent,
    });
  }
  function syncMode() {
    const challenge = mode.value === 'reto';
    guess.closest('label').hidden = !challenge;
    for (const button of batches) button.disabled = challenge;
  }
  function reset() {
    if (!start.reportValidity()) return false;
    prime = nextPrime(start.valueAsNumber);
    pairs = [];
    history.replaceChildren();
    figure.hidden = true;
    history.disabled = true;
    root.querySelector('[data-pair]').textContent = '';
    guess.value = '';
    current.textContent = 'Primer primo posterior al inicio: ' + numberLabel(prime) + '.';
    status.textContent = '';
    return true;
  }
  function discover(count) {
    if (pairs.length + count > 2000) {
      status.textContent = 'Has llegado al límite de 2.000 saltos por partida. Reinicia para seguir explorando.';
      return;
    }
    const challenge = mode.value === 'reto';
    if (challenge && (guess.value === '' || !guess.reportValidity())) {
      guess.focus();
      status.textContent = 'Escribe una distancia entera antes de descubrir el siguiente primo.';
      return;
    }
    const predicted = guess.valueAsNumber;
    for (let step = 0; step < count; step += 1) {
      const end = nextPrime(prime);
      const pair = { start: prime, end, gap: end - prime };
      history.add(new Option('Salto ' + (pairs.length + 1), pairs.length));
      pairs.push(pair);
      prime = end;
    }
    const pair = pairs.at(-1);
    current.textContent = 'Primo actual: ' + numberLabel(prime) + '.';
    status.textContent = 'Último salto: ' + numberLabel(pair.start) + ' → ' + numberLabel(pair.end) + ' (' + pair.gap + ' pasos).' +
      (challenge ? ' Tu predicción: ' + predicted + (predicted === pair.gap ? '. ¡Acertaste!' : '.') : '');
    history.disabled = false;
    history.value = pairs.length - 1;
    figure.hidden = false;
    guess.value = '';
    readPair();
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    reset();
  });
  preset.addEventListener('change', () => {
    start.value = preset.value;
    reset();
  });
  mode.addEventListener('change', syncMode);
  history.addEventListener('change', readPair);
  root.querySelector('[data-next]').addEventListener('click', () => discover(1));
  for (const button of batches) button.addEventListener('click', () => discover(Number(button.dataset.batch)));
  root.hidden = false;
  reset();
  syncMode();
  new ResizeObserver(readPair).observe(figure);
}
