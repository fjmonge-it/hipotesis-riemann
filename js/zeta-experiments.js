import { eulerFactor, numericFraction, zetaTerm, zetaTerms } from './math-format.js';
import { numberLabel } from './v2-chart.js';
import { realSeries, zetaEvolution, zetaReference } from './zeta.js';
import { formatCount, formatGap, formatValue, renderZetaChart } from './zeta-chart.js';

const limits = [10, 25, 50, 100, 500, 1000];
const quick = [2, 3, 4];

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

  let inspected;
  let axes;
  function showPoint() {
    const prime = chartData.products.some(entry => entry.n === inspected);
    const action = prime ? ' Ambos caminos cambian: la suma añade su fracción y el producto incorpora un factor nuevo.'
      : inspected === 1 ? ' La suma empieza con 1. El producto aún no incluye ningún factor.'
      : ' La suma añade una fracción. El producto conserva su valor porque ' + inspected + ' es compuesto.';
    const reading = root.querySelector('[data-euler-point]');
    reading.textContent = 'Al incluir el ' + formatCount(inspected) + '.' + action;
    const svg = chart.querySelector('svg');
    const x = axes.x(inspected);
    svg.querySelector('[data-zeta-cursor]').setAttribute('d', 'M' + x + ' ' + axes.top + 'V' + axes.bottom);
    svg.setAttribute('aria-valuenow', inspected);
    svg.setAttribute('aria-valuetext', root.querySelector('[data-euler-point]').textContent);
  }
  function drawChart() {
    chartWidth = chart.clientWidth;
    axes = renderZetaChart(chart, chartData);
    if (!compare) return;
    const svg = chart.querySelector('svg');
    svg.setAttribute('tabindex', '0');
    svg.setAttribute('role', 'slider');
    svg.setAttribute('aria-label', 'Inspeccionar la comparación. Usa las flechas para cambiar el último número incluido.');
    svg.setAttribute('aria-valuemin', '1');
    svg.setAttribute('aria-valuemax', chartData.sums.length);
    function select(value) {
      inspected = Math.min(chartData.sums.length, Math.max(1, value));
      showPoint();
    }
    svg.addEventListener('keydown', event => {
      const targets = { ArrowLeft: inspected - 1, ArrowDown: inspected - 1, ArrowRight: inspected + 1,
        ArrowUp: inspected + 1, Home: 1, End: chartData.sums.length };
      if (targets[event.key] === undefined) return;
      event.preventDefault();
      select(targets[event.key]);
    });
    svg.addEventListener('click', event => {
      const x = new DOMPoint(event.clientX, event.clientY).matrixTransform(svg.getScreenCTM().inverse()).x;
      select(axes.termAt(x));
    });
    showPoint();
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
    const powerTerms = '1 + ' + [2, 3, 4].map(k => zetaTerm(k, a)).join(' + ') + ' + …';
    if (compare) {
      const factors = [2, 3, 5].map(p => eulerFactor(p, a));
      expanded.innerHTML = `
        <strong>Camino A · Primeros términos</strong>
        <span class="euler-expanded">${powerTerms}</span>
        <strong>Camino B · Primeros factores</strong>
        <span class="euler-factors">${factors.map((factor, i) => '<span>' + (i ? '× ' : '') + factor + '</span>').join('')}<span>× …</span></span>`;
    } else {
      const terms = zetaTerms(s);
      expanded.innerHTML = `
        <p><strong>1. Con potencias</strong><br>${powerTerms}</p>
        <p><strong>2. Denominadores calculados</strong><br>${Number.isInteger(s) ? '' : '≈ '}1 + ${terms.map(({ denominator }) => numericFraction(1, numberLabel(denominator))).join(' + ')} + …</p>
        <p><strong>3. Primeros valores decimales</strong><br>${terms.every(({ term }) => Number.isInteger(term)) ? '' : '≈ '}1 + ${terms.map(({ term }) => numberLabel(term)).join(' + ')} + …</p>`;
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
      <div class="result-limit"><dt>${compare ? 'Límite común de la suma y del producto' : 'Límite de la serie'}</dt><dd>${divergent
        ? '<strong>No existe un límite finito</strong><span>La serie original diverge.</span>'
        : '<strong>≈ ' + formatValue(reference) + '</strong><span>' + (compare ? 'Ambos procedimientos se aproximan al mismo valor.' : 'Aproximación numérica de alta precisión') + '</span>'}</dd></div>`;

    if (compare) {
      root.querySelector('[data-prime-preview]').textContent = 'Hasta ' + formatCount(n) + ' utilizamos '
        + formatCount(factorCount) + ' primos. El último es ' + formatCount(products.at(-1).n) + '.';
    }
    const caption = divergent ? 'La gráfica se detiene en N porque dejamos de sumar. Si seguimos, la suma crece sin límite.'
      : compare
      ? 'La suma sube con cada entero. El producto forma escalones: solo sube cuando N alcanza un primo.'
      : 'Cada nuevo sumando hace subir la curva. La línea discontinua indica el límite.';
    inspected = n;
    chartData = { s, sums, products, reference, compare, caption };
    drawChart();

    let observation;
    if (compare) {
      observation = 'La suma incluye ' + formatCount(n) + ' términos y el producto, '
        + formatCount(factorCount) + ' factores.';
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
