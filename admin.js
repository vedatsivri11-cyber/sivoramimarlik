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
   SIRALAMA + YENİ FOTOĞRAF EKLEME + SİLME
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

    let currentPhotos =
      Array.isArray(photos)
        ? photos.map(photo => {

            if (typeof photo === 'string') {
              return {
                url: photo,
                path: null
              };
            }

            return {
              url: photo?.url || '',
              path: photo?.path || null
            };

          }).filter(photo => photo.url)
        : [];


    /* =====================================================
       BİLGİ
    ===================================================== */

    const info =
      document.createElement('p');

    info.textContent =
      'Fotoğrafları sürükleyerek veya yukarı-aşağı butonlarıyla sıralayabilirsiniz. 1. fotoğraf kapak fotoğrafı olacaktır.';

    info.style.margin =
      '0 0 18px 0';

    info.style.padding =
      '12px 15px';

    info.style.background =
      '#f5f5f5';

    info.style.border =
      '1px solid #ddd';

    info.style.fontSize =
      '13px';

    info.style.lineHeight =
      '1.5';


    /* =====================================================
       GALERİ
    ===================================================== */

    const gallery =
      document.createElement('div');

    gallery.style.display =
      'grid';

    gallery.style.gridTemplateColumns =
      'repeat(auto-fill,minmax(180px,1fr))';

    gallery.style.gap =
      '15px';


    /* =====================================================
       GALERİYİ OLUŞTUR
    ===================================================== */

    const renderGallery =
      () => {

        gallery.replaceChildren();


        if (!currentPhotos.length) {

          const empty =
            document.createElement('p');

          empty.textContent =
            'Fotoğraf bulunmuyor.';

          empty.style.gridColumn =
            '1 / -1';

          gallery.append(empty);

          return;
        }


        currentPhotos.forEach(
          (photo,index) => {

            const box =
              document.createElement('div');

            box.draggable =
              true;

            box.dataset.index =
              String(index);

            box.style.border =
              '1px solid #ddd';

            box.style.padding =
              '8px';

            box.style.background =
              '#fff';

            box.style.cursor =
              'grab';

            box.style.position =
              'relative';

            box.style.transition =
              'transform .15s ease, opacity .15s ease';


            /* =================================================
               NUMARA
            ================================================= */

            const number =
              document.createElement('div');

            number.textContent =
              String(index + 1);

            number.style.position =
              'absolute';

            number.style.left =
              '12px';

            number.style.top =
              '12px';

            number.style.zIndex =
              '3';

            number.style.width =
              '30px';

            number.style.height =
              '30px';

            number.style.borderRadius =
              '50%';

            number.style.background =
              '#b9975b';

            number.style.color =
              '#fff';

            number.style.display =
              'flex';

            number.style.alignItems =
              'center';

            number.style.justifyContent =
              'center';

            number.style.fontWeight =
              '700';

            number.style.fontSize =
              '14px';


            /* =================================================
               KAPAK
            ================================================= */

            const cover =
              document.createElement('div');

            cover.textContent =
              index === 0
                ? 'KAPAK FOTOĞRAFI'
                : '';

            cover.style.position =
              'absolute';

            cover.style.left =
              '50%';

            cover.style.bottom =
              '48px';

            cover.style.transform =
              'translateX(-50%)';

            cover.style.zIndex =
              '3';

            cover.style.background =
              'rgba(0,0,0,.72)';

            cover.style.color =
              '#fff';

            cover.style.padding =
              '5px 9px';

            cover.style.fontSize =
              '10px';

            cover.style.fontWeight =
              '700';

            cover.style.letterSpacing =
              '.08em';

            cover.style.whiteSpace =
              'nowrap';

            cover.style.pointerEvents =
              'none';

            if (index !== 0) {
              cover.style.display =
                'none';
            }


            /* =================================================
               FOTOĞRAF
            ================================================= */

            const image =
              document.createElement('img');

            image.src =
              photo.url;

            image.alt =
              `Proje fotoğrafı ${index + 1}`;

            image.style.width =
              '100%';

            image.style.height =
              '160px';

            image.style.objectFit =
              'cover';

            image.style.display =
              'block';


            /* =================================================
               YAZI
            ================================================= */

            const text =
              document.createElement('small');

            text.textContent =
              index === 0
                ? `Fotoğraf ${index + 1} · KAPAK`
                : `Fotoğraf ${index + 1}`;

            text.style.display =
              'block';

            text.style.margin =
              '8px 0';

            text.style.fontWeight =
              '600';


            /* =================================================
               BUTON ALANI
            ================================================= */

            const buttonArea =
              document.createElement('div');

            buttonArea.style.display =
              'flex';

            buttonArea.style.gap =
              '5px';

            buttonArea.style.marginTop =
              '5px';


            /* =================================================
               YUKARI
            ================================================= */

            const up =
              createButton('↑');

            up.type =
              'button';

            up.title =
              'Yukarı taşı';

            up.style.flex =
              '1';

            up.style.fontSize =
              '18px';

            up.disabled =
              index === 0;


            up.addEventListener(
              'click',
              () => {

                if (index <= 0) {
                  return;
                }

                const temp =
                  currentPhotos[index - 1];

                currentPhotos[index - 1] =
                  currentPhotos[index];

                currentPhotos[index] =
                  temp;

                renderGallery();

                setStatus(
                  'Fotoğraf sırası değiştirildi. Kaydet butonuna basın.'
                );

              }
            );


            /* =================================================
               AŞAĞI
            ================================================= */

            const down =
              createButton('↓');

            down.type =
              'button';

            down.title =
              'Aşağı taşı';

            down.style.flex =
              '1';

            down.style.fontSize =
              '18px';

            down.disabled =
              index === currentPhotos.length - 1;


            down.addEventListener(
              'click',
              () => {

                if (
                  index >=
                  currentPhotos.length - 1
                ) {
                  return;
                }

                const temp =
                  currentPhotos[index + 1];

                currentPhotos[index + 1] =
                  currentPhotos[index];

                currentPhotos[index] =
                  temp;

                renderGallery();

                setStatus(
                  'Fotoğraf sırası değiştirildi. Kaydet butonuna basın.'
                );

              }
            );


            /* =================================================
               SİL
            ================================================= */

            const remove =
              createButton(
                'Bu fotoğrafı sil'
              );

            remove.type =
              'button';

            remove.style.flex =
              '2';


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


                remove.disabled =
                  true;

                setStatus(
                  'Fotoğraf siliniyor...'
                );


                try {

                  if (photo.path) {

                    const {
                      error:
                        storageError
                    } =
                      await db.storage
                        .from('projects')
                        .remove([
                          photo.path
                        ]);


                    if (storageError) {
                      throw storageError;
                    }

                  }


                  const newPhotos =
                    currentPhotos.filter(
                      (_,photoIndex) =>
                        photoIndex !== index
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
                            ? first.url
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
                    throw error;
                  }


                  currentPhotos =
                    newPhotos;


                  renderGallery();


                  setStatus(
                    'Fotoğraf silindi.'
                  );


                  await refreshProjects();

                } catch (error) {

                  setStatus(
                    'Fotoğraf silinemedi: ' +
                    error.message
                  );

                  remove.disabled =
                    false;

                }

              }
            );


            buttonArea.append(
              up,
              down,
              remove
            );


            /* =================================================
               SÜRÜKLE BIRAK
            ================================================= */

            box.addEventListener(
              'dragstart',
              event => {

                event.dataTransfer.effectAllowed =
                  'move';

                event.dataTransfer.setData(
                  'text/plain',
                  String(index)
                );

                box.style.opacity =
                  '.45';

              }
            );


            box.addEventListener(
              'dragend',
              () => {

                box.style.opacity =
                  '1';

              }
            );


            box.addEventListener(
              'dragover',
              event => {

                event.preventDefault();

                event.dataTransfer.dropEffect =
                  'move';

                box.style.transform =
                  'scale(1.03)';

              }
            );


            box.addEventListener(
              'dragleave',
              () => {

                box.style.transform =
                  'scale(1)';

              }
            );


            box.addEventListener(
              'drop',
              event => {

                event.preventDefault();

                box.style.transform =
                  'scale(1)';


                const fromIndex =
                  Number(
                    event.dataTransfer.getData(
                      'text/plain'
                    )
                  );

                const toIndex =
                  index;


                if (
                  Number.isNaN(fromIndex) ||
                  fromIndex === toIndex
                ) {
                  return;
                }


                const movedPhoto =
                  currentPhotos.splice(
                    fromIndex,
                    1
                  )[0];


                currentPhotos.splice(
                  toIndex,
                  0,
                  movedPhoto
                );


                renderGallery();


                setStatus(
                  'Fotoğraf sırası değiştirildi. Kaydet butonuna basın.'
                );

              }
            );


            box.append(
              number,
              cover,
              image,
              text,
              buttonArea
            );


            gallery.append(box);

          }
        );

      };


    /* =====================================================
       YENİ FOTOĞRAF EKLEME
    ===================================================== */

    const addArea =
      document.createElement('div');

    addArea.style.marginTop =
      '25px';

    addArea.style.padding =
      '18px';

    addArea.style.border =
      '1px solid #ddd';

    addArea.style.background =
      '#fafafa';


    const addTitle =
      document.createElement('strong');

    addTitle.textContent =
      'Yeni Proje Fotoğrafı Ekle';

    addTitle.style.display =
      'block';

    addTitle.style.marginBottom =
      '10px';


    const input =
      document.createElement('input');

    input.type =
      'file';

    input.multiple =
      true;

    input.accept =
      'image/jpeg,image/png,image/webp';

    input.style.width =
      '100%';

    input.style.marginBottom =
      '12px';


    const selectedInfo =
      document.createElement('div');

    selectedInfo.style.fontSize =
      '13px';

    selectedInfo.style.color =
      '#666';

    selectedInfo.style.marginBottom =
      '12px';


    let selectedFiles =
      [];


    input.addEventListener(
      'change',
      () => {

        selectedFiles =
          Array.from(
            input.files || []
          ).filter(
            file =>
              file &&
              file.size > 0
          );


        selectedInfo.textContent =
          selectedFiles.length
            ? `${selectedFiles.length} yeni fotoğraf seçildi.`
            : 'Henüz fotoğraf seçilmedi.';

      }
    );


    const uploadButton =
      createButton(
        'Yeni Fotoğrafları Ekle'
      );

    uploadButton.type =
      'button';

    uploadButton.style.background =
      '#b9975b';

    uploadButton.style.color =
      '#fff';

    uploadButton.style.fontWeight =
      '700';


    uploadButton.addEventListener(
      'click',
      async () => {

        if (!selectedFiles.length) {

          setStatus(
            'Önce yeni fotoğrafları seç.'
          );

          return;
        }


        const validation =
          validateImageFiles(
            selectedFiles
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


        uploadButton.disabled =
          true;

        input.disabled =
          true;


        setStatus(
          `${selectedFiles.length} yeni fotoğraf yükleniyor...`
        );


        const uploaded =
          [];


        try {

          for (
            let i = 0;
            i < selectedFiles.length;
            i++
          ) {

            const file =
              selectedFiles[i];


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
              throw uploadError;
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


            setStatus(
              `${i + 1}/${selectedFiles.length} fotoğraf yüklendi...`
            );

          }


          /*
             YENİ FOTOĞRAFLAR
             MEVCUT FOTOĞRAFLARIN SONUNA EKLENİR
          */

          const newPhotos =
            [
              ...currentPhotos,
              ...uploaded
            ];


          const first =
            newPhotos[0];


          const {
            error:
              updateError
          } =
            await db
              .from('projects')
              .update({

                photos:
                  newPhotos,

                image_url:
                  first
                    ? first.url
                    : null,

                storage_path:
                  first?.path ||
                  null

              })
              .eq(
                'id',
                project.id
              );


          if (updateError) {

            await db.storage
              .from('projects')
              .remove(
                uploaded.map(
                  item =>
                    item.path
                )
              );

            throw updateError;
          }


          currentPhotos =
            newPhotos;


          selectedFiles =
            [];


          input.value =
            '';


          selectedInfo.textContent =
            '';


          renderGallery();


          setStatus(
            `${uploaded.length} yeni fotoğraf başarıyla eklendi.`
          );


          await refreshProjects();

        } catch (error) {

          setStatus(
            'Fotoğraf yüklenemedi: ' +
            error.message
          );

        } finally {

          uploadButton.disabled =
            false;

          input.disabled =
            false;

        }

      }
    );


    addArea.append(
      addTitle,
      input,
      selectedInfo,
      uploadButton
    );


    /* =====================================================
       SIRAYI KAYDET
    ===================================================== */

    const saveOrderButton =
      createButton(
        'Fotoğraf Sırasını Kaydet'
      );

    saveOrderButton.type =
      'button';

    saveOrderButton.style.marginTop =
      '20px';

    saveOrderButton.style.background =
      '#111';

    saveOrderButton.style.color =
      '#fff';

    saveOrderButton.style.fontWeight =
      '700';


    saveOrderButton.addEventListener(
      'click',
      async () => {

        saveOrderButton.disabled =
          true;


        setStatus(
          'Fotoğraf sırası kaydediliyor...'
        );


        try {

          const first =
            currentPhotos[0];


          const {
            error
          } =
            await db
              .from('projects')
              .update({

                photos:
                  currentPhotos,

                image_url:
                  first
                    ? first.url
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
            throw error;
          }


          setStatus(
            'Fotoğraf sırası başarıyla kaydedildi.'
          );


          await refreshProjects();

        } catch (error) {

          setStatus(
            'Sıralama kaydedilemedi: ' +
            error.message
          );

        } finally {

          saveOrderButton.disabled =
            false;

        }

      }
    );


    /* =====================================================
       MODAL
    ===================================================== */

    modal.content.append(
      info,
      gallery,
      addArea,
      saveOrderButton
    );


    renderGallery();

  };
