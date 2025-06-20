import '../../../styles/register.css';
import RegisterPresenter from './register-presenter';

export default class RegisterPage {
  async render() {
    return `
      <section class="register-page">
        <div class="container">
          <h1>Daftar Akun</h1>
          <form id="registerForm">
            <label for="name">Nama</label>
            <input type="text" id="name" name="name" required />

            <label for="email">Email</label>
            <input type="email" id="email" name="email" required />

            <label for="password">Password (min. 6 karakter)</label>
            <input type="password" id="password" name="password" minlength="6" required />

            <button type="submit">Daftar</button>
            <p id="form-message" class="form-message"></p>
          </form>
          <p>Sudah punya akun? <a href="#/login">Login di sini</a></p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const form = document.querySelector('#registerForm');
    const messageEl = document.querySelector('#form-message');

    this._presenter = new RegisterPresenter({
      showMessage: (message, type = 'error') => {
        messageEl.textContent = message;
        messageEl.className = `form-message ${type}`;
      },
      onSuccess: () => {
        messageEl.className = 'form-message success';
        messageEl.textContent = 'Registrasi berhasil! Mengarahkan ke halaman login...';
        setTimeout(() => {
          window.location.hash = '#/login';
        }, 1500);
      },
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const userData = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        password: form.password.value.trim(),
      };
      this._presenter.handleFormSubmit(userData);
    });
  }
}
