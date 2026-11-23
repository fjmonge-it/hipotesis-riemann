import { distributionModel, comparisonReading } from './distribution.js';
import { drawDistributionChart, formatInteger } from './distribution-chart.js';

const decimal = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 5, useGrouping: 'always' });
const formatDecimal = n => decimal.format(n).replace('-', '−');

export function initDistributionExperiment(root) {
  const limit = root.querySelector('#limite-distribucion');
  const slider = root.querySelector('#x-distribucion');
  const exact = root.querySelector('#x-exacto');
  const results = root.querySelector('[data-results]');
  const summary = root.querySelector('[data-summary]');
  const closerReading = root.querySelector('[data-closer]');
  const announcement = root.querySelector('[data-announcement]');
  let announcementTimer;
  const countChart = root.querySelector('#grafico-recuento');
  const errorChart = root.querySelector('#grafico-desviacion');
  const estimateControls = [...root.querySelectorAll('[data-estimate-toggle]')];
  function syncVisibility() {
    for (const control of estimateControls) {
      for (const trace of root.querySelectorAll('[data-' + control.dataset.estimateToggle + ']')) {
        trace.classList.toggle('plot-hidden', !control.checked);
      }
    }
  }
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
    syncVisibility();
  }

  function update(x) {
    reading = comparisonReading(x, model.primes);
    const { count, estimate, error, simple, simpleError } = reading;
    slider.value = exact.value = x;
    slider.setAttribute('aria-valuetext', formatInteger(x));
    results.innerHTML = `
      <div><dt>Primos hasta ${formatInteger(x)}, π(x)</dt><dd><strong>${formatInteger(count)}</strong></dd></div>
      <div class="result-simple"><dt>Estimación x/ln(x)</dt><dd><strong>≈ ${formatDecimal(simple)}</strong><span>Error de esta estimación ≈ ${formatDecimal(simpleError)}</span></dd></div>
      <div class="result-product"><dt>Estimación li(x)</dt><dd><strong>≈ ${formatDecimal(estimate)}</strong><span>Error de esta estimación ≈ ${formatDecimal(error)}</span></dd></div>`;
    const closer = Math.abs(error) < Math.abs(simpleError) ? 'li(x)' : Math.abs(error) > Math.abs(simpleError) ? 'x/ln(x)' : '';
    closerReading.textContent = closer ? 'La estimación más cercana aquí es ' + closer + '.'
      : 'Las dos estimaciones quedan a la misma distancia.';
    summary.textContent = 'En x = ' + formatInteger(x) + ' hay ' + formatInteger(count) + ' primos. '
      + 'Error de x/ln(x): ' + formatDecimal(simpleError) + '. Error de li(x): ' + formatDecimal(error) + '.';
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

  function announce() {
    clearTimeout(announcementTimer);
    announcementTimer = setTimeout(() => {
      announcement.textContent = summary.textContent;
    }, 220);
  }

  limit.value = limit.querySelector('option[selected]').value;
  root.hidden = false;
  changeLimit();
  for (const control of estimateControls) control.addEventListener('change', syncVisibility);
  for (const figure of [countChart, errorChart]) {
    figure.querySelector('svg').addEventListener('click', event => {
      const svg = event.currentTarget;
      const rect = svg.getBoundingClientRect();
      const width = svg.viewBox.baseVal.width;
      const fraction = ((event.clientX - rect.left) / rect.width * width - 49) / (width - 74);
      update(Math.round(2 + Math.min(1, Math.max(0, fraction)) * (model.limit - 2)));
      announce();
    });
  }
  limit.addEventListener('change', () => {
    changeLimit();
    announce();
  });
  for (const button of shortcuts) {
    button.addEventListener('click', () => {
      const x = Number(button.dataset.reading);
      if (model.limit !== 100) {
        limit.value = 100;
        changeLimit(x);
      } else {
        update(x);
      }
      announce();
    });
  }
  slider.addEventListener('input', () => {
    clearTimeout(announcementTimer);
    update(slider.valueAsNumber);
  });
  slider.addEventListener('change', announce);
  exact.addEventListener('change', () => {
    const x = exact.valueAsNumber;
    update(Number.isFinite(x) ? Math.min(model.limit, Math.max(2, Math.round(x))) : reading.x);
    announce();
  });
  new ResizeObserver(() => {
    if (countChart.clientWidth !== width) draw();
  }).observe(countChart);
  document.querySelector('#ejemplo-distribucion').hidden = true;
}
