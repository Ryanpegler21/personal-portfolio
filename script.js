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
  window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 10), { passive: true });
  document.querySelector('#year').textContent = new Date().getFullYear();
})();
