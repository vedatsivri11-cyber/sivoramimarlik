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
/* =========================================================
   SIVORA - DİL SEÇİM DROPDOWN
========================================================= */

(function () {

    const languageBox =
        document.getElementById("language-switcher");

    if (!languageBox) return;

    const buttons =
        languageBox.querySelectorAll("[data-lang]");

    if (!buttons.length) return;


    /* Mevcut yapıyı dropdown görünümüne hazırla */

    languageBox.classList.add("language-dropdown");


    /* Mevcut aktif dili bul */

    let activeButton =
        languageBox.querySelector(
            "[data-lang].active"
        );

    if (!activeButton) {
        activeButton = buttons[0];
    }


    /* Ana butonu oluştur */

    const currentLanguage =
        document.createElement("button");

    currentLanguage.type = "button";

    currentLanguage.className =
        "language-current";

    currentLanguage.setAttribute(
        "aria-expanded",
        "false"
    );

    currentLanguage.innerHTML =
        activeButton.innerHTML +
        ' <span class="language-arrow">⌄</span>';


    /* Eski butonları menüye al */

    const menu =
        document.createElement("div");

    menu.className =
        "language-menu";


    buttons.forEach(function (button) {

        const option =
            document.createElement("button");

        option.type = "button";

        option.className =
            "language-option";

        option.dataset.lang =
            button.dataset.lang;

        option.innerHTML =
            button.innerHTML;


        option.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                const selectedLanguage =
                    button.dataset.lang;


                /* Ana butonda seçilen dili göster */

                currentLanguage.innerHTML =
                    button.innerHTML +
                    ' <span class="language-arrow">⌄</span>';


                /* Aktif dili güncelle */

                buttons.forEach(function (item) {
                    item.classList.remove("active");
                });

                button.classList.add("active");


                /* Menüyü kapat */

                languageBox.classList.remove("open");

                currentLanguage.setAttribute(
                    "aria-expanded",
                    "false"
                );


                /*
                 * MEVCUT DİL SİSTEMİNİ ÇALIŞTIR
                 *
                 * Mevcut data-lang butonuna
                 * tıklatıyoruz.
                 */

                button.click();

            }
        );


        menu.appendChild(option);

    });


    /* Eski yapıyı gizle */

    buttons.forEach(function (button) {
        button.style.display = "none";
    });

    languageBox
        .querySelectorAll(":scope > span")
        .forEach(function (span) {
            span.style.display = "none";
        });


    /* Yeni yapıyı ekle */

    languageBox.appendChild(currentLanguage);

    languageBox.appendChild(menu);


    /* Aç / kapa */

    currentLanguage.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            const isOpen =
                languageBox.classList.toggle("open");

            currentLanguage.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );

        }
    );


    /* Sayfaya tıklayınca kapat */

    document.addEventListener(
        "click",
        function () {

            languageBox.classList.remove("open");

            currentLanguage.setAttribute(
                "aria-expanded",
                "false"
            );

        }
    );

})();
