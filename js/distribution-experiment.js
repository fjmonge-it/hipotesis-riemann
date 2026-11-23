import { comparisonReading, estimateCurve, estimateError, estimateLimits } from './distribution.js';
import { primesUpTo } from './primes.js';
import { drawDistributionChart, formatInteger } from './distribution-chart.js';

const percent = new Intl.NumberFormat('es-ES', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const decimal = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function initDistributionExperiment(root) {
  const limit = root.querySelector('#limite-distribucion');
  const results = root.querySelector('[data-results]');
  const summary = root.querySelector('[data-closer]');
  const figure = root.querySelector('#grafico-recuento');
  const table = root.querySelector('[data-error-history]');
  const errors = root.querySelector('[data-error-bars]');
  const primes = primesUpTo(estimateLimits.at(-1));
  const rows = estimateLimits.map(x => comparisonReading(x, primes));
  let curve;
  let width;

  function draw() {
    width = figure.clientWidth;
    drawDistributionChart(figure, curve);
  }

  function update() {
    const x = Number(limit.value);
    const { count, simple, estimate } = rows.find(row => row.x === x);
    results.innerHTML = `
      <div class="count-exact"><dt>Recuento real de primos <span>π(x) · Valor exacto</span></dt>
        <dd><strong>${formatInteger(count)} primos</strong></dd></div>
      <div class="result-simple"><dt>Estimación mediante <span>x/ln(x)</span></dt><dd><strong>≈ ${formatInteger(simple)} primos</strong></dd></div>
      <div class="result-product"><dt>Estimación mediante <span>li(x)</span></dt><dd><strong>≈ ${formatInteger(estimate)} primos</strong></dd></div>`;
    const definitions = [{ label: 'x/ln(x)', estimate: simple, style: 'simple' },
      { label: 'li(x)', estimate, style: 'li' }].map(item => ({ ...item, ...estimateError(count, item.estimate) }));
    const [first, second] = definitions;
    const closer = first.absolute < second.absolute ? first.label : second.absolute < first.absolute ? second.label : '';
    summary.textContent = 'Hasta ' + formatInteger(x) + ', ' + (closer ? 'la estimación más cercana es ' + closer + '.'
      : 'las dos estimaciones quedan a la misma distancia.');
    const max = Math.max(first.absolute, second.absolute) || 1;
    errors.innerHTML = definitions.map(item => {
      const direction = item.difference > 0 ? 'Se queda corta en' : 'Se pasa en';
      return `<div class="error-item">
        <h5>${item.label}</h5>
        <p>Estima ≈ ${formatInteger(item.estimate)} primos. ${item.difference === 0 ? 'Coincide con el recuento.' : direction + ' ≈ ' + formatInteger(item.absolute) + ' primos.'}</p>
        <div class="error-track" aria-hidden="true"><div class="error-fill ${item.style}" style="width:${100 * item.absolute / max}%"></div></div>
        <p><strong>Error relativo: ≈ ${percent.format(item.relative)}</strong></p>
      </div>`;
    }).join('');
    table.innerHTML = rows.map(row => `<tr${row.x === x ? ' aria-current="true"' : ''}>
      <th scope="row">${formatInteger(row.x)}${row.x === x ? '<span class="visually-hidden"> (seleccionado)</span>' : ''}</th>
      <td${row.x <= 1000 ? ' class="error-increase"' : ''}>≈ ${percent.format(estimateError(row.count, row.simple).relative)}${row.x === 1000 ? ' <span aria-label="sube respecto al valor anterior">↑</span>' : ''}</td>
      <td>≈ ${percent.format(estimateError(row.count, row.estimate).relative)}</td></tr>`).join('');
    curve = estimateCurve(x, primes);
    figure.querySelector('figcaption').textContent = curve.sampled
      ? 'A esta escala unimos muestras para mostrar la tendencia. Las tarjetas usan el recuento exacto.'
      : 'El recuento real sube un escalón al encontrar un primo. Las estimaciones se trazan uniendo muestras.';
    draw();
  }

  const example = root.parentElement.querySelector('[data-small-errors]');
  example.innerHTML = [12, 13].map(x => {
    const { count, simple } = comparisonReading(x, primes);
    return '<tr><th scope="row">' + x + '</th><td>' + count + '</td><td>≈ ' + decimal.format(simple)
      + '</td><td>≈ ' + percent.format(estimateError(count, simple).relative) + '</td></tr>';
  }).join('');
  root.hidden = false;
  update();
  limit.addEventListener('change', update);
  new ResizeObserver(() => {
    if (figure.clientWidth !== width) draw();
  }).observe(figure);
  document.querySelector('#ejemplo-distribucion').hidden = true;
}
