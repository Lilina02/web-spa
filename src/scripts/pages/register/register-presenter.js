import Api from '../../data/api.js';

export default class RegisterPresenter {
  constructor({ showMessage, onSuccess }) {
    this._showMessage = showMessage;
    this._onSuccess = onSuccess;
  }

  async handleFormSubmit({ name, email, password }) {
    if (!name || !email || password.length < 6) {
      this._showMessage('Isi semua field dengan benar. Password minimal 6 karakter.', 'error');
      return;
    }

    this._showMessage('Mendaftarkan akun...', 'info');

    try {
      await Api.register({ name, email, password });  // Panggil Api.register di sini
      this._onSuccess();
    } catch (error) {
      this._showMessage(error.message, 'error');
    }
  }
}
