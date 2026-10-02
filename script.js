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

    const darkMode =
      document.body.classList.contains('dark-mode');

    themeToggle.textContent =
      darkMode ? '☀️' : '🌙';

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


/* =========================================================
   SIVORA — DİL SEÇİMİ AÇILIR MENÜ
   Mevcut data-lang sistemini bozmadan çalışır.
========================================================= */

(function () {

  function initLanguageDropdown() {

    const box =
      document.getElementById(
        "language-switcher"
      );

    if (!box) return;


    const originalButtons =
      Array.from(
        box.querySelectorAll(
          ":scope > button[data-lang]"
        )
      );


    if (!originalButtons.length) return;


    /* Daha önce oluşturulduysa tekrar oluşturma */

    if (
      box.dataset.dropdownReady === "true"
    ) {
      return;
    }

    box.dataset.dropdownReady = "true";


    /* Ana dil butonu */

    const current =
      document.createElement("button");

    current.type = "button";

    current.className =
      "language-current";

    current.setAttribute(
      "aria-expanded",
      "false"
    );

    current.setAttribute(
      "aria-label",
      "Dil seçimi"
    );


    /* Açılır liste */

    const languageMenu =
      document.createElement("div");

    languageMenu.className =
      "language-menu";

    languageMenu.setAttribute(
      "role",
      "menu"
    );


    /* Aktif dili bul */

    let active =
      originalButtons.find(
        function (button) {

          return button.classList.contains(
            "active"
          );

        }
      );


    if (!active) {
      active = originalButtons[0];
    }


    /* Üstte görünen dili güncelle */

    function updateCurrent(button) {

      current.innerHTML =
        button.innerHTML +
        ' <span class="language-arrow">⌄</span>';

    }


    updateCurrent(active);


    /* TR / EN / DE seçeneklerini oluştur */

    originalButtons.forEach(
      function (originalButton) {

        const option =
          document.createElement("button");


        option.type = "button";

        option.className =
          "language-option";

        option.setAttribute(
          "role",
          "menuitem"
        );


        option.innerHTML =
          originalButton.innerHTML;


        option.addEventListener(
          "click",
          function (event) {

            event.stopPropagation();


            /*
             * Mevcut çeviri sisteminin
             * kendi butonunu çalıştır.
             */

            originalButton.click();


            /*
             * Üstte seçilen dili göster.
             */

            updateCurrent(
              originalButton
            );


            /*
             * Menüyü kapat.
             */

            box.classList.remove(
              "open"
            );


            current.setAttribute(
              "aria-expanded",
              "false"
            );

          }
        );


        languageMenu.appendChild(
          option
        );


        /*
         * Orijinal butonları görünmez yap.
         *
         * DOM'da kalıyorlar.
         * Böylece mevcut data-lang
         * sistemi çalışmaya devam ediyor.
         */

        originalButton.style.display =
          "none";

      }
    );


    /*
     * Eski / işaretlerini gizle.
     */

    box.querySelectorAll(
      ":scope > span"
    ).forEach(
      function (span) {

        span.style.display =
          "none";

      }
    );


    /*
     * Yeni dropdown'u ekle.
     */

    box.appendChild(current);

    box.appendChild(
      languageMenu
    );


    /*
     * Aç / kapa.
     */

    current.addEventListener(
      "click",
      function (event) {

        event.stopPropagation();


        const open =
          box.classList.toggle(
            "open"
          );


        current.setAttribute(
          "aria-expanded",
          open
            ? "true"
            : "false"
        );

      }
    );


    /*
     * Sayfanın başka yerine
     * tıklanınca kapat.
     */

    document.addEventListener(
      "click",
      function () {

        box.classList.remove(
          "open"
        );


        current.setAttribute(
          "aria-expanded",
          "false"
        );

      }
    );


    /*
     * Dil değiştiğinde üstteki
     * aktif dili güncelle.
     */

    const observer =
      new MutationObserver(
        function () {

          const newActive =
            originalButtons.find(
              function (button) {

                return button.classList.contains(
                  "active"
                );

              }
            );


          if (newActive) {

            updateCurrent(
              newActive
            );

          }

        }
      );


    observer.observe(
      box,
      {
        subtree: true,
        attributes: true,
        attributeFilter: [
          "class"
        ]
      }
    );

  }


  /*
   * Sayfa hazır olduğunda çalıştır.
   */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initLanguageDropdown
    );

  } else {

    initLanguageDropdown();

  }

})();
