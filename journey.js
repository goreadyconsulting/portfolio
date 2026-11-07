(() => {
  const header = document.querySelector('[data-header]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let previousY = window.scrollY;
  let ticking = false;

  const updateHeader = () => {
    if (!header) return;
    const y = window.scrollY;
    const goingDown = y > previousY;
    header.classList.toggle('is-hidden', goingDown && y > 260);
    header.classList.toggle('is-solid', y > 70 || document.body.dataset.page !== 'home');
    previousY = y;
  };

  const updateHero = () => {
    if (reduced || document.body.dataset.page !== 'home') return;
    const vh = Math.max(window.innerHeight, 1);
    const p = Math.min(window.scrollY / vh, 1.2);
    const root = document.documentElement.style;
    root.setProperty('--front-x', (p * 26) + 'px');
    root.setProperty('--front-y', (p * -34) + 'px');
    root.setProperty('--back-x', (p * -38) + 'px');
    root.setProperty('--back-y', (p * -18) + 'px');
    root.setProperty('--red-x', (p * 35) + 'px');
    root.setProperty('--blue-x', (p * -30) + 'px');
    root.setProperty('--word-a', (p * -70) + 'px');
    root.setProperty('--word-b', (p * 45) + 'px');
    root.setProperty('--word-c', (p * -28) + 'px');
  };

  const projectLink = id => 'project.html?id=' + encodeURIComponent(id);

  const renderWork = () => {
    const grid = document.querySelector('[data-project-grid]');
    if (!grid || !window.PORTFOLIO_PROJECTS) return;
    const count = document.querySelector('[data-project-count]');
    const filters = [...document.querySelectorAll('[data-filter]')];

    grid.innerHTML = window.PORTFOLIO_PROJECTS.map(project => {
      const tagString = [project.group, ...(project.tags || [])].join(' ');
      return '<a class="explorer-card" data-project-card data-project-tags="' + tagString + '" href="' + projectLink(project.id) + '">' +
        '<div class="card-meta"><span>' + project.label + '</span><span>' + (project.group === 'professional' ? 'Professional' : 'Personal') + '</span></div>' +
        '<h2>' + project.title + '</h2>' +
        '<p>' + project.summary + '</p>' +
        '<div class="card-tech">' + project.tech.join(' · ') + '</div>' +
        '<div class="card-arrow">View project →</div>' +
      '</a>';
    }).join('');

    const cards = [...grid.querySelectorAll('[data-project-card]')];
    const setFilter = value => {
      filters.forEach(button => button.classList.toggle('is-active', button.dataset.filter === value));
      let visible = 0;
      cards.forEach(card => {
        const tags = card.dataset.projectTags.split(' ');
        const show = value === 'all' || tags.includes(value);
        card.classList.toggle('is-hidden', !show);
        if (show) visible++;
      });
      if (count) count.textContent = visible + (visible === 1 ? ' project' : ' projects');
      const url = new URL(window.location.href);
      if (value === 'all') url.searchParams.delete('filter'); else url.searchParams.set('filter', value);
      history.replaceState(null, '', url);
    };

    filters.forEach(button => button.addEventListener('click', () => setFilter(button.dataset.filter)));
    const requested = new URLSearchParams(location.search).get('filter');
    const valid = filters.some(button => button.dataset.filter === requested);
    setFilter(valid ? requested : 'all');
  };

  const renderProject = () => {
    const mount = document.querySelector('[data-project-detail]');
    if (!mount || !window.PORTFOLIO_PROJECTS) return;

    const id = new URLSearchParams(location.search).get('id');
    const projects = window.PORTFOLIO_PROJECTS;
    const project = projects.find(item => item.id === id);

    if (!project) {
      mount.innerHTML = '<section class="project-loading"><h1>Project not found.</h1><p><a class="text-link" href="work.html">Back to work →</a></p></section>';
      return;
    }

    document.title = project.title + ' | P Omkareshwar Reddy';
    const index = projects.indexOf(project);
    const previous = projects[(index - 1 + projects.length) % projects.length];
    const next = projects[(index + 1) % projects.length];

    const links = [];
    if (project.repo) links.push('<a href="' + project.repo + '" target="_blank" rel="noreferrer">GitHub repo ↗</a>');
    if (project.repo2) links.push('<a href="' + project.repo2 + '" target="_blank" rel="noreferrer">' + (project.repo2Label || 'Additional repo') + ' ↗</a>');
    if (project.live) links.push('<a href="' + project.live + '" target="_blank" rel="noreferrer">Live site ↗</a>');

    mount.innerHTML =
      '<section class="case-hero">' +
        '<div class="case-meta"><span>' + (project.group === 'professional' ? 'Professional work' : 'Personal project') + '</span><i></i><span>' + project.label + '</span></div>' +
        '<h1>' + project.title + '</h1>' +
        '<p class="case-summary">' + project.summary + '</p>' +
        (links.length ? '<div class="case-links">' + links.join('') + '</div>' : '') +
      '</section>' +
      '<section class="case-grid">' +
        '<div class="case-block"><small>The problem</small><h2>Why this needed to exist.</h2><p>' + project.problem + '</p></div>' +
        '<div class="case-block"><small>What I built</small><h2>The working answer.</h2><p>' + project.built + '</p></div>' +
        '<div class="case-block"><small>My role</small><h2>Where I was involved.</h2><p>' + project.role + '</p></div>' +
        '<div class="case-block"><small>Project type</small><h2>' + project.label + '</h2><p>' + (project.group === 'professional' ? 'Built around an operational or business workflow.' : 'Built as a personal product, creative or technical experiment.') + '</p></div>' +
      '</section>' +
      '<section class="architecture-section"><small>How it works</small><h2>Simple architecture.</h2><div class="architecture-diagram">' +
        project.architecture.map((item, i) => '<span>' + item + '</span>' + (i < project.architecture.length - 1 ? '<i>→</i>' : '')).join('') +
      '</div></section>' +
      '<section class="tech-section"><small>Technology</small><h2>What was used.</h2><div class="tech-list">' +
        project.tech.map(item => '<span>' + item + '</span>').join('') +
      '</div></section>' +
      '<div class="case-note">' + project.note + '</div>' +
      '<nav class="case-nav" aria-label="Other projects"><a href="' + projectLink(previous.id) + '">← ' + previous.title + '</a><a href="' + projectLink(next.id) + '">' + next.title + ' →</a></nav>';
  };

  const render = () => {
    ticking = false;
    updateHeader();
    updateHero();
  };
  const requestRender = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(render);
  };

  renderWork();
  renderProject();
  window.addEventListener('scroll', requestRender, {passive:true});
  window.addEventListener('resize', requestRender);
  render();
})();