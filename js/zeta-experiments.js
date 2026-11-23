import { numberLabel } from './v2-chart.js';
import { realSeries, zetaEvolution, zetaReference } from './zeta.js';
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
  const expanded = root.querySelector('[data-expanded]');
  controls.innerHTML = `
    <div class="experiment-controls zeta-controls">
      <div class="exponent-control">
        <label for="${id}-s">Exponente <var>s</var> <span class="exponent-value" aria-hidden="true">2,0</span></label>
        <input type="range" id="${id}-s" min="${compare ? 1.2 : -2}" max="5" step="0.1" value="2">
        <div class="quick-values" role="group" aria-label="Exponentes rápidos">
          ${(compare ? quick : [...quick, 1, 0.5, 0, -2]).map(value => '<button type="button" data-exponent="' + value + '">s = ' + numberLabel(value) + '</button>').join('')}
        </div>
      </div>
      <label for="${id}-n">${compare ? '¿Hasta qué número quieres calcular?' : '¿Cuántos términos quieres sumar?'} <var>N</var>
        <select id="${id}-n">${(compare ? limits : [...limits, 10000, 100000]).map(n => '<option value="' + n + '"' + (n === 10 ? ' selected' : '') + '>' + formatCount(n) + '</option>').join('')}</select>
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

    const { sums, products = [], factorCount, reference = zetaReference(s) } =
      compare ? zetaEvolution(s, n, true) : realSeries(s, n);
    const divergent = reference === null;
    const a = numberLabel(s);
    if (compare) {
      const factors = [2, 3, 5].map(p => `<math><mfrac><mn>1</mn><mrow><mn>1</mn><mo>−</mo><mn>1</mn><mo>/</mo><msup><mn>${p}</mn><mn>${a}</mn></msup></mrow></mfrac></math>`);
      expanded.innerHTML = `
        <strong>Camino A · Primeros términos</strong>
        <span class="euler-expanded">1 + ${[2, 3, 4].map(k => `1/${k}<sup>${a}</sup>`).join(' + ')} + …</span>
        <strong>Camino B · Primeros factores</strong>
        <span class="euler-factors">${factors.map((factor, i) => '<span>' + (i ? '× ' : '') + factor + '</span>').join('')}<span>× …</span></span>`;
    } else {
      expanded.innerHTML = '<strong>Con s = ' + a + '</strong> · 1 + '
        + [2, 3, 4].map(k => '1/' + k + '<sup>' + a + '</sup>').join(' + ') + ' + …'
        + '<br>Con los denominadores calculados' + (Number.isInteger(s) ? ': ' : ' (aproximados): ')
        + '1 + ' + [2, 3, 4].map(k => (s < 0 ? numberLabel(k ** -s) : '1/' + numberLabel(k ** s))).join(' + ') + ' + …'
        + '<br>En números: 1 + ' + [2, 3, 4].map(k => numberLabel(k ** -s)).join(' + ') + ' + …';
    }
    const sum = sums.at(-1);
    const sumGap = divergent ? '' : formatGap(reference - sum);
    const product = products.at(-1)?.value;
    results.innerHTML = `
      <div class="result-sum"><dt>${compare ? 'Camino A · Suma de la zeta' : 'Suma parcial'}</dt><dd>
        <strong>${formatValue(sum)}</strong>
        <span>${formatCount(n)} sumandos</span>
        ${divergent ? '' : '<span>Faltan ≈ ' + sumGap + ' para el límite</span>'}
      </dd></div>
      ${compare ? `<div class="result-product"><dt>Camino B · Producto de Euler</dt><dd>
        <strong>${formatValue(product)}</strong>
        <span>${formatCount(factorCount)} factores primos</span>
        <span>Faltan ≈ ${formatGap(reference - product)} para el límite</span>
      </dd></div>` : ''}
      <div class="result-limit"><dt>Límite de la serie${compare ? ' y del producto' : ''}</dt><dd>${divergent
        ? '<strong>No existe un límite finito</strong><span>La serie original diverge.</span>'
        : '<strong>≈ ' + formatValue(reference) + '</strong><span>Aproximación numérica de alta precisión</span>'}</dd></div>`;

    if (compare) {
      const primes = products.map(point => point.n);
      const preview = primes.length <= 5 ? list.format(primes.map(String)) : primes.slice(0, 3).join(', ') + ', …, ' + primes.slice(-2).join(', ');
      root.querySelector('[data-prime-preview]').textContent = 'Primos incluidos: ' + preview
        + '. El último es ' + primes.at(-1) + ', el mayor primo menor o igual que ' + n + '.';
      root.querySelector('[data-prime-factors]').textContent = primes.map(p => p + ': 1/(1 − ' + p + '^(' + numberLabel(-s) + '))').join(' · ');
    }
    const caption = divergent ? 'La gráfica se detiene en N porque dejamos de sumar. Si seguimos, la suma crece sin límite.'
      : compare
      ? 'La suma sube con cada entero. El producto forma escalones: solo sube cuando N alcanza un primo.'
      : 'Cada nuevo sumando hace subir la curva. La línea discontinua indica el límite.';
    chartData = { s, sums, products, reference, compare, caption };
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
    if (s > 1 && s <= 1.4) pace = 'Cerca de 1, los términos decrecen despacio. Incluso con un límite de 1.000, aún queda una distancia apreciable.';
    if (s >= 4) pace = 'Con un exponente alto, los inversos de las potencias se hacen pequeños muy deprisa. Por eso las aproximaciones mejoran con pocos pasos.';
    insight.textContent = divergent
      ? (s === 1 ? 'En s = 1, cada término es pequeño, pero la suma armónica crece sin límite.'
        : s < 0 ? 'Los términos crecen. Añadir más hace que la suma aumente sin límite.'
        : s === 0 ? 'Todos los términos valen 1. La suma aumenta en una unidad cada vez.'
        : 'Las fracciones disminuyen, pero demasiado despacio para que la suma se acerque a un valor finito.')
      : observation + ' ' + pace;
    announcementText = 'Suma parcial: ' + formatValue(sum) + '. '
      + (compare ? 'Producto parcial: ' + formatValue(product) + '. ' : '')
      + (divergent ? 'No existe límite finito.' : 'Límite aproximado: ' + formatValue(reference) + '.');
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
