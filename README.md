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

Quedan pendientes el plano complejo interactivo y el simulador de distribución
de primos y desviaciones.
