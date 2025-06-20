import FavoritePresenter from './favorite-presenter.js';

export default class FavoritePage {
  async render() {
    return `
      <section class="favorite-page">
        <a href="#main-content" class="skip-link">Skip to main content</a>
        <main id="main-content" class="container" tabindex="-1">
          <div class="header">
            <h1>Cerita Favorit</h1>
            <a href="#/" class="btn-kembali">← Kembali</a>
          </div>
          <section id="favorite-list" class="story-list" aria-live="polite" aria-label="Daftar cerita favorit"></section>
        </main>
      </section>
    `;
  }

  async afterRender() {
    const listContainer = document.querySelector('#favorite-list');

    this._presenter = new FavoritePresenter({
      view: this,
      container: listContainer,
    });

    await this._presenter.init();
  }

  showStories(stories) {
    const container = document.querySelector('#favorite-list');

    if (!stories || stories.length === 0) {
      this.showEmptyState();
      return;
    }

    container.innerHTML = stories.map((story) => {
      const date = new Date(story.createdAt).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
      });

      return `
        <article class="story-card" tabindex="0">
          <img src="${story.photoUrl}" alt="Foto oleh ${story.name}" />
          <div class="card-content">
            <h2>${story.name}</h2>
            <p class="card-description">${story.description}</p>
            <div class="card-date">${date}</div>
            <div class="card-location">${story.lat}, ${story.lon}</div>
            <button class="btn-remove-favorite" data-id="${story.id}">🗑️ Hapus</button>
          </div>
        </article>
      `;
    }).join('');

    this._addRemoveButtonListeners();
  }

  showEmptyState() {
    const container = document.querySelector('#favorite-list');
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">❤️</div>
        <h2>Belum ada cerita favorit</h2>
        <p>Mulai menjelajahi cerita dan tambahkan ke favorit untuk melihatnya di sini.</p>
        <a href="#/" class="btn btn-primary">Jelajahi Cerita</a>
      </div>
    `;
  }

  _addRemoveButtonListeners() {
    document.querySelectorAll('.btn-remove-favorite').forEach((button) => {
      button.addEventListener('click', async (event) => {
        const id = event.target.dataset.id;
        if (confirm('Hapus cerita dari favorit?')) {
          try {
            const { default: FavoriteStoryIdb } = await import('../../utils/favorite-story-idb.js');
            await FavoriteStoryIdb.delete(id);
            // Re-initialize presenter untuk refresh data
            await this._presenter.init();
          } catch (error) {
            console.error('Error removing favorite:', error);
            this.showError('Gagal menghapus cerita dari favorit. Silakan coba lagi.');
          }
        }
      });
    });
  }

  showError(message) {
    const container = document.querySelector('#favorite-list');
    container.innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <h2>Terjadi Kesalahan</h2>
        <p class="error-message">${message}</p>
        <button class="btn btn-secondary" onclick="location.reload()">Coba Lagi</button>
      </div>
    `;
  }

  showLoading() {
    const container = document.querySelector('#favorite-list');
    container.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Memuat cerita favorit...</p>
      </div>
    `;
  }
}