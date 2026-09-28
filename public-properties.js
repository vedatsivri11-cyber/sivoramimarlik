(() => {

  const grid = document.getElementById('property-grid');
  if (!grid) return;

  if (
    !window.SIVORA_SUPABASE_URL ||
    !window.SIVORA_SUPABASE_ANON_KEY ||
    !window.supabase
  ) {
    grid.innerHTML =
      '<p class="property-empty">Gayrimenkul sistemi bağlantısı kurulamadı.</p>';
    return;
  }

  const db = window.supabase.createClient(
    window.SIVORA_SUPABASE_URL,
    window.SIVORA_SUPABASE_ANON_KEY
  );

  const parsePhotos = value => {

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'string') {

      try {

        const parsed = JSON.parse(value);

        return Array.isArray(parsed)
          ? parsed
          : [];

      } catch {

        return [];

      }

    }

    return [];

  };

  const money = (value, currency) => {

    return Number(value || 0).toLocaleString(
      'tr-TR',
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }
    ) + ' ' + (currency || 'TL');

  };

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
     GAYRİMENKUL DETAY MODALI
  ========================================================= */

  const openModal = property => {

    const modal =
      document.getElementById('property-modal');

    const detail =
      document.getElementById('property-detail');

    if (!modal || !detail) {
      return;
    }

    detail.replaceChildren();

    const sold =
      property.durum === 'satildi';

    const photos =
      parsePhotos(property.fotograflar);


    detail.append(

      el(
        'div',
        'property-public-status',
        sold
          ? 'SATILDI'
          : (property.ilan_turu || 'AKTİF')
      ),

      el(
        'h2',
        '',
        property.ilan_basligi ||
        'Gayrimenkul'
      )

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

      detail.append(gallery);

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

        info.append(row);

      }
    );


    detail.append(info);


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
     GAYRİMENKULLERİ EKRANA BAS
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


        const card =
          el(
            'article',
            'property-card'
          );


        /* SATILDI CLASS */

        if (sold) {

          card.classList.add(
            'property-card-sold'
          );

        }


        /* GÖRSEL ALANI */

        const imageBox =
          el(
            'div',
            'property-card-image'
          );


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

          imageBox.append(img);

        }


        /* ÜST ETİKET */

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


        /* SATILDI DAMGASI */

        if (sold) {

          imageBox.append(

            el(
              'span',
              'property-sold-stamp',
              'SATILDI'
            )

          );

        }


        /* İLAN İÇERİĞİ */

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


        /* KISA BİLGİLER */

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


        content.append(facts);


        /* DETAY BUTONU */

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
          () => openModal(property)
        );


        content.append(button);


        card.append(
          imageBox,
          content
        );


        grid.append(card);

      }
    );

  };


  /* =========================================================
     SATILDI TASARIMI
     MEVCUT SİTE TASARIMINI BOZMAZ
  ========================================================= */

  const style =
    document.createElement('style');


  style.textContent = `

    .property-card-sold
    .property-card-image img {

      filter: grayscale(1);

      opacity: .62;

    }


    .property-card-sold
    .property-card-image {

      background: #b8b8b8;

    }


    .property-sold-stamp {

      position: absolute;

      left: 50%;

      top: 50%;

      transform:
        translate(-50%, -50%)
        rotate(-8deg);

      z-index: 3;

      padding: 12px 22px;

      border: 3px solid #fff;

      color: #fff;

      background:
        rgba(70,70,70,.82);

      font-family:
        "DM Sans",
        Arial,
        sans-serif;

      font-size:
        clamp(
          22px,
          3vw,
          38px
        );

      font-weight: 700;

      letter-spacing: .16em;

      white-space: nowrap;

      pointer-events: none;

    }


    .property-public-status {

      display: inline-block;

      margin-bottom: 12px;

      padding: 7px 11px;

      background: #171716;

      color: #fff;

      font-size: 10px;

      font-weight: 700;

      letter-spacing: .12em;

    }


    .property-public-gallery {

      display: grid;

      grid-template-columns:
        repeat(
          2,
          minmax(0,1fr)
        );

      gap: 10px;

      margin: 20px 0;

    }


    .property-public-gallery img {

      width: 100%;

      max-height: 360px;

      object-fit: cover;

      display: block;

    }


    .property-public-info {

      display: grid;

      gap: 0;

      margin: 20px 0;

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

      display: flex;

      justify-content:
        space-between;

      gap: 20px;

      padding: 11px 0;

      border-bottom:
        1px solid
        rgba(
          170,
          165,
          156,
          .35
        );

      font-size: 12px;

    }


    .property-public-info-row span {

      opacity: .55;

    }


    .property-public-info-row strong {

      text-align: right;

    }


    .property-detail-sold
    .property-public-gallery img {

      filter: grayscale(1);

      opacity: .72;

    }


    @media(max-width:600px) {

      .property-public-gallery {

        grid-template-columns: 1fr;

      }

      .property-sold-stamp {

        font-size: 22px;

        padding: 9px 16px;

      }

    }

  `;


  document.head.append(style);


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


  load();


})();
