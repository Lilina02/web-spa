import "../../../styles/about.css";

export default class AboutView {
  getTemplate() {
    return `
     <!-- Hero Section -->
<div class="about-hero section section-1">
  <div class="hero-background"></div>
  <div class="container">
    <div class="hero-content">
      <div class="hero-icon">📖</div>
      <h1 class="hero-title">Jelajahi dan Bagikan Ceritamu</h1>
      <p class="hero-subtitle">Temukan kisah inspiratif dari berbagai tempat, dan abadikan ceritamu sendiri</p>
      <div class="hero-stats">
        <div class="stat-item"><span class="stat-number">∞</span><span class="stat-label">Cerita Dibagikan</span></div>
        <div class="stat-item"><span class="stat-number">🌍</span><span class="stat-label">Dari Seluruh Dunia</span></div>
        <div class="stat-item"><span class="stat-number">📱</span><span class="stat-label">Siap di Perangkat Mobile</span></div>
      </div>
    </div>
  </div>
</div>

<!-- What is Section -->
<div class="about-section section section-2">
  <div class="container">
    <div class="section-content">
      <div class="section-icon">🚀</div>
      <h2>Apa Itu Aplikasi Cerita?</h2>
      <p class="section-description">
        Aplikasi Cerita adalah platform digital yang memungkinkan siapa pun untuk membagikan kisah mereka secara visual dan geografis.
        Unggah foto, tuliskan kisahmu, dan tandai lokasi tempat itu terjadi — semua dalam satu tampilan yang menarik.
      </p>
      <div class="feature-preview">
        <div class="preview-card"><div class="card-icon">📷</div><h4>Cerita Visual</h4><p>Bagikan kisah dengan dukungan gambar</p></div>
        <div class="preview-card"><div class="card-icon">🗺️</div><h4>Peta Interaktif</h4><p>Lihat di mana cerita itu terjadi</p></div>
        <div class="preview-card"><div class="card-icon">👥</div><h4>Komunitas Cerita</h4><p>Terhubung dengan pengguna lain</p></div>
      </div>
    </div>
  </div>
</div>

<!-- Features Section -->
<div class="about-section section section-3">
  <div class="container">
    <div class="section-content">
      <div class="section-icon">⭐</div>
      <h2>Fitur Unggulan & Tujuan</h2>
      <div class="features-grid">
        <div class="feature-card"><div class="feature-icon">📝</div><h3>Tulis Ceritamu</h3><p>Buat cerita baru dengan gambar dan deskripsi singkat</p></div>
        <div class="feature-card"><div class="feature-icon">📍</div><h3>Lokasi Nyata</h3><p>Tunjukkan tempat di mana cerita terjadi</p></div>
        <div class="feature-card"><div class="feature-icon">🗂️</div><h3>Jelajahi Konten</h3><p>Temukan cerita dari berbagai penjuru dunia</p></div>
        <div class="feature-card"><div class="feature-icon">🔐</div><h3>Akun Pengguna</h3><p>Masuk untuk pengalaman berbagi yang lebih lengkap</p></div>
      </div>
      <div class="purpose-section">
        <div class="purpose-card">
          <h3>🎯 Tujuan Pengembangan</h3>
          <p>
            Aplikasi ini dikembangkan sebagai bagian dari proyek kelas <strong>Front-End Web Expert</strong> di Dicoding.
            Kami ingin menghadirkan pengalaman bercerita yang modern, interaktif, dan mudah digunakan bagi semua orang.
          </p>
        </div>
      </div>
    </div>
  </div>
</div>


    `;
  }

  initScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
        }
      });
    }, observerOptions);

    document.querySelectorAll(".section").forEach((section) => {
      observer.observe(section);
    });

    const cards = document.querySelectorAll(".feature-card, .preview-card");
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
    });
  }
}
