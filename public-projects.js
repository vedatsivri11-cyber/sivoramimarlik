(() => {
  const url = window.SIVORA_SUPABASE_URL;
  const key = window.SIVORA_SUPABASE_ANON_KEY;
  const grid = document.getElementById('project-grid');

  if (
    !url ||
    !key ||
    url.includes('SUPABASE_') ||
    key.includes('SUPABASE_') ||
    !window.supabase ||
    !grid
  ) {
    return;
  }

  const client = window.supabase.createClient(url, key);

  const escapeText = (value) => String(value ?? '');

  /* =========================================================
     PROJE FOTOĞRAFLARINI AL
  ========================================================= */

  const getProjectPhotos = (project) => {
    let photos = [];

    // Yeni sistem: photos JSONB
    if (Array.isArray(project.photos)) {
      photos = project.photos;
    } else if (typeof project.photos === 'string') {
      try {
        const parsed = JSON.parse(project.photos);

        if (Array.isArray(parsed)) {
          photos = parsed;
        }
      } catch (error) {
        console.warn('Proje fotoğrafları okunamadı:', error);
      }
    }

    // Fotoğrafları URL formatına çevir
    photos = photos
      .map((photo) => {
        if (typeof photo === 'string') {
          return {
            url: photo,
            path: null
          };
        }

        if (photo && typeof photo === 'object') {
          return {
            url: photo.url || '',
            path: photo.path || null
          };
        }

        return null;
      })
      .filter((photo) => photo && photo.url);

    // Eski sistemdeki image_url varsa ve photos boşsa kullan
    if (!photos.length && project.image_url) {
      photos.push({
        url: project.image_url,
        path: project.storage_path || null
      });
    }

    return photos;
  };


  /* =========================================================
     GALERİ / LIGHTBOX
  ========================================================= */

  let galleryPhotos = [];
  let galleryIndex = 0;
  let galleryTitle = '';

  const lightbox = document.createElement('div');
  lightbox.className = 'sivora-project-lightbox';
  lightbox.hidden = true;

  lightbox.innerHTML = `
    <button
      type="button"
      class="sivora-lightbox-close"
      aria-label="Kapat"
    >
      ×
    </button>

    <button
      type="button"
      class="sivora-lightbox-prev"
      aria-label="Önceki fotoğraf"
    >
      ‹
    </button>

    <div class="sivora-lightbox-content">

      <div class="sivora-lightbox-title"></div>

      <img
        class="sivora-lightbox-image"
        src=""
        alt=""
      >

      <div class="sivora-lightbox-counter"></div>

    </div>

    <button
      type="button"
      class="sivora-lightbox-next"
      aria-label="Sonraki fotoğraf"
    >
      ›
    </button>
  `;

  document.body.appendChild(lightbox);


  /* =========================================================
     GALERİ CSS
     Mevcut site tasarımına dokunmaz.
  ========================================================= */

  const lightboxStyle = document.createElement('style');

  lightboxStyle.textContent = `
    .sivora-project-lightbox {
      position: fixed;
      inset: 0;
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.92);
      padding: 30px;
      box-sizing: border-box;
    }

    .sivora-project-lightbox[hidden] {
      display: none;
    }

    .sivora-lightbox-content {
      position: relative;
      width: min(92vw, 1500px);
      height: min(90vh, 900px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
    }

    .sivora-lightbox-image {
      display: block;
      max-width: 100%;
      max-height: calc(100% - 50px);
      width: auto;
      height: auto;
      object-fit: contain;
      user-select: none;
      -webkit-user-drag: none;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
    }

    .sivora-lightbox-title {
      color: #ffffff;
      font-size: 15px;
      letter-spacing: 0.08em;
      margin-bottom: 14px;
      text-align: center;
      text-transform: uppercase;
    }

    .sivora-lightbox-counter {
      color: rgba(255, 255, 255, 0.75);
      font-size: 13px;
      margin-top: 12px;
      letter-spacing: 0.08em;
    }

    .sivora-lightbox-close,
    .sivora-lightbox-prev,
    .sivora-lightbox-next {
      position: absolute;
      z-index: 2;
      border: 0;
      background: rgba(0, 0, 0, 0.35);
      color: #ffffff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition:
        background 0.2s ease,
        opacity 0.2s ease;
    }

    .sivora-lightbox-close:hover,
    .sivora-lightbox-prev:hover,
    .sivora-lightbox-next:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    .sivora-lightbox-close {
      top: 20px;
      right: 25px;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      font-size: 34px;
      line-height: 1;
      font-weight: 200;
    }

    .sivora-lightbox-prev,
    .sivora-lightbox-next {
      top: 50%;
      transform: translateY(-50%);
      width: 56px;
      height: 72px;
      font-size: 52px;
      font-weight: 200;
      line-height: 1;
    }

    .sivora-lightbox-prev {
      left: 20px;
    }

    .sivora-lightbox-next {
      right: 20px;
    }

    .sivora-lightbox-prev[hidden],
    .sivora-lightbox-next[hidden] {
      display: none;
    }

    .project-image {
      cursor: zoom-in;
    }

    @media (max-width: 700px) {
      .sivora-project-lightbox {
        padding: 15px;
      }

      .sivora-lightbox-content {
        width: 96vw;
        height: 85vh;
      }

      .sivora-lightbox-prev,
      .sivora-lightbox-next {
        width: 44px;
        height: 60px;
        font-size: 40px;
      }

      .sivora-lightbox-prev {
        left: 5px;
      }

      .sivora-lightbox-next {
        right: 5px;
      }

      .sivora-lightbox-close {
        top: 10px;
        right: 10px;
        width: 42px;
        height: 42px;
      }

      .sivora-lightbox-title {
        font-size: 12px;
      }
    }
  `;

  document.head.appendChild(lightboxStyle);


  /* =========================================================
     GALERİYİ GÖSTER
  ========================================================= */

  const lightboxImage =
    lightbox.querySelector('.sivora-lightbox-image');

  const lightboxTitle =
    lightbox.querySelector('.sivora-lightbox-title');

  const lightboxCounter =
    lightbox.querySelector('.sivora-lightbox-counter');

  const prevButton =
    lightbox.querySelector('.sivora-lightbox-prev');

  const nextButton =
    lightbox.querySelector('.sivora-lightbox-next');

  const closeButton =
    lightbox.querySelector('.sivora-lightbox-close');


  const showGalleryImage = () => {
    if (!galleryPhotos.length) return;

    const photo = galleryPhotos[galleryIndex];

    lightboxImage.src = photo.url;
    lightboxImage.alt = galleryTitle;

    lightboxTitle.textContent = galleryTitle;

    lightboxCounter.textContent =
      `${galleryIndex + 1} / ${galleryPhotos.length}`;

    if (galleryPhotos.length <= 1) {
      prevButton.hidden = true;
      nextButton.hidden = true;
    } else {
      prevButton.hidden = false;
      nextButton.hidden = false;
    }
  };


  const openGallery = (photos, index, title) => {
    galleryPhotos = photos;
    galleryIndex = index;
    galleryTitle = title;

    showGalleryImage();

    lightbox.hidden = false;

    document.body.style.overflow = 'hidden';
  };


  const closeGallery = () => {
    lightbox.hidden = true;

    lightboxImage.src = '';

    document.body.style.overflow = '';
  };


  const nextPhoto = () => {
    if (galleryPhotos.length <= 1) return;

    galleryIndex++;

    if (galleryIndex >= galleryPhotos.length) {
      galleryIndex = 0;
    }

    showGalleryImage();
  };


  const previousPhoto = () => {
    if (galleryPhotos.length <= 1) return;

    galleryIndex--;

    if (galleryIndex < 0) {
      galleryIndex = galleryPhotos.length - 1;
    }

    showGalleryImage();
  };


  nextButton.addEventListener('click', (event) => {
    event.stopPropagation();
    nextPhoto();
  });


  prevButton.addEventListener('click', (event) => {
    event.stopPropagation();
    previousPhoto();
  });


  closeButton.addEventListener('click', (event) => {
    event.stopPropagation();
    closeGallery();
  });


  /* Arka plana tıklayınca kapat */
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) {
      closeGallery();
    }
  });


  /* Klavye kontrolleri */
  document.addEventListener('keydown', (event) => {
    if (lightbox.hidden) return;

    if (event.key === 'Escape') {
      closeGallery();
    }

    if (event.key === 'ArrowRight') {
      nextPhoto();
    }

    if (event.key === 'ArrowLeft') {
      previousPhoto();
    }
  });


  /* =========================================================
     PROJELERİ SUPABASE'DEN ÇEK
  ========================================================= */

  client
    .from('projects')
    .select(
      'id,title,location,description,image_url,storage_path,photos,created_at'
    )
    .order('created_at', { ascending: false })

    .then(({ data, error }) => {

      if (error) {
        console.error(
          'Portföy yüklenemedi:',
          error.message
        );

        return;
      }

      grid.replaceChildren();


      if (!data?.length) {

        const empty = document.createElement('p');

        empty.className = 'portfolio-empty';

        empty.textContent =
          'Yeni çalışmalarımız yakında burada.';

        grid.append(empty);

        return;
      }


      /* =====================================================
         HER PROJE
      ===================================================== */

      data.forEach((project, index) => {

        const photos = getProjectPhotos(project);

        const card =
          document.createElement('article');

        card.className =
          'project live-project';


        /* Ana fotoğraf */

        const img =
          document.createElement('img');

        img.className =
          'project-image';

        img.src =
          photos[0]?.url || '';

        img.alt =
          escapeText(project.title);

        img.loading =
          'lazy';


        /*
         * Fotoğrafa tıklanınca galeri aç
         */
        img.addEventListener('click', () => {

          if (!photos.length) return;

          openGallery(
            photos,
            0,
            escapeText(project.title)
          );

        });


        /* Proje bilgileri */

        const info =
          document.createElement('div');

        info.className =
          'project-info';


        const number =
          document.createElement('span');

        number.textContent =
          String(index + 1).padStart(2, '0');


        const text =
          document.createElement('div');


        const title =
          document.createElement('h2');

        title.textContent =
          escapeText(project.title);


        const location =
          document.createElement('p');

        location.textContent =
          escapeText(project.location);


        const description =
          document.createElement('p');

        description.className =
          'project-description';

        description.textContent =
          escapeText(project.description);


        text.append(
          title,
          location,
          description
        );


        info.append(
          number,
          text
        );


        card.append(
          img,
          info
        );


        grid.append(card);

      });

    })

    .catch((error) => {

      console.error(
        'Projeler yüklenirken hata oluştu:',
        error
      );

    });

})();
