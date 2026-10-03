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

    // Metin fiyatları aynen göster: ör. PROJE BAŞLANGICINA ÖZEL FİYAT
    const numeric = Number(raw.replace(/\./g, '').replace(',', '.'));
    if (!Number.isNaN(numeric) && /^[-+]?\d+(?:[.,]\d+)?$/.test(raw)) {
      return numeric.toLocaleString('tr-TR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }) + ' ' + (currency || 'TL');
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

      content.append(
        el(
          'p',
          'property-type',
          `${property.ilan_turu || ''} · ${property.gayrimenkul_turu || ''}`
        ),
        el(
          'h3',
          '',
          property.ilan_basligi || 'Gayrimenkul'
        ),
        el(
          'p',
          'property-location',
          property.konum || ''
        ),
        el(
          'p',
          'property-price',
          money(property.fiyat, property.para_birimi)
        )
      );

      const facts = el('div', 'property-mini-facts');

      if (property.brut_m2)
        facts.append(el('span', '', `Brüt ${property.brut_m2} m²`));

      if (property.net_m2)
        facts.append(el('span', '', `Net ${property.net_m2} m²`));

      if (property.oda_sayisi)
        facts.append(el('span', '', property.oda_sayisi));

      if (property.banyo_sayisi)
        facts.append(el('span', '', `${property.banyo_sayisi} Banyo`));

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
    .property-card-sold .property-card-image img{
      filter:grayscale(1);
      opacity:.62;
    }

    .property-card-sold .property-card-image{
      background:#b8b8b8;
    }

    .property-sold-stamp{
      position:absolute;
      left:50%;
      top:50%;
      transform:translate(-50%,-50%) rotate(-8deg);
      z-index:3;
      padding:12px 22px;
      border:3px solid #fff;
      color:#fff;
      background:rgba(70,70,70,.82);
      font-family:"DM Sans",Arial,sans-serif;
      font-size:clamp(22px,3vw,38px);
      font-weight:700;
      letter-spacing:.16em;
      white-space:nowrap;
      pointer-events:none;
    }

    .property-public-status{
      display:inline-block;
      margin-bottom:12px;
      padding:7px 11px;
      background:#171716;
      color:#fff;
      font-size:10px;
      font-weight:700;
      letter-spacing:.12em;
    }

    .property-public-gallery{
      display:block;
      margin:20px 0;
    }

    .property-public-gallery-main{
      position:relative;
      width:100%;
      height:min(58vw,560px);
      min-height:280px;
      overflow:hidden;
      background:#111;
      touch-action:pan-y;
      user-select:none;
    }

    .property-public-gallery-main > img{
      width:100%;
      height:100%;
      object-fit:cover;
      display:block;
      transition:opacity .18s ease;
      pointer-events:none;
    }

    .property-public-gallery-arrow{
      position:absolute;
      top:50%;
      transform:translateY(-50%);
      width:42px;
      height:42px;
      border:1px solid rgba(255,255,255,.7);
      background:rgba(0,0,0,.42);
      color:#fff;
      font-size:30px;
      line-height:1;
      cursor:pointer;
      z-index:2;
    }

    .property-public-gallery-prev{left:14px}
    .property-public-gallery-next{right:14px}

    .property-public-gallery-counter{
      position:absolute;
      left:50%;
      bottom:14px;
      transform:translateX(-50%);
      padding:6px 10px;
      background:rgba(0,0,0,.55);
      color:#fff;
      font-size:11px;
      letter-spacing:.08em;
      z-index:2;
    }

    .property-public-gallery-thumbs{
      display:flex;
      gap:8px;
      overflow-x:auto;
      padding:10px 2px 2px;
      scrollbar-width:thin;
    }

    .property-public-gallery-thumb{
      flex:0 0 82px;
      width:82px;
      height:62px;
      padding:0;
      border:2px solid transparent;
      background:#111;
      cursor:pointer;
      overflow:hidden;
    }

    .property-public-gallery-thumb img{
      width:100%;
      height:100%;
      object-fit:cover;
      display:block;
    }

    .property-public-gallery-thumb.active{
      border-color:#b69a63;
    }

    .property-public-info{
      display:grid;
      gap:0;
      margin:20px 0;
      border-top:1px solid rgba(170,165,156,.45);
    }

    .property-public-info-row{
      display:flex;
      justify-content:space-between;
      gap:20px;
      padding:11px 0;
      border-bottom:1px solid rgba(170,165,156,.35);
      font-size:12px;
    }

    .property-public-info-row span{opacity:.55}
    .property-public-info-row strong{text-align:right}

    @media(max-width:600px){
      .property-public-gallery-main{
        height:72vw;
        min-height:240px;
      }
      .property-public-gallery-arrow{
        width:38px;
        height:38px;
      }
      .property-public-gallery-thumb{
        flex-basis:72px;
        width:72px;
        height:54px;
      }
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

/* SIVORA — mobil ilan penceresi güvenliği */
(() => {
  const style = document.createElement('style');
  style.textContent = `
    .property-modal{z-index:999999!important;}
    .property-modal-box{position:relative!important;}
    .property-modal-x{display:flex!important;align-items:center!important;justify-content:center!important;touch-action:manipulation!important;}
    @media(max-width:700px){
      .property-modal{padding:0!important;place-items:stretch!important;}
      .property-modal-box{width:100%!important;height:100dvh!important;max-height:100dvh!important;border-radius:0!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;padding:58px 14px 24px!important;box-sizing:border-box!important;}
      .property-modal-x{position:fixed!important;top:max(10px,env(safe-area-inset-top))!important;right:10px!important;width:44px!important;height:44px!important;border-radius:50%!important;background:rgba(238,234,226,.96)!important;border:1px solid rgba(0,0,0,.16)!important;z-index:1000001!important;font-size:30px!important;line-height:1!important;box-shadow:0 4px 14px rgba(0,0,0,.12)!important;}
      .property-public-gallery-main{min-height:250px!important;}
      .property-public-gallery-main img{max-height:55vh!important;}
    }
  `;
  document.head.appendChild(style);

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const modal = document.getElementById('property-modal');
    if (modal && !modal.hidden) {
      modal.hidden = true;
      document.body.style.overflow = '';
    }
  });

  document.addEventListener('click', event => {
    const target = event.target.closest?.('[data-close-property]');
    if (!target) return;
    const modal = document.getElementById('property-modal');
    if (modal) modal.hidden = true;
    document.body.style.overflow = '';
  });
})();
