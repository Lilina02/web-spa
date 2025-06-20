import HomePresenter from './home-presenter.js';
import '../../../styles/home.css';

export default class HomePage {
  async render() {
    return `
      <section class="home-page">
        <a href="#main-content" class="skip-link">Skip to main content</a>
        <main id="main-content" class="container" tabindex="-1">
          <div class="header">
            <h1>Daftar Cerita</h1>
            <a href="#/tambah" class="btn-tambah">➕ Tambah Cerita</a>
          </div>
          <section id="story-list" class="story-list" aria-live="polite" aria-label="Daftar cerita"></section>
          <div id="map" class="map-container" aria-label="Peta lokasi cerita" role="region"></div>
        </main>
      </section>
    `;
  }

  async afterRender() {
    this._storyListEl = document.querySelector('#story-list');
    this._mapContainer = document.querySelector('#map');

    this._presenter = new HomePresenter({
      view: this,
      storyList: this._storyListEl,
      mapContainer: this._mapContainer.id,
    });

    await this._presenter.init();
  }

  showEmptyMessage() {
    this._storyListEl.innerHTML = `<p>Tidak ada cerita yang tersedia.</p>`;
  }

  showError(message) {
    this._storyListEl.innerHTML = `<p class="error">${message}</p>`;
  }

  showStories(stories) {
    this._storyListEl.innerHTML = stories.map(story => {
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
            <button class="btn-favorite" aria-label="Simpan cerita">💾 Simpan</button>
          </div>
        </article>
      `;
    }).join('');

    this._addFavoriteButtonListeners(stories);
  }

  _addFavoriteButtonListeners(stories) {
    const buttons = this._storyListEl.querySelectorAll('.btn-favorite');
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => {
        this._presenter.saveFavorite(stories[index]);
      });
    });
  }

  showFavoriteSavedMessage() {
    alert('Cerita disimpan sebagai favorit!');
  }
}
