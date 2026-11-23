# La hipótesis de Riemann, explicada para todos

Web divulgativa en español con siete secciones y experimentos sobre primos,
zeta, producto de Euler, números complejos, ceros y distribución de primos.

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
aproximaciones para todos los valores del deslizador y los estados iniciales
de los experimentos de ceros y distribución.

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

## Segunda versión

- Los saltos se calculan exactamente entre primos consecutivos. Para los
  intervalos densos se dibuja el máximo de cada tramo y se guarda su pareja.
  El juego busca primos mediante división por candidatos hasta la raíz.
- La serie finita de la zeta se puede explorar hasta 100.000 términos. Para
  s ≤ 1 se omite el límite y se indica que la serie diverge. Para N > 1.000,
  la gráfica de sumas parciales muestra muestras espaciadas logarítmicamente.
  Los resultados numéricos se calculan usando todos los términos elegidos.
- Euler conserva el intervalo original y muestra la lista de factores reales.
- El mapa de ceros separa las dos clases de ceros. La hipótesis se explora
  revelando uno, tres y cinco puntos antes de mostrar la recta crítica.
- Las gráficas de recuento y de error comparten lectura y controles. Los
  escalones son exactos y las curvas de las estimaciones unen muestras.
  La oscilación relativa ilustra una sola contribución y usa un ejemplo
  hipotético de parte real ¾, con frecuencia fija.
- El comunicado de Lean FRO y Mathlib Initiative se contrastó con su
  [fuente oficial](https://github.com/leanprover-community/blog/blob/d01066fd27759b7abae93e1b137090f3b5996a0f/posts/riemann_hypothesis.md).
  El estado institucional se enlaza a Clay para consulta directa.

Además de las pruebas previas, `tests/v2.test.mjs` comprueba los primos
grandes y el récord de saltos, el caso divergente de zeta, los factores de
Euler, las dos estimaciones y el modelo relativo de oscilación.
