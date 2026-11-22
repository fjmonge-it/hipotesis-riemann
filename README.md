# La hipótesis de Riemann, explicada para todos

Artículo divulgativo en español sobre los números primos, la función zeta y la
hipótesis de Riemann. La fase 1 incluye el recorrido completo, fórmulas y
diagramas estáticos.

## Vista local

Desde la raíz del repositorio, ejecuta `python3 -m http.server 8000` y abre
[http://localhost:8000/](http://localhost:8000/). La página y las figuras pueden
leerse con JavaScript desactivado.

La web usa rutas relativas para poder servirse bajo `/hipotesis-riemann/` en
GitHub Pages. Cuando se apruebe la publicación, se puede seleccionar la raíz
de `main` como origen. El proyecto no necesita instalar dependencias ni
ejecutar una compilación.

## Pruebas

Ejecuta `node --test` con Node.js 22.7 o posterior. No se necesita npm.
Las pruebas comprueban el recuento de primos, las cotas de truncamiento de la
zeta, el producto de Euler, los ceros tabulados y la integral logarítmica
estándar con su desviación.

## Organización

- `index.html` contiene el artículo, el índice y los SVG. Las figuras con
  identificador reservan el punto de integración de cada simulador.
- `styles.css` define la composición editorial y su adaptación a pantallas pequeñas.
- `js/main.js` actualiza la indicación de sección seleccionada en el índice.
- `js/primes.js` reúne los cálculos de primos, li(x) y su desviación.
- `js/zeta.js` contiene la suma y el producto parciales para exponentes reales
  mayores que 1 y las coordenadas redondeadas de los tres primeros ceros
  no triviales con parte imaginaria positiva.
- `tests/math.test.mjs` comprueba los módulos de cálculo sin usar el DOM.

Quedan pendientes el explorador de primos, la suma parcial interactiva, el
comparador zeta–Euler, el plano complejo interactivo y el simulador de
distribución de primos y desviaciones.
