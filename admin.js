<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#eeeae2">
<title>Yönetim | Sivora Mimarlık</title>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&display=swap" rel="stylesheet">

<link rel="stylesheet" href="style.css">
</head>

<body class="admin-body">

<header class="admin-header">
  <a class="logo admin-logo" href="index.html">
    SVR <span>· SİVORA MİMARLIK OFİSİ</span>
  </a>
  <a href="index.html">← Siteye dön</a>
</header>

<main class="admin-main">

<p class="eyebrow">Sivora · Yönetim paneli</p>

<h1>Yönetim</h1>

<p class="admin-lede">
  Mimarlık projelerini ve gayrimenkul ilanlarını buradan yönetebilirsin.
</p>

<section id="setup-needed" class="admin-notice" hidden>
  <strong>Bağlantı kurulmadı.</strong><br>
  Önce Supabase bağlantısını kontrol et.
</section>

<form id="login-form" class="admin-card">
  <h2>Yönetici girişi</h2>

  <label>
    E-posta
    <input type="email" name="email" autocomplete="username" required>
  </label>

  <label>
    Şifre
    <input type="password" name="password" autocomplete="current-password" required>
  </label>

  <button type="submit">Giriş yap</button>
</form>

<section id="dashboard" hidden>

  <div class="admin-topline">
    <h2>Yönetim</h2>
    <button type="button" class="button-quiet" id="logout">
      Çıkış yap
    </button>
  </div>


  <!-- MİMARLIK PROJELERİ -->

  <section class="admin-card">

    <h2>Yeni mimarlık projesi</h2>

    <form id="project-form">

      <label>
        Proje adı
        <input
          name="title"
          maxlength="100"
          required
          placeholder="Örn. Bahçeli konut"
        >
      </label>

      <label>
        Konum / adres
        <input
          name="location"
          maxlength="180"
          required
          placeholder="Örn. Küçükçekmece, İstanbul"
        >
      </label>

      <label>
        Proje fotoğrafı
        <input
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
        >
      </label>

      <small>
        JPG, PNG veya WebP; en fazla 5 MB.
      </small>

      <button type="submit">
        Projeyi yayımla
      </button>

    </form>

  </section>


  <!-- GAYRİMENKUL -->

  <section class="admin-card">

    <h2>Yeni gayrimenkul ilanı</h2>

    <form id="property-form">

      <label>
        İlan başlığı
        <input
          name="ilan_basligi"
          maxlength="150"
          required
          placeholder="Örn. Modern 3+1 Daire"
        >
      </label>

      <label>
        İlan türü
        <select name="ilan_turu" required>
          <option value="">Seçiniz</option>
          <option value="Satılık">Satılık</option>
          <option value="Kiralık">Kiralık</option>
        </select>
      </label>

      <label>
        Gayrimenkul türü
        <select name="gayrimenkul_turu" required>
          <option value="">Seçiniz</option>
          <option value="Daire">Daire</option>
          <option value="Villa">Villa</option>
          <option value="Müstakil Ev">Müstakil Ev</option>
          <option value="Arsa">Arsa</option>
          <option value="İşyeri">İşyeri</option>
          <option value="Ofis">Ofis</option>
          <option value="Dükkan">Dükkan</option>
          <option value="Diğer">Diğer</option>
        </select>
      </label>

      <label>
        Konum
        <input
          name="konum"
          maxlength="180"
          required
          placeholder="Örn. Konstanz, Almanya"
        >
      </label>

      <label>
        Fiyat
        <input
          name="fiyat"
          type="number"
          step="0.01"
          min="0"
          required
          placeholder="8500000"
        >
      </label>

      <label>
        Para birimi
        <select name="para_birimi" required>
          <option value="EUR">Euro (€)</option>
          <option value="TRY">Türk Lirası (₺)</option>
          <option value="USD">Dolar ($)</option>
          <option value="CHF">İsviçre Frangı (CHF)</option>
        </select>
      </label>

      <label>
        Brüt m²
        <input
          name="brut_m2"
          type="number"
          step="0.01"
          min="0"
          placeholder="145"
        >
      </label>

      <label>
        Net m²
        <input
          name="net_m2"
          type="number"
          step="0.01"
          min="0"
          placeholder="125"
        >
      </label>

      <label>
        Oda sayısı
        <input
          name="oda_sayisi"
          placeholder="3+1"
        >
      </label>

      <label>
        Banyo sayısı
        <input
          name="banyo_sayisi"
          type="number"
          min="0"
          placeholder="2"
        >
      </label>

      <label>
        Kat
        <input
          name="kat"
          placeholder="5. Kat"
        >
      </label>

      <label>
        Bina yaşı
        <input
          name="bina_yasi"
          type="number"
          min="0"
          placeholder="8"
        >
      </label>

      <label>
        Isıtma
        <input
          name="isitma"
          placeholder="Kombi"
        >
      </label>

      <label>
        Balkon
        <select name="balkon">
          <option value="false">Yok</option>
          <option value="true">Var</option>
        </select>
      </label>

      <label>
        Otopark
        <select name="otopark">
          <option value="false">Yok</option>
          <option value="true">Var</option>
        </select>
      </label>

      <label>
        Özellikler
        <input
          name="ozellikler"
          placeholder="Asansör, teras, bahçe, otopark..."
        >
      </label>

      <label>
        Detaylı açıklama
        <textarea
          name="aciklama"
          rows="7"
          placeholder="Gayrimenkul hakkında detaylı açıklama..."
        ></textarea>
      </label>

      <label>
        Gayrimenkul fotoğrafları
        <input
          name="fotograflar"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          required
        >
      </label>

      <small>
        Birden fazla fotoğraf seçebilirsin. JPG, PNG veya WebP.
        Her fotoğraf en fazla 5 MB.
      </small>

      <button type="submit">
        Gayrimenkulü yayımla
      </button>

    </form>

  </section>


  <p id="admin-status" class="admin-status" role="status"></p>


  <!-- PROJELER -->

  <section>
    <h2>Yayınlanan mimarlık projeleri</h2>
    <div id="admin-projects" class="admin-projects"></div>
  </section>


  <!-- GAYRİMENKULLER -->

  <section>
    <h2>Yayınlanan gayrimenkuller</h2>
    <div id="admin-properties" class="admin-projects"></div>
  </section>

</section>

</main>

<script src="supabase-config.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="admin.js"></script>

</body>
</html>
