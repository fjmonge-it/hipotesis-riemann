const whole = new Intl.NumberFormat('es-ES', { useGrouping: 'always' });
export const formatCount = value => whole.format(value);
const decimals = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 9 });
const scientific = new Intl.NumberFormat('es-ES', { notation: 'scientific', maximumFractionDigits: 3 });
export const formatValue = value => decimals.format(value);
export const formatGap = value => value < 1e-8 ? scientific.format(value) : formatValue(value);

export function renderZetaChart(figure, { sums, products, reference, compare, caption }) {
  const limit = sums.length;
  const left = 76;
  const width = Math.max(240, Math.floor(figure.clientWidth) || 480);
  const right = width - 34;
  const top = 28;
  const bottom = width < 360 ? 158 : 176;
  const x = n => left + Math.log(n) / Math.log(limit) * (right - left);
  const max = reference ?? sums.at(-1) * 1.1;
  const y = value => bottom - (value - 1) / (max - 1) * (bottom - top);
  const coord = value => value.toFixed(2);
  const ticks = [1];
  for (const n of [2, 5, 10, 25, 50, 100, 250, 500, 1000, 5000, 10000, 50000]) {
    if (n < limit && x(n) - x(ticks.at(-1)) >= 36 && right - x(n) >= 44) ticks.push(n);
  }
  ticks.push(limit);
  const horizontal = [1, 1 + (max - 1) / 2, max];
  const yLabels = new Intl.NumberFormat('es-ES', max > 100000 ? { notation: 'scientific', maximumSignificantDigits: 3 } : { maximumFractionDigits: 4 });
  const grid = horizontal.map((value, i) => {
    const row = coord(y(value));
    const lineClass = i === 2 && reference !== null ? 'line-limit' : 'grid';
    return '<path class="' + lineClass + '" d="M' + left + ' ' + row + 'H' + right + '"/>'
      + '<text text-anchor="end" x="68" y="' + (Number(row) + 5) + '">' + yLabels.format(value) + '</text>';
  }).join('');
  const marks = ticks.map(n => {
    const column = coord(x(n));
    return '<path class="axis" d="M' + column + ' ' + bottom + 'v5"/>'
      + '<text text-anchor="middle" x="' + column + '" y="' + (bottom + 22) + '">' + formatCount(n) + '</text>';
  }).join('');
  const indices = limit <= 1000 ? sums.map((_, i) => i) :
    [...new Set(Array.from({ length: 321 }, (_, i) => Math.round(limit ** (i / 320)) - 1))];
  const sumPath = indices.map((index, i) => (
    (i === 0 ? 'M' : 'H') + coord(x(index + 1)) + (i === 0 ? ' ' : 'V') + coord(y(sums[index]))
  )).join('');
  const productPath = 'M' + left + ' ' + bottom + products.map(({ n, value }) => (
    'H' + coord(x(n)) + 'V' + coord(y(value))
  )).join('') + 'H' + right;
  const label = compare ? 'Evolución de la suma y del producto hasta N' : 'Evolución de la suma hasta N';
  figure.innerHTML = `
    <ul class="legend" aria-label="Leyenda">
      <li>Suma parcial</li>
      ${compare ? '<li class="legend-li">Producto parcial</li>' : ''}
      ${reference !== null ? '<li class="legend-limit">Valor límite</li>' : ''}
    </ul>
    <svg viewBox="0 0 ${width} ${bottom + 56}" role="img" aria-label="${label}">
      <g class="plot-text">
        <text x="66" y="17">Resultado de la suma</text>
        ${grid}${marks}
        <text x="${width / 2}" y="${bottom + 48}" text-anchor="middle">${compare ? 'Último número incluido' : 'Número de términos sumados'}</text>
      </g>
      <path class="axis" d="M${left} ${top}V${bottom}H${right}"/>
      <path class="line-primes" d="${sumPath}"/>
      ${compare ? '<path class="line-li" d="' + productPath + '"/>' : ''}
      ${compare ? '<path class="coordinate-guide" data-zeta-cursor/>' : ''}
      <circle class="prime-dots" data-zeta-end cx="${right}" cy="${coord(y(sums.at(-1)))}" r="3.5"/>
    </svg>
    <figcaption>${caption} El eje horizontal deja más espacio a los primeros pasos.</figcaption>`;
}
