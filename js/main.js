import { initPrimeGaps, initPrimeSequence } from './prime-gaps.js';
import { initPrimeCount } from './prime-context.js';
import { initComplexPlane, initZeroExplorer, initZeroMap } from './complex-experiments.js';
import { initDistributionExperiment } from './distribution-experiment.js';
import { initZetaExperiment } from './zeta-experiments.js';

// Enhance the article index when JavaScript is available.
const links = [...document.querySelectorAll('.contents a')];

function updateCurrentSection() {
  for (const link of links) {
    if (link.hash === location.hash) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  }
}

updateCurrentSection();
window.addEventListener('hashchange', updateCurrentSection);

initZetaExperiment(document.querySelector('#experimento-zeta'));
initZetaExperiment(document.querySelector('#experimento-euler'), true);

initComplexPlane(document.querySelector('#experimento-complejos'));
initZeroExplorer(document.querySelector('#experimento-ceros'));
initDistributionExperiment(document.querySelector('#experimento-distribucion'));

initPrimeGaps(document.querySelector('#distancias-primos'));
initPrimeSequence(document.querySelector('#explorador-secuencia'));
initZeroMap(document.querySelector('#mapa-ceros'));
initPrimeCount(document.querySelector('#primer-recuento'));
