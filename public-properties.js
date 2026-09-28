(() => {

  const grid = document.getElementById('property-grid');

  if (!grid) return;


  /* =========================================================
     SUPABASE KONTROLÜ
  ========================================================= */

  if (
    !window.SIVORA_SUPABASE_URL ||
    !window.SIVORA_SUPABASE_ANON_KEY ||
    !window.supabase
  ) {

    grid.innerHTML =
      '<p class="property-empty">Gayrimenkul sistemi bağlantısı kurulamadı.</p>';

    return;

  }


  const db =
    window.supabase.createClient(
      window.SIVORA_SUPABASE_URL,
      window.SIVORA_SUPABASE_ANON_KEY
    );


  /* =========================================================
     FOTOĞRAF PARSE
  ========================================================= */

  const parsePhotos = value => {

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'string') {

      try {

        const parsed =
          JSON.parse(value);

        return Array.isArray(parsed)
          ? parsed
          : [];

      } catch {

        return [];

      }

    }

    return [];

  };


  /* =========================================================
     FİYAT
  ========================================================= */

  const money = (value, currency) => {

    return Number(value || 0)
      .toLocaleString(
        'tr-TR',
        {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }
      )
      + ' '
      + (currency || 'TL');

  };


  /* =========================================================
     ELEMENT YARDIMCISI
  ========================================================= */

  const el = (tag, cls, text) => {

    const node =
      document.createElement(tag);

    if (cls) {
      node.className = cls;
    }

    if (text !== undefined) {
      node.textContent = text;
    }

    return node;

  };


  /* =========================================================
     DETAY MODALI
  ========================================================= */

  const openModal = property => {

    const modal =
      document.getElementById(
        'property-modal'
      );

    const detail =
      document.getElementById(
        'property-detail'
      );


    if (!modal || !detail) {
      return;
    }


    detail.replaceChildren();


    const sold =
      property.durum === 'satildi';


    const photos =
      parsePhotos(
        property.fotograflar
      );


    /* DURUM */

    const status =
      el(
        'div',
        'property-public-status',
        sold
          ? 'SATILDI'
          : (
              property.ilan_turu ||
              'AKTİF'
            )
      );


    /* BAŞLIK */

    const title =
      el(
        'h2',
        '',
        property.ilan_basligi ||
        'Gayrimenkul'
      );


    detail.append(
      status,
      title
    );


    /* FOTOĞRAFLAR */

    if (photos.length) {

      const gallery =
        el(
          'div',
          'property-public-gallery'
        );


      photos.forEach(
        (url, index) => {

          const img =
            el('img');

          img.src = url;

          img.alt =
            `${property.ilan_basligi || 'Gayrimenkul'} ${index + 1}`;

          gallery.append(img);

        }
      );


      detail.append(
        gallery
      );

    }


    /* BİLGİLER */

    const info =
      el(
        'div',
        'property-public-info'
      );


    [

      [
        'İlan Türü',
        property.ilan_turu
      ],

      [
        'Gayrimenkul',
        property.gayrimenkul_turu
      ],

      [
        'Konum',
        property.konum
      ],

      [
        'Fiyat',
        money(
          property.fiyat,
          property.para_birimi
        )
      ],

      [
        'Brüt m²',
        property.brut_m2
      ],

      [
        'Net m²',
        property.net_m2
      ],

      [
        'Oda',
        property.oda_sayisi
      ],

      [
        'Banyo',
        property.banyo_sayisi
      ],

      [
        'Kat',
        property.kat
      ],

      [
        'Bina Yaşı',
        property.bina_yasi
      ],

      [
        'Isıtma',
        property.isitma
      ],

      [
        'Balkon',
        property.balkon
          ? 'Var'
          : 'Yok'
      ],

      [
        'Otopark',
        property.otopark
          ? 'Var'
          : 'Yok'
      ]

    ].forEach(
      ([label, value]) => {

        if (
          value === null ||
          value === undefined ||
          value === ''
        ) {
          return;
        }


        const row =
          el(
            'div',
            'property-public-info-row'
          );


        row.append(

          el(
            'span',
            '',
            label
          ),

          el(
            'strong',
            '',
            String(value)
          )

        );


        info.append(
          row
        );

      }
    );


    detail.append(
      info
    );


    /* ÖZELLİKLER */

    if (property.ozellikler) {

      detail.append(

        el(
          'h3',
          '',
          'Özellikler'
        ),

        el(
          'p',
          '',
          property.ozellikler
        )

      );

    }


    /* AÇIKLAMA */

    if (property.aciklama) {

      detail.append(

        el(
          'h3',
          '',
          'Açıklama'
        ),

        el(
          'p',
          '',
          property.aciklama
        )

      );

    }


    /* SATILDI DETAY */

    if (sold) {

      detail.classList.add(
        'property-detail-sold'
      );

    } else {

      detail.classList.remove(
        'property-detail-sold'
      );

    }


    modal.hidden = false;

    document.body.style.overflow =
      'hidden';

  };


  /* =========================================================
     GAYRİMENKULLERİ OLUŞTUR
  ========================================================= */

  const render = properties => {

    grid.replaceChildren();


    if (!properties.length) {

      grid.append(

        el(
          'p',
          'property-empty',
          'İlan bulunamadı.'
        )

      );

      return;

    }


    properties.forEach(
      property => {


        const sold =
          property.durum === 'satildi';


        const photos =
          parsePhotos(
            property.fotograflar
          );


        /* KART */

        const card =
          el(
            'article',
            'property-card'
          );


        if (sold) {

          card.classList.add(
            'property-card-sold'
          );

        }


        /* =====================================================
           GÖRSEL ALANI
        ===================================================== */

        const imageBox =
          el(
            'div',
            'property-card-image'
          );


        /* ÖNEMLİ:
           SATILDI DAMGASININ DOĞRU KONUMDA
           DURMASI İÇİN RELATIVE */
        
        imageBox.style.position =
          'relative';


        /* RESİM */

        if (photos.length) {

          const img =
            el('img');


          img.src =
            photos[0];


          img.alt =
            property.ilan_basligi ||
            'Gayrimenkul';


          img.loading =
            'lazy';


          imageBox.append(
            img
          );

        }


        /* İLAN TÜRÜ */

        imageBox.append(

          el(
            'span',
            'property-badge',
            sold
              ? 'SATILDI'
              : (
                  property.ilan_turu ||
                  'Gayrimenkul'
                )
          )

        );


        /* =====================================================
           SATILDI KAŞESİ
        ===================================================== */

        if (sold) {

          const soldStamp =
            el(
              'span',
              'property-sold-stamp',
              'SATILDI'
            );


          imageBox.append(
            soldStamp
          );

        }


        /* =====================================================
           İÇERİK
        ===================================================== */

        const content =
          el(
            'div',
            'property-card-content'
          );


        content.append(

          el(
            'p',
            'property-type',
            `${property.ilan_turu || ''} · ${property.gayrimenkul_turu || ''}`
          ),

          el(
            'h3',
            '',
            property.ilan_basligi ||
            'Gayrimenkul'
          ),

          el(
            'p',
            'property-location',
            property.konum || ''
          ),

          el(
            'p',
            'property-price',
            money(
              property.fiyat,
              property.para_birimi
            )
          )

        );


        /* =====================================================
           KISA BİLGİLER
        ===================================================== */

        const facts =
          el(
            'div',
            'property-mini-facts'
          );


        if (property.brut_m2) {

          facts.append(

            el(
              'span',
              '',
              `Brüt ${property.brut_m2} m²`
            )

          );

        }


        if (property.net_m2) {

          facts.append(

            el(
              'span',
              '',
              `Net ${property.net_m2} m²`
            )

          );

        }


        if (property.oda_sayisi) {

          facts.append(

            el(
              'span',
              '',
              property.oda_sayisi
            )

          );

        }


        if (property.banyo_sayisi) {

          facts.append(

            el(
              'span',
              '',
              `${property.banyo_sayisi} Banyo`
            )

          );

        }


        content.append(
          facts
        );


        /* =====================================================
           DETAY BUTONU
        ===================================================== */

        const button =
          el(
            'button',
            'property-detail-button',
            sold
              ? 'SATILDI · Detayları Gör'
              : 'Detayları Gör'
          );


        button.type =
          'button';


        button.addEventListener(
          'click',
          event => {

            event.stopPropagation();

            openModal(
              property
            );

          }
        );


        content.append(
          button
        );


        card.append(
          imageBox,
          content
        );


        /* =====================================================
           RESME TIKLAMA
        ===================================================== */

        imageBox.style.cursor =
          'pointer';


        imageBox.addEventListener(
          'click',
          event => {

            event.stopPropagation();

            openModal(
              property
            );

          }
        );


        /* =====================================================
           KARTIN TAMAMINA TIKLAMA
        ===================================================== */

        card.style.cursor =
          'pointer';


        card.addEventListener(
          'click',
          event => {

            if (
              event.target.closest(
                'button'
              )
            ) {
              return;
            }


            openModal(
              property
            );

          }
        );


        grid.append(
          card
        );

      }
    );

  };


  /* =========================================================
     SATILDI TASARIMI
  ========================================================= */

  const style =
    document.createElement(
      'style'
    );


  style.textContent = `

    /* -----------------------------------------
       SATILMIŞ İLAN RESMİ
    ----------------------------------------- */

    .property-card-sold
    .property-card-image {

      position: relative !important;

      overflow: hidden;

      background:
        #b8b8b8;

    }


    .property-card-sold
    .property-card-image img {

      filter:
        grayscale(1);

      opacity:
        .55;

    }


    /* -----------------------------------------
       KIRMIZI SATILDI KAŞESİ
    ----------------------------------------- */

    .property-sold-stamp {

      position: absolute !important;

      left: 50% !important;

      top: 50% !important;

      transform:
        translate(
          -50%,
          -50%
        )
        rotate(-10deg) !important;

      z-index: 20 !important;

      display: block !important;

      width: max-content !important;

      padding:
        10px 24px !important;

      border:
        4px solid #b40000 !important;

      color:
        #b40000 !important;

      background:
        rgba(
          255,
          255,
          255,
          .88
        ) !important;

      font-family:
        Arial,
        Helvetica,
        sans-serif !important;

      font-size:
        clamp(
          28px,
          4vw,
          52px
        ) !important;

      line-height:
        1 !important;

      font-weight:
        900 !important;

      letter-spacing:
        .08em !important;

      text-align:
        center !important;

      white-space:
        nowrap !important;

      pointer-events:
        none !important;

      box-shadow:
        0 2px 10px
        rgba(
          0,
          0,
          0,
          .18
        );

    }


    /* -----------------------------------------
       SATILDI ÜST ETİKETİ
    ----------------------------------------- */

    .property-card-sold
    .property-badge {

      background:
        #b40000 !important;

      color:
        #fff !important;

      font-weight:
        700 !important;

    }


    /* -----------------------------------------
       DETAY MODALINDA SATILDI
    ----------------------------------------- */

    .property-detail-sold
    .property-public-status {

      background:
        #b40000 !important;

      color:
        #fff !important;

      font-weight:
        800 !important;

    }


    .property-detail-sold
    .property-public-gallery img {

      filter:
        grayscale(1);

      opacity:
        .72;

    }


    /* -----------------------------------------
       RESME TIKLANABİLİR EFEKTİ
    ----------------------------------------- */

    .property-card-image {

      cursor:
        pointer;

    }


    .property-card-image img {

      transition:
        transform .35s ease,
        opacity .35s ease,
        filter .35s ease;

    }


    .property-card:not(.property-card-sold)
    .property-card-image:hover img {

      transform:
        scale(1.025);

    }


    .property-card-sold
    .property-card-image:hover
    .property-sold-stamp {

      transform:
        translate(
          -50%,
          -50%
        )
        rotate(-10deg)
        scale(1.03) !important;

    }


    /* -----------------------------------------
       MODAL GALERİ
    ----------------------------------------- */

    .property-public-gallery {

      display:
        grid;

      grid-template-columns:
        repeat(
          2,
          minmax(
            0,
            1fr
          )
        );

      gap:
        10px;

      margin:
        20px 0;

    }


    .property-public-gallery img {

      width:
        100%;

      max-height:
        360px;

      object-fit:
        cover;

      display:
        block;

    }


    /* -----------------------------------------
       BİLGİLER
    ----------------------------------------- */

    .property-public-info {

      display:
        grid;

      gap:
        0;

      margin:
        20px 0;

      border-top:
        1px solid
        rgba(
          170,
          165,
          156,
          .45
        );

    }


    .property-public-info-row {

      display:
        flex;

      justify-content:
        space-between;

      gap:
        20px;

      padding:
        11px 0;

      border-bottom:
        1px solid
        rgba(
          170,
          165,
          156,
          .35
        );

      font-size:
        12px;

    }


    .property-public-info-row span {

      opacity:
        .55;

    }


    .property-public-info-row strong {

      text-align:
        right;

    }


    /* -----------------------------------------
       MODAL DURUM
    ----------------------------------------- */

    .property-public-status {

      display:
        inline-block;

      margin-bottom:
        12px;

      padding:
        7px 11px;

      background:
        #171716;

      color:
        #fff;

      font-size:
        10px;

      font-weight:
        700;

      letter-spacing:
        .12em;

    }


    /* -----------------------------------------
       MOBİL
    ----------------------------------------- */

    @media(max-width:600px) {

      .property-public-gallery {

        grid-template-columns:
          1fr;

      }


      .property-sold-stamp {

        font-size:
          25px !important;

        padding:
          9px 17px !important;

        border-width:
          3px !important;

      }

    }

  `;


  document.head.append(
    style
  );


  /* =========================================================
     SUPABASE'DEN GAYRİMENKULLERİ ÇEK
  ========================================================= */

  const load = async () => {

    grid.innerHTML =
      '<p class="property-loading">Gayrimenkuller yükleniyor…</p>';


    const {
      data,
      error
    } = await db

      .from('properties')

      .select(`

        id,

        ilan_basligi,

        ilan_turu,

        gayrimenkul_turu,

        konum,

        fiyat,

        para_birimi,

        brut_m2,

        net_m2,

        oda_sayisi,

        banyo_sayisi,

        kat,

        bina_yasi,

        isitma,

        balkon,

        otopark,

        aciklama,

        ozellikler,

        fotograflar,

        durum

      `)

      .order(
        'id',
        {
          ascending: false
        }
      );


    if (error) {

      console.error(
        'Sivora gayrimenkul hatası:',
        error
      );


      grid.innerHTML =
        '<p class="property-empty">Gayrimenkuller yüklenemedi. Supabase tablo/izinlerini kontrol edin.</p>';

      return;

    }


    render(
      data || []
    );

  };


  /* =========================================================
     BAŞLAT
  ========================================================= */

  load();


})();
