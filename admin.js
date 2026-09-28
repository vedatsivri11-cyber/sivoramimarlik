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

      const row =
        document.createElement('article');

      row.className =
        'admin-project';


      /* =========================
         FOTOĞRAF
      ========================= */

      const image =
        document.createElement('img');

      image.src =
        project.image_url || '';

      image.alt =
        project.title || 'Proje';


      /* =========================
         DETAY
      ========================= */

      const detail =
        document.createElement('div');


      const title =
        document.createElement('strong');

      title.textContent =
        project.title || '';


      const location =
        document.createElement('p');

      location.textContent =
        project.location || '';


      detail.append(
        title,
        location
      );


      /* AÇIKLAMA */

      if (project.description) {

        const description =
          document.createElement('p');

        description.textContent =
          project.description;

        detail.append(
          description
        );
      }


      /* FOTOĞRAF SAYISI */

      let photoCount = 0;

      if (
        Array.isArray(project.photos)
      ) {

        photoCount =
          project.photos.length;

      } else if (
        project.image_url
      ) {

        photoCount = 1;
      }


      if (photoCount > 0) {

        const photosInfo =
          document.createElement('small');

        photosInfo.textContent =
          `${photoCount} fotoğraf`;

        detail.append(
          photosInfo
        );
      }


      /* =========================
         SİL BUTONU
      ========================= */

      const remove =
        document.createElement('button');

      remove.type =
        'button';

      remove.textContent =
        'Sil';


      remove.addEventListener(
        'click',
        async () => {

          if (
            !window.confirm(
              'Bu proje ve bütün fotoğrafları galeriden kaldırılsın mı?'
            )
          ) {
            return;
          }


          setStatus(
            'Proje siliniyor...'
          );


          /* =========================
             TÜM FOTOĞRAF YOLLARINI BUL
          ========================= */

          let pathsToDelete = [];


          if (
            Array.isArray(project.photos)
          ) {

            pathsToDelete =
              project.photos
                .map(photo => {

                  if (
                    typeof photo === 'string'
                  ) {
                    return null;
                  }

                  return photo?.path || null;
                })
                .filter(Boolean);
          }


          /* ESKİ PROJELER */

          if (
            project.storage_path &&
            !pathsToDelete.includes(
              project.storage_path
            )
          ) {

            pathsToDelete.push(
              project.storage_path
            );
          }


          /* =========================
             FOTOĞRAFLARI SİL
          ========================= */

          if (
            pathsToDelete.length
          ) {

            const {
              error: fileError
            } = await db.storage
              .from('projects')
              .remove(
                pathsToDelete
              );


            if (fileError) {

              setStatus(
                'Fotoğraflar silinemedi: ' +
                fileError.message
              );

              return;
            }
          }


          /* =========================
             VERİTABANI KAYDINI SİL
          ========================= */

          const {
            error: rowError
          } = await db
            .from('projects')
            .delete()
            .eq(
              'id',
              project.id
            );


          if (rowError) {

            setStatus(
              'Proje silinemedi: ' +
              rowError.message
            );

            return;
          }


          setStatus(
            'Proje ve fotoğrafları silindi.'
          );


          refreshProjects();

        }
      );


      row.append(
        image,
        detail,
        remove
      );

      cards.append(
        row
      );
    });
  };


  /* =========================
     GAYRİMENKULLER
  ========================= */

  const refreshProperties = async () => {

    if (!propertyCards) {
      return;
    }


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
      .order(
        'id',
        {
          ascending: false
        }
      );


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


      let photos = [];


      try {

        photos =
          JSON.parse(
            property.fotograflar ||
            '[]'
          );

      } catch {

        photos = [];
      }


      const image =
        document.createElement('img');


      if (
        photos.length > 0
      ) {

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
        property.ilan_basligi;


      const type =
        document.createElement('p');

      type.textContent =
        `${property.ilan_turu || ''} · ${property.gayrimenkul_turu || ''}`;


      const location =
        document.createElement('p');

      location.textContent =
        property.konum || '';


      const price =
        document.createElement('p');


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


      price.textContent =
        `${formattedPrice} ${property.para_birimi || ''}`;


      detail.append(
        title,
        type,
        location,
        price
      );


      const remove =
        document.createElement('button');

      remove.type =
        'button';

      remove.textContent =
        'Sil';


      remove.addEventListener(
        'click',
        async () => {

          if (
            !window.confirm(
              'Bu gayrimenkul ilanı tamamen silinsin mi?'
            )
          ) {
            return;
          }


          setStatus(
            'Gayrimenkul siliniyor...'
          );


          const {
            error: rowError
          } = await db
            .from('properties')
            .delete()
            .eq(
              'id',
              property.id
            );


          if (rowError) {

            setStatus(
              'Gayrimenkul silinemedi: ' +
              rowError.message
            );

            return;
          }


          setStatus(
            'Gayrimenkul silindi.'
          );


          refreshProperties();

        }
      );


      row.append(
        image,
        detail,
        remove
      );

      propertyCards.append(
        row
      );

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

    const { data } =
      await db.auth.getSession();


    const signedIn =
      !!data.session;


    login.hidden =
      signedIn;

    dashboard.hidden =
      !signedIn;


    if (signedIn) {

      refresh();

    }

  };


  /* =========================
     GİRİŞ
  ========================= */

  login.addEventListener(
    'submit',
    async event => {

      event.preventDefault();


      const form =
        new FormData(login);


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


  /* =========================
     ÇIKIŞ
  ========================= */

  document
    .getElementById('logout')
    .addEventListener(
      'click',
      async () => {

        await db.auth.signOut();


        setStatus(
          'Çıkış yapıldı.'
        );


        loadSession();

      }
    );


  /* =========================
     PROJE EKLEME
  ========================= */

  document
    .getElementById('project-form')
    .addEventListener(
      'submit',
      async event => {

        event.preventDefault();


        const form =
          new FormData(
            event.currentTarget
          );


        const files =
          form.getAll(
            'images'
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


        /* =========================
           FOTOĞRAFLARI KONTROL ET
        ========================= */

        const validFiles =
          files.filter(
            file =>
              file &&
              file instanceof File &&
              file.size > 0
          );


        if (
          !validFiles.length
        ) {

          setStatus(
            'En az bir proje fotoğrafı seç.'
          );

          return;
        }


        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/webp'
        ];


        for (
          const file of validFiles
        ) {

          if (
            !allowedTypes.includes(
              file.type
            )
          ) {

            setStatus(
              `"${file.name}" için sadece JPG, PNG veya WebP kullanılabilir.`
            );

            return;
          }


          if (
            file.size >
            5 * 1024 * 1024
          ) {

            setStatus(
              `"${file.name}" 5 MB'tan büyük.`
            );

            return;
          }

        }


        /* =========================
           FOTOĞRAFLARI YÜKLE
        ========================= */

        setStatus(
          `${validFiles.length} fotoğraf yükleniyor...`
        );


        const uploadedPhotos = [];


        for (
          let i = 0;
          i < validFiles.length;
          i++
        ) {

          const file =
            validFiles[i];


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

            if (
              uploadedPhotos.length
            ) {

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
              `"${file.name}" yüklenemedi: ` +
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

            path:
              path

          });


          setStatus(
            `${i + 1} / ${validFiles.length} fotoğraf yüklendi...`
          );

        }


        /* =========================
           PROJEYİ VERİTABANINA KAYDET
        ========================= */

        const {
          error
        } = await db
          .from('projects')
          .insert({

            owner_id:
              userData.user.id,


            title:
              String(
                form.get(
                  'title'
                ) || ''
              ).trim(),


            location:
              String(
                form.get(
                  'location'
                ) || ''
              ).trim(),


            description:
              String(
                form.get(
                  'description'
                ) || ''
              ).trim(),


            /* İLK FOTOĞRAF */

            image_url:
              uploadedPhotos[0]?.url ||
              null,


            /* İLK FOTOĞRAFIN YOLU */

            storage_path:
              uploadedPhotos[0]?.path ||
              null,


            /* TÜM FOTOĞRAFLAR */

            photos:
              uploadedPhotos

          });


        /* =========================
           KAYIT HATALIYSA
        ========================= */

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


        /* =========================
           BAŞARILI
        ========================= */

        event.currentTarget.reset();


        setStatus(
          `Proje yayımlandı. ${uploadedPhotos.length} fotoğraf yüklendi.`
        );


        refreshProjects();

      }
    );


  /* =========================
     GAYRİMENKUL EKLEME
  ========================= */

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
          form.getAll(
            'fotograflar'
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


        /* FOTOĞRAF KONTROLÜ */

        const validFiles =
          files.filter(
            file =>
              file &&
              file instanceof File &&
              file.size > 0
          );


        if (
          !validFiles.length
        ) {

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


        for (
          const file of validFiles
        ) {

          if (
            !allowedTypes.includes(
              file.type
            )
          ) {

            setStatus(
              'Sadece JPG, PNG veya WebP fotoğraflar kullanılabilir.'
            );

            return;
          }


          if (
            file.size >
            5 * 1024 * 1024
          ) {

            setStatus(
              `"${file.name}" 5 MB'tan büyük.`
            );

            return;
          }

        }


        /* İLAN BİLGİLERİ */

        const ilanBasligi =
          String(
            form.get(
              'ilan_basligi'
            ) || ''
          ).trim();


        const ilanTuru =
          String(
            form.get(
              'ilan_turu'
            ) || ''
          ).trim();


        const gayrimenkulTuru =
          String(
            form.get(
              'gayrimenkul_turu'
            ) || ''
          ).trim();


        const konum =
          String(
            form.get(
              'konum'
            ) || ''
          ).trim();


        const fiyat =
          form.get(
            'fiyat'
          );


        const paraBirimi =
          String(
            form.get(
              'para_birimi'
            ) || 'EUR'
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


        for (
          let i = 0;
          i < validFiles.length;
          i++
        ) {

          const file =
            validFiles[i];


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
            .from(
              'property-images'
            )
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

            if (
              uploadedPaths.length
            ) {

              await db.storage
                .from(
                  'property-images'
                )
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
            .from(
              'property-images'
            )
            .getPublicUrl(
              path
            );


          photoUrls.push(
            publicData.publicUrl
          );


          setStatus(
            `${i + 1}/${validFiles.length} fotoğraf yüklendi...`
          );

        }


        /* =========================
           VERİTABANINA KAYDET
        ========================= */

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
            form.get(
              'brut_m2'
            )
              ? Number(
                  form.get(
                    'brut_m2'
                  )
                )
              : null,


          net_m2:
            form.get(
              'net_m2'
            )
              ? Number(
                  form.get(
                    'net_m2'
                  )
                )
              : null,


          oda_sayisi:
            String(
              form.get(
                'oda_sayisi'
              ) || ''
            ).trim(),


          banyo_sayisi:
            form.get(
              'banyo_sayisi'
            )
              ? Number(
                  form.get(
                    'banyo_sayisi'
                  )
                )
              : null,


          kat:
            String(
              form.get(
                'kat'
              ) || ''
            ).trim(),


          bina_yasi:
            form.get(
              'bina_yasi'
            )
              ? Number(
                  form.get(
                    'bina_yasi'
                  )
                )
              : null,


          isitma:
            String(
              form.get(
                'isitma'
              ) || ''
            ).trim(),


          balkon:
            form.get(
              'balkon'
            ) === 'true',


          otopark:
            form.get(
              'otopark'
            ) === 'true',


          aciklama:
            String(
              form.get(
                'aciklama'
              ) || ''
            ).trim(),


          ozellikler:
            String(
              form.get(
                'ozellikler'
              ) || ''
            ).trim(),


          fotograflar:
            JSON.stringify(
              photoUrls
            )

        };


        const {
          error: insertError
        } = await db
          .from(
            'properties'
          )
          .insert(
            propertyData
          );


        /* KAYIT BAŞARISIZSA FOTOĞRAFLARI TEMİZLE */

        if (insertError) {

          await db.storage
            .from(
              'property-images'
            )
            .remove(
              uploadedPaths
            );


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
