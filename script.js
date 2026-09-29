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
/* =========================================================
   SIVORA MİMARLIK - İLETİŞİM FORMU
========================================================= */

(function () {

  const contactForm =
    document.getElementById("contact-form");

  const contactStatus =
    document.getElementById("contact-status");

  if (!contactForm) return;

  contactForm.addEventListener(
    "submit",
    function (event) {

      event.preventDefault();

      const name =
        document.getElementById("contact-name").value.trim();

      const email =
        document.getElementById("contact-email").value.trim();

      const phone =
        document.getElementById("contact-phone").value.trim();

      const subject =
        document.getElementById("contact-subject").value.trim();

      const message =
        document.getElementById("contact-message").value.trim();


      if (!name || !email || !subject || !message) {

        contactStatus.textContent =
          "Lütfen gerekli alanları doldurun.";

        return;
      }


      const mailSubject =
        encodeURIComponent(
          "SIVORA MİMARLIK - " + subject
        );


      const mailBody =
        encodeURIComponent(
          "Ad Soyad: " + name +
          "\n\n" +
          "E-posta: " + email +
          "\n\n" +
          "Telefon: " + (phone || "-") +
          "\n\n" +
          "Mesaj:\n" + message
        );


      window.location.href =
        "mailto:sivoramimarlik@gmail.com" +
        "?subject=" +
        mailSubject +
        "&body=" +
        mailBody;

    }
  );

})();
