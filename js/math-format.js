const number = value => '<mn>' + value + '</mn>';
const fraction = (top, bottom) => '<mfrac>' + top + bottom + '</mfrac>';
const math = content => '<math>' + content + '</math>';

export function zetaTerm(base, exponent) {
  return math(fraction(number(1), '<msup>' + number(base) + number(exponent) + '</msup>'));
}

export function numericFraction(top, bottom) {
  return math(fraction(number(top), number(bottom)));
}

export function eulerFactor(base, exponent) {
  const power = '<msup>' + number(base) + number(exponent) + '</msup>';
  return math(fraction(number(1), '<mrow><mn>1</mn><mo>−</mo>' + fraction(number(1), power) + '</mrow>'));
}

export function zetaTerms(s, bases = [2, 3, 4]) {
  return bases.map(base => {
    const denominator = base ** s;
    return { base, denominator, term: 1 / denominator };
  });
}
