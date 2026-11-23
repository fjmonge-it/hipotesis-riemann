import { comparisonReading, normalizedEnvelope, relativeEnvelope, relativeOscillation } from './distribution.js';
import { primesUpTo } from './primes.js';
import { plot } from './v2-chart.js';

export function initPrimeCount(root) {
  const input = root.querySelector('input');
  const status = root.querySelector('[role=status]');
  const primes = primesUpTo(30);
  const figure = root.querySelector('figure');
  const steps = [[2, 1], ...primes.slice(1).flatMap((p, i) => [[p, i + 1], [p, i + 2]]), [30, primes.length]];
  function update() {
    const x = input.valueAsNumber;
    const { count } = comparisonReading(x, primes);
    status.textContent = 'π(' + x + ') = ' + count + '. El ' + x +
      (primes.includes(x) ? ' es primo y el recuento sube un escalón.' : ' es compuesto y el recuento no cambia.');
    input.setAttribute('aria-valuetext', String(x));
    plot(figure, {
      series: [{ points: steps, style: 'line-primes' }],
      minX: 2, maxX: 30, maxY: primes.length,
      xLabel: 'Número examinado', yLabel: 'Primos', marker: [x, count], label: status.textContent,
    });
  }
  input.addEventListener('input', update);
  root.hidden = false;
  update();
  new ResizeObserver(update).observe(figure);
}

export function initOscillations(root) {
  const input = root.querySelector('select');
  const wave = root.querySelector('[data-wave]');
  const envelope = root.querySelector('[data-envelope]');
  const result = root.querySelector('[role=status]');
  const gamma = 14.134725;
  const tMin = Math.log(2);
  const tMax = Math.log(1000);
  const samples = Array.from({ length: 480 }, (_, i) => tMin + (tMax - tMin) * i / 479);
  const horizontalTicks = [[2, '2'], [10, '10'], [100, '100'], [1000, '1.000']]
    .map(([x, text]) => [Math.log(x), text]);
  const percent = new Intl.NumberFormat('es-ES', { style: 'percent', maximumFractionDigits: 0 });
  const axes = {
    minX: tMin, maxX: tMax, horizontalTicks, xLabel: 'Número estudiado, x',
    formatY: n => percent.format(n).replace('-', '−'),
  };
  const cases = [
    { beta: .5, style: 'line-primes' },
    { beta: .75, style: 'line-li' },
  ];
  const series = (active, value, outline = false) => active.map(({ beta, style }) => ({
    style: style + (outline ? ' wave-envelope' : ''),
    points: samples.map(t => [t, value(t, beta)]),
  }));

  function update() {
    const active = cases.filter(({ beta }) => input.value === 'ambas' || beta === Number(input.value));
    for (const item of root.querySelectorAll('[data-beta]')) {
      item.hidden = !active.some(({ beta }) => beta === Number(item.dataset.beta));
    }
    const both = active.length === 2;
    result.textContent = both
      ? 'Ambas curvas parten del 100 % de su propia amplitud en x = 2. La de la recta crítica baja más deprisa.'
      : 'Se muestra ' + (active[0].beta === .5 ? 'el caso de la recta crítica.' : 'el caso hipotético fuera de la recta.');
    plot(wave, {
      ...axes, minY: -.06, maxY: .06, yLabel: 'Contribución relativa',
      series: [
        ...series(active, (t, beta) => relativeEnvelope(t, beta, gamma), true),
        ...series(active, (t, beta) => -relativeEnvelope(t, beta, gamma), true),
        ...series(active, (t, beta) => relativeOscillation(t, beta, gamma)),
      ],
      label: 'Oscilaciones ilustrativas con sus límites de amplitud. ' + result.textContent,
    });
    plot(envelope, {
      ...axes, maxY: 1, yLabel: 'Amplitud que queda',
      series: series(active, (t, beta) => normalizedEnvelope(t, beta, tMin)),
      label: 'Amplitudes en proporción a su valor de partida. ' + result.textContent,
    });
  }
  root.hidden = false;
  input.addEventListener('change', update);
  update();
  const observer = new ResizeObserver(update);
  observer.observe(wave);
  observer.observe(envelope);
}
