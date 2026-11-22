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
