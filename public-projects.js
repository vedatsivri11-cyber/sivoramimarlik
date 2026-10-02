(() => {

  const grid = document.getElementById('property-grid');
  if (!grid) return;

  if (!window.SIVORA_SUPABASE_URL ||
      !window.SIVORA_SUPABASE_ANON_KEY ||
      !window.supabase) {
    grid.innerHTML = '<p class="property-empty">Gayrimenkul sistemi bağlantısı kurulamadı.</p>';
    return;
  }

  const db = window.supabase.createClient(
    window.SIVORA_SUPABASE_URL,
    window.SIVORA_SUPABASE_ANON_KEY
  );

  const parsePhotos = value => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const money = (value, currency) => {
    const raw = String(value ?? '').trim();
    if (!raw) return '';

    // Sayısal fiyatları Türkçe biçimde göster; özel fiyat metinlerini aynen koru.
    const numericPattern = /^[-+]?\d{1,3}(?:\.\d{3})*(?:,\d+)?$|^[-+]?\d+(?:,\d+)?$/;
    if (numericPattern.test(raw)) {
      const normalized = raw.replace(/\./g, '').replace(',', '.');
      const numeric = Number(normalized);
      if (Number.isFinite(numeric)) {
        return numeric.toLocaleString('tr-TR', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }) + ' ' + (currency || 'TL');
      }
    }

    return raw;
  };

  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const openModal = property => {

    const modal = document.getElementById('property-modal');
    const detail = document.getElementById('property-detail');

    if (!modal || !detail) return;

    detail.replaceChildren();

    const sold = property.durum === 'satildi';
    const photos = parsePhotos(property.fotograflar);

    detail.append(
      el('div', 'property-public-status', sold ? 'SATILDI' : (property.ilan_turu || 'AKTİF')),
      el('h2', '', property.ilan_basligi || 'Gayrimenkul')
    );

    if (photos.length) {
      const galleryWrap = el('div', 'property-public-gallery');
      const mainWrap = el('div', 'property-public-gallery-main');
      const mainImg = el('img');
      const counter = el('div', 'property-public-gallery-counter', `1 / ${photos.length}`);
      const prev = el('button', 'property-public-gallery-arrow property-public-gallery-prev', '‹');
      const next = el('button', 'property-public-gallery-arrow property-public-gallery-next', '›');
      const thumbs = el('div', 'property-public-gallery-thumbs');

      prev.type = 'button';
      next.type = 'button';
      mainImg.draggable = false;

      let currentIndex = 0;

      const showPhoto = index => {
        currentIndex = (index + photos.length) % photos.length;
        mainImg.src = photos[currentIndex];
        mainImg.alt = `${property.ilan_basligi || 'Gayrimenkul'} ${currentIndex + 1}`;
        counter.textContent = `${currentIndex + 1} / ${photos.length}`;

        thumbs.querySelectorAll('button').forEach((button, i) => {
          button.classList.toggle('active', i === currentIndex);
        });
      };

      photos.forEach((url, index) => {
        const thumb = el('button', 'property-public-gallery-thumb');
        const thumbImg = el('img');
        thumb.type = 'button';
        thumbImg.src = url;
        thumbImg.alt = `Fotoğraf ${index + 1}`;
        thumb.append(thumbImg);
        thumb.addEventListener('click', () => showPhoto(index));
        thumbs.append(thumb);
      });

      prev.addEventListener('click', () => showPhoto(currentIndex - 1));
      next.addEventListener('click', () => showPhoto(currentIndex + 1));

      let touchStartX = 0;
      let touchStartY = 0;

      mainWrap.addEventListener('touchstart', event => {
        const touch = event.changedTouches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
      }, { passive: true });

      mainWrap.addEventListener('touchend', event => {
        const touch = event.changedTouches[0];
        const diffX = touch.clientX - touchStartX;
        const diffY = touch.clientY - touchStartY;

        if (Math.abs(diffX) < 45 || Math.abs(diffX) <= Math.abs(diffY)) return;
        showPhoto(diffX < 0 ? currentIndex + 1 : currentIndex - 1);
      }, { passive: true });

      mainWrap.append(mainImg, prev, next, counter);
      galleryWrap.append(mainWrap, thumbs);
      detail.append(galleryWrap);
      showPhoto(0);
    }

    const info = el('div', 'property-public-info');

    [
      ['İlan Türü', property.ilan_turu],
      ['Gayrimenkul', property.gayrimenkul_turu],
      ['Konum', property.konum],
      ['Fiyat', money(property.fiyat, property.para_birimi)],
      ['Brüt m²', property.brut_m2],
      ['Net m²', property.net_m2],
      ['Oda', property.oda_sayisi],
      ['Banyo', property.banyo_sayisi],
      ['Kat', property.kat],
      ['Bina Yaşı', property.bina_yasi],
      ['Isıtma', property.isitma],
      ['Balkon', property.balkon ? 'Var' : 'Yok'],
      ['Otopark', property.otopark ? 'Var' : 'Yok']
    ].forEach(([label, value]) => {

      if (value === null || value === undefined || value === '') return;

      const row = el('div', 'property-public-info-row');

      row.append(
        el('span', '', label),
        el('strong', '', String(value))
      );

      info.append(row);
    });

    detail.append(info);

    if (property.ozellikler) {
      detail.append(
        el('h3', '', 'Özellikler'),
        el('p', '', property.ozellikler)
      );
    }

    if (property.aciklama) {
      detail.append(
        el('h3', '', 'Açıklama'),
        el('p', '', property.aciklama)
      );
    }

    if (sold) {
      detail.classList.add('property-detail-sold');
    } else {
      detail.classList.remove('property-detail-sold');
    }

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  };

  const render = properties => {

    grid.replaceChildren();

    if (!properties.length) {
      grid.append(el('p', 'property-empty', 'İlan bulunamadı.'));
      return;
    }

    properties.forEach(property => {

      const sold = property.durum === 'satildi';
      const photos = parsePhotos(property.fotograflar);

      const card = el('article', 'property-card');

      if (sold) card.classList.add('property-card-sold');

      const imageBox = el('div', 'property-card-image');

      if (photos.length) {
        const img = el('img');
        img.src = photos[0];
        img.alt = property.ilan_basligi || 'Gayrimenkul';
        img.loading = 'lazy';
        imageBox.append(img);
      }

      // Görsele tıklayınca doğrudan ilan detayını aç.
      imageBox.classList.add('property-card-image-clickable');
      imageBox.setAttribute('role', 'button');
      imageBox.setAttribute('tabindex', '0');
      imageBox.setAttribute('aria-label', 'İlan detaylarını aç');
      imageBox.addEventListener('click', () => openModal(property));
      imageBox.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openModal(property);
        }
      });

      imageBox.append(
        el(
          'span',
          'property-badge',
          sold ? 'SATILDI' : (property.ilan_turu || 'Gayrimenkul')
        )
      );

      if (sold) {
        imageBox.append(
          el('span', 'property-sold-stamp', 'SATILDI')
        );
      }

      const content = el('div', 'property-card-content');

      const typeLine = el(
        'div',
        'property-card-type-line',
        `${property.ilan_turu || 'İLAN'}${property.gayrimenkul_turu ? '  ·  ' + property.gayrimenkul_turu : ''}`
      );

      const title = el(
        'h3',
        'property-card-title',
        property.ilan_basligi || 'Gayrimenkul'
      );

      const location = el(
        'p',
        'property-card-location',
        property.konum || 'Konum bilgisi belirtilmemiş'
      );

      const price = el(
        'div',
        'property-card-price',
        money(property.fiyat, property.para_birimi)
      );

      const priceLabel = el('span', 'property-card-price-label', 'FİYAT');
      price.prepend(priceLabel);

      content.append(typeLine, title, location, price);

      const facts = el('div', 'property-mini-facts');

      if (property.brut_m2)
        facts.append(el('span', '', `BRÜT ${property.brut_m2} m²`));

      if (property.net_m2)
        facts.append(el('span', '', `NET ${property.net_m2} m²`));

      if (property.oda_sayisi)
        facts.append(el('span', '', property.oda_sayisi));

      if (property.banyo_sayisi)
        facts.append(el('span', '', `${property.banyo_sayisi} BANYO`));

      content.append(facts);

      const button = el(
        'button',
        'property-detail-button',
        sold ? 'SATILDI · Detayları Gör' : 'Detayları Gör'
      );

      button.type = 'button';
      button.addEventListener('click', () => openModal(property));

      content.append(button);
      card.append(imageBox, content);
      grid.append(card);
    });
  };

  const style = document.createElement('style');

  style.textContent = `
    /* =====================================================
       SIVORA GAYRİMENKULLER — PREMIUM KART TASARIMI
    ===================================================== */
    .property-grid{
      grid-template-columns:repeat(3,minmax(0,1fr)) !important;
      gap:26px !important;
      align-items:stretch !important;
    }

    .property-card{
      position:relative !important;
      min-width:0 !important;
      overflow:hidden !important;
      background:#f7f4ed !important;
      border:1px solid rgba(23,23,22,.11) !important;
      box-shadow:0 12px 35px rgba(23,23,22,.07) !important;
      transition:transform .3s ease, box-shadow .3s ease, border-color .3s ease !important;
    }

    .property-card:hover{
      transform:translateY(-5px) !important;
      box-shadow:0 20px 45px rgba(23,23,22,.13) !important;
      border-color:rgba(185,151,91,.45) !important;
    }

    .property-card-image{
      position:relative !important;
      aspect-ratio:16 / 10 !important;
      overflow:hidden !important;
      background:#171716 !important;
      cursor:pointer !important;
      outline:none !important;
    }

    .property-card-image-clickable:focus-visible{
      box-shadow:inset 0 0 0 3px #b9975b !important;
    }

    .property-card-image img{
      width:100% !important;
      height:100% !important;
      object-fit:cover !important;
      display:block !important;
      transition:transform .55s cubic-bezier(.2,.7,.2,1), filter .35s ease !important;
    }

    .property-card:hover .property-card-image img{
      transform:scale(1.045) !important;
    }

    .property-card-image::after{
      content:'FOTOĞRAFLARI GÖR  ›' !important;
      position:absolute !important;
      left:16px !important;
      bottom:16px !important;
      padding:8px 11px !important;
      background:rgba(17,17,16,.86) !important;
      color:#fff !important;
      border:1px solid rgba(185,151,91,.65) !important;
      font-size:9px !important;
      font-weight:700 !important;
      letter-spacing:.12em !important;
      opacity:0 !important;
      transform:translateY(7px) !important;
      transition:opacity .25s ease, transform .25s ease !important;
      pointer-events:none !important;
      z-index:4 !important;
    }

    .property-card:hover .property-card-image::after,
    .property-card-image-clickable:focus-visible::after{
      opacity:1 !important;
      transform:translateY(0) !important;
    }

    .property-badge{
      position:absolute !important;
      top:15px !important;
      left:15px !important;
      z-index:5 !important;
      padding:7px 10px !important;
      background:#171716 !important;
      color:#fff !important;
      border:1px solid rgba(255,255,255,.28) !important;
      font-size:9px !important;
      font-weight:700 !important;
      letter-spacing:.13em !important;
      box-shadow:0 5px 18px rgba(0,0,0,.22) !important;
    }

    .property-sold-stamp{
      position:absolute !important;
      left:50% !important;
      top:50% !important;
      transform:translate(-50%,-50%) rotate(-8deg) !important;
      z-index:6 !important;
      padding:12px 22px !important;
      border:3px solid #fff !important;
      color:#fff !important;
      background:rgba(70,70,70,.82) !important;
      font-size:clamp(22px,3vw,38px) !important;
      font-weight:700 !important;
      letter-spacing:.16em !important;
      white-space:nowrap !important;
      pointer-events:none !important;
    }

    .property-card-content{
      padding:20px 21px 18px !important;
    }

    .property-card-type-line{
      margin-bottom:9px !important;
      color:#a1844f !important;
      font-size:9px !important;
      font-weight:700 !important;
      letter-spacing:.14em !important;
      text-transform:uppercase !important;
    }

    .property-card-title{
      margin:0 !important;
      color:#171716 !important;
      font-family:"Playfair Display",Georgia,serif !important;
      font-size:clamp(20px,1.8vw,26px) !important;
      font-weight:500 !important;
      line-height:1.2 !important;
      letter-spacing:-.02em !important;
    }

    .property-card-location{
      position:relative !important;
      margin:9px 0 15px !important;
      padding-left:17px !important;
      color:#77736c !important;
      font-size:11px !important;
      line-height:1.45 !important;
    }

    .property-card-location::before{
      content:'⌖' !important;
      position:absolute !important;
      left:0 !important;
      top:-1px !important;
      color:#b9975b !important;
      font-size:14px !important;
    }

    .property-card-price{
      display:flex !important;
      align-items:baseline !important;
      gap:9px !important;
      padding:12px 0 13px !important;
      border-top:1px solid rgba(23,23,22,.09) !important;
      border-bottom:1px solid rgba(23,23,22,.09) !important;
      color:#171716 !important;
      font-size:clamp(17px,1.7vw,23px) !important;
      font-weight:700 !important;
      line-height:1.2 !important;
    }

    .property-card-price-label{
      color:#a1844f !important;
      font-size:8px !important;
      font-weight:700 !important;
      letter-spacing:.14em !important;
      white-space:nowrap !important;
    }

    .property-mini-facts{
      display:flex !important;
      flex-wrap:wrap !important;
      gap:0 !important;
      margin:0 !important;
      padding:12px 0 15px !important;
    }

    .property-mini-facts span{
      padding:0 11px !important;
      border-right:1px solid rgba(23,23,22,.14) !important;
      color:#69655e !important;
      font-size:9px !important;
      font-weight:600 !important;
      letter-spacing:.04em !important;
      line-height:1.5 !important;
    }

    .property-mini-facts span:first-child{padding-left:0 !important}
    .property-mini-facts span:last-child{border-right:0 !important}

    .property-detail-button{
      width:100% !important;
      min-height:42px !important;
      border:1px solid #171716 !important;
      background:#171716 !important;
      color:#fff !important;
      font-size:9px !important;
      font-weight:700 !important;
      letter-spacing:.14em !important;
      cursor:pointer !important;
      transition:background .2s ease, color .2s ease, border-color .2s ease !important;
    }

    .property-detail-button:hover{
      background:#b9975b !important;
      border-color:#b9975b !important;
      color:#171716 !important;
    }

    .property-card-sold .property-card-image img{
      filter:grayscale(1) !important;
      opacity:.62 !important;
    }

    /* =====================================================
       DETAY MODALI — FOTO + BİLGİ AYNI EKRANDA
    ===================================================== */
    .property-modal{padding:14px !important;box-sizing:border-box !important}
    .property-modal-box{
      width:min(1080px,calc(100vw - 28px)) !important;
      max-width:1080px !important;
      height:min(92vh,900px) !important;
      max-height:calc(100vh - 28px) !important;
      overflow:hidden !important;
      box-shadow:0 30px 90px rgba(0,0,0,.25) !important;
    }
    .property-detail{
      height:100% !important;
      max-height:100% !important;
      overflow-y:auto !important;
      overflow-x:hidden !important;
      padding:22px 28px 26px !important;
      scrollbar-width:thin !important;
    }
    .property-detail h2{
      margin:0 48px 8px 0 !important;
      font-family:"Playfair Display",Georgia,serif !important;
      font-size:clamp(22px,2.3vw,32px) !important;
      line-height:1.12 !important;
    }
    .property-public-status{
      display:inline-flex !important;
      margin:0 0 7px !important;
      padding:5px 9px !important;
      background:#171716 !important;
      color:#fff !important;
      font-size:9px !important;
      font-weight:700 !important;
      letter-spacing:.13em !important;
    }
    .property-public-gallery{margin:9px 0 14px !important}
    .property-public-gallery-main{
      position:relative !important;
      width:100% !important;
      height:min(43vh,450px) !important;
      min-height:230px !important;
      overflow:hidden !important;
      background:#151515 !important;
      touch-action:pan-y !important;
      user-select:none !important;
    }
    .property-public-gallery-main > img{
      width:100% !important;
      height:100% !important;
      object-fit:contain !important;
      background:#151515 !important;
      display:block !important;
      pointer-events:none !important;
    }
    .property-public-gallery-arrow{
      position:absolute !important;
      top:50% !important;
      transform:translateY(-50%) !important;
      z-index:4 !important;
      width:46px !important;
      height:46px !important;
      border:1px solid rgba(255,255,255,.4) !important;
      border-radius:50% !important;
      background:rgba(0,0,0,.55) !important;
      color:#fff !important;
      font-size:31px !important;
      line-height:1 !important;
      cursor:pointer !important;
    }
    .property-public-gallery-arrow:hover{background:#b9975b !important;color:#171716 !important}
    .property-public-gallery-prev{left:14px !important}
    .property-public-gallery-next{right:14px !important}
    .property-public-gallery-counter{
      position:absolute !important;
      left:50% !important;
      bottom:11px !important;
      transform:translateX(-50%) !important;
      z-index:5 !important;
      padding:5px 10px !important;
      border-radius:18px !important;
      background:rgba(0,0,0,.65) !important;
      color:#fff !important;
      font-size:10px !important;
      letter-spacing:.08em !important;
    }
    .property-public-gallery-thumbs{
      display:flex !important;
      gap:7px !important;
      overflow-x:auto !important;
      padding:7px 2px 2px !important;
      scrollbar-width:thin !important;
    }
    .property-public-gallery-thumb{
      flex:0 0 70px !important;
      width:70px !important;
      height:50px !important;
      padding:0 !important;
      border:2px solid transparent !important;
      background:#111 !important;
      overflow:hidden !important;
      cursor:pointer !important;
      opacity:.62 !important;
    }
    .property-public-gallery-thumb img{width:100% !important;height:100% !important;object-fit:cover !important;display:block !important}
    .property-public-gallery-thumb.active{opacity:1 !important;border-color:#b9975b !important}

    .property-public-info{
      display:grid !important;
      grid-template-columns:repeat(3,minmax(0,1fr)) !important;
      gap:0 !important;
      margin:10px 0 15px !important;
      border-top:1px solid rgba(23,23,22,.14) !important;
    }
    .property-public-info-row{
      display:flex !important;
      flex-direction:column !important;
      justify-content:center !important;
      gap:4px !important;
      min-height:53px !important;
      padding:8px 12px !important;
      border-bottom:1px solid rgba(23,23,22,.10) !important;
      border-right:1px solid rgba(23,23,22,.08) !important;
      font-size:10px !important;
    }
    .property-public-info-row span{opacity:.55 !important;font-size:8px !important;letter-spacing:.1em !important;text-transform:uppercase !important}
    .property-public-info-row strong{text-align:left !important;font-size:12px !important}
    .property-detail > h3{margin:13px 0 5px !important;font-size:14px !important;letter-spacing:.04em !important}
    .property-detail > p{margin:0 0 9px !important;line-height:1.5 !important;font-size:12px !important}

    @media(max-width:1100px){
      .property-grid{grid-template-columns:repeat(2,minmax(0,1fr)) !important}
    }

    @media(max-width:700px){
      .property-grid{grid-template-columns:1fr !important;gap:20px !important}
      .property-card-content{padding:18px !important}
      .property-card-title{font-size:23px !important}
      .property-modal{padding:7px !important}
      .property-modal-box{width:calc(100vw - 14px) !important;height:calc(100vh - 14px) !important;max-height:calc(100vh - 14px) !important}
      .property-detail{padding:17px 13px 20px !important}
      .property-public-gallery-main{height:31vh !important;min-height:205px !important}
      .property-public-gallery-arrow{width:40px !important;height:40px !important;font-size:27px !important}
      .property-public-gallery-prev{left:8px !important}.property-public-gallery-next{right:8px !important}
      .property-public-gallery-thumb{flex-basis:62px !important;width:62px !important;height:45px !important}
      .property-public-info{grid-template-columns:repeat(2,minmax(0,1fr)) !important}
      .property-public-info-row{min-height:49px !important;padding:7px 9px !important}
      .property-card-image::after{opacity:1 !important;transform:none !important;font-size:8px !important;left:10px !important;bottom:10px !important}
    }
  `;
  document.head.append(style);

  const load = async () => {

    grid.innerHTML =
      '<p class="property-loading">Gayrimenkuller yükleniyor…</p>';

    const { data, error } = await db
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
      .order('id', { ascending: false });

    if (error) {
      console.error('Sivora gayrimenkul hatası:', error);
      grid.innerHTML =
        '<p class="property-empty">Gayrimenkuller yüklenemedi. Supabase tablo/izinlerini kontrol edin.</p>';
      return;
    }

    render(data || []);
  };

  load();

})();
