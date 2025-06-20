import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#setupDrawer();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url];

    if (!page || typeof page.render !== 'function' || typeof page.afterRender !== 'function') {
      this.#content.innerHTML = '<p>Halaman tidak ditemukan.</p>';
      return;
    }

    try {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
    } catch (error) {
      console.error('Gagal merender halaman:', error);
      this.#content.innerHTML = '<p>Terjadi kesalahan saat memuat halaman.</p>';
    }
  }
}

export default App;
