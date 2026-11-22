import { zetaEvolution, zetaReference } from './zeta.js';
import { formatCount, formatGap, formatValue, renderZetaChart } from './zeta-chart.js';

const limits = [10, 25, 50, 100, 500, 1000];
const quick = [2, 3, 4];
const list = new Intl.ListFormat('es-ES');

export function initZetaExperiment(root, compare = false) {
  const id = root.id;
  const controls = root.querySelector('[data-controls]');
  const results = root.querySelector('[data-results]');
  const chart = root.querySelector('[data-chart]');
  const insight = root.querySelector('[data-insight]');
  controls.innerHTML = `
    <div class="experiment-controls zeta-controls">
      <div class="exponent-control">
        <label for="${id}-s">Exponente <var>s</var> <span class="exponent-value" aria-hidden="true">2,0</span></label>
        <input type="range" id="${id}-s" min="1.2" max="5" step="0.1" value="2">
        <div class="quick-values" role="group" aria-label="Exponentes rápidos">
          ${quick.map(value => '<button type="button" data-exponent="' + value + '">s = ' + value + '</button>').join('')}
        </div>
      </div>
      <label for="${id}-n">${compare ? 'Límite' : 'Número de términos'} <var>N</var>
        <select id="${id}-n">${limits.map(n => '<option value="' + n + '"' + (n === 10 ? ' selected' : '') + '>' + formatCount(n) + '</option>').join('')}</select>
      </label>
    </div>`;
  const exponent = controls.querySelector('input');
  const readout = controls.querySelector('.exponent-value');
  const limitSelect = controls.querySelector('select');
  const shortcuts = [...controls.querySelectorAll('button')];

  const announcement = document.createElement('span');
  announcement.className = 'visually-hidden';
  announcement.setAttribute('role', 'status');
  results.after(announcement);
  let chartData;
  let chartWidth;
  let announcementText;
  let announcementTimer;

  function drawChart() {
    chartWidth = chart.clientWidth;
    renderZetaChart(chart, chartData);
  }

  function update() {
    const s = exponent.valueAsNumber;
    const n = Number(limitSelect.value);
    const exponentLabel = s.toFixed(1).replace('.', ',');
    readout.textContent = exponentLabel;
    exponent.setAttribute('aria-valuetext', exponentLabel);
    for (const button of shortcuts) {
      button.setAttribute('aria-pressed', String(Number(button.dataset.exponent) === s));
    }

    const { sums, products, factorCount } = zetaEvolution(s, n, compare);
    const reference = zetaReference(s);
    const sum = sums.at(-1);
    const sumGap = formatGap(reference - sum);
    const product = products.at(-1)?.value;
    results.innerHTML = `
      <div class="result-sum"><dt>${compare ? 'Camino A · Suma de la zeta' : 'Suma parcial'}</dt><dd>
        <strong>${formatValue(sum)}</strong>
        <span>${formatCount(n)} sumandos</span>
        <span>Faltan ≈ ${sumGap} para el límite</span>
      </dd></div>
      ${compare ? `<div class="result-product"><dt>Camino B · Producto de Euler</dt><dd>
        <strong>${formatValue(product)}</strong>
        <span>${formatCount(factorCount)} factores primos</span>
        <span>Faltan ≈ ${formatGap(reference - product)} para el límite</span>
      </dd></div>` : ''}
      <div class="result-limit"><dt>Límite ${compare ? 'común ' : ''}ζ(s)</dt><dd><strong>≈ ${formatValue(reference)}</strong><span>Aproximación numérica de alta precisión</span></dd></div>`;

    const caption = compare
      ? 'La suma sube con cada entero. El producto forma escalones: solo sube cuando N alcanza un primo.'
      : 'Cada nuevo sumando hace subir la curva. La línea discontinua indica el límite.';
    chartData = { sums, products, reference, compare, caption };
    drawChart();

    let observation;
    if (compare && n === 10) {
      observation = 'El producto incorpora los factores de ' + list.format(products.map(point => String(point.n))) + '.';
    } else if (compare && n === 100) {
      observation = 'De los ' + formatCount(n) + ' enteros sumados, ' + formatCount(factorCount) + ' son primos y aportan un factor cada uno.';
    } else if (compare) {
      observation = 'En los tramos planos del producto, los nuevos enteros sí cuentan para la suma, pero ninguno es primo.';
    } else if (n === 1000) {
      observation = 'Incluso con 1.000 sumandos, quedan infinitos términos positivos por añadir.';
    } else {
      observation = 'Al aumentar N, la suma crece porque cada término nuevo es positivo.';
    }

    let pace = 'Un exponente mayor hace que los nuevos términos disminuyan más deprisa.';
    if (compare) pace = 'Cada operación añade elementos distintos. Sus resultados parciales pueden diferir aunque compartan el límite.';
    if (s <= 1.4) pace = 'Cerca de 1, los términos decrecen despacio. Incluso con un límite de 1.000, aún queda una distancia apreciable.';
    if (s >= 4) pace = 'Con un exponente alto, los inversos de las potencias se hacen pequeños muy deprisa. Por eso las aproximaciones mejoran con pocos pasos.';
    insight.textContent = observation + ' ' + pace;
    announcementText = 'Suma parcial: ' + formatValue(sum) + '. '
      + (compare ? 'Producto parcial: ' + formatValue(product) + '. ' : '')
      + 'Límite aproximado: ' + formatValue(reference) + '.';
  }

  function announce() {
    clearTimeout(announcementTimer);
    // Group successive keyboard steps into a single status update.
    announcementTimer = setTimeout(() => {
      announcement.textContent = announcementText;
    }, 220);
  }

  exponent.addEventListener('input', () => {
    clearTimeout(announcementTimer);
    update();
  });
  exponent.addEventListener('change', announce);
  limitSelect.addEventListener('change', () => {
    update();
    announce();
  });
  for (const button of shortcuts) {
    button.addEventListener('click', () => {
      exponent.value = button.dataset.exponent;
      update();
      announce();
    });
  }
  root.hidden = false;
  update();
  new ResizeObserver(() => {
    if (chart.clientWidth !== chartWidth) drawChart();
  }).observe(chart);
  root.nextElementSibling.hidden = true;
}
