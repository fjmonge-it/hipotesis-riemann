const number = new Intl.NumberFormat('es-ES', { maximumSignificantDigits: 6, useGrouping: 'always' });
const integer = new Intl.NumberFormat('es-ES', { useGrouping: 'always' });
export const numberLabel = value => (Number.isInteger(value) ? integer : number).format(value).replace('-', '−');

export function plot(figure, { series, xLabel, yLabel, marker, label, minY = 0, maxY, minX, maxX, horizontalTicks, formatY = numberLabel, average, maximum, pointLabels = [], wideTicks = false, ringMarker = false }) {
  const svg = figure.querySelector('svg');
  const width = Math.max(245, Math.floor(figure.clientWidth));
  const left = wideTicks ? 28 : 61;
  const right = width - (wideTicks ? 32 : 30);
  const top = 25;
  const bottom = 153;
  const x = n => left + (right - left) * (n - minX) / (maxX - minX || 1);
  const y = n => bottom - (bottom - top) * (n - minY) / (maxY - minY || 1);
  const yTicks = [minY, (minY + maxY) / 2, maxY];
  const xTicks = horizontalTicks ?? (minX === maxX ? [minX] : [minX, maxX]).map(n => [n, numberLabel(n)]);
  svg.setAttribute('viewBox', '0 0 ' + width + ' 200');
  svg.setAttribute('aria-label', label);
  svg.innerHTML = `
    <g class="plane-labels">
      <text x="${left}" y="17">${yLabel}</text>
      ${yTicks.map(n => '<path class="grid" d="M' + left + ' ' + y(n) + 'H' + right + '"/><text text-anchor="end" x="' + (left - 5) + '" y="' + (y(n) + 4) + '">' + formatY(n) + '</text>').join('')}
      ${xTicks.map(([n, text]) => '<text text-anchor="middle" x="' + x(n) + '" y="173">' + text + '</text>').join('')}
      <path class="axis" d="M${left} ${top}V${bottom}H${right}"/>
      <text x="${width / 2}" y="194" text-anchor="middle">${xLabel}</text>
    </g>
    ${average !== undefined ? '<path class="zero-axis" d="M' + left + ' ' + y(average) + 'H' + right + '"/>' : ''}
    ${series.map(({ points, style, bars }) => {
      if (bars) return '<path class="' + style + '" d="' + points.map(([a, b]) => 'M' + x(a) + ' ' + y(0) + 'V' + y(b)).join('') + '"/>';
      return '<path class="' + style + '" d="' + points.map(([a, b], i) => (i === 0 ? 'M' : 'L') + x(a) + ' ' + y(b)).join('') + '"/>';
    }).join('')}
    ${pointLabels.map(([a, b, text]) => '<text class="plane-labels" x="' + x(a)
      + '" y="' + (Math.min(bottom - 17, y(b) - 12)) + '" text-anchor="middle">' + text + '</text>').join('')}
    ${maximum ? '<path class="peak-symbol" d="M' + x(maximum[0]) + ' ' + (y(maximum[1]) - 7) + 'l5 5 -5 5 -5 -5z"/>' : ''}
    ${marker && ringMarker ? '<circle class="selected-ring" r="8" cx="' + x(marker[0]) + '" cy="' + y(marker[1]) + '"/>' : ''}
    ${marker ? '<circle class="example-point" r="5" cx="' + x(marker[0]) + '" cy="' + y(marker[1]) + '"/>' : ''}`;
}
