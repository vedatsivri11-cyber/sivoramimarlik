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
   SIVORA MİMARLIK
   İLETİŞİM FORMU - SUPABASE / RESEND
========================================================= */

(function () {

  const contactForm =
    document.getElementById("contact-form");

  const contactStatus =
    document.getElementById("contact-status");

  if (!contactForm) return;


  contactForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();
      console.log("SIVORA FORM ÇALIŞTI");

      const name =
        document
          .getElementById("contact-name")
          .value
          .trim();

      const email =
        document
          .getElementById("contact-email")
          .value
          .trim();

      const phone =
        document
          .getElementById("contact-phone")
          .value
          .trim();

      const subject =
        document
          .getElementById("contact-subject")
          .value
          .trim();

      const message =
        document
          .getElementById("contact-message")
          .value
          .trim();


      /* GEREKLİ ALAN KONTROLÜ */

      if (
        !name ||
        !email ||
        !subject ||
        !message
      ) {

        contactStatus.textContent =
          "Lütfen gerekli alanları doldurun.";

        return;
      }


      /* BUTONU KİLİTLE */

      const submitButton =
        contactForm.querySelector(
          ".contact-submit"
        );

      if (submitButton) {

        submitButton.disabled = true;

        submitButton.textContent =
          "GÖNDERİLİYOR...";
      }


      contactStatus.textContent =
        "Mesajınız gönderiliyor...";


      try {

        /* SUPABASE CLIENT */

        const supabaseClient =
          window.supabase.createClient(
            window.SIVORA_SUPABASE_URL,
            window.SIVORA_SUPABASE_ANON_KEY
          );


        /* EDGE FUNCTION */

        const { data, error } =
          await supabaseClient.functions.invoke(
            "send-contact-email",
            {
              body: {
                name: name,
                email: email,
                phone: phone,
                subject: subject,
                message: message
              }
            }
          );


        if (error) {
          throw error;
        }


        if (
          !data ||
          data.success !== true
        ) {

          throw new Error(
            data?.error ||
            "Mesaj gönderilemedi."
          );

        }


        /* BAŞARILI */

        contactStatus.textContent =
          "Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.";


        contactForm.reset();


      } catch (error) {

        console.error(
          "İletişim formu hatası:",
          error
        );


        contactStatus.textContent =
          "Mesaj gönderilemedi. Lütfen daha sonra tekrar deneyin.";


      } finally {

        if (submitButton) {

          submitButton.disabled = false;

          submitButton.textContent =
            "GÖNDER";

        }

      }

    }
  );

})();
/* =====================================================
   SIVORA — DİL AÇILIR MENÜ
===================================================== */

(function () {

    const dropdown =
        document.getElementById("language-dropdown");

    const current =
        document.getElementById("language-current");

    const menu =
        document.getElementById("language-menu");

    if (!current || !menu) return;

    current.addEventListener("click", function (event) {

        event.stopPropagation();

        const parent =
            current.closest(".language-dropdown");

        if (!parent) return;

        const open =
            parent.classList.toggle("open");

        current.setAttribute(
            "aria-expanded",
            open ? "true" : "false"
        );

    });


    menu.querySelectorAll(
        "[data-language]"
    ).forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const language =
                    button.dataset.language;

                current.innerHTML =
                    language + " <span>⌄</span>";

                const parent =
                    current.closest(".language-dropdown");

                if (parent) {
                    parent.classList.remove("open");
                }

                current.setAttribute(
                    "aria-expanded",
                    "false"
                );

                /*
                 * BURADA MEVCUT DİL SİSTEMİNİZ
                 * ÇALIŞMAYA DEVAM EDECEK.
                 *
                 * Mevcut TR / EN / DE kodunu
                 * ayrıca değiştirmiyoruz.
                 */
            }
        );

    });


    document.addEventListener(
        "click",
        function () {

            const parent =
                current.closest(".language-dropdown");

            if (!parent) return;

            parent.classList.remove("open");

            current.setAttribute(
                "aria-expanded",
                "false"
            );

        }
    );

})();
