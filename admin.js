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
  const propertyCards = document.getElementById('admin-properties');

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


  /* =========================
     MİMARLIK PROJELERİ
  ========================= */

  const refreshProjects = async () => {
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
        refreshProjects();
      });

      row.append(image, detail, remove);
      cards.append(row);
    });
  };


  /* =========================
     GAYRİMENKULLER
  ========================= */

  const refreshProperties = async () => {
    if (!propertyCards) return;

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
        fotograflar
      `)
      .order('id', { ascending: false });

    if (error) {
      setStatus('Gayrimenkuller yüklenemedi: ' + error.message);
      return;
    }

    propertyCards.replaceChildren();

    (data || []).forEach(property => {
      const row = document.createElement('article');
      row.className = 'admin-project';

      let photos = [];

      try {
        photos = JSON.parse(property.fotograflar || '[]');
      } catch {
        photos = [];
      }

      const image = document.createElement('img');

      if (photos.length > 0) {
        image.src = photos[0];
      }

      image.alt = property.ilan_basligi || 'Gayrimenkul';

      const detail = document.createElement('div');

      const title = document.createElement('strong');
      title.textContent = property.ilan_basligi;

      const type = document.createElement('p');
      type.textContent =
        `${property.ilan_turu || ''} · ${property.gayrimenkul_turu || ''}`;

      const location = document.createElement('p');
      location.textContent = property.konum || '';

      const price = document.createElement('p');

      const formattedPrice = Number(property.fiyat || 0).toLocaleString(
        'tr-TR',
        {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }
      );

      price.textContent =
        `${formattedPrice} ${property.para_birimi || ''}`;

      detail.append(title, type, location, price);

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Sil';

      remove.addEventListener('click', async () => {
        if (
          !window.confirm(
            'Bu gayrimenkul ilanı tamamen silinsin mi?'
          )
        ) {
          return;
        }

        setStatus('Gayrimenkul siliniyor...');

        const { error: rowError } = await db
          .from('properties')
          .delete()
          .eq('id', property.id);

        if (rowError) {
          setStatus(
            'Gayrimenkul silinemedi: ' + rowError.message
          );
          return;
        }

        setStatus('Gayrimenkul silindi.');

        refreshProperties();
      });

      row.append(image, detail, remove);
      propertyCards.append(row);
    });
  };


  /* =========================
     GENEL YENİLEME
  ========================= */

  const refresh = async () => {
    await refreshProjects();
    await refreshProperties();
  };


  /* =========================
     OTURUM
  ========================= */

  const loadSession = async () => {
    const { data } = await db.auth.getSession();

    const signedIn = !!data.session;

    login.hidden = signedIn;
    dashboard.hidden = !signedIn;

    if (signedIn) {
      refresh();
    }
  };


  /* =========================
     GİRİŞ
  ========================= */

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


  /* =========================
     ÇIKIŞ
  ========================= */

  document
    .getElementById('logout')
    .addEventListener('click', async () => {
      await db.auth.signOut();

      setStatus('Çıkış yapıldı.');

      loadSession();
    });


  /* =========================
     PROJE EKLEME
  ========================= */

  document
    .getElementById('project-form')
    .addEventListener('submit', async event => {

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
        setStatus(
          'JPG, PNG veya WebP biçiminde 5 MB’tan küçük bir fotoğraf seç.'
        );
        return;
      }

      setStatus('Proje fotoğrafı yükleniyor...');

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
        setStatus(
          'Fotoğraf yüklenemedi: ' +
          uploadError.message
        );
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
        await db.storage
          .from('projects')
          .remove([path]);

        setStatus(
          'Proje kaydedilemedi: ' +
          error.message
        );

        return;
      }

      event.currentTarget.reset();

      setStatus('Proje yayımlandı.');

      refreshProjects();
    });


  /* =========================
     GAYRİMENKUL EKLEME
  ========================= */

  const propertyForm =
    document.getElementById('property-form');

  if (propertyForm) {

    propertyForm.addEventListener(
      'submit',
      async event => {

        event.preventDefault();

        const form =
          new FormData(event.currentTarget);

        const files =
          form.getAll('fotograflar');

        const { data: userData } =
          await db.auth.getUser();

        if (!userData.user) {
          setStatus(
            'Oturum kapandı; yeniden giriş yap.'
          );

          loadSession();
          return;
        }


        /* FOTOĞRAF KONTROLÜ */

        const validFiles = files.filter(
          file =>
            file &&
            file instanceof File &&
            file.size > 0
        );

        if (!validFiles.length) {
          setStatus(
            'En az bir gayrimenkul fotoğrafı seç.'
          );
          return;
        }

        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/webp'
        ];

        for (const file of validFiles) {

          if (!allowedTypes.includes(file.type)) {
            setStatus(
              'Sadece JPG, PNG veya WebP fotoğraflar kullanılabilir.'
            );
            return;
          }

          if (file.size > 5 * 1024 * 1024) {
            setStatus(
              `"${file.name}" 5 MB'tan büyük.`
            );
            return;
          }
        }


        /* İLAN BİLGİLERİ */

        const ilanBasligi =
          String(
            form.get('ilan_basligi') || ''
          ).trim();

        const ilanTuru =
          String(
            form.get('ilan_turu') || ''
          ).trim();

        const gayrimenkulTuru =
          String(
            form.get('gayrimenkul_turu') || ''
          ).trim();

        const konum =
          String(
            form.get('konum') || ''
          ).trim();

        const fiyat =
          form.get('fiyat');

        const paraBirimi =
          String(
            form.get('para_birimi') || 'EUR'
          );

        if (
          !ilanBasligi ||
          !ilanTuru ||
          !gayrimenkulTuru ||
          !konum ||
          !fiyat
        ) {
          setStatus(
            'Lütfen zorunlu alanları doldur.'
          );
          return;
        }


        /* FOTOĞRAFLARI YÜKLE */

        setStatus(
          `${validFiles.length} fotoğraf yükleniyor...`
        );

        const photoUrls = [];
        const uploadedPaths = [];

        for (let i = 0; i < validFiles.length; i++) {

          const file = validFiles[i];

          const ext =
            file.type === 'image/jpeg'
              ? 'jpg'
              : file.type.split('/')[1];

          const path =
            'properties/' +
            userData.user.id +
            '/' +
            crypto.randomUUID() +
            '.' +
            ext;

          const {
            error: uploadError
          } = await db.storage
            .from('property-images')
            .upload(
              path,
              file,
              {
                contentType: file.type,
                upsert: false
              }
            );

          if (uploadError) {

            if (uploadedPaths.length) {
              await db.storage
                .from('property-images')
                .remove(uploadedPaths);
            }

            setStatus(
              'Fotoğraf yüklenemedi: ' +
              uploadError.message
            );

            return;
          }

          uploadedPaths.push(path);

          const {
            data: publicData
          } = db.storage
            .from('property-images')
            .getPublicUrl(path);

          photoUrls.push(
            publicData.publicUrl
          );

          setStatus(
            `${i + 1}/${validFiles.length} fotoğraf yüklendi...`
          );
        }


        /* VERİTABANINA KAYDET */

        const propertyData = {
          ilan_basligi: ilanBasligi,

          ilan_turu: ilanTuru,

          gayrimenkul_turu:
            gayrimenkulTuru,

          konum: konum,

          fiyat: Number(fiyat),

          para_birimi:
            paraBirimi,

          brut_m2:
            form.get('brut_m2')
              ? Number(form.get('brut_m2'))
              : null,

          net_m2:
            form.get('net_m2')
              ? Number(form.get('net_m2'))
              : null,

          oda_sayisi:
            String(
              form.get('oda_sayisi') || ''
            ).trim(),

          banyo_sayisi:
            form.get('banyo_sayisi')
              ? Number(form.get('banyo_sayisi'))
              : null,

          kat:
            String(
              form.get('kat') || ''
            ).trim(),

          bina_yasi:
            form.get('bina_yasi')
              ? Number(form.get('bina_yasi'))
              : null,

          isitma:
            String(
              form.get('isitma') || ''
            ).trim(),

          balkon:
            form.get('balkon') === 'true',

          otopark:
            form.get('otopark') === 'true',

          aciklama:
            String(
              form.get('aciklama') || ''
            ).trim(),

          ozellikler:
            String(
              form.get('ozellikler') || ''
            ).trim(),

          fotograflar:
            JSON.stringify(photoUrls)
        };


        const {
          error: insertError
        } = await db
          .from('properties')
          .insert(propertyData);


        /* KAYIT BAŞARISIZSA FOTOĞRAFLARI TEMİZLE */

        if (insertError) {

          await db.storage
            .from('property-images')
            .remove(uploadedPaths);

          setStatus(
            'Gayrimenkul kaydedilemedi: ' +
            insertError.message
          );

          return;
        }


        /* BAŞARILI */

        event.currentTarget.reset();

        setStatus(
          'Gayrimenkul başarıyla yayımlandı.'
        );

        refreshProperties();
      }
    );
  }


  /* =========================
     BAŞLAT
  ========================= */

  loadSession();

})();
