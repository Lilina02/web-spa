import Api from '../../data/api.js';

export default class LoginPresenter {
  constructor({ showMessage, onSuccess }) {
    this._showMessage = showMessage;
    this._onSuccess = onSuccess;
  }

  async handleFormSubmit({ email, password }) {
    if (!email || !password) {
      this._showMessage('Email dan password wajib diisi.', 'error');
      return;
    }

    this._showMessage('Sedang login...', 'info');

    try {
      const result = await Api.login({ email, password });
      localStorage.setItem('token', result.loginResult.token);
      this._onSuccess();
    } catch (error) {
      this._showMessage(error.message, 'error');
    }
  }
}
