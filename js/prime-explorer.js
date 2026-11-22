import { primeFactors, primesUpTo } from './primes.js';

export function initPrimeExplorer(root) {
  const range = root.querySelector('#intervalo-primos');
  const highlight = root.querySelector('#mostrar-primos');
  const grid = root.querySelector('.prime-grid');
  const selection = root.querySelector('#numero-elegido');
  const gaps = root.querySelector('.gap-list');
  let selected = 1;
  let primes;
  let buttons;
  let tabStop;

  function moveTabStop(n) {
    tabStop.tabIndex = -1;
    tabStop = buttons[n - 1];
    tabStop.tabIndex = 0;
  }

  function showSelection() {
    const name = document.createElement('strong');
    const factors = primeFactors(selected);
    let explanation;
    if (selected === 1) {
      name.textContent = '1 · Unidad';
      explanation = 'Solo tiene un divisor positivo. Los primos tienen dos.';
    } else if (factors.length === 1) {
      name.textContent = selected + ' · Primo';
      explanation = 'Sus únicos divisores positivos son 1 y ' + selected + '.';
    } else {
      name.textContent = selected + ' · Compuesto';
      explanation = selected + ' = ' + factors.join(' × ') + '.';
    }
    selection.replaceChildren(name, document.createTextNode(' ' + explanation));

    const following = primes.findIndex(prime => prime > selected);
    const start = Math.min(primes.length - 5, Math.max(0, (following < 0 ? primes.length : following) - 3));
    const rows = primes.slice(start, start + 4).map((prime, offset) => {
      const next = primes[start + offset + 1];
      const gap = next - prime;
      const row = document.createElement('li');
      row.textContent = prime + ' → ' + next + ': ' + gap + (gap === 1 ? ' paso' : ' pasos');
      return row;
    });
    gaps.replaceChildren(...rows);
  }

  function fillGrid() {
    const limit = Number(range.value);
    if (selected > limit) selected = 1;
    primes = primesUpTo(limit);
    const primeSet = new Set(primes);
    buttons = Array.from({ length: limit }, (_, index) => {
      const n = index + 1;
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = n;
      button.dataset.number = n;
      if (n === 1) button.classList.add('unit-cell');
      if (primeSet.has(n)) button.classList.add('prime-cell');
      button.setAttribute('aria-pressed', String(n === selected));
      button.tabIndex = n === selected ? 0 : -1;
      return button;
    });
    tabStop = buttons[selected - 1];
    grid.replaceChildren(...buttons);
    grid.scrollTop = 0;
    showSelection();
  }

  grid.addEventListener('click', event => {
    const n = Number(event.target.dataset.number);
    if (!n) return;
    buttons[selected - 1].setAttribute('aria-pressed', 'false');
    selected = n;
    moveTabStop(n);
    buttons[selected - 1].setAttribute('aria-pressed', 'true');
    showSelection();
  });

  grid.addEventListener('keydown', event => {
    const n = Number(event.target.dataset.number);
    if (!n) return;
    const columns = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    const moves = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -columns, ArrowDown: columns };
    const delta = moves[event.key];
    if (delta === undefined) return;
    event.preventDefault();
    const next = n + delta;
    if (next < 1 || next > buttons.length) return;
    moveTabStop(next);
    buttons[next - 1].focus();
  });

  function showHighlights() {
    grid.classList.toggle('show-primes', highlight.checked);
    const marked = new Set(primes);
    for (const [index, button] of buttons.entries()) {
      const n = index + 1;
      button.setAttribute('aria-label', n === 1 ? '1, unidad' : (
        highlight.checked && marked.has(n) ? n + ', primo' : String(n)
      ));
    }
  }

  range.addEventListener('change', () => {
    fillGrid();
    showHighlights();
  });
  highlight.addEventListener('change', showHighlights);
  fillGrid();
  showHighlights();
  root.hidden = false;
  document.querySelector('#figura-primos').hidden = true;
}
