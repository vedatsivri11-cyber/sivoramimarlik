/* =========================================================
   SIVORA MİMARLIK
   TÜRKÇE / ENGLISH / DEUTSCH DİL SİSTEMİ
========================================================= */

(function () {
  "use strict";

  const STORAGE_KEY = "sivora-language";

  const translations = {
    tr: {
      "SİVORA MİMARLIK & GAYRİMENKUL": "SİVORA MİMARLIK & GAYRİMENKUL",
      "ZERAFETİN İZİNDE": "ZERAFETİN İZİNDE",
      "GAYRİMENKUL": "GAYRİMENKUL",

      "Projeler": "Projeler",
      "Gayrimenkuller": "Gayrimenkuller",
      "Yaklaşım": "Yaklaşım",
      "Hizmetler": "Hizmetler",
      "İletişim": "İletişim",

      "Mekânın": "Mekânın",
      "karakteri.": "karakteri.",
      "Tasarım": "Tasarım",
      "mimarinin": "mimarinin",
      "ötesinde.": "ötesinde.",

      "Seçkin mimari projeler,": "Seçkin mimari projeler,",
      "özenle seçilmiş gayrimenkuller": "özenle seçilmiş gayrimenkuller",
      "ve zamansız tasarım anlayışı.": "ve zamansız tasarım anlayışı.",

      "Projelerimizi İncele": "Projelerimizi İncele",
      "Gayrimenkulleri İncele": "Gayrimenkulleri İncele",

      "Projeler": "Projeler",
      "Mimari": "Mimari",
      "tasarımın": "tasarımın",
      "iz bırakan": "iz bırakan",
      "örnekleri.": "örnekleri.",

      "Gayrimenkuller": "Gayrimenkuller",
      "Seçkin": "Seçkin",
      "yaşam alanları.": "yaşam alanları.",

      "Yaklaşım": "Yaklaşım",
      "Mekâna": "Mekâna",
      "anlam": "anlam",
      "katıyoruz.": "katıyoruz.",

      "Her proje; bağlam, işlev, estetik ve kullanıcı deneyiminin": "Her proje; bağlam, işlev, estetik ve kullanıcı deneyiminin",
      "bir bütün olarak ele alındığı bir tasarım sürecidir.": "bir bütün olarak ele alındığı bir tasarım sürecidir.",

      "Hizmetler": "Hizmetler",

      "Mimari Tasarım": "Mimari Tasarım",
      "İç Mimarlık": "İç Mimarlık",
      "Kentsel Tasarım": "Kentsel Tasarım",
      "Gayrimenkul Danışmanlığı": "Gayrimenkul Danışmanlığı",

      "İletişim": "İletişim",
      "Bizimle iletişime geçin.": "Bizimle iletişime geçin.",
      "Projenizi konuşalım.": "Projenizi konuşalım.",

      "Adınız": "Adınız",
      "E-posta": "E-posta",
      "Telefon": "Telefon",
      "Mesajınız": "Mesajınız",
      "Gönder": "Gönder",

      "Fiyat": "Fiyat",
      "Konum": "Konum",
      "Satılık": "Satılık",
      "Kiralık": "Kiralık",
      "Detayları Gör": "Detayları Gör",
      "İlan Detayı": "İlan Detayı",
      "Oda": "Oda",
      "Banyo": "Banyo",
      "m²": "m²",
      "Kat": "Kat",
      "Bina Yaşı": "Bina Yaşı",
      "Isıtma": "Isıtma",
      "Balkon": "Balkon",
      "Otopark": "Otopark",

      "Tüm hakları saklıdır.": "Tüm hakları saklıdır.",
      "Yasal Bilgilendirme": "Yasal Bilgilendirme",
      "Gizlilik Politikası": "Gizlilik Politikası",
      "KVKK": "KVKK"
    },

    en: {
      "SİVORA MİMARLIK & GAYRİMENKUL": "SIVORA ARCHITECTURE & REAL ESTATE",
      "ZERAFETİN İZİNDE": "IN PURSUIT OF ELEGANCE",
      "GAYRİMENKUL": "REAL ESTATE",

      "Projeler": "Projects",
      "Gayrimenkuller": "Properties",
      "Yaklaşım": "Approach",
      "Hizmetler": "Services",
      "İletişim": "Contact",

      "Mekânın": "The character",
      "karakteri.": "of space.",
      "Tasarım": "Design",
      "mimarinin": "beyond",
      "ötesinde.": "architecture.",

      "Seçkin mimari projeler,": "Selected architectural projects,",
      "özenle seçilmiş gayrimenkuller": "carefully selected properties",
      "ve zamansız tasarım anlayışı.": "and a timeless design approach.",

      "Projelerimizi İncele": "Explore Projects",
      "Gayrimenkulleri İncele": "Explore Properties",

      "Projeler": "Projects",
      "Mimari": "Architecture",
      "tasarımın": "design",
      "iz bırakan": "that leaves a mark",
      "örnekleri.": "examples.",

      "Gayrimenkuller": "Properties",
      "Seçkin": "Selected",
      "yaşam alanları.": "living spaces.",

      "Yaklaşım": "Approach",
      "Mekâna": "We give space",
      "anlam": "meaning",
      "katıyoruz.": "and identity.",

      "Her proje; bağlam, işlev, estetik ve kullanıcı deneyiminin":
        "Every project is a design process where context, function, aesthetics and user experience",

      "bir bütün olarak ele alındığı bir tasarım sürecidir.":
        "are considered as a whole.",

      "Hizmetler": "Services",

      "Mimari Tasarım": "Architectural Design",
      "İç Mimarlık": "Interior Architecture",
      "Kentsel Tasarım": "Urban Design",
      "Gayrimenkul Danışmanlığı": "Real Estate Consultancy",

      "İletişim": "Contact",
      "Bizimle iletişime geçin.": "Get in touch with us.",
      "Projenizi konuşalım.": "Let's discuss your project.",

      "Adınız": "Your Name",
      "E-posta": "Email",
      "Telefon": "Phone",
      "Mesajınız": "Your Message",
      "Gönder": "Send",

      "Fiyat": "Price",
      "Konum": "Location",
      "Satılık": "For Sale",
      "Kiralık": "For Rent",
      "Detayları Gör": "View Details",
      "İlan Detayı": "Property Details",
      "Oda": "Rooms",
      "Banyo": "Bathroom",
      "m²": "m²",
      "Kat": "Floor",
      "Bina Yaşı": "Building Age",
      "Isıtma": "Heating",
      "Balkon": "Balcony",
      "Otopark": "Parking",

      "Tüm hakları saklıdır.": "All rights reserved.",
      "Yasal Bilgilendirme": "Legal Information",
      "Gizlilik Politikası": "Privacy Policy",
      "KVKK": "Privacy Notice"
    },

    de: {
      "SİVORA MİMARLIK & GAYRİMENKUL": "SIVORA ARCHITEKTUR & IMMOBILIEN",
      "ZERAFETİN İZİNDE": "AUF DEN SPUREN DER ELEGANZ",
      "GAYRİMENKUL": "IMMOBILIEN",

      "Projeler": "Projekte",
      "Gayrimenkuller": "Immobilien",
      "Yaklaşım": "Ansatz",
      "Hizmetler": "Leistungen",
      "İletişim": "Kontakt",

      "Mekânın": "Der Charakter",
      "karakteri.": "des Raumes.",
      "Tasarım": "Design",
      "mimarinin": "über die",
      "ötesinde.": "Architektur hinaus.",

      "Seçkin mimari projeler,": "Ausgewählte Architekturprojekte,",
      "özenle seçilmiş gayrimenkuller": "sorgfältig ausgewählte Immobilien",
      "ve zamansız tasarım anlayışı.": "und ein zeitloser Designansatz.",

      "Projelerimizi İncele": "Projekte entdecken",
      "Gayrimenkulleri İncele": "Immobilien entdecken",

      "Projeler": "Projekte",
      "Mimari": "Architektur",
      "tasarımın": "des Designs",
      "iz bırakan": "mit bleibendem Eindruck",
      "örnekleri.": "Beispiele.",

      "Gayrimenkuller": "Immobilien",
      "Seçkin": "Ausgewählte",
      "yaşam alanları.": "Lebensräume.",

      "Yaklaşım": "Ansatz",
      "Mekâna": "Wir geben Räumen",
      "anlam": "Bedeutung",
      "katıyoruz.": "und Identität.",

      "Her proje; bağlam, işlev, estetik ve kullanıcı deneyiminin":
        "Jedes Projekt ist ein Designprozess, bei dem Kontext, Funktion, Ästhetik und Nutzererlebnis",

      "bir bütün olarak ele alındığı bir tasarım sürecidir.":
        "als Einheit betrachtet werden.",

      "Hizmetler": "Leistungen",

      "Mimari Tasarım": "Architekturdesign",
      "İç Mimarlık": "Innenarchitektur",
      "Kentsel Tasarım": "Städtebauliches Design",
      "Gayrimenkul Danışmanlığı": "Immobilienberatung",

      "İletişim": "Kontakt",
      "Bizimle iletişime geçin.": "Kontaktieren Sie uns.",
      "Projenizi konuşalım.": "Sprechen wir über Ihr Projekt.",

      "Adınız": "Ihr Name",
      "E-posta": "E-Mail",
      "Telefon": "Telefon",
      "Mesajınız": "Ihre Nachricht",
      "Gönder": "Senden",

      "Fiyat": "Preis",
      "Konum": "Standort",
      "Satılık": "Zu verkaufen",
      "Kiralık": "Zu vermieten",
      "Detayları Gör": "Details ansehen",
      "İlan Detayı": "Immobiliendetails",
      "Oda": "Zimmer",
      "Banyo": "Bad",
      "m²": "m²",
      "Kat": "Etage",
      "Bina Yaşı": "Gebäudealter",
      "Isıtma": "Heizung",
      "Balkon": "Balkon",
      "Otopark": "Parkplatz",

      "Tüm hakları saklıdır.": "Alle Rechte vorbehalten.",
      "Yasal Bilgilendirme": "Rechtliche Hinweise",
      "Gizlilik Politikası": "Datenschutzerklärung",
      "KVKK": "Datenschutzhinweis"
    }
  };

  let currentLanguage =
    localStorage.getItem(STORAGE_KEY) || "tr";

  if (!translations[currentLanguage]) {
    currentLanguage = "tr";
  }

  const originalTexts = new WeakMap();
  let translating = false;
  let observerTimer = null;

  function saveOriginal(element) {
    if (!originalTexts.has(element)) {
      originalTexts.set(element, element.textContent);
    }
  }

  function translateElement(element) {
    if (!element || element.nodeType !== 1) return;

    /*
      Sadece metin içeren yaprak elementleri çevir.
      Böylece parent elementlerin tamamı bozulmaz.
    */
    const children = Array.from(element.children);

    if (children.length === 0) {
      const text = element.textContent.trim();

      if (!text) return;

      saveOriginal(element);

      const original = originalTexts.get(element);

      const translated =
        translations[currentLanguage]?.[original];

      if (translated) {
        element.textContent = translated;
      } else if (currentLanguage === "tr") {
        element.textContent = original;
      }
    } else {
      children.forEach(translateElement);
    }
  }

  function translatePage() {
    if (translating) return;

    translating = true;

    try {
      document.documentElement.lang = currentLanguage;

      const titleTranslations = {
        tr: "Sivora Mimarlık & Gayrimenkul",
        en: "Sivora Architecture & Real Estate",
        de: "Sivora Architektur & Immobilien"
      };

      document.title =
        titleTranslations[currentLanguage];

      document
        .querySelectorAll("body *")
        .forEach(element => {
          if (
            element.closest(".language-switcher") ||
            element.tagName === "SCRIPT" ||
            element.tagName === "STYLE"
          ) {
            return;
          }

          translateElement(element);
        });

      translatePlaceholders();
      updateLanguageButtons();

    } finally {
      translating = false;
    }
  }

  function translatePlaceholders() {
    const placeholderTranslations = {
      tr: {
        "Adınız": "Adınız",
        "E-posta": "E-posta",
        "Telefon": "Telefon",
        "Mesajınız": "Mesajınız"
      },

      en: {
        "Adınız": "Your Name",
        "E-posta": "Email",
        "Telefon": "Phone",
        "Mesajınız": "Your Message"
      },

      de: {
        "Adınız": "Ihr Name",
        "E-posta": "E-Mail",
        "Telefon": "Telefon",
        "Mesajınız": "Ihre Nachricht"
      }
    };

    document
      .querySelectorAll("input[placeholder], textarea[placeholder]")
      .forEach(input => {
        if (!input.dataset.originalPlaceholder) {
          input.dataset.originalPlaceholder =
            input.getAttribute("placeholder");
        }

        const original =
          input.dataset.originalPlaceholder;

        const translated =
          placeholderTranslations[currentLanguage]?.[original];

        if (translated) {
          input.setAttribute("placeholder", translated);
        }
      });
  }

  function updateLanguageButtons() {
    document
      .querySelectorAll(".language-switcher button")
      .forEach(button => {
        const lang = button.dataset.lang;

        button.classList.toggle(
          "active",
          lang === currentLanguage
        );

        button.setAttribute(
          "aria-pressed",
          lang === currentLanguage ? "true" : "false"
        );
      });
  }

  function setLanguage(language) {
    if (!translations[language]) return;

    currentLanguage = language;

    localStorage.setItem(
      STORAGE_KEY,
      currentLanguage
    );

    translatePage();
  }

  function createLanguageSwitcher() {
    let switcher =
      document.getElementById("language-switcher");

    if (!switcher) {
      switcher = document.createElement("div");

      switcher.id = "language-switcher";
      switcher.className = "language-switcher";

      switcher.setAttribute(
        "aria-label",
        "Dil seçimi"
      );

      switcher.innerHTML = `
        <button type="button" data-lang="tr">TR</button>
        <span>/</span>
        <button type="button" data-lang="en">EN</button>
        <span>/</span>
        <button type="button" data-lang="de">DE</button>
      `;

      const themeWrapper =
        document.getElementById("theme-wrapper");

      if (themeWrapper && themeWrapper.parentNode) {
        themeWrapper.parentNode.insertBefore(
          switcher,
          themeWrapper
        );
      }
    }

    switcher
      .querySelectorAll("button[data-lang]")
      .forEach(button => {

        if (button.dataset.languageReady === "1") {
          return;
        }

        button.dataset.languageReady = "1";

        button.addEventListener(
          "click",
          function () {
            setLanguage(
              this.dataset.lang
            );
          }
        );
      });

    updateLanguageButtons();
  }

  function observeDynamicContent() {
    const projectGrid =
      document.getElementById("project-grid");

    const propertyGrid =
      document.getElementById("property-grid");

    const targets = [
      projectGrid,
      propertyGrid
    ].filter(Boolean);

    if (!targets.length) return;

    const observer =
      new MutationObserver(() => {

        if (translating) return;

        clearTimeout(observerTimer);

        observerTimer = setTimeout(() => {
          translatePage();
        }, 150);

      });

    targets.forEach(target => {
      observer.observe(target, {
        childList: true,
        subtree: true
      });
    });
  }

  function init() {
    createLanguageSwitcher();

    /*
      Sayfadaki Türkçe metinleri önce kaydet.
    */
    document
      .querySelectorAll("body *")
      .forEach(element => {

        if (
          element.closest(".language-switcher") ||
          element.tagName === "SCRIPT" ||
          element.tagName === "STYLE"
        ) {
          return;
        }

        if (element.children.length === 0) {
          const text = element.textContent.trim();

          if (text) {
            saveOriginal(element);
          }
        }
      });

    translatePage();

    observeDynamicContent();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init
    );
  } else {
    init();
  }

})();
