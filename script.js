(() => {
  'use strict';
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const themeButton = document.querySelector('.theme-toggle');
  function setTheme(dark) {
    document.body.classList.toggle('dark', dark);
    themeButton.setAttribute('aria-pressed', String(dark));
    themeButton.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
    document.querySelector('meta[name="theme-color"]').content = dark ? '#0d1524' : '#ffffff';
  }
  try { setTheme(localStorage.getItem('theme') === 'dark'); } catch { /* Storage may be unavailable in private contexts. */ }
  themeButton.addEventListener('click', () => {
    const dark = !document.body.classList.contains('dark');
    setTheme(dark);
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch { /* Theme still works without persistence. */ }
  });
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  function closeMenu() { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Open navigation'); }
  menu.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menu.focus(); } });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  window.matchMedia('(min-width: 801px)').addEventListener('change', closeMenu);
  if ('IntersectionObserver' in window) {
    if (!motion.matches) {
      document.body.classList.add('motion-ready');
      const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); reveal.unobserve(entry.target); }
      }), { threshold: 0.07 });
      document.querySelectorAll('.reveal').forEach(element => reveal.observe(element));
    }
    const active = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        nav.querySelectorAll('a').forEach(link => {
          const current = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('active', current);
          if (current) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
        });
      }
    }), { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
    document.querySelectorAll('main section[id]').forEach(section => active.observe(section));
  }
  const phrases = ['Financial Data Analyst at Allstate', 'Founder of OpenField', 'Finance & Information Systems | Illinois', 'Bocconi University | Milan'];
  const typed = document.querySelector('#typed-text');
  let phrase = 0, index = phrases[0].length, deleting = true, timer;
  function type() {
    if (motion.matches) { typed.textContent = phrases[0]; return; }
    const text = phrases[phrase];
    index += deleting ? -1 : 1;
    typed.textContent = text.slice(0, index);
    let delay = deleting ? 28 : 55;
    if (!deleting && index === text.length) { deleting = true; delay = 2400; }
    else if (deleting && index === 0) { deleting = false; phrase = (phrase + 1) % phrases.length; delay = 350; }
    timer = window.setTimeout(type, delay);
  }
  if (!motion.matches) timer = window.setTimeout(type, 2800);
  motion.addEventListener('change', () => {
    window.clearTimeout(timer);
    if (motion.matches) { document.body.classList.remove('motion-ready'); typed.textContent = phrases[0]; }
    else { phrase = 0; index = phrases[0].length; deleting = true; typed.textContent = phrases[0]; timer = window.setTimeout(type, 2800); }
  });
  const header = document.querySelector('.site-header');
  const progress = document.querySelector('.reading-progress > span');
  let scrollQueued = false;
  function updateScroll() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const fraction = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    progress.style.transform = `scaleX(${fraction})`;
    header.classList.toggle('scrolled', window.scrollY > 10);
    scrollQueued = false;
  }
  function queueScroll() {
    if (!scrollQueued) { scrollQueued = true; window.requestAnimationFrame(updateScroll); }
  }
  window.addEventListener('scroll', queueScroll, { passive: true });
  window.addEventListener('resize', queueScroll);
  window.addEventListener('load', queueScroll);
  if ('ResizeObserver' in window) new window.ResizeObserver(queueScroll).observe(document.body);
  updateScroll();

  const copyButton = document.querySelector('.copy-email');
  const copyLabel = copyButton.querySelector('span');
  const copyStatus = document.querySelector('.copy-status');
  let copyReset;
  if (window.navigator.clipboard && window.navigator.clipboard.writeText) {
    copyButton.hidden = false;
    copyButton.addEventListener('click', async () => {
      window.clearTimeout(copyReset);
      try {
        await window.navigator.clipboard.writeText('ryan.d.pegler@gmail.com');
        copyButton.classList.add('copied');
        copyLabel.textContent = 'Copied';
        copyStatus.textContent = 'Email address copied to clipboard.';
      } catch {
        copyButton.classList.remove('copied');
        copyLabel.textContent = 'Copy';
        copyStatus.textContent = 'Could not copy. You can select the email address or click it to open your email app.';
      }
      copyReset = window.setTimeout(() => {
        copyButton.classList.remove('copied');
        copyLabel.textContent = 'Copy';
        copyStatus.textContent = '';
      }, 2500);
    });
  }
  document.querySelector('#year').textContent = new Date().getFullYear();
})();

// Project filters and keyboard-accessible quick navigation.
(() => {
  'use strict';
  const filters = document.querySelector('.project-filters');
  const cards = [...document.querySelectorAll('.project-card')];
  filters.hidden = false;
  filters.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.filter;
      let count = 0;
      cards.forEach(card => {
        card.hidden = category !== 'all' && card.dataset.category !== category;
        if (!card.hidden) { count++; card.classList.add('visible'); }
      });
      filters.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      filters.querySelector('.filter-status').textContent = `${count} ${count === 1 ? 'project' : 'projects'} shown.`;
    });
  });

  const dialog = document.querySelector('.command-dialog');
  const trigger = document.querySelector('.command-toggle');
  if (typeof dialog.showModal !== 'function') return;
  const search = dialog.querySelector('#command-search');
  const links = [...dialog.querySelectorAll('.command-results a')];
  const empty = dialog.querySelector('.command-empty');
  let selected = 0, returnFocus;
  const visibleLinks = () => links.filter(link => !link.hidden);
  function select(index, scroll = false) {
    const visible = visibleLinks();
    selected = visible.length ? (index + visible.length) % visible.length : 0;
    links.forEach(link => link.classList.remove('selected'));
    if (visible[selected]) {
      visible[selected].classList.add('selected');
      if (scroll) visible[selected].scrollIntoView({ block: 'nearest' });
    }
  }
  function filter() {
    const query = search.value.trim().toLowerCase();
    links.forEach(link => { link.hidden = !`${link.textContent} ${link.dataset.search}`.toLowerCase().includes(query); });
    empty.hidden = visibleLinks().length > 0;
    select(0);
  }
  function open() {
    if (dialog.open) return;
    returnFocus = document.activeElement;
    search.value = '';
    filter();
    dialog.showModal();
    document.body.classList.add('command-open');
    search.focus();
  }
  function close() { dialog.close(); }
  trigger.hidden = false;
  trigger.querySelector('kbd').textContent = /Mac|iPhone|iPad/.test(window.navigator.platform || '') ? '⌘ K' : 'Ctrl K';
  trigger.addEventListener('click', open);
  dialog.querySelector('.command-close').addEventListener('click', close);
  dialog.addEventListener('close', () => {
    document.body.classList.remove('command-open');
    if (returnFocus && typeof returnFocus.focus === 'function') returnFocus.focus();
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close();
  });
  search.addEventListener('input', filter);
  links.forEach(link => link.addEventListener('click', () => {
    close();
    const href = link.getAttribute('href');
    if (href.startsWith('#')) {
      const section = document.querySelector(href);
      if (section) {
        returnFocus = section;
        section.setAttribute('tabindex', '-1');
        section.focus({ preventScroll: true });
        section.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      }
    }
  }));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const focused = visibleLinks().indexOf(document.activeElement);
      select((focused >= 0 ? focused : selected) + (event.key === 'ArrowDown' ? 1 : -1), true);
      search.focus({ preventScroll: true });
    } else if (event.key === 'Enter' && event.target === search) {
      event.preventDefault();
      visibleLinks()[selected]?.click();
    }
  });
  document.addEventListener('keydown', event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k' && !event.altKey) {
      event.preventDefault();
      if (dialog.open) close(); else open();
    }
  });
})();
