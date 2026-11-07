(() => {
  const header = document.querySelector('[data-header]');
  const front = document.querySelector('.hero-front');
  const back = document.querySelector('.hero-back');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let previousY = window.scrollY;
  let ticking = false;

  const render = () => {
    ticking = false;
    const y = window.scrollY;
    const vh = Math.max(window.innerHeight, 1);
    const p = Math.min(y / vh, 1.2);

    if (header) {
      const goingDown = y > previousY;
      header.classList.toggle('is-hidden', goingDown && y > 220);
      previousY = y;
    }

    if (reduced) return;

    document.documentElement.style.setProperty('--front-x', (p * 26) + 'px');
    document.documentElement.style.setProperty('--front-y', (p * -34) + 'px');
    document.documentElement.style.setProperty('--back-x', (p * -38) + 'px');
    document.documentElement.style.setProperty('--back-y', (p * -18) + 'px');
    document.documentElement.style.setProperty('--red-x', (p * 35) + 'px');
    document.documentElement.style.setProperty('--blue-x', (p * -30) + 'px');
    document.documentElement.style.setProperty('--word-a', (p * -70) + 'px');
    document.documentElement.style.setProperty('--word-b', (p * 45) + 'px');
    document.documentElement.style.setProperty('--word-c', (p * -28) + 'px');
  };

  const requestRender = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(render);
  };

  window.addEventListener('scroll', requestRender, {passive:true});
  window.addEventListener('resize', requestRender);
  render();
})();