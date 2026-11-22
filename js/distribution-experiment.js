import { distributionModel, distributionReading } from './distribution.js';
import { drawDistributionChart, formatInteger } from './distribution-chart.js';

const decimal = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 5, useGrouping: 'always' });
const formatDecimal = n => decimal.format(n).replace('-', '−');

export function initDistributionExperiment(root) {
  const limit = root.querySelector('#limite-distribucion');
  const slider = root.querySelector('#x-distribucion');
  const exact = root.querySelector('#x-exacto');
  const results = root.querySelector('[data-results]');
  const summary = root.querySelector('[data-summary]');
  const countChart = root.querySelector('#grafico-recuento');
  const errorChart = root.querySelector('#grafico-desviacion');
  const shortcuts = root.querySelectorAll('[data-reading]');
  let model;
  let moveCount;
  let moveError;
  let width;
  let reading;

  function draw() {
    width = countChart.clientWidth;
    moveCount = drawDistributionChart(countChart, model, false);
    moveError = drawDistributionChart(errorChart, model, true);
    moveCount(reading);
    moveError(reading);
  }

  function update(x) {
    reading = distributionReading(x, model.primes);
    const { count, estimate, error } = reading;
    slider.value = exact.value = x;
    slider.setAttribute('aria-valuetext', formatInteger(x));
    results.innerHTML = `
      <div><dt>Primos hasta ${formatInteger(x)}, π(x)</dt><dd><strong>${formatInteger(count)}</strong></dd></div>
      <div class="result-product"><dt>Estimación li(x)</dt><dd><strong>≈ ${formatDecimal(estimate)}</strong></dd></div>
      <div class="result-limit"><dt>Desviación E(x)</dt><dd><strong>≈ ${formatDecimal(error)}</strong></dd></div>`;
    const relation = error < 0 ? 'El recuento queda por debajo de la estimación.'
      : error > 0 ? 'El recuento supera la estimación.' : 'El recuento coincide con la estimación.';
    summary.textContent = 'En x = ' + formatInteger(x) + ' hay ' + formatInteger(count)
      + ' primos. ' + relation + ' Desviación aproximada: ' + formatDecimal(error) + '.';
    for (const button of shortcuts) {
      button.setAttribute('aria-pressed', String(model.limit === 100 && x === Number(button.dataset.reading)));
    }
    moveCount?.(reading);
    moveError?.(reading);
  }

  function changeLimit(value) {
    model = distributionModel(Number(limit.value));
    slider.max = exact.max = model.limit;
    moveCount = moveError = undefined;
    update(value ?? model.limit);
    draw();
  }

  root.hidden = false;
  changeLimit();
  limit.addEventListener('change', () => changeLimit());
  for (const button of shortcuts) {
    button.addEventListener('click', () => {
      const x = Number(button.dataset.reading);
      if (model.limit !== 100) {
        limit.value = 100;
        changeLimit(x);
      } else {
        update(x);
      }
    });
  }
  slider.addEventListener('input', () => update(slider.valueAsNumber));
  exact.addEventListener('change', () => {
    const x = exact.valueAsNumber;
    update(Number.isFinite(x) ? Math.min(model.limit, Math.max(2, Math.round(x))) : reading.x);
  });
  new ResizeObserver(() => {
    if (countChart.clientWidth !== width) draw();
  }).observe(countChart);
  document.querySelector('#ejemplo-distribucion').hidden = true;
}
