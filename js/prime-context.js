import { comparisonReading, relativeOscillation } from './distribution.js';
import { primesUpTo } from './primes.js';
import { numberLabel, plot } from './v2-chart.js';

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
  const figure = root.querySelector('figure');
  const result = root.querySelector('[role=status]');
  const gamma = 14.134725;
  const tMin = Math.log(2);
  const tMax = Math.log(1000);
  const styles = ['line-primes', 'line-li'];
  function update() {
    const betas = input.value === 'ambas' ? [.5, .75] : [Number(input.value)];
    const series = betas.map(beta => ({
      style: styles[beta === .5 ? 0 : 1],
      points: Array.from({ length: 480 }, (_, i) => {
        const t = tMin + (tMax - tMin) * i / 479;
        return [t, relativeOscillation(t, beta, gamma)];
      }),
    }));
    const max = .065;
    result.textContent = 'En x = 1.000: ' + betas.map(beta => 'β = ' + numberLabel(beta)
      + ', contribución relativa ' + numberLabel(relativeOscillation(tMax, beta, gamma))).join(' · ') + '.';
    plot(figure, {
      series, minX: tMin, maxX: tMax, minY: -max, maxY: max,
      xLabel: 'ln(x)', yLabel: 'Contribución dividida por x',
      label: 'Oscilaciones ilustrativas con frecuencia fija. ' + result.textContent,
    });
  }
  root.hidden = false;
  input.addEventListener('change', update);
  update();
  new ResizeObserver(update).observe(figure);
}
