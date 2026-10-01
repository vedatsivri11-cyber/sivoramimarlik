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

    const name =
      file?.name || '';

    const ext =
      name.includes('.')
        ? name
            .split('.')
            .pop()
            .toLowerCase()
        : 'jpg';

    return ext === 'jpeg'
      ? 'jpg'
      : ext;

  };


  /* =========================================================
     MODAL
  ========================================================= */

  const createModal =
    title => {

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


      const box =
        document.createElement('div');

      box.style.background =
        '#fff';

      box.style.width =
        'min(1100px,94vw)';

      box.style.maxHeight =
        '90vh';

      box.style.overflow =
        'auto';

      box.style.borderRadius =
        '12px';

      box.style.padding =
        '24px';

      box.style.boxSizing =
        'border-box';


      const header =
        document.createElement('div');

      header.style.display =
        'flex';

      header.style.alignItems =
        'center';

      header.style.justifyContent =
        'space-between';

      header.style.gap =
        '15px';


      const heading =
        document.createElement('h2');

      heading.textContent =
        title;

      heading.style.margin =
        '0';


      const close =
        createButton('×');

      close.style.fontSize =
        '28px';

      close.style.lineHeight =
        '1';

      close.style.border =
        '0';

      close.style.background =
        'transparent';

      close.style.cursor =
        'pointer';


      close.addEventListener(
        'click',
        () => {
          overlay.remove();
        }
      );


      header.append(
        heading,
        close
      );


      const content =
        document.createElement('div');

      content.style.marginTop =
        '20px';


      box.append(
        header,
        content
      );


      overlay.append(
        box
      );


      overlay.addEventListener(
        'click',
        event => {

          if (
            event.target ===
            overlay
          ) {
            overlay.remove();
          }

        }
      );


      document.body.append(
        overlay
      );


      return {
        overlay,
        box,
        content
      };

    };


  /* =========================================================
     YARDIMCI FONKSİYONLAR
  ========================================================= */

  const parseBoolean =
    value => {

      if (
        typeof value ===
        'boolean'
      ) {
        return value;
      }

      if (
        typeof value ===
        'string'
      ) {
        return [
          'true',
          '1',
          'evet',
          'yes'
        ].includes(
          value.toLowerCase()
        );
      }

      return Boolean(value);

    };


  const formatPrice =
    (
      price,
      currency = 'TL'
    ) => {

      if (
        price === null ||
        price === undefined ||
        price === ''
      ) {
        return '';
      }

      const number =
        Number(price);

      if (
        Number.isNaN(number)
      ) {
        return `${price} ${currency}`;
      }

      return (
        new Intl.NumberFormat(
          'tr-TR'
        ).format(number) +
        ` ${currency}`
      );

    };


  const normalizePhotos =
    photos => {

      return parsePhotos(
        photos
      )
        .map(
          photo => {

            if (
              typeof photo ===
              'string'
            ) {

              return {
                url: photo,
                path: null
              };

            }

            if (
              photo &&
              typeof photo ===
              'object'
            ) {

              return {
                url:
                  photo.url ||
                  '',
                path:
                  photo.path ||
                  null
              };

            }

            return null;

          }
        )
        .filter(
          photo =>
            photo &&
            photo.url
        );

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
                      typeof photo ===
                      'object'
                        ? photo.path
                        : null
                  )
                  .filter(
                    Boolean
                  );


              if (paths.length) {

                const {
                  error:
                    storageError
                } =
                  await db.storage
                    .from(
                      'projects'
                    )
                    .remove(
                      paths
                    );


                if (
                  storageError
                ) {

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
                  .from(
                    'projects'
                  )
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


          cards.append(
            row
          );

        }
      );

    };
  /* =========================================================
     BURAYA KADAR 1. PARÇA
  ========================================================= */  /* =========================================================
     PROJE FOTOĞRAFLARI
     SIRALAMA + SİLME
  ========================================================= */

  const openProjectPhotos =
    (project, photos) => {

      const modal =
        createModal(
          `Proje Fotoğrafları · ${project.title}`
        );

      let currentPhotos =
        (
          Array.isArray(photos)
            ? photos
            : []
        )
          .map(photo => {

            if (
              typeof photo ===
              'string'
            ) {
              return {
                url: photo,
                path: null
              };
            }

            return {
              url:
                photo?.url ||
                '',
              path:
                photo?.path ||
                null
            };

          })
          .filter(
            photo =>
              photo.url
          );


      const info =
        document.createElement(
          'p'
        );

      info.textContent =
        'Fotoğrafları ↑ ↓ butonlarıyla veya sürükleyerek sıralayabilirsiniz. 1. fotoğraf kapak fotoğrafıdır.';

      info.style.cssText =
        `
        margin:0 0 18px;
        padding:12px 15px;
        background:#f5f5f5;
        border:1px solid #ddd;
        font-size:13px;
        line-height:1.5;
        `;


      const gallery =
        document.createElement(
          'div'
        );

      gallery.style.cssText =
        `
        display:grid;
        grid-template-columns:
          repeat(
            auto-fill,
            minmax(180px,1fr)
          );
        gap:15px;
        `;


      /* =====================================================
         SIRAYI SUPABASE'E KAYDET
      ===================================================== */

      const saveOrder =
        async () => {

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

        };


      /* =====================================================
         GALERİYİ OLUŞTUR
      ===================================================== */

      const renderGallery =
        () => {

          gallery.replaceChildren();


          if (
            !currentPhotos.length
          ) {

            const empty =
              document.createElement(
                'p'
              );

            empty.textContent =
              'Fotoğraf bulunmuyor.';

            gallery.append(
              empty
            );

            return;
          }


          currentPhotos.forEach(
            (
              photo,
              index
            ) => {

              const box =
                document.createElement(
                  'div'
                );

              box.draggable =
                true;

              box.dataset.index =
                String(index);

              box.style.cssText =
                `
                border:1px solid #ddd;
                padding:8px;
                background:#fff;
                position:relative;
                `;


              /* NUMARA */

              const number =
                document.createElement(
                  'div'
                );

              number.textContent =
                String(
                  index + 1
                );

              number.style.cssText =
                `
                position:absolute;
                left:12px;
                top:12px;
                z-index:2;
                width:30px;
                height:30px;
                border-radius:50%;
                background:#b9975b;
                color:#fff;
                display:flex;
                align-items:center;
                justify-content:center;
                font-weight:700;
                `;


              /* FOTOĞRAF */

              const image =
                document.createElement(
                  'img'
                );

              image.src =
                photo.url;

              image.alt =
                `Proje fotoğrafı ${
                  index + 1
                }`;

              image.style.cssText =
                `
                width:100%;
                height:160px;
                object-fit:cover;
                display:block;
                `;


              /* FOTOĞRAF ADI */

              const text =
                document.createElement(
                  'small'
                );

              text.textContent =
                index === 0
                  ? `Fotoğraf ${
                      index + 1
                    } · KAPAK`
                  : `Fotoğraf ${
                      index + 1
                    }`;

              text.style.cssText =
                `
                display:block;
                margin:8px 0;
                font-weight:600;
                `;


              /* BUTONLAR */

              const buttons =
                document.createElement(
                  'div'
                );

              buttons.style.cssText =
                `
                display:flex;
                gap:5px;
                `;


              /* YUKARI */

              const up =
                createButton(
                  '↑'
                );

              up.disabled =
                index === 0;


              up.addEventListener(
                'click',
                () => {

                  if (
                    index === 0
                  ) {
                    return;
                  }


                  [
                    currentPhotos[
                      index - 1
                    ],
                    currentPhotos[
                      index
                    ]
                  ] = [
                    currentPhotos[
                      index
                    ],
                    currentPhotos[
                      index - 1
                    ]
                  ];


                  renderGallery();


                  setStatus(
                    'Sıra değiştirildi. Kaydet butonuna basın.'
                  );

                }
              );


              /* AŞAĞI */

              const down =
                createButton(
                  '↓'
                );

              down.disabled =
                index ===
                currentPhotos.length - 1;


              down.addEventListener(
                'click',
                () => {

                  if (
                    index >=
                    currentPhotos.length - 1
                  ) {
                    return;
                  }


                  [
                    currentPhotos[
                      index
                    ],
                    currentPhotos[
                      index + 1
                    ]
                  ] = [
                    currentPhotos[
                      index + 1
                    ],
                    currentPhotos[
                      index
                    ]
                  ];


                  renderGallery();


                  setStatus(
                    'Sıra değiştirildi. Kaydet butonuna basın.'
                  );

                }
              );


              /* SİL */

              const remove =
                createButton(
                  'Sil'
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


                  remove.disabled =
                    true;


                  try {

                    if (
                      photo.path
                    ) {

                      const {
                        error:
                          storageError
                      } =
                        await db
                          .storage
                          .from(
                            'projects'
                          )
                          .remove(
                            [
                              photo.path
                            ]
                          );


                      if (
                        storageError
                      ) {
                        throw storageError;
                      }

                    }


                    currentPhotos.splice(
                      index,
                      1
                    );


                    await saveOrder();


                    renderGallery();


                    setStatus(
                      'Fotoğraf silindi.'
                    );


                    await refreshProjects();


                  } catch (
                    error
                  ) {

                    setStatus(
                      'Fotoğraf silinemedi: ' +
                      error.message
                    );


                    remove.disabled =
                      false;

                  }

                }
              );


              buttons.append(
                up,
                down,
                remove
              );


              box.append(
                number,
                image,
                text,
                buttons
              );


              /* =================================================
                 SÜRÜKLE - BIRAK
              ================================================= */

              box.addEventListener(
                'dragstart',
                event => {

                  event.dataTransfer.setData(
                    'text/plain',
                    String(index)
                  );

                  event.dataTransfer.effectAllowed =
                    'move';

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

                  box.style.transform =
                    'scale(1.03)';

                }
              );


              box.addEventListener(
                'dragleave',
                () => {

                  box.style.transform =
                    '';

                }
              );


              box.addEventListener(
                'drop',
                event => {

                  event.preventDefault();


                  box.style.transform =
                    '';


                  const from =
                    Number(
                      event.dataTransfer
                        .getData(
                          'text/plain'
                        )
                    );


                  const to =
                    index;


                  if (
                    Number.isNaN(
                      from
                    ) ||
                    from === to
                  ) {
                    return;
                  }


                  const moved =
                    currentPhotos.splice(
                      from,
                      1
                    )[0];


                  currentPhotos.splice(
                    to,
                    0,
                    moved
                  );


                  renderGallery();


                  setStatus(
                    'Sıra değiştirildi. Kaydet butonuna basın.'
                  );

                }
              );


              gallery.append(
                box
              );

            }
          );

        };


      /* =====================================================
         SIRAYI KAYDET BUTONU
      ===================================================== */

      const save =
        createButton(
          'Fotoğraf Sırasını Kaydet'
        );


      save.style.cssText =
        `
        margin-top:20px;
        background:#111;
        color:#fff;
        font-weight:700;
        `;


      save.addEventListener(
        'click',
        async () => {

          save.disabled =
            true;


          try {

            await saveOrder();


            setStatus(
              'Fotoğraf sırası başarıyla kaydedildi.'
            );


            await refreshProjects();


          } catch (
            error
          ) {

            setStatus(
              'Sıralama kaydedilemedi: ' +
              error.message
            );

          } finally {

            save.disabled =
              false;

          }

        }
      );


      modal.content.append(
        info,
        gallery,
        save
      );


      renderGallery();

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

          input.type =
            type;

        }


        if (
          type === 'textarea'
        ) {

          input.rows =
            5;

        }


        input.value =
          value ?? '';


        input.style.width =
          '100%';

        input.style.boxSizing =
          'border-box';

        input.style.padding =
          '10px';

        input.style.marginTop =
          '5px';

        input.style.border =
          '1px solid #ddd';

        input.style.borderRadius =
          '8px';


        label.append(
          input
        );

        form.append(
          label
        );

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

    save.style.cssText =
      `
      background:#111;
      color:#fff;
      border:0;
      padding:12px 18px;
      border-radius:8px;
      font-weight:700;
      cursor:pointer;
      margin-top:8px;
      `;


    form.append(
      save
    );


    form.addEventListener(
      'submit',
      async event => {

        event.preventDefault();

        save.disabled =
          true;

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

          save.disabled =
            false;

          return;

        }


        modal.overlay.remove();


        setStatus(
          'Proje başarıyla güncellendi.'
        );


        await refreshProjects();

      }
    );


    modal.content.append(
      form
    );

  };
  /* =========================================================
     GAYRİMENKULLER
  ========================================================= */

  const refreshProperties =
    async () => {

      if (
        !propertyCards
      ) {
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
              ascending:false
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


      (
        data || []
      ).forEach(
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

row.style.cssText =
  `
  display:flex;
  gap:20px;
  align-items:stretch;
  border:1px solid #e3e3e3;
  border-radius:14px;
  padding:16px;
  margin-bottom:18px;
  background:#fff;
  box-shadow:0 4px 16px rgba(0,0,0,.06);
  overflow:hidden;
  `;


/* =====================================================
   İLAN FOTOĞRAFI
===================================================== */

const photoBox =
  document.createElement(
    'div'
  );

photoBox.style.cssText =
  `
  width:220px;
  min-width:220px;
  height:155px;
  border-radius:10px;
  overflow:hidden;
  background:#f1f1f1;
  `;

const firstPhoto =
  photos[0];

const photoUrl =
  typeof firstPhoto === 'string'
    ? firstPhoto
    : firstPhoto?.url;

if (photoUrl) {

  const image =
    document.createElement(
      'img'
    );

  image.src =
    photoUrl;

  image.alt =
    property.ilan_basligi ||
    'Gayrimenkul';

  image.style.cssText =
    `
    width:100%;
    height:100%;
    object-fit:cover;
    display:block;
    `;

  photoBox.append(
    image
  );

} else {

  photoBox.innerHTML =
    `
    <div style="
      width:100%;
      height:100%;
      display:flex;
      align-items:center;
      justify-content:center;
      color:#888;
      font-size:14px;
      ">
      Fotoğraf Yok
    </div>
    `;

}


/* =====================================================
   İLAN BİLGİLERİ
===================================================== */

const content =
  document.createElement(
    'div'
  );

content.style.cssText =
  `
  flex:1;
  min-width:0;
  display:flex;
  flex-direction:column;
  justify-content:center;
  `;


const title =
  document.createElement(
    'h3'
  );

title.textContent =
  property.ilan_basligi ||
  'İlan';

title.style.cssText =
  `
  margin:0 0 10px 0;
  font-size:22px;
  font-weight:700;
  color:#111;
  `;


const info =
  document.createElement(
    'div'
  );

info.innerHTML =
  `
  <div style="
    font-size:15px;
    font-weight:600;
    color:#444;
    margin-bottom:5px;
    ">
    ${escapeHtml(
      property.konum || ''
    )}
  </div>

  <div style="
    font-size:15px;
    color:#555;
    ">
    ${escapeHtml(
      property.gayrimenkul_turu ||
      ''
    )}

    ${
      property.fiyat
        ? `
          <span style="margin:0 5px;color:#aaa;">
            ·
          </span>
          <strong style="color:#111;">
            ${escapeHtml(
              formatPrice(
                property.fiyat,
                property.para_birimi ||
                'TL'
              )
            )}
          </strong>
        `
        : ''
    }
  </div>
  `;


/* =====================================================
   DURUM
===================================================== */

const statusBadge =
  document.createElement(
    'span'
  );

statusBadge.textContent =
  sold
    ? 'SATILDI'
    : 'AKTİF';

statusBadge.style.cssText =
  `
  display:inline-flex;
  align-items:center;
  width:max-content;
  margin-top:12px;
  padding:6px 13px;
  border-radius:20px;
  background:${
    sold
      ? '#6f6f6f'
      : '#e8f5ed'
  };
  color:${
    sold
      ? '#fff'
      : '#247447'
  };
  font-size:12px;
  font-weight:800;
  letter-spacing:.4px;
  `;


/* =====================================================
   BUTONLAR
===================================================== */

const actions =
  document.createElement(
    'div'
  );

actions.style.cssText =
  `
  display:flex;
  flex-wrap:wrap;
  gap:9px;
  margin-top:18px;
  `;


const styleButton =
  (
    button,
    background,
    color,
    border
  ) => {

    button.style.cssText =
      `
      border:1px solid ${
        border || background
      };
      background:${background};
      color:${color};
      padding:9px 15px;
      border-radius:8px;
      font-size:13px;
      font-weight:700;
      cursor:pointer;
      transition:all .2s ease;
      `;

    button.addEventListener(
      'mouseenter',
      () => {
        button.style.transform =
          'translateY(-1px)';
        button.style.boxShadow =
          '0 4px 10px rgba(0,0,0,.10)';
      }
    );

    button.addEventListener(
      'mouseleave',
      () => {
        button.style.transform =
          '';
        button.style.boxShadow =
          '';
      }
    );
  };


/* DÜZENLE */

const edit =
  createButton(
    '✎  Düzenle'
  );

styleButton(
  edit,
  '#111',
  '#fff'
);

edit.addEventListener(
  'click',
  () => {

    openPropertyEdit(
      property
    );

  }
);


/* FOTOĞRAFLAR */

const photoButton =
  createButton(
    `▣  Fotoğraflar (${photos.length})`
  );

styleButton(
  photoButton,
  '#fff',
  '#222',
  '#d7d7d7'
);

photoButton.addEventListener(
  'click',
  () => {

    openPropertyPhotos(
      property,
      photos
    );

  }
);


/* AKTİF / SATILDI */

const toggleSold =
  createButton(
    sold
      ? '✓  Aktif Yap'
      : '●  Satıldı Yap'
  );

styleButton(
  toggleSold,
  sold
    ? '#247447'
    : '#f1f1f1',
  sold
    ? '#fff'
    : '#333',
  sold
    ? '#247447'
    : '#d7d7d7'
  );

toggleSold.addEventListener(
  'click',
  async () => {

    toggleSold.disabled =
      true;

    const newStatus =
      sold
        ? 'aktif'
        : 'satildi';

    const {
      error
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

    if (error) {

      setStatus(
        'Durum değiştirilemedi: ' +
        error.message
      );

      toggleSold.disabled =
        false;

      return;

    }

    setStatus(
      newStatus ===
      'satildi'
        ? 'İlan satıldı olarak işaretlendi.'
        : 'İlan tekrar aktif yapıldı.'
    );

    await refreshProperties();

  }
);


/* SİL */

const remove =
  createButton(
    '×  Sil'
  );

styleButton(
  remove,
  '#fff',
  '#b42318',
  '#e4b4b0'
);

remove.addEventListener(
  'click',
  async () => {

    if (
      !confirm(
        'Bu gayrimenkul silinsin mi?'
      )
    ) {
      return;
    }

    const {
      error
    } =
      await db
        .from('properties')
        .delete()
        .eq(
          'id',
          property.id
        );

    if (error) {

      setStatus(
        'Gayrimenkul silinemedi: ' +
        error.message
      );

      return;

    }

    setStatus(
      'Gayrimenkul silindi.'
    );

    await refreshProperties();

  }
);


actions.append(
  edit,
  photoButton,
  toggleSold,
  remove
);


content.append(
  title,
  info,
  statusBadge,
  actions
);


row.append(
  photoBox,
  content
);


propertyCards.append(
  row
);

        }
      );

    };  /* =========================================================
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

      let currentPhotos =
        parsePhotos(
          photos
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


      /* =====================================================
         FOTOĞRAF SIRASINI KAYDET
      ===================================================== */

      const saveOrder =
        async () => {

          const {
            error
          } =
            await db
              .from('properties')
              .update({

                fotograflar:
                  JSON.stringify(
                    currentPhotos
                  )

              })
              .eq(
                'id',
                property.id
              );

          if (error) {
            throw error;
          }

        };


      /* =====================================================
         GALERİ
      ===================================================== */

      const renderGallery =
        () => {

          gallery.replaceChildren();

          if (
            !currentPhotos.length
          ) {

            const empty =
              document.createElement(
                'p'
              );

            empty.textContent =
              'Bu gayrimenkulde fotoğraf bulunmuyor.';

            gallery.append(
              empty
            );

            return;

          }


          currentPhotos.forEach(
            (
              photo,
              index
            ) => {

              const box =
                document.createElement(
                  'div'
                );

              box.draggable =
                true;

              box.style.cssText =
                `
                border:1px solid #ddd;
                padding:8px;
                background:#fff;
                position:relative;
                `;


              const number =
                document.createElement(
                  'div'
                );

              number.textContent =
                String(
                  index + 1
                );

              number.style.cssText =
                `
                position:absolute;
                left:12px;
                top:12px;
                z-index:2;
                width:30px;
                height:30px;
                border-radius:50%;
                background:#b9975b;
                color:#fff;
                display:flex;
                align-items:center;
                justify-content:center;
                font-weight:700;
                `;


              const image =
                document.createElement(
                  'img'
                );

              image.src =
                typeof photo ===
                'string'
                  ? photo
                  : photo?.url || '';

              image.style.width =
                '100%';

              image.style.height =
                '160px';

              image.style.objectFit =
                'cover';

              image.style.display =
                'block';


              const text =
                document.createElement(
                  'small'
                );

              text.textContent =
                index === 0
                  ? `Fotoğraf ${
                      index + 1
                    } · KAPAK`
                  : `Fotoğraf ${
                      index + 1
                    }`;

              text.style.display =
                'block';

              text.style.margin =
                '8px 0';

              text.style.fontWeight =
                '600';


              const buttons =
                document.createElement(
                  'div'
                );

              buttons.style.display =
                'flex';

              buttons.style.gap =
                '5px';


              /* YUKARI */

              const up =
                createButton(
                  '↑'
                );

              up.disabled =
                index === 0;


              up.addEventListener(
                'click',
                () => {

                  if (
                    index === 0
                  ) {
                    return;
                  }

                  [
                    currentPhotos[
                      index - 1
                    ],
                    currentPhotos[
                      index
                    ]
                  ] = [
                    currentPhotos[
                      index
                    ],
                    currentPhotos[
                      index - 1
                    ]
                  ];

                  renderGallery();

                  setStatus(
                    'Sıra değiştirildi. Kaydet butonuna basın.'
                  );

                }
              );


              /* AŞAĞI */

              const down =
                createButton(
                  '↓'
                );

              down.disabled =
                index ===
                currentPhotos.length - 1;


              down.addEventListener(
                'click',
                () => {

                  if (
                    index >=
                    currentPhotos.length - 1
                  ) {
                    return;
                  }

                  [
                    currentPhotos[
                      index
                    ],
                    currentPhotos[
                      index + 1
                    ]
                  ] = [
                    currentPhotos[
                      index + 1
                    ],
                    currentPhotos[
                      index
                    ]
                  ];

                  renderGallery();

                  setStatus(
                    'Sıra değiştirildi. Kaydet butonuna basın.'
                  );

                }
              );


              /* SİL */

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


                  const photoPath =
                    typeof photo ===
                    'object'
                      ? photo?.path
                      : null;


                  if (
                    photoPath
                  ) {

                    const {
                      error
                    } =
                      await db.storage
                        .from(
                          'property-images'
                        )
                        .remove([
                          photoPath
                        ]);


                    if (error) {

                      setStatus(
                        'Fotoğraf silinemedi: ' +
                        error.message
                      );

                      return;

                    }

                  }


                  currentPhotos.splice(
                    index,
                    1
                  );


                  try {

                    await saveOrder();

                  } catch (
                    error
                  ) {

                    setStatus(
                      'İlan güncellenemedi: ' +
                      error.message
                    );

                    return;

                  }


                  renderGallery();

                  setStatus(
                    'Fotoğraf silindi.'
                  );

                  refreshProperties();

                }
              );


              buttons.append(
                up,
                down,
                remove
              );


              box.append(
                number,
                image,
                text,
                buttons
              );


              /* =================================================
                 SÜRÜKLE - BIRAK
              ================================================= */

              box.addEventListener(
                'dragstart',
                event => {

                  event.dataTransfer.setData(
                    'text/plain',
                    String(index)
                  );

                  event.dataTransfer.effectAllowed =
                    'move';

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

                  box.style.transform =
                    'scale(1.03)';

                }
              );


              box.addEventListener(
                'dragleave',
                () => {

                  box.style.transform =
                    '';

                }
              );


              box.addEventListener(
                'drop',
                event => {

                  event.preventDefault();

                  box.style.transform =
                    '';


                  const from =
                    Number(
                      event.dataTransfer
                        .getData(
                          'text/plain'
                        )
                    );


                  const to =
                    index;


                  if (
                    Number.isNaN(
                      from
                    ) ||
                    from === to
                  ) {
                    return;
                  }


                  const moved =
                    currentPhotos.splice(
                      from,
                      1
                    )[0];


                  currentPhotos.splice(
                    to,
                    0,
                    moved
                  );


                  renderGallery();


                  setStatus(
                    'Sıra değiştirildi. Kaydet butonuna basın.'
                  );

                }
              );


              gallery.append(
                box
              );

            }
          );

        };


      /* =====================================================
         KAYDET
      ===================================================== */

      const save =
        createButton(
          'Fotoğraf Sırasını Kaydet'
        );

      save.style.cssText =
        `
        margin-top:20px;
        background:#111;
        color:#fff;
        font-weight:700;
        `;


      save.addEventListener(
        'click',
        async () => {

          save.disabled =
            true;

          try {

            await saveOrder();

            setStatus(
              'Fotoğraf sırası başarıyla kaydedildi.'
            );

            await refreshProperties();

          } catch (
            error
          ) {

            setStatus(
              'Sıralama kaydedilemedi: ' +
              error.message
            );

          } finally {

            save.disabled =
              false;

          }

        }
      );


      modal.content.append(
        gallery,
        save
      );


      renderGallery();

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

            input.rows =
              4;

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


          label.append(
            input
          );

          form.append(
            label
          );

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
  property.fiyat
    ? Number(property.fiyat).toLocaleString('tr-TR')
    : '',
  'text'
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


      form.append(
        save
      );


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

            fiyat: (() => {
  const rawPrice =
    String(fields.fiyat.value || '').trim();

  if (!rawPrice) {
    return null;
  }

  const normalizedPrice =
    rawPrice
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(',', '.');

  const parsedPrice =
    Number(normalizedPrice);

  return Number.isFinite(parsedPrice)
    ? parsedPrice
    : null;
})(),

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


      modal.content.append(
        form
      );

    };
    /* =========================================================
     EKSİK YARDIMCI FONKSİYONLAR
  ========================================================= */

  const escapeHtml =
    value => {

      return String(
        value ?? ''
      )
        .replaceAll(
          '&',
          '&amp;'
        )
        .replaceAll(
          '<',
          '&lt;'
        )
        .replaceAll(
          '>',
          '&gt;'
        )
        .replaceAll(
          '"',
          '&quot;'
        )
        .replaceAll(
          "'",
          '&#039;'
        );

    };


  const validateImageFiles =
  files => {

    const allowed = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!files || !files.length) {
      return 'En az bir fotoğraf seçin.';
    }

    for (const file of files) {

      if (!file || !file.size) {
        continue;
      }

      if (!allowed.includes(file.type)) {
        return (
          `"${file.name}" desteklenmeyen formatta. ` +
          'Sadece JPG, PNG veya WebP kullanabilirsiniz.'
        );
      }

      // Tek fotoğraf için maksimum 15 MB
      if (file.size > 15 * 1024 * 1024) {
        return (
          `"${file.name}" 15 MB'tan büyük. ` +
          'Lütfen fotoğrafı küçültün.'
        );
      }

    }

    return null;
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
            makePhotoExt(
              file
            );


          const {
            error:
              uploadError
          } =
            await db.storage
              .from(
                'projects'
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
              uploaded.length
            ) {

              await db.storage
                .from(
                  'projects'
                )
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
              .from(
                'projects'
              )
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
            .from(
              'projects'
            )
            .insert({

              owner_id:
                userData.user.id,

              title:
                String(
                  form.get(
                    'title'
                  ) ||
                  ''
                ).trim(),

              location:
                String(
                  form.get(
                    'location'
                  ) ||
                  ''
                ).trim(),

              description:
                String(
                  form.get(
                    'description'
                  ) ||
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
            .from(
              'projects'
            )
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
            .getAll(
              'fotograflar'
            )
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
            form.get(
              'ilan_basligi'
            ) ||
            ''
          ).trim();


        const ilanTuru =
          String(
            form.get(
              'ilan_turu'
            ) ||
            ''
          ).trim();


        const gayrimenkulTuru =
          String(
            form.get(
              'gayrimenkul_turu'
            ) ||
            ''
          ).trim();


        const konum =
          String(
            form.get(
              'konum'
            ) ||
            ''
          ).trim();


        const fiyat =
          form.get(
            'fiyat'
          );


        const paraBirimi =
          String(
            form.get(
              'para_birimi'
            ) ||
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
            makePhotoExt(
              file
            );


          const {
            error:
              uploadError
          } =
            await db.storage
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
            data:
              publicData
          } =
            db.storage
              .from(
                'property-images'
              )
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
            Number(
              fiyat
            ),

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
              ) ||
              ''
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
              ) ||
              ''
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
              ) ||
              ''
            ).trim(),

          balkon:
            form.get(
              'balkon'
            ) ===
            'true',

          otopark:
            form.get(
              'otopark'
            ) ===
            'true',

          aciklama:
            String(
              form.get(
                'aciklama'
              ) ||
              ''
            ).trim(),

          ozellikler:
            String(
              form.get(
                'ozellikler'
              ) ||
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
            .from(
              'properties'
            )
            .insert(
              propertyData
            );


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
          form.get(
            'email'
          );


        const password =
          form.get(
            'password'
          );


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
   ADMIN SAYFASI KAPANINCA OTURUMU YERELDEN TEMİZLE
========================================================= */

const SIVORA_AUTH_STORAGE_KEY =
  'sb-jfmldtumtnmuhzomujtm-auth-token';

window.addEventListener(
  'pagehide',
  () => {

    try {

      localStorage.removeItem(
        SIVORA_AUTH_STORAGE_KEY
      );

    } catch (error) {

      console.warn(
        'Admin oturumu temizlenemedi:',
        error
      );

    }

  }
);
  /* =========================================================
     BAŞLAT
  ========================================================= */

  loadSession();

})();
/* =====================================================
   ADMIN TEMA SİSTEMİ
===================================================== */

(function(){

  const body =
    document.body;

  const toggle =
    document.getElementById(
      'admin-theme-toggle'
    );

  if(!body || !toggle) return;


  const savedTheme =
    localStorage.getItem(
      'sivora-admin-theme'
    );


  if(savedTheme === 'light'){

    body.classList.remove(
      'admin-theme-dark'
    );

    body.classList.add(
      'admin-theme-light'
    );

    toggle.textContent = '☾';

  }else{

    body.classList.remove(
      'admin-theme-light'
    );

    body.classList.add(
      'admin-theme-dark'
    );

    toggle.textContent = '☼';

  }


  toggle.addEventListener(
    'click',
    function(){

      const isLight =
        body.classList.contains(
          'admin-theme-light'
        );


      if(isLight){

        body.classList.remove(
          'admin-theme-light'
        );

        body.classList.add(
          'admin-theme-dark'
        );

        toggle.textContent = '☼';

        localStorage.setItem(
          'sivora-admin-theme',
          'dark'
        );

      }else{

        body.classList.remove(
          'admin-theme-dark'
        );

        body.classList.add(
          'admin-theme-light'
        );

        toggle.textContent = '☾';

        localStorage.setItem(
          'sivora-admin-theme',
          'light'
        );

      }

    }
  );

})();
