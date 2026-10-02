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

  const db = window.supabase.createClient(
    window.SIVORA_SUPABASE_URL,
    window.SIVORA_SUPABASE_ANON_KEY
  );

  const parsePhotos = value => {
    if (Array.isArray(value)) return value;
    if (typeof value !== 'string') return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const normalizePhotos = project => {
    let photos = parsePhotos(project.photos)
      .map(photo => {
        if (typeof photo === 'string') return { url: photo, path: null };
        if (photo && typeof photo === 'object') {
          return { url: photo.url || '', path: photo.path || null };
        }
        return null;
      })
      .filter(Boolean)
      .filter(photo => photo.url);

    if (!photos.length && project.image_url) {
      photos = [{ url: project.image_url, path: project.storage_path || null }];
    }

    return photos;
  };

  const escText = value => String(value ?? '').trim();

  const createProjectCard = (project, index) => {
    const photos = normalizePhotos(project);
    const article = document.createElement('article');
    article.className = 'project live-project' + (index === 0 ? ' large' : '');

    const image = document.createElement('img');
    image.className = 'project-image';
    image.src = photos[0]?.url || '';
    image.alt = escText(project.title) || 'Sivora Projesi';
    image.loading = index === 0 ? 'eager' : 'lazy';

    const imageWrap = document.createElement('div');
    imageWrap.className = 'project-image-wrap';
    imageWrap.append(image);

    if (photos.length > 1) {
      const count = document.createElement('span');
      count.className = 'project-photo-count';
      count.textContent = `${photos.length} FOTOĞRAF`;
      imageWrap.append(count);
    }

    const info = document.createElement('div');
    info.className = 'project-info';

    const number = document.createElement('span');
    number.textContent = String(index + 1).padStart(2, '0');

    const text = document.createElement('div');
    const title = document.createElement('h2');
    title.textContent = escText(project.title) || 'Proje';

    const meta = document.createElement('p');
    meta.textContent = escText(project.location) || 'Sivora Mimarlık';

    text.append(title, meta);
    info.append(number, text);
    article.append(imageWrap, info);

    return article;
  };

  const loadProjects = async () => {
    const { data, error } = await db
      .from('projects')
      .select(`
        id,
        title,
        location,
        description,
        image_url,
        storage_path,
        photos,
        created_at
      `)
      .order('created_at', { ascending: false });

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

    projects.forEach((project, index) => {
      grid.append(createProjectCard(project, index));
    });
  };

  const style = document.createElement('style');
  style.textContent = `
    .project-grid .live-project{min-width:0;}
    .project-grid .project-image-wrap{position:relative;overflow:hidden;}
    .project-grid .live-project .project-image{display:block;width:100%;height:auto;object-fit:cover;}
    .project-grid .project-photo-count{
      position:absolute;left:14px;bottom:14px;z-index:2;
      padding:7px 10px;background:rgba(0,0,0,.68);color:#fff;
      font:600 9px/1 Arial,sans-serif;letter-spacing:.12em;
    }
    body.dark-mode .project-grid .project-photo-count{background:rgba(255,255,255,.9);color:#171717;}
    .project-grid .live-project:hover .project-image{transform:scale(1.015);}
    .project-grid .live-project .project-image{transition:transform .6s ease;}
  `;
  document.head.append(style);

  loadProjects();
})();
