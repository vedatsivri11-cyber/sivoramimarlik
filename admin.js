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
    if (setup) setup.hidden = false;
    if (login) login.hidden = true;
    return;
  }

  const db = window.supabase.createClient(
    window.SIVORA_SUPABASE_URL,
    window.SIVORA_SUPABASE_ANON_KEY
  );

  const setStatus = (message) => {
    if (status) status.textContent = message;
  };


  /* =========================================================
     YARDIMCI FONKSİYONLAR
  ========================================================= */

  const parseProjectPhotos = (value) => {
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


  const parsePropertyPhotos = (value) => {
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


  const getProjectPhotoUrl = (photo) => {
    if (!photo) return '';

    if (typeof photo === 'string') {
      return photo;
    }

    if (typeof photo === 'object') {
      return photo.url || '';
    }

    return '';
  };


  const getProjectPhotoPath = (photo) => {
    if (!photo || typeof photo !== 'object') return null;
    return photo.path || null;
  };


  const createButton = (text, className = '') => {
    const button = document.createElement('button');

    button.type = 'button';
    button.textContent = text;

    if (className) {
      button.className = className;
    }

    return button;
  };


  const makePhotoExt = (file) => {
    if (file.type === 'image/jpeg') return 'jpg';

    const parts = file.type.split('/');

    return parts[1] || 'jpg';
  };


  const validateImageFiles = (files) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    for (const file of files) {
      if (!file || file.size <= 0) {
        continue;
      }

      if (!allowedTypes.includes(file.type)) {
        return 'Sadece JPG, PNG veya WebP fotoğraflar kullanılabilir.';
      }

      if (file.size > 5 * 1024 * 1024) {
        return `"${file.name}" 5 MB'tan büyük.`;
      }
    }

    return null;
  };


  /* =========================================================
     PROJE FOTOĞRAFLARINI STORAGE'DAN SİL
  ========================================================= */

  const removeProjectStorageFiles = async (photos, oldStoragePath = null) => {
    const paths = [];

    for (const photo of photos || []) {
      const path = getProjectPhotoPath(photo);

      if (path && !paths.includes(path)) {
        paths.push(path);
      }
    }

    if (
      oldStoragePath &&
      !paths.includes(oldStoragePath)
    ) {
      paths.push(oldStoragePath);
    }

    if (!paths.length) {
      return null;
    }

    const { error } = await db.storage
      .from('projects')
      .remove(paths);

    return error || null;
  };


  /* =========================================================
     PROJELERİ GETİR
  ========================================================= */

  const refreshProjects = async () => {
    if (!cards) return;

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
      .order('created_at', {
        ascending: false
      });

    if (error) {
      setStatus(
        'Projeler yüklenemedi: ' +
        error.message
      );
      return;
    }

    cards.replaceChildren();

    (data || []).forEach(project => {

      const row = document.createElement('article');

      row.className = 'admin-project';


      /* =====================================================
         FOTOĞRAFLAR
      ===================================================== */

      let photos = parseProjectPhotos(
        project.photos
      );

      /*
       * Eski projelerde photos olmayabilir.
       * image_url üzerinden devam et.
       */

      if (!photos.length && project.image_url) {
        photos = [
          {
            url: project.image_url,
            path: project.storage_path || null
          }
        ];
      }


      const image = document.createElement('img');

      image.src =
        getProjectPhotoUrl(photos[0]) ||
        project.image_url ||
        '';

      image.alt =
        project.title || 'Proje';


      /* =====================================================
         DETAY
      ===================================================== */

      const detail =
        document.createElement('div');

      const title =
        document.createElement('strong');

      title.textContent =
        project.title || 'Proje';


      const location =
        document.createElement('p');

      location.textContent =
        project.location || '';


      const photoCount =
        document.createElement('p');

      photoCount.textContent =
        `${photos.length} fotoğraf`;


      detail.append(
        title,
        location,
        photoCount
      );


      /* =====================================================
         BUTONLAR
      ===================================================== */

      const actions =
        document.createElement('div');

      actions.className =
        'admin-project-actions';


      const edit =
        createButton('Düzenle');


      const managePhotos =
        createButton('Fotoğraflar');


      const remove =
        createButton('Sil');


      /* =====================================================
         DÜZENLE
      ===================================================== */

      edit.addEventListener(
        'click',
        () => {

          openProjectEdit(
            project,
            photos
          );

        }
      );


      /* =====================================================
         FOTOĞRAFLAR
      ===================================================== */

      managePhotos.addEventListener(
        'click',
        () => {

          openProjectPhotoManager(
            project,
            photos
          );

        }
      );


      /* =====================================================
         PROJEYİ TAMAMEN SİL
      ===================================================== */

      remove.addEventListener(
        'click',
        async () => {

          const confirmed =
            window.confirm(
              'Bu proje ve içindeki TÜM fotoğraflar tamamen silinsin mi?'
            );

          if (!confirmed) {
            return;
          }

          setStatus(
            'Proje siliniyor...'
          );

          const fileError =
            await removeProjectStorageFiles(
              photos,
              project.storage_path
            );

          if (fileError) {
            setStatus(
              'Proje fotoğrafları silinemedi: ' +
              fileError.message
            );
            return;
          }


          const {
            error: rowError
          } = await db
            .from('projects')
            .delete()
            .eq('id', project.id);


          if (rowError) {

            setStatus(
              'Proje silinemedi: ' +
              rowError.message
            );

            return;
          }


          setStatus(
            'Proje tamamen silindi.'
          );

          refreshProjects();

        }
      );


      actions.append(
        edit,
        managePhotos,
        remove
      );


      row.append(
        image,
        detail,
        actions
      );


      cards.append(row);

    });
  };


  /* =========================================================
     PROJE FOTOĞRAF YÖNETİCİSİ
  ========================================================= */

  const openProjectPhotoManager = (
    project,
    photos
  ) => {

    const modal =
      createModal(
        `Proje Fotoğrafları · ${project.title}`
      );


    const gallery =
      document.createElement('div');

    gallery.style.display =
      'grid';

    gallery.style.gridTemplateColumns =
      'repeat(auto-fill, minmax(180px, 1fr))';

    gallery.style.gap =
      '16px';


    photos.forEach(
      (photo, index) => {

        const box =
          document.createElement('div');

        box.style.position =
          'relative';

        box.style.border =
          '1px solid rgba(0,0,0,.12)';

        box.style.padding =
          '8px';


        const image =
          document.createElement('img');

        image.src =
          getProjectPhotoUrl(photo);

        image.alt =
          `${project.title} ${index + 1}`;

        image.style.width =
          '100%';

        image.style.height =
          '160px';

        image.style.objectFit =
          'cover';


        const number =
          document.createElement('small');

        number.textContent =
          `Fotoğraf ${index + 1}`;

        number.style.display =
          'block';

        number.style.margin =
          '8px 0';


        const deleteButton =
          createButton(
            'Bu fotoğrafı sil'
          );


        deleteButton.addEventListener(
          'click',
          async () => {

            const confirmed =
              window.confirm(
                'Sadece bu fotoğraf silinsin mi? Proje silinmeyecek.'
              );

            if (!confirmed) {
              return;
            }

            setStatus(
              'Fotoğraf siliniyor...'
            );


            const newPhotos =
              photos.filter(
                (_, photoIndex) =>
                  photoIndex !== index
              );


            /*
             * Storage dosyasını sil
             */

            const path =
              getProjectPhotoPath(photo);


            if (path) {

              const {
                error: storageError
              } = await db.storage
                .from('projects')
                .remove([path]);


              if (storageError) {

                setStatus(
                  'Fotoğraf Storage\'dan silinemedi: ' +
                  storageError.message
                );

                return;
              }
            }


            /*
             * En az bir fotoğraf kaldıysa
             * ilk fotoğrafı ana fotoğraf yap.
             */

            const firstPhoto =
              newPhotos[0] || null;


            const updateData = {
              photos: newPhotos,
              image_url:
                firstPhoto
                  ? getProjectPhotoUrl(firstPhoto)
                  : null,
              storage_path:
                firstPhoto
                  ? getProjectPhotoPath(firstPhoto)
                  : null
            };


            const {
              error
            } = await db
              .from('projects')
              .update(updateData)
              .eq('id', project.id);


            if (error) {

              setStatus(
                'Proje güncellenemedi: ' +
                error.message
              );

              return;
            }


            setStatus(
              'Fotoğraf silindi.'
            );


            closeModal();

            refreshProjects();

          }
        );


        box.append(
          image,
          number,
          deleteButton
        );


        gallery.append(box);

      }
    );


    if (!photos.length) {

      const empty =
        document.createElement('p');

      empty.textContent =
        'Bu projede fotoğraf bulunmuyor.';

      gallery.append(empty);

    }


    modal.content.append(
      gallery
    );


    const addArea =
      document.createElement('div');

    addArea.style.marginTop =
      '25px';

    addArea.style.paddingTop =
      '20px';

    addArea.style.borderTop =
      '1px solid rgba(0,0,0,.12)';


    const label =
      document.createElement('label');

    label.textContent =
      'Bu projeye yeni fotoğraf ekle';


    const input =
      document.createElement('input');

    input.type =
      'file';

    input.multiple =
      true;

    input.accept =
      'image/jpeg,image/png,image/webp';


    const addButton =
      createButton(
        'Fotoğrafları ekle'
      );


    addButton.addEventListener(
      'click',
      async () => {

        const files =
          Array.from(input.files || [])
            .filter(file => file.size > 0);


        if (!files.length) {

          setStatus(
            'Önce fotoğraf seç.'
          );

          return;
        }


        const validation =
          validateImageFiles(files);


        if (validation) {

          setStatus(
            validation
          );

          return;
        }


        const {
          data: userData
        } = await db.auth.getUser();


        if (!userData.user) {

          setStatus(
            'Oturum kapandı; yeniden giriş yap.'
          );

          return;
        }


        setStatus(
          `${files.length} fotoğraf ekleniyor...`
        );


        const uploaded =
          [];


        for (
          let i = 0;
          i < files.length;
          i++
        ) {

          const file =
            files[i];

          const ext =
            makePhotoExt(file);


          const path =
            userData.user.id +
            '/' +
            crypto.randomUUID() +
            '.' +
            ext;


          const {
            error: uploadError
          } = await db.storage
            .from('projects')
            .upload(
              path,
              file,
              {
                contentType: file.type,
                upsert: false
              }
            );


          if (uploadError) {

            if (uploaded.length) {

              await db.storage
                .from('projects')
                .remove(
                  uploaded.map(
                    item => item.path
                  )
                );

            }


            setStatus(
              'Fotoğraf yüklenemedi: ' +
              uploadError.message
            );

            return;
          }


          const {
            data: publicData
          } = db.storage
            .from('projects')
            .getPublicUrl(path);


          uploaded.push({
            url:
              publicData.publicUrl,
            path
          });


          setStatus(
            `${i + 1}/${files.length} fotoğraf yüklendi...`
          );
        }


        const combinedPhotos = [
          ...photos,
          ...uploaded
        ];


        const {
          error
        } = await db
          .from('projects')
          .update({
            photos:
              combinedPhotos,
            image_url:
              getProjectPhotoUrl(
                combinedPhotos[0]
              ),
            storage_path:
              getProjectPhotoPath(
                combinedPhotos[0]
              )
          })
          .eq('id', project.id);


        if (error) {

          await db.storage
            .from('projects')
            .remove(
              uploaded.map(
                item => item.path
              )
            );


          setStatus(
            'Proje güncellenemedi: ' +
            error.message
          );

          return;
        }


        setStatus(
          'Fotoğraflar başarıyla eklendi.'
        );


        closeModal();

        refreshProjects();

      }
    );


    addArea.append(
      label,
      input,
      addButton
    );


    modal.content.append(
      addArea
    );

  };


  /* =========================================================
     PROJE DÜZENLE
  ========================================================= */

  const openProjectEdit = (
    project,
    photos
  ) => {

    const modal =
      createModal(
        'Projeyi Düzenle'
      );


    const form =
      document.createElement('form');


    form.style.display =
      'grid';

    form.style.gap =
      '14px';


    const titleLabel =
      document.createElement('label');

    titleLabel.textContent =
      'Proje adı';


    const titleInput =
      document.createElement('input');

    titleInput.type =
      'text';

    titleInput.value =
      project.title || '';

    titleInput.required =
      true;


    titleLabel.append(
      titleInput
    );


    const locationLabel =
      document.createElement('label');

    locationLabel.textContent =
      'Konum';


    const locationInput =
      document.createElement('input');

    locationInput.type =
      'text';

    locationInput.value =
      project.location || '';

    locationInput.required =
      true;


    locationLabel.append(
      locationInput
    );


    const descriptionLabel =
      document.createElement('label');

    descriptionLabel.textContent =
      'Açıklama';


    const descriptionInput =
      document.createElement('textarea');

    descriptionInput.rows =
      5;

    descriptionInput.value =
      project.description || '';


    descriptionLabel.append(
      descriptionInput
    );


    const save =
      createButton(
        'Değişiklikleri kaydet'
      );


    save.type =
      'submit';


    form.append(
      titleLabel,
      locationLabel,
      descriptionLabel,
      save
    );


    form.addEventListener(
      'submit',
      async event => {

        event.preventDefault();


        setStatus(
          'Proje güncelleniyor...'
        );


        const {
          error
        } = await db
          .from('projects')
          .update({
            title:
              titleInput.value.trim(),

            location:
              locationInput.value.trim(),

            description:
              descriptionInput.value.trim()
          })
          .eq('id', project.id);


        if (error) {

          setStatus(
            'Proje güncellenemedi: ' +
            error.message
          );

          return;
        }


        setStatus(
          'Proje güncellendi.'
        );


        closeModal();

        refreshProjects();

      }
    );


    modal.content.append(
      form
    );

  };


  /* =========================================================
     GAYRİMENKULLER
  ========================================================= */

  const refreshProperties = async () => {

    if (!propertyCards) return;


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
        fotograflar
      `)
      .order('id', {
        ascending: false
      });


    if (error) {

      setStatus(
        'Gayrimenkuller yüklenemedi: ' +
        error.message
      );

      return;
    }


    propertyCards.replaceChildren();


    (data || []).forEach(property => {

      const row =
        document.createElement('article');

      row.className =
        'admin-project';


      const photos =
        parsePropertyPhotos(
          property.fotograflar
        );


      const image =
        document.createElement('img');


      if (photos.length) {
        image.src =
          photos[0];
      }


      image.alt =
        property.ilan_basligi ||
        'Gayrimenkul';


      const detail =
        document.createElement('div');


      const title =
        document.createElement('strong');

      title.textContent =
        property.ilan_basligi ||
        'Gayrimenkul';


      const type =
        document.createElement('p');

      type.textContent =
        `${property.ilan_turu || ''} · ${property.gayrimenkul_turu || ''}`;


      const location =
        document.createElement('p');

      location.textContent =
        property.konum || '';


      const formattedPrice =
        Number(
          property.fiyat || 0
        ).toLocaleString(
          'tr-TR',
          {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
          }
        );


      const price =
        document.createElement('p');

      price.textContent =
        `${formattedPrice} ${property.para_birimi || ''}`;


      const photoCount =
        document.createElement('p');

      photoCount.textContent =
        `${photos.length} fotoğraf`;


      detail.append(
        title,
        type,
        location,
        price,
        photoCount
      );


      const actions =
        document.createElement('div');

      actions.className =
        'admin-project-actions';


      const edit =
        createButton(
          'Düzenle'
        );


      const managePhotos =
        createButton(
          'Fotoğraflar'
        );


      const remove =
        createButton(
          'Sil'
        );


      /* =====================================================
         GAYRİMENKUL DÜZENLE
      ===================================================== */

      edit.addEventListener(
        'click',
        () => {

          openPropertyEdit(
            property
          );

        }
      );


      /* =====================================================
         GAYRİMENKUL FOTOĞRAFLARI
      ===================================================== */

      managePhotos.addEventListener(
        'click',
        () => {

          openPropertyPhotoManager(
            property,
            photos
          );

        }
      );


      /* =====================================================
         GAYRİMENKUL TAMAMEN SİL
      ===================================================== */

      remove.addEventListener(
        'click',
        async () => {

          const confirmed =
            window.confirm(
              'Bu gayrimenkul ilanı ve TÜM fotoğrafları tamamen silinsin mi?'
            );


          if (!confirmed) {
            return;
          }


          setStatus(
            'Gayrimenkul siliniyor...'
          );


          /*
           * Fotoğraf URL'sinden Storage path
           * çıkarmaya çalış.
           */

          const paths =
            photos
              .map(
                photo =>
                  extractPropertyStoragePath(
                    photo
                  )
              )
              .filter(Boolean);


          if (paths.length) {

            const {
              error: storageError
            } = await db.storage
              .from('property-images')
              .remove(paths);


            if (storageError) {

              setStatus(
                'Gayrimenkul fotoğrafları silinemedi: ' +
                storageError.message
              );

              return;
            }
          }


          const {
            error: rowError
          } = await db
            .from('properties')
            .delete()
            .eq('id', property.id);


          if (rowError) {

            setStatus(
              'Gayrimenkul silinemedi: ' +
              rowError.message
            );

            return;
          }


          setStatus(
            'Gayrimenkul tamamen silindi.'
          );


          refreshProperties();

        }
      );


      actions.append(
        edit,
        managePhotos,
        remove
      );


      row.append(
        image,
        detail,
        actions
      );


      propertyCards.append(row);

    });

  };


  /* =========================================================
     GAYRİMENKUL STORAGE PATH
  ========================================================= */

  const extractPropertyStoragePath = (
    photoUrl
  ) => {

    if (!photoUrl) return null;

    /*
     * Eski kayıtlar URL olarak tutuluyor.
     * Örnek:
     * .../storage/v1/object/public/property-images/properties/...
     */

    try {

      const marker =
        '/storage/v1/object/public/property-images/';

      const index =
        photoUrl.indexOf(marker);


      if (index === -1) {
        return null;
      }


      return decodeURIComponent(
        photoUrl.substring(
          index + marker.length
        )
      );

    } catch {

      return null;

    }
  };


  /* =========================================================
     GAYRİMENKUL FOTOĞRAF YÖNETİCİSİ
  ========================================================= */

  const openPropertyPhotoManager = (
    property,
    photos
  ) => {

    const modal =
      createModal(
        `Gayrimenkul Fotoğrafları · ${property.ilan_basligi}`
      );


    const gallery =
      document.createElement('div');


    gallery.style.display =
      'grid';

    gallery.style.gridTemplateColumns =
      'repeat(auto-fill, minmax(180px, 1fr))';

    gallery.style.gap =
      '16px';


    photos.forEach(
      (photo, index) => {

        const box =
          document.createElement('div');


        box.style.border =
          '1px solid rgba(0,0,0,.12)';

        box.style.padding =
          '8px';


        const image =
          document.createElement('img');

        image.src =
          photo;

        image.alt =
          `${property.ilan_basligi} ${index + 1}`;

        image.style.width =
          '100%';

        image.style.height =
          '160px';

        image.style.objectFit =
          'cover';


        const label =
          document.createElement('small');

        label.textContent =
          `Fotoğraf ${index + 1}`;

        label.style.display =
          'block';

        label.style.margin =
          '8px 0';


        const deleteButton =
          createButton(
            'Bu fotoğrafı sil'
          );


        deleteButton.addEventListener(
          'click',
          async () => {

            const confirmed =
              window.confirm(
                'Sadece bu fotoğraf silinsin mi? İlan silinmeyecek.'
              );


            if (!confirmed) {
              return;
            }


            setStatus(
              'Fotoğraf siliniyor...'
            );


            const newPhotos =
              photos.filter(
                (_, photoIndex) =>
                  photoIndex !== index
              );


            const storagePath =
              extractPropertyStoragePath(
                photo
              );


            if (storagePath) {

              const {
                error: storageError
              } = await db.storage
                .from('property-images')
                .remove([
                  storagePath
                ]);


              if (storageError) {

                setStatus(
                  'Fotoğraf Storage\'dan silinemedi: ' +
                  storageError.message
                );

                return;
              }
            }


            const {
              error
            } = await db
              .from('properties')
              .update({
                fotograflar:
                  JSON.stringify(
                    newPhotos
                  )
              })
              .eq('id', property.id);


            if (error) {

              setStatus(
                'İlan güncellenemedi: ' +
                error.message
              );

              return;
            }


            setStatus(
              'Fotoğraf silindi.'
            );


            closeModal();

            refreshProperties();

          }
        );


        box.append(
          image,
          label,
          deleteButton
        );


        gallery.append(
          box
        );

      }
    );


    if (!photos.length) {

      const empty =
        document.createElement('p');

      empty.textContent =
        'Bu gayrimenkulde fotoğraf bulunmuyor.';

      gallery.append(empty);

    }


    modal.content.append(
      gallery
    );


    /* =====================================================
       YENİ FOTOĞRAF EKLE
    ===================================================== */

    const addArea =
      document.createElement('div');


    addArea.style.marginTop =
      '25px';

    addArea.style.paddingTop =
      '20px';

    addArea.style.borderTop =
      '1px solid rgba(0,0,0,.12)';


    const label =
      document.createElement('label');

    label.textContent =
      'Bu ilana yeni fotoğraf ekle';


    const input =
      document.createElement('input');

    input.type =
      'file';

    input.multiple =
      true;

    input.accept =
      'image/jpeg,image/png,image/webp';


    const addButton =
      createButton(
        'Fotoğrafları ekle'
      );


    addButton.addEventListener(
      'click',
      async () => {

        const files =
          Array.from(
            input.files || []
          ).filter(
            file =>
              file &&
              file.size > 0
          );


        if (!files.length) {

          setStatus(
            'Önce fotoğraf seç.'
          );

          return;
        }


        const validation =
          validateImageFiles(
            files
          );


        if (validation) {

          setStatus(
            validation
          );

          return;
        }


        const {
          data: userData
        } = await db.auth.getUser();


        if (!userData.user) {

          setStatus(
            'Oturum kapandı; yeniden giriş yap.'
          );

          return;
        }


        setStatus(
          `${files.length} fotoğraf ekleniyor...`
        );


        const uploadedUrls =
          [];

        const uploadedPaths =
          [];


        for (
          let i = 0;
          i < files.length;
          i++
        ) {

          const file =
            files[i];


          const ext =
            makePhotoExt(file);


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
                contentType:
                  file.type,
                upsert:
                  false
              }
            );


          if (uploadError) {

            if (uploadedPaths.length) {

              await db.storage
                .from('property-images')
                .remove(
                  uploadedPaths
                );

            }


            setStatus(
              'Fotoğraf yüklenemedi: ' +
              uploadError.message
            );

            return;
          }


          uploadedPaths.push(
            path
          );


          const {
            data: publicData
          } = db.storage
            .from('property-images')
            .getPublicUrl(
              path
            );


          uploadedUrls.push(
            publicData.publicUrl
          );


          setStatus(
            `${i + 1}/${files.length} fotoğraf yüklendi...`
          );

        }


        const combined =
          [
            ...photos,
            ...uploadedUrls
          ];


        const {
          error
        } = await db
          .from('properties')
          .update({
            fotograflar:
              JSON.stringify(
                combined
              )
          })
          .eq('id', property.id);


        if (error) {

          await db.storage
            .from('property-images')
            .remove(
              uploadedPaths
            );


          setStatus(
            'İlan güncellenemedi: ' +
            error.message
          );

          return;
        }


        setStatus(
          'Fotoğraflar başarıyla eklendi.'
        );


        closeModal();

        refreshProperties();

      }
    );


    addArea.append(
      label,
      input,
      addButton
    );


    modal.content.append(
      addArea
    );

  };


  /* =========================================================
     GAYRİMENKUL DÜZENLEME
  ========================================================= */

  const openPropertyEdit = (
    property
  ) => {

    const modal =
      createModal(
        'Gayrimenkulü Düzenle'
      );


    const form =
      document.createElement('form');


    form.style.display =
      'grid';

    form.style.gap =
      '12px';


    const fields = [];


    const addField = (
      labelText,
      name,
      value,
      type = 'text'
    ) => {

      const label =
        document.createElement('label');

      label.textContent =
        labelText;


      const input =
        document.createElement(
          type === 'textarea'
            ? 'textarea'
            : 'input'
        );


      if (type !== 'textarea') {
        input.type =
          type;
      }


      if (type === 'textarea') {
        input.rows = 4;
      }


      input.value =
        value ?? '';


      label.append(
        input
      );


      form.append(
        label
      );


      fields.push({
        name,
        input
      });

    };


    addField(
      'İlan başlığı',
      'ilan_basligi',
      property.ilan_basligi
    );


    addField(
      'İlan türü',
      'ilan_turu',
      property.ilan_turu
    );


    addField(
      'Gayrimenkul türü',
      'gayrimenkul_turu',
      property.gayrimenkul_turu
    );


    addField(
      'Konum',
      'konum',
      property.konum
    );


    addField(
      'Fiyat',
      'fiyat',
      property.fiyat,
      'number'
    );


    addField(
      'Para birimi',
      'para_birimi',
      property.para_birimi
    );


    addField(
      'Brüt m²',
      'brut_m2',
      property.brut_m2,
      'number'
    );


    addField(
      'Net m²',
      'net_m2',
      property.net_m2,
      'number'
    );


    addField(
      'Oda sayısı',
      'oda_sayisi',
      property.oda_sayisi
    );


    addField(
      'Banyo sayısı',
      'banyo_sayisi',
      property.banyo_sayisi,
      'number'
    );


    addField(
      'Kat',
      'kat',
      property.kat
    );


    addField(
      'Bina yaşı',
      'bina_yasi',
      property.bina_yasi,
      'number'
    );


    addField(
      'Isıtma',
      'isitma',
      property.isitma
    );


    addField(
      'Açıklama',
      'aciklama',
      property.aciklama,
      'textarea'
    );


    addField(
      'Özellikler',
      'ozellikler',
      property.ozellikler,
      'textarea'
    );


    const balkonLabel =
      document.createElement('label');


    const balkon =
      document.createElement('input');

    balkon.type =
      'checkbox';

    balkon.checked =
      property.balkon === true;


    balkonLabel.append(
      balkon,
      document.createTextNode(
        ' Balkon'
      )
    );


    form.append(
      balkonLabel
    );


    const otoparkLabel =
      document.createElement('label');


    const otopark =
      document.createElement('input');

    otopark.type =
      'checkbox';

    otopark.checked =
      property.otopark === true;


    otoparkLabel.append(
      otopark,
      document.createTextNode(
        ' Otopark'
      )
    );


    form.append(
      otoparkLabel
    );


    const save =
      createButton(
        'Değişiklikleri kaydet'
      );


    save.type =
      'submit';


    form.append(
      save
    );


    form.addEventListener(
      'submit',
      async event => {

        event.preventDefault();


        const get =
          name => {

            const item =
              fields.find(
                field =>
                  field.name === name
              );

            return item
              ? item.input.value
              : '';
          };


        setStatus(
          'Gayrimenkul güncelleniyor...'
        );


        const updateData = {

          ilan_basligi:
            get('ilan_basligi').trim(),

          ilan_turu:
            get('ilan_turu').trim(),

          gayrimenkul_turu:
            get('gayrimenkul_turu').trim(),

          konum:
            get('konum').trim(),

          fiyat:
            Number(get('fiyat')),

          para_birimi:
            get('para_birimi').trim(),

          brut_m2:
            get('brut_m2')
              ? Number(get('brut_m2'))
              : null,

          net_m2:
            get('net_m2')
              ? Number(get('net_m2'))
              : null,

          oda_sayisi:
            get('oda_sayisi').trim(),

          banyo_sayisi:
            get('banyo_sayisi')
              ? Number(get('banyo_sayisi'))
              : null,

          kat:
            get('kat').trim(),

          bina_yasi:
            get('bina_yasi')
              ? Number(get('bina_yasi'))
              : null,

          isitma:
            get('isitma').trim(),

          balkon:
            balkon.checked,

          otopark:
            otopark.checked,

          aciklama:
            get('aciklama').trim(),

          ozellikler:
            get('ozellikler').trim()
        };


        const {
          error
        } = await db
          .from('properties')
          .update(updateData)
          .eq('id', property.id);


        if (error) {

          setStatus(
            'Gayrimenkul güncellenemedi: ' +
            error.message
          );

          return;
        }


        setStatus(
          'Gayrimenkul güncellendi.'
        );


        closeModal();

        refreshProperties();

      }
    );


    modal.content.append(
      form
    );

  };


  /* =========================================================
     MODAL SİSTEMİ
  ========================================================= */

  let activeModal = null;


  const closeModal = () => {

    if (!activeModal) {
      return;
    }


    activeModal.remove();

    activeModal = null;

    document.body.style.overflow = '';

  };


  const createModal = (
    titleText
  ) => {

    closeModal();


    const overlay =
      document.createElement('div');


    overlay.style.position =
      'fixed';

    overlay.style.inset =
      '0';

    overlay.style.zIndex =
      '99999';

    overlay.style.background =
      'rgba(0,0,0,.65)';

    overlay.style.display =
      'flex';

    overlay.style.alignItems =
      'center';

    overlay.style.justifyContent =
      'center';

    overlay.style.padding =
      '20px';

    overlay.style.boxSizing =
      'border-box';


    const box =
      document.createElement('div');


    box.style.background =
      '#fff';

    box.style.width =
      'min(1000px, 96vw)';

    box.style.maxHeight =
      '90vh';

    box.style.overflow =
      'auto';

    box.style.padding =
      '28px';

    box.style.boxSizing =
      'border-box';

    box.style.position =
      'relative';


    const close =
      createButton(
        '×'
      );


    close.style.position =
      'absolute';

    close.style.right =
      '15px';

    close.style.top =
      '10px';

    close.style.fontSize =
      '28px';

    close.style.border =
      '0';

    close.style.background =
      'transparent';

    close.style.cursor =
      'pointer';


    close.addEventListener(
      'click',
      closeModal
    );


    const heading =
      document.createElement('h2');

    heading.textContent =
      titleText;


    heading.style.marginTop =
      '0';

    heading.style.paddingRight =
      '40px';


    const content =
      document.createElement('div');


    box.append(
      close,
      heading,
      content
    );


    overlay.append(
      box
    );


    overlay.addEventListener(
      'click',
      event => {

        if (
          event.target === overlay
        ) {
          closeModal();
        }

      }
    );


    document.body.append(
      overlay
    );


    activeModal =
      overlay;


    document.body.style.overflow =
      'hidden';


    return {
      overlay,
      box,
      content
    };

  };


  document.addEventListener(
    'keydown',
    event => {

      if (
        event.key === 'Escape' &&
        activeModal
      ) {

        closeModal();

      }

    }
  );


  /* =========================================================
     PROJE EKLEME
  ========================================================= */

  const projectForm =
    document.getElementById(
      'project-form'
    );


  if (projectForm) {

    projectForm.addEventListener(
      'submit',
      async event => {

        event.preventDefault();


        const form =
          new FormData(
            event.currentTarget
          );


        const files =
          form.getAll('images')
            .filter(
              file =>
                file &&
                file instanceof File &&
                file.size > 0
            );


        const {
          data: userData
        } = await db.auth.getUser();


        if (!userData.user) {

          setStatus(
            'Oturum kapandı; yeniden giriş yap.'
          );

          loadSession();

          return;
        }


        if (!files.length) {

          setStatus(
            'En az bir proje fotoğrafı seç.'
          );

          return;
        }


        const validation =
          validateImageFiles(
            files
          );


        if (validation) {

          setStatus(
            validation
          );

          return;
        }


        setStatus(
          `${files.length} proje fotoğrafı yükleniyor...`
        );


        const uploadedPhotos =
          [];


        for (
          let i = 0;
          i < files.length;
          i++
        ) {

          const file =
            files[i];


          const ext =
            makePhotoExt(file);


          const path =
            userData.user.id +
            '/' +
            crypto.randomUUID() +
            '.' +
            ext;


          const {
            error: uploadError
          } = await db.storage
            .from('projects')
            .upload(
              path,
              file,
              {
                contentType:
                  file.type,
                upsert:
                  false
              }
            );


          if (uploadError) {

            if (uploadedPhotos.length) {

              await db.storage
                .from('projects')
                .remove(
                  uploadedPhotos.map(
                    photo =>
                      photo.path
                  )
                );

            }


            setStatus(
              'Fotoğraf yüklenemedi: ' +
              uploadError.message
            );

            return;
          }


          const {
            data: publicData
          } = db.storage
            .from('projects')
            .getPublicUrl(
              path
            );


          uploadedPhotos.push({
            url:
              publicData.publicUrl,
            path
          });


          setStatus(
            `${i + 1}/${files.length} fotoğraf yüklendi...`
          );

        }


        const {
          error
        } = await db
          .from('projects')
          .insert({
            owner_id:
              userData.user.id,

            title:
              String(
                form.get('title') || ''
              ).trim(),

            location:
              String(
                form.get('location') || ''
              ).trim(),

            description:
              String(
                form.get('description') || ''
              ).trim(),

            image_url:
              uploadedPhotos[0]?.url ||
              null,

            storage_path:
              uploadedPhotos[0]?.path ||
              null,

            photos:
              uploadedPhotos
          });


        if (error) {

          await db.storage
            .from('projects')
            .remove(
              uploadedPhotos.map(
                photo =>
                  photo.path
              )
            );


          setStatus(
            'Proje kaydedilemedi: ' +
            error.message
          );

          return;
        }


        event.currentTarget.reset();


        setStatus(
          'Proje başarıyla yayımlandı.'
        );


        refreshProjects();

      }
    );

  }


  /* =========================================================
     GAYRİMENKUL EKLEME
  ========================================================= */

  const propertyForm =
    document.getElementById(
      'property-form'
    );


  if (propertyForm) {

    propertyForm.addEventListener(
      'submit',
      async event => {

        event.preventDefault();


        const form =
          new FormData(
            event.currentTarget
          );


        const files =
          form.getAll('fotograflar')
            .filter(
              file =>
                file &&
                file instanceof File &&
                file.size > 0
            );


        const {
          data: userData
        } = await db.auth.getUser();


        if (!userData.user) {

          setStatus(
            'Oturum kapandı; yeniden giriş yap.'
          );

          loadSession();

          return;
        }


        if (!files.length) {

          setStatus(
            'En az bir gayrimenkul fotoğrafı seç.'
          );

          return;
        }


        const validation =
          validateImageFiles(
            files
          );


        if (validation) {

          setStatus(
            validation
          );

          return;
        }


        const ilanBasligi =
          String(
            form.get('ilan_basligi') ||
            ''
          ).trim();


        const ilanTuru =
          String(
            form.get('ilan_turu') ||
            ''
          ).trim();


        const gayrimenkulTuru =
          String(
            form.get('gayrimenkul_turu') ||
            ''
          ).trim();


        const konum =
          String(
            form.get('konum') ||
            ''
          ).trim();


        const fiyat =
          form.get('fiyat');


        const paraBirimi =
          String(
            form.get('para_birimi') ||
            'EUR'
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


        setStatus(
          `${files.length} fotoğraf yükleniyor...`
        );


        const photoUrls =
          [];

        const uploadedPaths =
          [];


        for (
          let i = 0;
          i < files.length;
          i++
        ) {

          const file =
            files[i];


          const ext =
            makePhotoExt(file);


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
                contentType:
                  file.type,
                upsert:
                  false
              }
            );


          if (uploadError) {

            if (uploadedPaths.length) {

              await db.storage
                .from('property-images')
                .remove(
                  uploadedPaths
                );

            }


            setStatus(
              'Fotoğraf yüklenemedi: ' +
              uploadError.message
            );

            return;
          }


          uploadedPaths.push(
            path
          );


          const {
            data: publicData
          } = db.storage
            .from('property-images')
            .getPublicUrl(
              path
            );


          photoUrls.push(
            publicData.publicUrl
          );


          setStatus(
            `${i + 1}/${files.length} fotoğraf yüklendi...`
          );

        }


        const propertyData = {

          ilan_basligi:
            ilanBasligi,

          ilan_turu:
            ilanTuru,

          gayrimenkul_turu:
            gayrimenkulTuru,

          konum:
            konum,

          fiyat:
            Number(fiyat),

          para_birimi:
            paraBirimi,

          brut_m2:
            form.get('brut_m2')
              ? Number(
                  form.get('brut_m2')
                )
              : null,

          net_m2:
            form.get('net_m2')
              ? Number(
                  form.get('net_m2')
                )
              : null,

          oda_sayisi:
            String(
              form.get('oda_sayisi') ||
              ''
            ).trim(),

          banyo_sayisi:
            form.get('banyo_sayisi')
              ? Number(
                  form.get('banyo_sayisi')
                )
              : null,

          kat:
            String(
              form.get('kat') ||
              ''
            ).trim(),

          bina_yasi:
            form.get('bina_yasi')
              ? Number(
                  form.get('bina_yasi')
                )
              : null,

          isitma:
            String(
              form.get('isitma') ||
              ''
            ).trim(),

          balkon:
            form.get('balkon') === 'true',

          otopark:
            form.get('otopark') === 'true',

          aciklama:
            String(
              form.get('aciklama') ||
              ''
            ).trim(),

          ozellikler:
            String(
              form.get('ozellikler') ||
              ''
            ).trim(),

          fotograflar:
            JSON.stringify(
              photoUrls
            )
        };


        const {
          error: insertError
        } = await db
          .from('properties')
          .insert(
            propertyData
          );


        if (insertError) {

          await db.storage
            .from('property-images')
            .remove(
              uploadedPaths
            );


          setStatus(
            'Gayrimenkul kaydedilemedi: ' +
            insertError.message
          );

          return;
        }


        event.currentTarget.reset();


        setStatus(
          'Gayrimenkul başarıyla yayımlandı.'
        );


        refreshProperties();

      }
    );

  }


  /* =========================================================
     GENEL YENİLEME
  ========================================================= */

  const refresh = async () => {

    await refreshProjects();

    await refreshProperties();

  };


  /* =========================================================
     OTURUM
  ========================================================= */

  const loadSession = async () => {

    const {
      data
    } = await db.auth.getSession();


    const signedIn =
      !!data.session;


    if (login) {
      login.hidden =
        signedIn;
    }


    if (dashboard) {
      dashboard.hidden =
        !signedIn;
    }


    if (signedIn) {
      refresh();
    }

  };


  /* =========================================================
     GİRİŞ
  ========================================================= */

  if (login) {

    login.addEventListener(
      'submit',
      async event => {

        event.preventDefault();


        const form =
          new FormData(
            login
          );


        const email =
          form.get('email');


        const password =
          form.get('password');


        setStatus(
          'Giriş yapılıyor...'
        );


        const {
          error
        } = await db.auth
          .signInWithPassword({
            email,
            password
          });


        if (error) {

          alert(
            'GİRİŞ HATASI:\n\n' +
            error.message
          );


          setStatus(
            'Giriş başarısız.'
          );

          return;
        }


        login.reset();


        setStatus(
          'Giriş başarılı.'
        );


        await loadSession();

      }
    );

  }


  /* =========================================================
     ÇIKIŞ
  ========================================================= */

  const logout =
    document.getElementById(
      'logout'
    );


  if (logout) {

    logout.addEventListener(
      'click',
      async () => {

        await db.auth.signOut();


        setStatus(
          'Çıkış yapıldı.'
        );


        loadSession();

      }
    );

  }


  /* =========================================================
     BAŞLAT
  ========================================================= */

  loadSession();

})();
