document.getElementById('year').textContent = new Date().getFullYear();

const menu = document.getElementById('menu');
const nav = document.getElementById('navlinks');

menu.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', open);
  menu.textContent = open ? '×' : '☰';
});

nav.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
    menu.textContent = '☰';
  });
});


/* Açık / Koyu tema */

const themeToggle = document.getElementById('theme-toggle');

if (themeToggle) {

  const savedTheme = localStorage.getItem('sivora-theme');

  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
  }

  themeToggle.addEventListener('click', () => {

    document.body.classList.toggle('dark-mode');

    const darkMode = document.body.classList.contains('dark-mode');

    themeToggle.textContent = darkMode ? '☀️' : '🌙';

    localStorage.setItem(
      'sivora-theme',
      darkMode ? 'dark' : 'light'
    );

  });

}
