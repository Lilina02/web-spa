import '../../../styles/login.css';
import LoginPresenter from './login-presenter.js';

export default class LoginPage {
  async render() {
    return `
      <section class="login-page">
        <div class="container">
          <h1>Login</h1>
          <form id="loginForm">
            <label for="email">Email</label>
            <input type="email" id="email" required />

            <label for="password">Password</label>
            <input type="password" id="password" required />

            <button type="submit">Login</button>
            <p id="login-message" class="form-message"></p>
          </form>
          <p>Belum punya akun? <a href="#/register">Daftar di sini</a></p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const form = document.querySelector('#loginForm');
    const messageEl = document.querySelector('#login-message');

    this._presenter = new LoginPresenter({
      showMessage: (msg, type = 'error') => {
        messageEl.textContent = msg;
        messageEl.className = `form-message ${type}`;
      },
      onSuccess: () => {
        messageEl.className = 'form-message success';
        messageEl.textContent = 'Login berhasil! Mengarahkan...';
        setTimeout(() => {
          window.location.hash = '#/';
        }, 1500);
      },
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const userData = {
        email: form.email.value.trim(),
        password: form.password.value.trim(),
      };
      this._presenter.handleFormSubmit(userData);
    });
  }
}
