(() => {
  const url = window.SIVORA_SUPABASE_URL;
  const key = window.SIVORA_SUPABASE_ANON_KEY;
  const grid = document.getElementById('property-grid');

  if (
    !grid ||
    !url ||
    !key ||
    url.includes('SUPABASE_') ||
    key.includes('SUPABASE_') ||
    !window.supabase
  ) {
    return;
  }

  const client = window.supabase.createClient(url, key);

  const modal = document.getElementById('property-modal');
  const detail = document.getElementById('property-detail');
  const closeButton = document.getElementById('property-modal-x');
  const backdrop = document.getElementById('property-modal-close');

  const formatPrice = (price, currency) => {
    if (price === null || price === undefined || price === '') {
      return 'Fiyat için iletişime geçin';
    }

    const number = Number(price);

    if (Number.isNaN(number)) {
      return String(price);
    }

    return new Intl.NumberFormat('tr-TR').format(number) +
      ' ' +
      (currency || '₺');
  };

  const escapeText = (value) => {
    return String(value ?? '');
  };

  const getPhotos = (property) => {
    try {
      const photos = JSON.parse(property.fotograflar || '[]');

      if (Array.isArray(photos)) {
        return photos.filter(Boolean);
      }
    } catch (error) {
      console.error('Fotoğraflar okunamadı:', error);
    }

    return [];
  };

  const openDetail = (property) => {
    const photos = getPhotos(property);

    detail.replaceChildren();

    const wrapper = document.createElement('div');
    wrapper.className = 'property-detail';

    const gallery = document.createElement('div');
    gallery.className = 'property-detail-gallery';

    photos.forEach((photo, index) => {
      const img = document.createElement('img');

      img.src = photo;
      img.alt = escapeText(property.ilan_basligi) + ' - Fotoğraf ' + (index + 1);
      img.loading = index === 0 ? 'eager' : 'lazy';

      gallery.append(img);
    });

    if (!photos.length) {
      const emptyImage = document.createElement('div');
      emptyImage.className = 'property-no-image';
      emptyImage.textContent = 'Fotoğraf bulunmuyor';
      gallery.append(emptyImage);
    }

    const content = document.createElement('div');
    content.className = 'property-detail-content';

    const type = document.createElement('p');
    type.className = 'eyebrow';
    type.textContent =
      escapeText(property.ilan_turu) +
      ' · ' +
      escapeText(property.gayrimenkul_turu);

    const title = document.createElement('h2');
    title.textContent = escapeText(property.ilan_basligi);

    const location = document.createElement('p');
    location.className = 'property-detail-location';
    location.textContent = escapeText(property.konum);

    const price = document.createElement('div');
    price.className = 'property-detail-price';
    price.textContent = formatPrice(
      property.fiyat,
      property.para_birimi
    );

    const facts = document.createElement('div');
    facts.className = 'property-facts';

    const addFact = (label, value) => {
      if (
        value === null ||
        value === undefined ||
        value === ''
      ) {
        return;
      }

      const item = document.createElement('div');

      const small = document.createElement('small');
      small.textContent = label;

      const strong = document.createElement('strong');
      strong.textContent = String(value);

      item.append(small, strong);
      facts.append(item);
    };

    addFact('Brüt', property.brut_m2 ? property.brut_m2 + ' m²' : '');
    addFact('Net', property.net_m2 ? property.net_m2 + ' m²' : '');
    addFact('Oda', property.oda_sayisi);
    addFact('Banyo', property.banyo_sayisi);
    addFact('Kat', property.kat);
    addFact(
      'Bina yaşı',
      property.bina_yasi !== null &&
      property.bina_yasi !== undefined
        ? property.bina_yasi + ' yıl'
        : ''
    );
    addFact('Isıtma', property.isitma);

    const extras = document.createElement('div');
    extras.className = 'property-extras';

    if (property.balkon) {
      extras.append(createTag('Balkon'));
    }

    if (property.otopark) {
      extras.append(createTag('Otopark'));
    }

    if (property.ozellikler) {
      const featureText = document.createElement('p');
      featureText.textContent = property.ozellikler;
      extras.append(featureText);
    }

    const description = document.createElement('div');
    description.className = 'property-description';

    const descriptionTitle = document.createElement('h3');
    descriptionTitle.textContent = 'Açıklama';

    const descriptionText = document.createElement('p');
    descriptionText.textContent =
      property.aciklama || 'Detaylı bilgi için bizimle iletişime geçebilirsiniz.';

    description.append(
      descriptionTitle,
      descriptionText
    );

    const whatsapp = document.createElement('a');
    whatsapp.className = 'property-whatsapp';
    whatsapp.href =
      'https://wa.me/905532217532?text=' +
      encodeURIComponent(
        'Merhaba, "' +
        property.ilan_basligi +
        '" ilanı hakkında bilgi almak istiyorum.'
      );
    whatsapp.target = '_blank';
    whatsapp.rel = 'noopener';
    whatsapp.textContent = 'WhatsApp ile bilgi alın ↗';

    content.append(
      type,
      title,
      location,
      price,
      facts,
      extras,
      description,
      whatsapp
    );

    wrapper.append(gallery, content);
    detail.append(wrapper);

    modal.hidden = false;
    document.body.classList.add('property-modal-open');
  };

  const closeDetail = () => {
    modal.hidden = true;
    document.body.classList.remove('property-modal-open');
  };

  const createTag = (text) => {
    const tag = document.createElement('span');
    tag.className = 'property-tag';
    tag.textContent = text;
    return tag;
  };

  const loadProperties = async () => {
    const { data, error } = await client
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
        fotograflar
      `)
      .order('id', { ascending: false });

    if (error) {
      console.error('Gayrimenkuller yüklenemedi:', error.message);

      grid.replaceChildren();

      const errorMessage = document.createElement('p');
      errorMessage.className = 'property-empty';
      errorMessage.textContent =
        'Gayrimenkuller şu anda yüklenemiyor.';

      grid.append(errorMessage);
      return;
    }

    grid.replaceChildren();

    if (!data || !data.length) {
      const empty = document.createElement('p');
      empty.className = 'property-empty';
      empty.textContent =
        'Yeni gayrimenkullerimiz yakında burada.';
      grid.append(empty);
      return;
    }

    data.forEach((property, index) => {
      const photos = getPhotos(property);

      const card = document.createElement('article');
      card.className = 'property-card';

      const imageWrapper = document.createElement('div');
      imageWrapper.className = 'property-card-image';

      if (photos.length) {
        const image = document.createElement('img');

        image.src = photos[0];
        image.alt = escapeText(property.ilan_basligi);
        image.loading = index < 3 ? 'eager' : 'lazy';

        imageWrapper.append(image);
      } else {
        imageWrapper.textContent = 'Fotoğraf yok';
      }

      const badge = document.createElement('span');
      badge.className = 'property-badge';
      badge.textContent = escapeText(property.ilan_turu);

      imageWrapper.append(badge);

      const cardContent = document.createElement('div');
      cardContent.className = 'property-card-content';

      const propertyType = document.createElement('p');
      propertyType.className = 'property-type';
      propertyType.textContent =
        escapeText(property.gayrimenkul_turu);

      const title = document.createElement('h3');
      title.textContent = escapeText(property.ilan_basligi);

      const location = document.createElement('p');
      location.className = 'property-location';
      location.textContent = escapeText(property.konum);

      const price = document.createElement('strong');
      price.className = 'property-price';
      price.textContent = formatPrice(
        property.fiyat,
        property.para_birimi
      );

      const miniFacts = document.createElement('div');
      miniFacts.className = 'property-mini-facts';

      if (property.net_m2) {
        miniFacts.append(
          createTag(property.net_m2 + ' m²')
        );
      }

      if (property.oda_sayisi) {
        miniFacts.append(
          createTag(property.oda_sayisi + ' oda')
        );
      }

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'property-detail-button';
      button.textContent = 'Detayları incele ↗';

      button.addEventListener('click', () => {
        openDetail(property);
      });

      cardContent.append(
        propertyType,
        title,
        location,
        price,
        miniFacts,
        button
      );

      card.append(
        imageWrapper,
        cardContent
      );

      grid.append(card);
    });
  };

  closeButton?.addEventListener('click', closeDetail);
  backdrop?.addEventListener('click', closeDetail);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.hidden) {
      closeDetail();
    }
  });

  loadProperties();
})();
