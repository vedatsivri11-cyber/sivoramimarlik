(() => {
  const configured =
    window.SIVORA_SUPABASE_URL &&
    window.SIVORA_SUPABASE_ANON_KEY &&
    !window.SIVORA_SUPABASE_URL.includes('SUPABASE_') &&
    !window.SIVORA_SUPABASE_ANON_KEY.includes('SUPABASE_') &&
    window.supabase;

  const setup = document.getElementById('setup-needed');
  const login = document.getElementById('login-form');
  const dashboard = document.getElementById('dashboard');
  const status = document.getElementById('admin-status');
  const cards = document.getElementById('admin-projects');

  if (!configured) {
    setup.hidden = false;
    login.hidden = true;
    return;
  }

  const db = window.supabase.createClient(
    window.SIVORA_SUPABASE_URL,
    window.SIVORA_SUPABASE_ANON_KEY
  );

  const setStatus = (message) => {
    status.textContent = message;
  };

  const refresh = async () => {
    const { data, error } = await db
      .from('projects')
      .select('id,title,location,image_url,storage_path,created_at')
      .order('created_at', { ascending: false });

    if (error) {
      setStatus('Projeler yüklenemedi: ' + error.message);
      return;
    }

    cards.replaceChildren();

    (data || []).forEach(project => {
      const row = document.createElement('article');
      row.className = 'admin-project';

      const image = document.createElement('img');
      image.src = project.image_url;
      image.alt = project.title;

      const detail = document.createElement('div');

      const title = document.createElement('strong');
      title.textContent = project.title;

      const location = document.createElement('p');
      location.textContent = project.location;

      detail.append(title, location);

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Sil';

      remove.addEventListener('click', async () => {
        if (!window.confirm('Bu proje galeriden kaldırılsın mı?')) {
          return;
        }

        const { error: fileError } = await db.storage
          .from('projects')
          .remove([project.storage_path]);

        if (fileError) {
          setStatus('Fotoğraf silinemedi: ' + fileError.message);
          return;
        }

        const { error: rowError } = await db
          .from('projects')
          .delete()
          .eq('id', project.id);

        if (rowError) {
          setStatus('Proje silinemedi: ' + rowError.message);
          return;
        }

        setStatus('Proje silindi.');
        refresh();
      });

      row.append(image, detail, remove);
      cards.append(row);
    });
  };

  const loadSession = async () => {
    const { data } = await db.auth.getSession();

    const signedIn = !!data.session;

    login.hidden = signedIn;
    dashboard.hidden = !signedIn;

    if (signedIn) {
      refresh();
    }
  };

  login.addEventListener('submit', async event => {
    event.preventDefault();

    const form = new FormData(login);

    const email = form.get('email');
    const password = form.get('password');

    setStatus('Giriş yapılıyor...');

    const { error } = await db.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      alert('GİRİŞ HATASI:\n\n' + error.message);
      setStatus('Giriş başarısız.');
      return;
    }

    login.reset();

    setStatus('Giriş başarılı.');
    await loadSession();
  });

  document.getElementById('logout').addEventListener('click', async () => {
    await db.auth.signOut();
    setStatus('Çıkış yapıldı.');
    loadSession();
  });

  document.getElementById('project-form').addEventListener('submit', async event => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const file = form.get('image');

    const { data: userData } = await db.auth.getUser();

    if (!userData.user) {
      setStatus('Oturum kapandı; yeniden giriş yap.');
      loadSession();
      return;
    }

    if (
      !file ||
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setStatus('JPG, PNG veya WebP biçiminde 5 MB’tan küçük bir fotoğraf seç.');
      return;
    }

    setStatus('Fotoğraf yükleniyor...');

    const ext =
      file.type === 'image/jpeg'
        ? 'jpg'
        : file.type.split('/')[1];

    const path =
      userData.user.id +
      '/' +
      crypto.randomUUID() +
      '.' +
      ext;

    const { error: uploadError } = await db.storage
      .from('projects')
      .upload(path, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      setStatus('Fotoğraf yüklenemedi: ' + uploadError.message);
      return;
    }

    const { data: publicData } = db.storage
      .from('projects')
      .getPublicUrl(path);

    const { error } = await db
      .from('projects')
      .insert({
        owner_id: userData.user.id,
        title: String(form.get('title')).trim(),
        location: String(form.get('location')).trim(),
        image_url: publicData.publicUrl,
        storage_path: path
      });

    if (error) {
      await db.storage.from('projects').remove([path]);
      setStatus('Proje kaydedilemedi: ' + error.message);
      return;
    }

    event.currentTarget.reset();

    setStatus('Proje yayımlandı.');
    refresh();
  });

  loadSession();
})();