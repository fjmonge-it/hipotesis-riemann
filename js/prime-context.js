import { comparisonReading } from './distribution.js';
import { primesUpTo } from './primes.js';
import { plot } from './v2-chart.js';

export function initPrimeCount(root) {
  const input = root.querySelector('input');
  const status = root.querySelector('[role=status]');
  const primes = primesUpTo(30);
  const figure = root.querySelector('figure');
  const output = root.querySelector('output');
  const strip = root.querySelector('[data-count-strip]');
  const cells = Array.from({ length: 29 }, (_, i) => {
    const n = i + 2;
    const cell = document.createElement('span');
    cell.textContent = n;
    cell.classList.toggle('count-prime', primes.includes(n));
    return cell;
  });
  strip.replaceChildren(...cells);
  const steps = [[2, 1], ...primes.slice(1).flatMap((p, i) => [[p, i + 1], [p, i + 2]]), [30, primes.length]];
  function update() {
    const x = input.valueAsNumber;
    output.value = x;
    for (const [index, cell] of cells.entries()) {
      cell.classList.toggle('not-counted', index + 2 > x);
      cell.classList.toggle('count-selected', index + 2 === x);
    }
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
