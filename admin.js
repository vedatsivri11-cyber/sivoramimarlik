(() => {

  /* =========================================================
     SIVORA MİMARLIK
     ADMIN.JS
     GAYRİMENKUL SATILDI / AKTİF SİSTEMİ DAHİL
  ========================================================= */

  const configured =
    window.SIVORA_SUPABASE_URL &&
    window.SIVORA_SUPABASE_ANON_KEY &&
    !window.SIVORA_SUPABASE_URL.includes('SUPABASE_') &&
    !window.SIVORA_SUPABASE_ANON_KEY.includes('SUPABASE_') &&
    window.supabase;

  const setup =
    document.getElementById('setup-needed');

  const login =
    document.getElementById('login-form');

  const dashboard =
    document.getElementById('dashboard');

  const status =
    document.getElementById('admin-status');

  const cards =
    document.getElementById('admin-projects');

  const propertyCards =
    document.getElementById('admin-properties');


  if (!configured) {

    if (setup) {
      setup.hidden = false;
    }

    if (login) {
      login.hidden = true;
    }

    return;
  }


  const db =
    window.supabase.createClient(
      window.SIVORA_SUPABASE_URL,
      window.SIVORA_SUPABASE_ANON_KEY
    );


  /* =========================================================
     DURUM MESAJI
  ========================================================= */

  const setStatus = message => {

    if (status) {
      status.textContent = message;
    }

  };


  /* =========================================================
     FOTOĞRAF PARSE
  ========================================================= */

  const parsePhotos = value => {

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'string') {

      try {

        const parsed =
          JSON.parse(value);

        return Array.isArray(parsed)
          ? parsed
          : [];

      } catch {

        return [];

      }

    }

    return [];

  };


  /* =========================================================
     BUTON
  ========================================================= */

  const createButton =
    (text, className = '') => {

      const button =
        document.createElement('button');

      button.type = 'button';
      button.textContent = text;

      if (className) {
        button.className = className;
      }

      return button;

    };


  /* =========================================================
     FOTOĞRAF UZANTISI
  ========================================================= */

  const makePhotoExt = file => {

    if (file.type === 'image/jpeg') {
      return 'jpg';
    }

    const parts =
      file.type.split('/');

    return parts[1] || 'jpg';

  };


  /* =========================================================
     FOTOĞRAF KONTROL
  ========================================================= */

  const validateImageFiles = files => {

    const allowed = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    for (const file of files) {

      if (!file || !file.size) {
        continue;
      }

      if (!allowed.includes(file.type)) {

        return (
          'Sadece JPG, PNG veya WebP fotoğraflar kullanılabilir.'
        );

      }

      if (file.size > 5 * 1024 * 1024) {

        return (
          `"${file.name}" 5 MB'tan büyük.`
        );

      }

    }

    return null;

  };


  /* =========================================================
     MODAL
  ========================================================= */

  const createModal = title => {

    const old =
      document.getElementById(
        'sivora-admin-modal'
      );

    if (old) {
      old.remove();
    }


    const overlay =
      document.createElement('div');

    overlay.id =
      'sivora-admin-modal';

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


    const box =
      document.createElement('div');

    box.style.background =
      '#fff';

    box.style.color =
      '#111';

    box.style.width =
      'min(900px,100%)';

    box.style.maxHeight =
      '90vh';

    box.style.overflow =
      'auto';

    box.style.borderRadius =
      '10px';

    box.style.padding =
      '25px';

    box.style.position =
      'relative';


    const close =
      document.createElement('button');

    close.type = 'button';

    close.textContent = '×';

    close.style.position =
      'absolute';

    close.style.right =
      '15px';

    close.style.top =
      '10px';

    close.style.border =
      '0';

    close.style.background =
      'transparent';

    close.style.fontSize =
      '30px';

    close.style.cursor =
      'pointer';

    close.style.lineHeight =
      '1';


    const heading =
      document.createElement('h2');

    heading.textContent =
      title;

    heading.style.marginTop =
      '0';

    heading.style.paddingRight =
      '40px';


    const content =
      document.createElement('div');


    close.addEventListener(
      'click',
      () => overlay.remove()
    );


    overlay.addEventListener(
      'click',
      event => {

        if (
          event.target === overlay
        ) {
          overlay.remove();
        }

      }
    );


    document.addEventListener(
      'keydown',
      function escapeHandler(event) {

        if (
          event.key === 'Escape' &&
          document.body.contains(overlay)
        ) {

          overlay.remove();

          document.removeEventListener(
            'keydown',
            escapeHandler
          );

        }

      }
    );


    box.append(
      close,
      heading,
      content
    );

    overlay.append(box);

    document.body.append(overlay);


    return {
      overlay,
      content,
      close
    };

  };


  /* =========================================================
     PROJELERİ GETİR
  ========================================================= */

  const refreshProjects =
    async () => {

      if (!cards) {
        return;
      }


      const {
        data,
        error
      } = await db
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
        .order(
          'created_at',
          {
            ascending: false
          }
        );


      if (error) {

        setStatus(
          'Projeler yüklenemedi: ' +
          error.message
        );

        return;

      }


      cards.replaceChildren();


      (data || []).forEach(
        project => {

          const row =
            document.createElement(
              'article'
            );

          row.className =
            'admin-project';


          let photos =
            parsePhotos(
              project.photos
            );


          if (
            !photos.length &&
            project.image_url
          ) {

            photos = [
              {
                url:
                  project.image_url,

                path:
                  project.storage_path ||
                  null
              }
            ];

          }


          const image =
            document.createElement(
              'img'
            );

          image.src =
            photos[0]?.url ||
            project.image_url ||
            '';

          image.alt =
            project.title ||
            'Proje';


          const detail =
            document.createElement(
              'div'
            );


          const title =
            document.createElement(
              'strong'
            );

          title.textContent =
            project.title ||
            'Proje';


          const location =
            document.createElement(
              'p'
            );

          location.textContent =
            project.location ||
            '';


          const count =
            document.createElement(
              'p'
            );

          count.textContent =
            `${photos.length} fotoğraf`;


          detail.append(
            title,
            location,
            count
          );


          const actions =
            document.createElement(
              'div'
            );

          actions.className =
            'admin-project-actions';


          const edit =
            createButton(
              'Düzenle'
            );


          const photoButton =
            createButton(
              'Fotoğraflar'
            );


          const remove =
            createButton(
              'Sil'
            );


          edit.addEventListener(
            'click',
            () => {

              openProjectEdit(
                project
              );

            }
          );


          photoButton.addEventListener(
            'click',
            () => {

              openProjectPhotos(
                project,
                photos
              );

            }
          );


          remove.addEventListener(
            'click',
            async () => {

              if (
                !confirm(
                  'Bu proje ve tüm fotoğrafları silinsin mi?'
                )
              ) {
                return;
              }


              setStatus(
                'Proje siliniyor...'
              );


              const paths =
                photos
                  .map(
                    photo =>
                      typeof photo === 'object'
                        ? photo.path
                        : null
                  )
                  .filter(Boolean);


              if (paths.length) {

                const {
                  error:
                    storageError
                } =
                  await db.storage
                    .from('projects')
                    .remove(paths);


                if (storageError) {

                  setStatus(
                    'Fotoğraflar silinemedi: ' +
                    storageError.message
                  );

                  return;

                }

              }


              const {
                error:
                  deleteError
              } =
                await db
                  .from('projects')
                  .delete()
                  .eq(
                    'id',
                    project.id
                  );


              if (deleteError) {

                setStatus(
                  'Proje silinemedi: ' +
                  deleteError.message
                );

                return;

              }


              setStatus(
                'Proje silindi.'
              );


              refreshProjects();

            }
          );


          actions.append(
            edit,
            photoButton,
            remove
          );


          row.append(
            image,
            detail,
            actions
          );


          cards.append(row);

        }
      );

    };


  /* =========================================================
     PROJE DÜZENLE
  ========================================================= */

  const openProjectEdit =
    project => {

      const modal =
        createModal(
          'Projeyi Düzenle'
        );


      const form =
        document.createElement(
          'form'
        );

      form.style.display =
        'grid';

      form.style.gap =
        '14px';


      const fields = {};


      const addField =
        (
          labelText,
          name,
          value,
          type = 'text'
        ) => {

          const label =
            document.createElement(
              'label'
            );

          label.textContent =
            labelText;


          const input =
            type === 'textarea'
              ? document.createElement(
                  'textarea'
                )
              : document.createElement(
                  'input'
                );


          if (
            type !== 'textarea'
          ) {
            input.type = type;
          }


          input.value =
            value || '';


          if (
            type === 'textarea'
          ) {
            input.rows = 5;
          }


          input.style.width =
            '100%';

          input.style.boxSizing =
            'border-box';

          input.style.padding =
            '10px';

          input.style.marginTop =
            '5px';


          label.append(input);

          form.append(label);

          fields[name] =
            input;

        };


      addField(
        'Proje adı',
        'title',
        project.title
      );


      addField(
        'Konum',
        'location',
        project.location
      );


      addField(
        'Açıklama',
        'description',
        project.description,
        'textarea'
      );


      const save =
        createButton(
          'Değişiklikleri Kaydet'
        );

      save.type =
        'submit';


      form.append(save);


      form.addEventListener(
        'submit',
        async event => {

          event.preventDefault();


          setStatus(
            'Proje güncelleniyor...'
          );


          const {
            error
          } =
            await db
              .from('projects')
              .update({

                title:
                  fields.title.value.trim(),

                location:
                  fields.location.value.trim(),

                description:
                  fields.description.value.trim()

              })
              .eq(
                'id',
                project.id
              );


          if (error) {

            setStatus(
              'Proje güncellenemedi: ' +
              error.message
            );

            return;

          }


          modal.overlay.remove();

          setStatus(
            'Proje güncellendi.'
          );

          refreshProjects();

        }
      );


      modal.content.append(form);

    };


  /* =========================================================
     PROJE FOTOĞRAFLARI
  ========================================================= */

  const openProjectPhotos =
    (
      project,
      photos
    ) => {

      const modal =
        createModal(
          `Proje Fotoğrafları · ${project.title}`
        );


      const gallery =
        document.createElement(
          'div'
        );

      gallery.style.display =
        'grid';

      gallery.style.gridTemplateColumns =
        'repeat(auto-fill,minmax(180px,1fr))';

      gallery.style.gap =
        '15px';


      photos.forEach(
        (photo,index) => {

          const url =
            typeof photo === 'string'
              ? photo
              : photo.url;


          const path =
            typeof photo === 'object'
              ? photo.path
              : null;


          const box =
            document.createElement(
              'div'
            );

          box.style.border =
            '1px solid #ddd';

          box.style.padding =
            '8px';


          const image =
            document.createElement(
              'img'
            );

          image.src =
            url;

          image.style.width =
            '100%';

          image.style.height =
            '160px';

          image.style.objectFit =
            'cover';


          const text =
            document.createElement(
              'small'
            );

          text.textContent =
            `Fotoğraf ${index + 1}`;


          const remove =
            createButton(
              'Bu fotoğrafı sil'
            );


          remove.addEventListener(
            'click',
            async () => {

              if (
                !confirm(
                  'Bu fotoğraf silinsin mi?'
                )
              ) {
                return;
              }


              if (path) {

                await db.storage
                  .from('projects')
                  .remove([path]);

              }


              const newPhotos =
                photos.filter(
                  (_,i) =>
                    i !== index
                );


              const first =
                newPhotos[0];


              const {
                error
              } =
                await db
                  .from('projects')
                  .update({

                    photos:
                      newPhotos,

                    image_url:
                      first
                        ? (
                            typeof first ===
                            'string'
                              ? first
                              : first.url
                          )
                        : null,

                    storage_path:
                      first?.path ||
                      null

                  })
                  .eq(
                    'id',
                    project.id
                  );


              if (error) {

                setStatus(
                  'Fotoğraf güncellenemedi: ' +
                  error.message
                );

                return;

              }


              modal.overlay.remove();

              setStatus(
                'Fotoğraf silindi.'
              );

              refreshProjects();

            }
          );


          box.append(
            image,
            text,
            remove
          );

          gallery.append(box);

        }
      );


      if (!photos.length) {

        const empty =
          document.createElement(
            'p'
          );

        empty.textContent =
          'Fotoğraf bulunmuyor.';

        gallery.append(empty);

      }


      modal.content.append(
        gallery
      );

    };


  /* =========================================================
     GAYRİMENKULLER
  ========================================================= */

  const refreshProperties =
    async () => {

      if (!propertyCards) {
        return;
      }


      const {
        data,
        error
      } =
        await db
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


      (data || []).forEach(
        property => {

          const photos =
            parsePhotos(
              property.fotograflar
            );


          const sold =
            property.durum ===
            'satildi';


          const row =
            document.createElement(
              'article'
            );

          row.className =
            'admin-project';


          const image =
            document.createElement(
              'img'
            );

          image.src =
            photos[0] || '';

          image.alt =
            property.ilan_basligi ||
            'Gayrimenkul';


          const detail =
            document.createElement(
              'div'
            );


          const title =
            document.createElement(
              'strong'
            );

          title.textContent =
            property.ilan_basligi ||
            'Gayrimenkul';


          const type =
            document.createElement(
              'p'
            );

          type.textContent =
            `${property.ilan_turu || ''} · ${property.gayrimenkul_turu || ''}`;


          const location =
            document.createElement(
              'p'
            );

          location.textContent =
            property.konum ||
            '';


          const price =
            document.createElement(
              'p'
            );


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


          const count =
            document.createElement(
              'p'
            );

          count.textContent =
            `${photos.length} fotoğraf`;


          const statusText =
            document.createElement(
              'p'
            );

          statusText.textContent =
            sold
              ? 'DURUM: SATILDI'
              : 'DURUM: AKTİF';


          statusText.style.fontWeight =
            '700';

          statusText.style.color =
            sold
              ? '#777'
              : '#b9975b';


          detail.append(
            title,
            type,
            location,
            price,
            count,
            statusText
          );


          const actions =
            document.createElement(
              'div'
            );

          actions.className =
            'admin-project-actions';


          const edit =
            createButton(
              'Düzenle'
            );


          const photosButton =
            createButton(
              'Fotoğraflar'
            );


          const statusButton =
            createButton(
              sold
                ? 'Aktif Yap'
                : 'Satıldı'
            );


          statusButton.style.background =
            sold
              ? '#777'
              : '#b9975b';

          statusButton.style.color =
            '#fff';


          statusButton.style.fontWeight =
            '700';


          /* =================================================
             SATILDI / AKTİF
          ================================================= */

          statusButton.addEventListener(
            'click',
            async () => {

              const newStatus =
                sold
                  ? 'aktif'
                  : 'satildi';


              setStatus(
                newStatus === 'satildi'
                  ? 'Gayrimenkul SATILDI olarak işaretleniyor...'
                  : 'Gayrimenkul AKTİF yapılıyor...'
              );


              const {
                error:
                  statusError
              } =
                await db
                  .from('properties')
                  .update({

                    durum:
                      newStatus

                  })
                  .eq(
                    'id',
                    property.id
                  );


              if (statusError) {

                setStatus(
                  'Durum değiştirilemedi: ' +
                  statusError.message
                );

                return;

              }


              setStatus(
                newStatus === 'satildi'
                  ? 'Gayrimenkul SATILDI olarak işaretlendi.'
                  : 'Gayrimenkul tekrar AKTİF yapıldı.'
              );


              refreshProperties();

            }
          );


          const remove =
            createButton(
              'Sil'
            );


          /* =================================================
             DÜZENLE
          ================================================= */

          edit.addEventListener(
            'click',
            () => {

              openPropertyEdit(
                property
              );

            }
          );


          /* =================================================
             FOTOĞRAFLAR
          ================================================= */

          photosButton.addEventListener(
            'click',
            () => {

              openPropertyPhotos(
                property,
                photos
              );

            }
          );


          /* =================================================
             SİL
          ================================================= */

          remove.addEventListener(
            'click',
            async () => {

              if (
                !confirm(
                  'Bu gayrimenkul ve tüm fotoğrafları tamamen silinsin mi?'
                )
              ) {
                return;
              }


              setStatus(
                'Gayrimenkul siliniyor...'
              );


              const paths =
                photos
                  .map(
                    url =>
                      extractStoragePath(
                        url
                      )
                  )
                  .filter(Boolean);


              if (paths.length) {

                const {
                  error:
                    storageError
                } =
                  await db.storage
                    .from(
                      'property-images'
                    )
                    .remove(paths);


                if (storageError) {

                  setStatus(
                    'Fotoğraflar silinemedi: ' +
                    storageError.message
                  );

                  return;

                }

              }


              const {
                error:
                  deleteError
              } =
                await db
                  .from('properties')
                  .delete()
                  .eq(
                    'id',
                    property.id
                  );


              if (deleteError) {

                setStatus(
                  'Gayrimenkul silinemedi: ' +
                  deleteError.message
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
            photosButton,
            statusButton,
            remove
          );


          row.append(
            image,
            detail,
            actions
          );


          propertyCards.append(row);

        }
      );

    };


  /* =========================================================
     STORAGE PATH
  ========================================================= */

  const extractStoragePath =
    url => {

      if (!url) {
        return null;
      }


      const marker =
        '/storage/v1/object/public/property-images/';


      const index =
        url.indexOf(marker);


      if (index === -1) {
        return null;
      }


      return decodeURIComponent(
        url.substring(
          index + marker.length
        )
      );

    };


  /* =========================================================
     GAYRİMENKUL FOTOĞRAFLARI
  ========================================================= */

  const openPropertyPhotos =
    (
      property,
      photos
    ) => {

      const modal =
        createModal(
          `Gayrimenkul Fotoğrafları · ${property.ilan_basligi}`
        );


      const gallery =
        document.createElement(
          'div'
        );


      gallery.style.display =
        'grid';

      gallery.style.gridTemplateColumns =
        'repeat(auto-fill,minmax(180px,1fr))';

      gallery.style.gap =
        '15px';


      photos.forEach(
        (photo,index) => {

          const box =
            document.createElement(
              'div'
            );

          box.style.border =
            '1px solid #ddd';

          box.style.padding =
            '8px';


          const image =
            document.createElement(
              'img'
            );

          image.src =
            photo;

          image.style.width =
            '100%';

          image.style.height =
            '160px';

          image.style.objectFit =
            'cover';


          const text =
            document.createElement(
              'small'
            );

          text.textContent =
            `Fotoğraf ${index + 1}`;


          const remove =
            createButton(
              'Bu fotoğrafı sil'
            );


          remove.addEventListener(
            'click',
            async () => {

              if (
                !confirm(
                  'Bu fotoğraf silinsin mi?'
                )
              ) {
                return;
              }


              const path =
                extractStoragePath(
                  photo
                );


              if (path) {

                const {
                  error
                } =
                  await db.storage
                    .from(
                      'property-images'
                    )
                    .remove([
                      path
                    ]);


                if (error) {

                  setStatus(
                    'Fotoğraf silinemedi: ' +
                    error.message
                  );

                  return;

                }

              }


              const newPhotos =
                photos.filter(
                  (_,i) =>
                    i !== index
                );


              const {
                error:
                  updateError
              } =
                await db
                  .from('properties')
                  .update({

                    fotograflar:
                      JSON.stringify(
                        newPhotos
                      )

                  })
                  .eq(
                    'id',
                    property.id
                  );


              if (updateError) {

                setStatus(
                  'İlan güncellenemedi: ' +
                  updateError.message
                );

                return;

              }


              modal.overlay.remove();

              setStatus(
                'Fotoğraf silindi.'
              );


              refreshProperties();

            }
          );


          box.append(
            image,
            text,
            remove
          );


          gallery.append(box);

        }
      );


      if (!photos.length) {

        const empty =
          document.createElement(
            'p'
          );

        empty.textContent =
          'Bu gayrimenkulde fotoğraf bulunmuyor.';

        gallery.append(empty);

      }


      modal.content.append(
        gallery
      );

    };


  /* =========================================================
     GAYRİMENKUL DÜZENLE
  ========================================================= */

  const openPropertyEdit =
    property => {

      const modal =
        createModal(
          'Gayrimenkulü Düzenle'
        );


      const form =
        document.createElement(
          'form'
        );


      form.style.display =
        'grid';

      form.style.gap =
        '12px';


      const fields = {};


      const addField =
        (
          labelText,
          name,
          value,
          type = 'text'
        ) => {

          const label =
            document.createElement(
              'label'
            );

          label.textContent =
            labelText;


          const input =
            type === 'textarea'
              ? document.createElement(
                  'textarea'
                )
              : document.createElement(
                  'input'
                );


          if (
            type !== 'textarea'
          ) {
            input.type =
              type;
          }


          if (
            type === 'textarea'
          ) {
            input.rows = 4;
          }


          input.value =
            value ?? '';


          input.style.width =
            '100%';

          input.style.boxSizing =
            'border-box';

          input.style.padding =
            '9px';

          input.style.marginTop =
            '5px';


          label.append(input);

          form.append(label);

          fields[name] =
            input;

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


      const save =
        createButton(
          'Değişiklikleri Kaydet'
        );

      save.type =
        'submit';


      form.append(save);


      form.addEventListener(
        'submit',
        async event => {

          event.preventDefault();


          setStatus(
            'Gayrimenkul güncelleniyor...'
          );


          const updateData = {

            ilan_basligi:
              fields.ilan_basligi.value.trim(),

            ilan_turu:
              fields.ilan_turu.value.trim(),

            gayrimenkul_turu:
              fields.gayrimenkul_turu.value.trim(),

            konum:
              fields.konum.value.trim(),

            fiyat:
              fields.fiyat.value
                ? Number(
                    fields.fiyat.value
                  )
                : null,

            para_birimi:
              fields.para_birimi.value.trim(),

            brut_m2:
              fields.brut_m2.value
                ? Number(
                    fields.brut_m2.value
                  )
                : null,

            net_m2:
              fields.net_m2.value
                ? Number(
                    fields.net_m2.value
                  )
                : null,

            oda_sayisi:
              fields.oda_sayisi.value.trim(),

            banyo_sayisi:
              fields.banyo_sayisi.value
                ? Number(
                    fields.banyo_sayisi.value
                  )
                : null,

            kat:
              fields.kat.value.trim(),

            bina_yasi:
              fields.bina_yasi.value
                ? Number(
                    fields.bina_yasi.value
                  )
                : null,

            isitma:
              fields.isitma.value.trim(),

            aciklama:
              fields.aciklama.value.trim(),

            ozellikler:
              fields.ozellikler.value.trim()

          };


          const {
            error
          } =
            await db
              .from('properties')
              .update(
                updateData
              )
              .eq(
                'id',
                property.id
              );


          if (error) {

            setStatus(
              'Gayrimenkul güncellenemedi: ' +
              error.message
            );

            return;

          }


          modal.overlay.remove();

          setStatus(
            'Gayrimenkul güncellendi.'
          );


          refreshProperties();

        }
      );


      modal.content.append(form);

    };


  /* =========================================================
     PROJE FORMU
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
            projectForm
          );


        const files =
          form
            .getAll('images')
            .filter(
              file =>
                file &&
                file instanceof File &&
                file.size > 0
            );


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


        const {
          data:
            userData
        } =
          await db.auth.getUser();


        if (!userData.user) {

          setStatus(
            'Oturum kapandı; yeniden giriş yap.'
          );

          return;

        }


        const uploaded =
          [];


        setStatus(
          `${files.length} proje fotoğrafı yükleniyor...`
        );


        for (
          let i = 0;
          i < files.length;
          i++
        ) {

          const file =
            files[i];


          const path =
            userData.user.id +
            '/' +
            crypto.randomUUID() +
            '.' +
            makePhotoExt(file);


          const {
            error:
              uploadError
          } =
            await db.storage
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

            if (uploaded.length) {

              await db.storage
                .from('projects')
                .remove(
                  uploaded.map(
                    item =>
                      item.path
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
            data:
              publicData
          } =
            db.storage
              .from('projects')
              .getPublicUrl(
                path
              );


          uploaded.push({

            url:
              publicData.publicUrl,

            path

          });

        }


        const {
          error
        } =
          await db
            .from('projects')
            .insert({

              owner_id:
                userData.user.id,

              title:
                String(
                  form.get('title') ||
                  ''
                ).trim(),

              location:
                String(
                  form.get('location') ||
                  ''
                ).trim(),

              description:
                String(
                  form.get('description') ||
                  ''
                ).trim(),

              image_url:
                uploaded[0]?.url ||
                null,

              storage_path:
                uploaded[0]?.path ||
                null,

              photos:
                uploaded

            });


        if (error) {

          await db.storage
            .from('projects')
            .remove(
              uploaded.map(
                item =>
                  item.path
              )
            );


          setStatus(
            'Proje kaydedilemedi: ' +
            error.message
          );

          return;

        }


        projectForm.reset();


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
            propertyForm
          );


        const files =
          form
            .getAll('fotograflar')
            .filter(
              file =>
                file &&
                file instanceof File &&
                file.size > 0
            );


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


        const {
          data:
            userData
        } =
          await db.auth.getUser();


        if (!userData.user) {

          setStatus(
            'Oturum kapandı; yeniden giriş yap.'
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


        const photoUrls =
          [];

        const uploadedPaths =
          [];


        setStatus(
          `${files.length} gayrimenkul fotoğrafı yükleniyor...`
        );


        for (
          let i = 0;
          i < files.length;
          i++
        ) {

          const file =
            files[i];


          const path =
            'properties/' +
            userData.user.id +
            '/' +
            crypto.randomUUID() +
            '.' +
            makePhotoExt(file);


          const {
            error:
              uploadError
          } =
            await db.storage
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

            if (
              uploadedPaths.length
            ) {

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
            data:
              publicData
          } =
            db.storage
              .from('property-images')
              .getPublicUrl(
                path
              );


          photoUrls.push(
            publicData.publicUrl
          );

        }


        /* ===================================================
           GAYRİMENKUL VERİSİ

           YENİ İLANLAR OTOMATİK OLARAK AKTİF
        =================================================== */

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
            form.get('balkon') ===
            'true',

          otopark:
            form.get('otopark') ===
            'true',

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

          durum:
            'aktif',

          fotograflar:
            JSON.stringify(
              photoUrls
            )

        };


        const {
          error:
            insertError
        } =
          await db
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


        propertyForm.reset();


        setStatus(
          'Gayrimenkul başarıyla yayımlandı.'
        );


        refreshProperties();

      }
    );

  }


  /* =========================================================
     YENİLE
  ========================================================= */

  const refresh =
    async () => {

      await refreshProjects();

      await refreshProperties();

    };


  /* =========================================================
     OTURUM
  ========================================================= */

  const loadSession =
    async () => {

      const {
        data
      } =
        await db.auth.getSession();


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

        await refresh();

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
        } =
          await db.auth
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


        loadSession();

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
