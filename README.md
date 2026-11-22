# La hipótesis de Riemann, explicada para todos

Web divulgativa en español con siete secciones. La fase 2A incorpora un
explorador de primos, una calculadora de sumas parciales de la zeta y un
comparador con el producto de Euler.

## Vista local

Desde la raíz del repositorio, ejecuta `python3 -m http.server 8000` y abre
[http://localhost:8000/](http://localhost:8000/). Con JavaScript desactivado
se pueden leer el artículo, las fórmulas y los ejemplos de referencia.

La web usa rutas relativas para funcionar bajo `/hipotesis-riemann/` en GitHub
Pages. No necesita instalación de dependencias ni compilación.

## Pruebas

Ejecuta `node --test` con Node.js 22.7 o posterior. Las pruebas cubren
factorización, recuentos, zeta, producto de Euler, ceros tabulados y la
integral logarítmica. Comprueban también la monotonía y los errores de las
aproximaciones para todos los valores del deslizador.

## Organización

- `index.html` y `styles.css` definen el artículo, los ejemplos estáticos y la
  composición adaptable de los experimentos.
- `js/main.js` inicializa el índice y los simuladores.
- `js/primes.js` y `js/zeta.js` contienen los cálculos puros.
- `js/prime-explorer.js` gestiona la cuadrícula, la selección y los saltos.
- `js/zeta-experiments.js` comparte los controles y la presentación de
  resultados entre la suma y el comparador. `js/zeta-chart.js` dibuja los SVG.
- `tests/math.test.mjs` comprueba los módulos matemáticos sin el DOM.

## Valor de referencia de la zeta

Se suman los primeros 128 términos y se estima la cola infinita con
Euler–Maclaurin hasta la corrección de Bernoulli B₆. El término principal
de la cola es `128^(1−s)/(s−1)`. Este término recoge el crecimiento de la
zeta cerca de 1, donde sumar solo 1.000 términos deja un error considerable.

Para `1,2 ≤ s ≤ 5` el resto analítico está acotado por
`s(s+1)(s+2)(s+3)(s+4) / (30240 × 128^(s+5))`, menor de
`6 × 10⁻¹⁶` antes del redondeo de coma flotante. Las cifras mostradas
usan nueve decimales como máximo, con notación científica para diferencias
pequeñas. La gráfica usa un eje horizontal logarítmico y el producto solo
cambia en los límites que corresponden a primos.


## Plano complejo y distribución

Las secciones 4 a 6 incluyen un punto de ejemplo con coordenadas editables,
un explorador de cinco ceros tabulados y dos gráficas coordinadas para el
recuento de primos y su desviación. Los controles se pueden usar con teclado.
Sin JavaScript quedan las explicaciones y los ejemplos estáticos.

- `js/coordinates.js` proyecta coordenadas matemáticas a SVG. La exploración
  inicial usa la misma escala en los dos ejes. El gráfico de ceros usa escalas
  distintas para que se aprecien la anchura de la banda y las alturas.
- `js/complex-experiments.js` conecta los controles del plano y los ceros.
- `js/distribution.js` reutiliza la criba y la integral logarítmica. Una criba
  por intervalo produce todos los saltos del recuento. La integral se calcula
  en los saltos y en muestras intermedias y se interpola linealmente entre
  ellas. La desviación usa esas mismas muestras. Las lecturas se calculan
  directamente en el valor elegido, sin interpolación.
- `js/distribution-chart.js` dibuja las trazas SVG y los dos cursores.
  `js/distribution-experiment.js` coordina las gráficas y las lecturas.

Las pruebas de `tests/experiments.test.mjs` cubren la proyección, la banda
crítica, el recuento, la definición estándar de li(x) y la coherencia de las
lecturas con los datos de los gráficos. Los cinco ceros tabulados se
contrastaron de forma independiente con `mpmath.zetazero`.
