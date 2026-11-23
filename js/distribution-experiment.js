import { distributionModel, comparisonReading } from './distribution.js';
import { drawDistributionChart, formatInteger } from './distribution-chart.js';

const decimal = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 5, useGrouping: 'always' });
const formatDecimal = n => decimal.format(n).replace('-', '−');

export function initDistributionExperiment(root) {
  const limit = root.querySelector('#limite-distribucion');
  const results = root.querySelector('[data-results]');
  const summary = root.querySelector('[data-summary]');
  const closerReading = root.querySelector('[data-closer]');
  const figures = [root.querySelector('#grafico-recuento'), root.querySelector('#grafico-desviacion')];
  const svgs = figures.map(figure => figure.querySelector('svg'));
  let model;
  let markers = [];
  let width;
  let reading;

  function draw() {
    width = figures[0].clientWidth;
    markers = figures.map((figure, i) => drawDistributionChart(figure, model, i === 1));
    markers.forEach(move => move(reading));
  }

  function update(x) {
    reading = comparisonReading(x, model.primes);
    const { count, estimate, error, simple, simpleError } = reading;
    results.innerHTML = `
      <div><dt>Recuento real π(x)</dt><dd><strong>${formatInteger(count)}</strong></dd></div>
      <div class="result-simple"><dt>Estimación mediante x/ln(x)</dt><dd><strong>≈ ${formatDecimal(simple)}</strong></dd></div>
      <div class="result-product"><dt>Estimación mediante li(x)</dt><dd><strong>≈ ${formatDecimal(estimate)}</strong></dd></div>`;
    const readingLabel = 'Hasta ' + formatInteger(x) + ' hay ' + formatInteger(count) + ' primos.';
    const closer = Math.abs(error) < Math.abs(simpleError) ? 'li(x)' : Math.abs(error) > Math.abs(simpleError) ? 'x/ln(x)' : '';
    closerReading.textContent = readingLabel + (closer ? ' Aquí se acerca más ' + closer + '.'
      : ' Las dos estimaciones quedan a la misma distancia.');
    summary.textContent = readingLabel + ' Error de x/ln(x): ' + formatDecimal(simpleError)
      + '. Error de li(x): ' + formatDecimal(error) + '.';
    for (const svg of svgs) {
      svg.setAttribute('aria-valuemin', '2');
      svg.setAttribute('aria-valuemax', model.limit);
      svg.setAttribute('aria-valuenow', x);
      svg.setAttribute('aria-valuetext', summary.textContent);
    }
    markers.forEach(move => move(reading));
  }

  function changeLimit() {
    model = distributionModel(Number(limit.value));
    markers = [];
    update(model.limit);
    draw();
  }

  root.hidden = false;
  changeLimit();
  for (const svg of svgs) {
    svg.addEventListener('click', event => {
      const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(svg.getScreenCTM().inverse());
      const fraction = (point.x - 49) / (svg.viewBox.baseVal.width - 74);
      update(Math.round(2 + Math.min(1, Math.max(0, fraction)) * (model.limit - 2)));
    });
    svg.addEventListener('keydown', event => {
      const increment = event.shiftKey ? Math.max(1, Math.round(model.limit / 100)) : 1;
      const targets = { ArrowLeft: reading.x - increment, ArrowDown: reading.x - increment,
        ArrowRight: reading.x + increment, ArrowUp: reading.x + increment, Home: 2, End: model.limit };
      if (targets[event.key] === undefined) return;
      event.preventDefault();
      update(Math.max(2, Math.min(model.limit, targets[event.key])));
    });
  }
  limit.addEventListener('change', changeLimit);
  new ResizeObserver(() => {
    if (figures[0].clientWidth !== width) draw();
  }).observe(figures[0]);
  document.querySelector('#ejemplo-distribucion').hidden = true;
}
