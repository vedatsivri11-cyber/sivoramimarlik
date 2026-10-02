(() => {
  const grid = document.getElementById('project-grid');
  if (!grid) return;

  if (!window.SIVORA_SUPABASE_URL || !window.SIVORA_SUPABASE_ANON_KEY || !window.supabase) {
    grid.replaceChildren();
    const p = document.createElement('p');
    p.className = 'portfolio-empty';
    p.textContent = 'Projeler bağlantısı kurulamadı.';
    grid.append(p);
    return;
  }

  const db = window.supabase.createClient(window.SIVORA_SUPABASE_URL, window.SIVORA_SUPABASE_ANON_KEY);

  const parsePhotos = value => {
    if (Array.isArray(value)) return value;
    if (typeof value !== 'string') return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  };

  const normalizePhotos = project => {
    let photos = parsePhotos(project.photos)
      .map(photo => {
        if (typeof photo === 'string') return { url: photo, path: null };
        if (photo && typeof photo === 'object') return { url: photo.url || '', path: photo.path || null };
        return null;
      })
      .filter(photo => photo && photo.url);

    if (!photos.length && project.image_url) {
      photos = [{ url: project.image_url, path: project.storage_path || null }];
    }
    return photos;
  };

  const cleanText = value => String(value ?? '').trim();

  // Proje detay penceresi
  const modal = document.createElement('div');
  modal.className = 'sivora-project-modal';
  modal.hidden = true;
  modal.innerHTML = `
    <div class="sivora-project-backdrop" data-project-close></div>
    <div class="sivora-project-box" role="dialog" aria-modal="true" aria-label="Proje detayları">
      <button type="button" class="sivora-project-close" data-project-close aria-label="Kapat">×</button>
      <div class="sivora-project-gallery">
        <button type="button" class="sivora-project-arrow sivora-project-prev" aria-label="Önceki fotoğraf">‹</button>
        <img class="sivora-project-main-image" alt="">
        <button type="button" class="sivora-project-arrow sivora-project-next" aria-label="Sonraki fotoğraf">›</button>
      </div>
      <div class="sivora-project-content">
        <div class="sivora-project-counter"></div>
        <h2 class="sivora-project-title"></h2>
        <p class="sivora-project-location"></p>
        <p class="sivora-project-description"></p>
        <div class="sivora-project-thumbs"></div>
      </div>
    </div>
  `;
  document.body.append(modal);

  const mainImage = modal.querySelector('.sivora-project-main-image');
  const titleEl = modal.querySelector('.sivora-project-title');
  const locationEl = modal.querySelector('.sivora-project-location');
  const descriptionEl = modal.querySelector('.sivora-project-description');
  const counterEl = modal.querySelector('.sivora-project-counter');
  const thumbsEl = modal.querySelector('.sivora-project-thumbs');
  const prevBtn = modal.querySelector('.sivora-project-prev');
  const nextBtn = modal.querySelector('.sivora-project-next');

  let activePhotos = [];
  let activeIndex = 0;

  const renderGallery = () => {
    if (!activePhotos.length) return;
    const photo = activePhotos[activeIndex];
    mainImage.src = photo.url;
    mainImage.alt = titleEl.textContent || 'Sivora Mimarlık Projesi';
    counterEl.textContent = activePhotos.length > 1 ? `${activeIndex + 1} / ${activePhotos.length}` : '';
    prevBtn.hidden = activePhotos.length < 2;
    nextBtn.hidden = activePhotos.length < 2;
    thumbsEl.replaceChildren();

    if (activePhotos.length > 1) {
      activePhotos.forEach((item, index) => {
        const thumb = document.createElement('button');
        thumb.type = 'button';
        thumb.className = 'sivora-project-thumb' + (index === activeIndex ? ' active' : '');
        thumb.setAttribute('aria-label', `Fotoğraf ${index + 1}`);
        const img = document.createElement('img');
        img.src = item.url;
        img.alt = '';
        thumb.append(img);
        thumb.addEventListener('click', () => {
          activeIndex = index;
          renderGallery();
        });
        thumbsEl.append(thumb);
      });
    }
  };

  const openProject = project => {
    activePhotos = normalizePhotos(project);
    activeIndex = 0;
    titleEl.textContent = cleanText(project.title) || 'Proje';
    locationEl.textContent = cleanText(project.location);
    descriptionEl.textContent = cleanText(project.description);
    descriptionEl.hidden = !cleanText(project.description);
    renderGallery();
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  };

  const closeProject = () => {
    modal.hidden = true;
    document.body.style.overflow = '';
  };

  modal.addEventListener('click', event => {
    if (event.target.closest('[data-project-close]')) closeProject();
  });
  prevBtn.addEventListener('click', () => {
    if (!activePhotos.length) return;
    activeIndex = (activeIndex - 1 + activePhotos.length) % activePhotos.length;
    renderGallery();
  });
  nextBtn.addEventListener('click', () => {
    if (!activePhotos.length) return;
    activeIndex = (activeIndex + 1) % activePhotos.length;
    renderGallery();
  });
  document.addEventListener('keydown', event => {
    if (modal.hidden) return;
    if (event.key === 'Escape') closeProject();
    if (event.key === 'ArrowLeft' && activePhotos.length > 1) {
      activeIndex = (activeIndex - 1 + activePhotos.length) % activePhotos.length;
      renderGallery();
    }
    if (event.key === 'ArrowRight' && activePhotos.length > 1) {
      activeIndex = (activeIndex + 1) % activePhotos.length;
      renderGallery();
    }
  });

  const createProjectCard = (project, index) => {
    const photos = normalizePhotos(project);
    const article = document.createElement('article');
    article.className = 'project live-project' + (index === 0 ? ' large' : '');
    article.setAttribute('tabindex', '0');
    article.setAttribute('role', 'button');
    article.setAttribute('aria-label', `${cleanText(project.title) || 'Proje'} detaylarını aç`);

    const imageWrap = document.createElement('div');
    imageWrap.className = 'project-image-wrap';
    const image = document.createElement('img');
    image.className = 'project-image';
    image.src = photos[0]?.url || '';
    image.alt = cleanText(project.title) || 'Sivora Mimarlık Projesi';
    image.loading = index === 0 ? 'eager' : 'lazy';
    imageWrap.append(image);

    const info = document.createElement('div');
    info.className = 'project-info';
    const number = document.createElement('span');
    number.textContent = String(index + 1).padStart(2, '0');
    const text = document.createElement('div');
    const title = document.createElement('h2');
    title.textContent = cleanText(project.title) || 'Proje';
    const meta = document.createElement('p');
    meta.textContent = cleanText(project.location) || 'Sivora Mimarlık';
    text.append(title, meta);
    info.append(number, text);
    article.append(imageWrap, info);

    const activate = () => openProject(project);
    article.addEventListener('click', activate);
    article.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activate();
      }
    });
    return article;
  };

  const loadProjects = async () => {
    const { data, error } = await db.from('projects').select(`
      id, title, location, description, image_url, storage_path, photos, created_at
    `).order('created_at', { ascending: false });

    grid.replaceChildren();
    if (error) {
      console.error('Sivora projeler hatası:', error);
      const p = document.createElement('p');
      p.className = 'portfolio-empty';
      p.textContent = 'Projeler yüklenemedi.';
      grid.append(p);
      return;
    }

    const projects = (data || []).filter(project => normalizePhotos(project).length);
    if (!projects.length) {
      const p = document.createElement('p');
      p.className = 'portfolio-empty';
      p.textContent = 'Henüz proje eklenmedi.';
      grid.append(p);
      return;
    }
    projects.forEach((project, index) => grid.append(createProjectCard(project, index)));
  };

  const style = document.createElement('style');
  style.textContent = `
    .project-grid .live-project{min-width:0;cursor:pointer;}
    .project-grid .live-project:focus-visible{outline:2px solid #b9975b;outline-offset:6px;}
    .project-grid .project-image-wrap{position:relative;overflow:hidden;}
    .project-grid .live-project .project-image{display:block;width:100%;height:auto;object-fit:cover;transition:transform .6s ease;}
    .project-grid .live-project:hover .project-image{transform:scale(1.015);}
    .project-grid .portfolio-empty{grid-column:1/-1;padding:60px 20px;text-align:center;opacity:.6;}
    .sivora-project-modal{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;}
    .sivora-project-modal[hidden]{display:none!important;}
    .sivora-project-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.78);backdrop-filter:blur(4px);}
    .sivora-project-box{position:relative;z-index:1;width:min(1000px,94vw);max-height:92vh;overflow:auto;background:#f4f0e8;color:#171717;box-shadow:0 25px 80px rgba(0,0,0,.35);}
    body.dark-mode .sivora-project-box{background:#222;color:#f1eee8;}
    .sivora-project-close{position:absolute;right:14px;top:10px;z-index:5;width:44px;height:44px;border:0;background:rgba(0,0,0,.45);color:#fff;font-size:32px;line-height:1;cursor:pointer;}
    .sivora-project-gallery{position:relative;background:#111;display:flex;align-items:center;justify-content:center;min-height:300px;}
    .sivora-project-main-image{display:block;width:100%;max-height:58vh;object-fit:contain;}
    .sivora-project-arrow{position:absolute;top:50%;transform:translateY(-50%);z-index:3;width:46px;height:46px;border:0;background:rgba(0,0,0,.5);color:#fff;font-size:38px;cursor:pointer;}
    .sivora-project-prev{left:14px}.sivora-project-next{right:14px}
    .sivora-project-content{padding:24px 28px 28px;}
    .sivora-project-counter{font-size:10px;letter-spacing:.12em;opacity:.55;margin-bottom:8px;}
    .sivora-project-title{margin:0 0 6px;font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:32px;}
    .sivora-project-location{margin:0 0 18px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;opacity:.65;}
    .sivora-project-description{margin:0;line-height:1.7;max-width:760px;white-space:pre-line;}
    .sivora-project-thumbs{display:flex;gap:8px;overflow-x:auto;margin-top:22px;padding-bottom:3px;}
    .sivora-project-thumb{flex:0 0 72px;width:72px;height:54px;padding:0;border:1px solid transparent;background:transparent;cursor:pointer;opacity:.6;}
    .sivora-project-thumb.active{border-color:#b9975b;opacity:1;}
    .sivora-project-thumb img{width:100%;height:100%;object-fit:cover;display:block;}
    @media(max-width:700px){
      .sivora-project-modal{padding:10px;}
      .sivora-project-box{width:96vw;max-height:94vh;}
      .sivora-project-gallery{min-height:220px;}
      .sivora-project-main-image{max-height:48vh;}
      .sivora-project-content{padding:18px;}
      .sivora-project-title{font-size:27px;}
    }
  `;
  document.head.append(style);
  loadProjects();
})();
