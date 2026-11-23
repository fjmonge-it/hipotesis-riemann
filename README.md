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
- `js/prime-gaps.js` muestra distancias y secuencias consecutivas. Para un
  intervalo denso, cada barra representa el máximo de su tramo. La media
  y el máximo global se calculan sobre todas las parejas.
- `js/zeta.js` contiene los cálculos. La referencia para s > 1 usa
  128 términos y una corrección de Euler–Maclaurin hasta B₆. En 1,2 ≤ s ≤ 5
  el resto analítico es menor que 6 × 10⁻¹⁶ antes del redondeo. Para s ≤ 1
  se calcula solo la suma finita. Para más de 1.000 términos, el gráfico
  dibuja muestras logarítmicas de las sumas calculadas.
- `js/complex-experiments.js` controla el plano, el mapa y los grupos de
  hasta cincuenta ceros. Los valores se obtuvieron con `mpmath.zetazero`
  a 35 cifras y se verificaron evaluando ζ en los ceros sin redondear.
  El navegador usa la tabla redondeada a seis decimales.
- `js/distribution.js` conserva la integral logarítmica estándar,
  li(x) = Ei(ln x). Las dos gráficas comparten la selección, por puntero
  o teclado. Mayús y flecha avanza aproximadamente un centésimo del
  intervalo. Las estimaciones unen muestras y el recuento mantiene
  los saltos exactos.
- La gráfica de importancia relativa compara (x/2)^(−1/2) y
  (x/2)^(−1/4). Ambas están normalizadas al 100 % en x = 2.

## Fuentes contemporáneas

El [comunicado de Lean FRO y Mathlib Initiative](https://github.com/leanprover-community/blog/blob/d01066fd27759b7abae93e1b137090f3b5996a0f/posts/riemann_hypothesis.md)
se volvió a contrastar en el repositorio oficial. La consulta directa
del PDF de Alpöge y de la página institucional de Clay queda pendiente
por restricciones de acceso.
