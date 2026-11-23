# La hipótesis de Riemann, explicada para todos

Web divulgativa en español. Las siete secciones conectan las separaciones
entre primos, la zeta, el producto de Euler, los ceros y el error al estimar
la cantidad de primos.

## Vista local y pruebas

Desde la raíz, inicia `python3 -m http.server 8000` y abre
[http://localhost:8000/](http://localhost:8000/). Los recursos tienen rutas
relativas para funcionar bajo `/hipotesis-riemann/` en GitHub Pages.
No hay compilación ni dependencias de aplicación. El texto, las fórmulas
y los ejemplos estáticos se pueden leer sin JavaScript.

Ejecuta `node --test` con Node.js 22.7 o posterior. Las pruebas cubren
primos y distancias, series convergentes y divergentes, producto de Euler,
proyecciones y ceros, recuentos y estimaciones, y estados iniciales.

## Organización

- `index.html` contiene el recorrido editorial. `styles.css` conserva la
  composición adaptable y la identidad visual.
- `js/prime-gaps.js` muestra secuencias consecutivas y dos indicadores
  comparados en cinco intervalos. La media y el máximo se calculan sobre
  todas las parejas, y se conserva la pareja que produce el mayor salto.
  El explorador presenta hasta cinco vecinas a cada lado de la pareja elegida.
- `js/zeta.js` contiene los cálculos. La referencia para s > 1 usa
  128 términos y una corrección de Euler–Maclaurin hasta B₆. En 1,2 ≤ s ≤ 5
  el resto analítico es menor que 6 × 10⁻¹⁶ antes del redondeo. Para s ≤ 1
  se calcula solo la suma finita. Para más de 1.000 términos, el gráfico
  dibuja muestras logarítmicas de las sumas calculadas. Los gráficos usan
  un eje horizontal lineal por debajo de 1.000 y vertical con marcas
  redondas para series divergentes.
- `js/complex-experiments.js` controla el plano, el mapa y los grupos de
  diez ceros entre los cincuenta tabulados. Los valores se obtuvieron con `mpmath.zetazero`
  a 35 cifras y se verificaron evaluando ζ en los ceros sin redondear.
  El navegador usa la tabla redondeada a seis decimales.
- `js/distribution.js` conserva la integral logarítmica estándar,
  li(x) = Ei(ln x). Un único selector actualiza el recuento, las estimaciones,
  las barras de error absoluto y la fila del historial de error relativo.
  A partir de 100.000, el gráfico de recuento une muestras. Las lecturas
  numéricas siempre usan el recuento exacto y los errores se calculan antes
  de redondear.
- La importancia de la recta crítica se explica comparando dos casos en
  texto. La cota permanece disponible como ampliación matemática.

## Fuentes contemporáneas

El [comunicado de Lean FRO y Mathlib Initiative](https://github.com/leanprover-community/blog/blob/d01066fd27759b7abae93e1b137090f3b5996a0f/posts/riemann_hypothesis.md)
se volvió a contrastar en el repositorio oficial. La consulta directa
del PDF de Alpöge y de la página institucional de Clay queda pendiente
por restricciones de acceso.
