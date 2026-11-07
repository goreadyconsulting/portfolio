(() => {
  const journey = document.querySelector('[data-journey]');
  const progressBar = document.getElementById('page-progress-bar');
  const journeyRail = document.getElementById('journey-rail');
  const navLinks = [...document.querySelectorAll('[data-nav]')];
  const portraitStack = document.querySelector('.portrait-stack');
  const caption = document.querySelector('[data-caption]');
  const header = document.querySelector('[data-header]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const clamp = (n, min = 0, max = 1) => Math.min(Math.max(n, min), max);
  const smooth = t => t * t * (3 - 2 * t);
  const lerp = (a, b, t) => a + (b - a) * t;
  const compact = () => window.innerWidth <= 900;

  const ranges = {
    hero: [0.00, 0.025, 0.105, 0.155],
    method: [0.095, 0.14, 0.215, 0.255],
    flow: [0.20, 0.235, 0.305, 0.345],
    workIntro: [0.305, 0.335, 0.37, 0.395],
    cti: [0.36, 0.395, 0.455, 0.49],
    utilisation: [0.455, 0.49, 0.55, 0.585],
    ukcd: [0.55, 0.585, 0.645, 0.68],
    transition: [0.65, 0.685, 0.735, 0.775],
    career: [0.735, 0.77, 0.85, 0.885],
    foundation: [0.845, 0.88, 0.965, 1.00]
  };

  const opacityFor = (p, range) => {
    const [start, fullIn, fullOut, end] = range;
    if (p <= start || p >= end) return 0;
    if (p >= fullIn && p <= fullOut) return 1;
    if (p < fullIn) return smooth(clamp((p - start) / (fullIn - start)));
    return 1 - smooth(clamp((p - fullOut) / (end - fullOut)));
  };

  const journeyProgress = () => {
    if (!journey) return 0;
    const rect = journey.getBoundingClientRect();
    const range = Math.max(journey.offsetHeight - window.innerHeight, 1);
    return clamp(-rect.top / range);
  };

  const sceneSide = name => {
    if (['hero','workIntro','cti','ukcd','career'].includes(name)) return -1;
    if (['method','utilisation','foundation'].includes(name)) return 1;
    return 0;
  };

  const setScene = (name, opacity, p) => {
    const scene = document.querySelector('[data-scene="' + name + '"]');
    if (!scene) return;
    scene.style.opacity = opacity.toFixed(3);
    scene.classList.toggle('is-active', opacity > 0.46);

    if (reduced) return;
    const range = ranges[name];
    const center = (range[1] + range[2]) / 2;
    const drift = clamp((p - center) / 0.16, -1, 1);
    const side = sceneSide(name);
    const x = side * drift * 24;
    const y = side === 0 ? drift * -9 : drift * -14;
    scene.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
  };

  const updateScenes = p => {
    Object.entries(ranges).forEach(([name, range]) => setScene(name, opacityFor(p, range), p));
  };

  const updatePortrait = p => {
    if (!portraitStack) return;

    const swap = smooth(clamp((p - 0.665) / 0.125));
    const pulse = 1 - Math.abs(clamp((p - 0.725) / 0.095, -1, 1));
    const earlyDrift = Math.sin(p * Math.PI * 2) * 3.5;
    const scale = 1 + pulse * 0.035;
    const rotateY = lerp(-1.2, 1.5, p);

    portraitStack.style.setProperty('--front-opacity', String(1 - swap));
    portraitStack.style.setProperty('--back-opacity', String(swap));
    portraitStack.style.setProperty('--front-y', lerp(0, -9, swap) + 'px');
    portraitStack.style.setProperty('--back-y', lerp(9, 0, swap) + 'px');
    portraitStack.style.setProperty('--front-scale', String(lerp(1, 1.022, swap)));
    portraitStack.style.setProperty('--back-scale', String(lerp(.985, 1, swap)));
    portraitStack.style.setProperty('--portrait-scale', String(scale));
    portraitStack.style.setProperty('--portrait-ry', rotateY + 'deg');
    portraitStack.style.transform = 'translate3d(-50%,calc(-48% + ' + earlyDrift + 'px),0) scale(' + scale + ') rotateY(' + rotateY + 'deg)';

    if (caption) {
      if (p < 0.31) caption.textContent = 'OPERATIONS · PEOPLE · SYSTEMS';
      else if (p < 0.665) caption.textContent = 'WORK · DATA · TOOLS';
      else caption.textContent = 'SUPPORT · QUALITY · SCHEDULING · SYSTEMS';
    }
  };

  const updateFlow = p => {
    const local = smooth(clamp((p - 0.19) / 0.18));
    document.documentElement.style.setProperty('--flow-far-x', lerp(-64, 17, local) + 'vw');
    document.documentElement.style.setProperty('--flow-mid-x', lerp(-90, 33, local) + 'vw');
    document.documentElement.style.setProperty('--flow-near-x', lerp(-116, 52, local) + 'vw');

    const quoteLocal = clamp((p - 0.64) / 0.16);
    document.documentElement.style.setProperty('--quote-x', lerp(-7, 7, quoteLocal) + 'vw');

    const careerLocal = smooth(clamp((p - 0.72) / 0.19));
    document.documentElement.style.setProperty('--career-x', lerp(-7, 7, careerLocal) + 'vw');
    document.documentElement.style.setProperty('--career-x-reverse', lerp(7, -7, careerLocal) + 'vw');
  };

  const updateAmbient = p => {
    const wave = Math.sin(p * Math.PI * 2);
    document.documentElement.style.setProperty('--red-x', lerp(-26, 82, p) + 'px');
    document.documentElement.style.setProperty('--red-y', wave * 28 + 'px');
    document.documentElement.style.setProperty('--blue-x', lerp(34, -82, p) + 'px');
    document.documentElement.style.setProperty('--blue-y', -wave * 22 + 'px');

    document.documentElement.style.setProperty('--line-one-x', lerp(-8, 15, p) + 'vw');
    document.documentElement.style.setProperty('--line-two-x', lerp(9, -14, p) + 'vw');
    document.documentElement.style.setProperty('--line-three-x', lerp(-5, 9, p) + 'vw');

    document.documentElement.style.setProperty('--word-one-x', lerp(-12, 21, p) + 'vw');
    document.documentElement.style.setProperty('--word-one-y', lerp(0, -7, p) + 'vh');
    document.documentElement.style.setProperty('--word-two-x', lerp(14, -18, p) + 'vw');
    document.documentElement.style.setProperty('--word-two-y', lerp(4, -5, p) + 'vh');
    document.documentElement.style.setProperty('--word-three-x', lerp(-7, 12, p) + 'vw');
    document.documentElement.style.setProperty('--word-three-y', lerp(5, -4, p) + 'vh');
    document.documentElement.style.setProperty('--word-four-x', lerp(5, -10, p) + 'vw');
    document.documentElement.style.setProperty('--word-four-y', lerp(-2, 6, p) + 'vh');

    document.documentElement.style.setProperty('--portrait-red-x', lerp(-18, 18, p) + 'px');
    document.documentElement.style.setProperty('--portrait-red-y', wave * 10 + 'px');
    document.documentElement.style.setProperty('--portrait-blue-x', lerp(18, -16, p) + 'px');
    document.documentElement.style.setProperty('--portrait-blue-y', -wave * 8 + 'px');
  };

  const updateProgress = p => {
    if (journeyRail) journeyRail.style.transform = 'scaleX(' + p + ')';
    if (progressBar) {
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      progressBar.style.transform = 'scaleX(' + clamp(window.scrollY / max) + ')';
    }
  };

  const updateNav = p => {
    let active = p >= 0.30 && p < 0.72 ? 'work' : 'about';
    navLinks.forEach(link => link.classList.toggle('is-active', link.dataset.nav === active));
  };

  let previousY = window.scrollY;
  const updateHeader = () => {
    if (!header || compact()) return;
    const currentY = window.scrollY;
    const goingDown = currentY > previousY;
    header.classList.toggle('is-hidden', goingDown && currentY > window.innerHeight * 0.35);
    previousY = currentY;
  };

  let ticking = false;
  const render = () => {
    ticking = false;
    const p = journeyProgress();
    updateProgress(p);
    updateNav(p);
    updateHeader();

    if (compact()) return;
    updateScenes(p);
    updatePortrait(p);
    updateFlow(p);
    updateAmbient(p);
  };

  const requestRender = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(render);
  };

  window.addEventListener('scroll', requestRender, { passive:true });
  window.addEventListener('resize', requestRender);
  render();
})();
