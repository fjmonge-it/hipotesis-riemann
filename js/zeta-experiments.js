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
        <select id="${id}-n">${limits.map(n => '<option value="' + n + '">' + formatCount(n) + '</option>').join('')}</select>
      </label>
    </div>`;
  const exponent = controls.querySelector('input');
  const readout = controls.querySelector('.exponent-value');
  const limitSelect = controls.querySelector('select');
  const shortcuts = [...controls.querySelectorAll('button')];

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
      <div class="result-sum"><dt>Suma de la zeta</dt><dd>
        <strong>${formatValue(sum)}</strong>
        <span>${formatCount(n)} sumandos</span>
        <span>Faltan ≈ ${sumGap} para el límite</span>
      </dd></div>
      ${compare ? `<div class="result-product"><dt>Producto de Euler</dt><dd>
        <strong>${formatValue(product)}</strong>
        <span>${formatCount(factorCount)} factores primos</span>
        <span>Faltan ≈ ${formatGap(reference - product)} para el límite</span>
      </dd></div>` : ''}
      <div class="result-limit"><dt>Límite de referencia ζ(s)</dt><dd><strong>≈ ${formatValue(reference)}</strong></dd></div>`;

    const caption = compare
      ? 'La suma sube con cada entero. El producto forma escalones: solo sube cuando N alcanza un primo.'
      : 'Cada nuevo sumando hace subir la curva. La línea discontinua indica el límite.';
    renderZetaChart(chart, { sums, products, reference, compare, caption });

    const example = compare && n === 10
      ? ' Los factores corresponden a ' + list.format(products.map(point => String(point.n))) + '.'
      : '';
    const action = compare
      ? 'Hasta ' + formatCount(n) + ' hay ' + formatCount(factorCount) + ' primos. Cada uno aporta un factor, mientras que la suma usa los ' + formatCount(n) + ' enteros.'
      : 'Con ' + formatCount(n) + ' términos, la suma aún queda a unos ' + sumGap + ' del límite.';
    let pace = 'Al aumentar N, ambas aproximaciones siguen acercándose al mismo valor.';
    if (!compare) pace = 'Al añadir sumandos positivos, la suma sigue creciendo hacia ese valor.';
    if (s <= 1.4) pace = 'Cerca de 1, los términos decrecen despacio. Incluso con 1.000, el acercamiento al límite sigue mucho más allá de la gráfica.';
    if (s >= 4) pace = 'Con un exponente alto, las potencias crecen deprisa y sus inversos son muy pequeños. Por eso bastan pocos pasos para acercarse mucho al límite.';
    insight.textContent = action + example + ' ' + pace;
  }

  exponent.addEventListener('input', update);
  exponent.addEventListener('change', announce);
  limitSelect.addEventListener('change', () => {
    update();
    announce();
  });
  const announcement = document.createElement('span');
  announcement.className = 'visually-hidden';
  announcement.setAttribute('role', 'status');
  results.after(announcement);
  function announce() {
    announcement.textContent = results.textContent.replace(/\s+/g, ' ').trim();
  }
  for (const button of shortcuts) {
    button.addEventListener('click', () => {
      exponent.value = button.dataset.exponent;
      update();
      announce();
    });
  }
  update();
  root.hidden = false;
  root.nextElementSibling.hidden = true;
}
