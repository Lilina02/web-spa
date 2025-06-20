const API_BASE_URL = 'https://story-api.dicoding.dev/v1';

const Api = {
  // Ambil token dari localStorage
  _getToken() {
    return localStorage.getItem('token');
  },

  // Simpan token ke localStorage
  _setToken(token) {
    localStorage.setItem('token', token);
  },

  // Hapus token dari localStorage
  logout() {
    localStorage.removeItem('token');
  },

  async register({ name, email, password }) {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const result = await response.json();
    if (!response.ok || result.error) {
      throw new Error(result.message || 'Registrasi gagal.');
    }
    return result;
  },

  async login({ email, password }) {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();
    if (!response.ok || result.error) {
      throw new Error(result.message || 'Login gagal.');
    }

    const token = result.loginResult.token;
    this._setToken(token); // simpan ke localStorage
    return result;
  },

  async getStories() {
    const token = this._getToken();

    if (!token) {
      throw new Error('Anda harus login terlebih dahulu.');
    }

    const response = await fetch(`${API_BASE_URL}/stories`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      throw new Error(result.message || 'Gagal mengambil cerita.');
    }

    return result.listStory || [];
  },

  async addStory({ description, photo, lat, lon }) {
    const token = this._getToken();

    if (!token) {
      throw new Error('Anda harus login terlebih dahulu.');
    }

    // FormData untuk upload file dan data lain
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photo);
    if (lat) formData.append('lat', lat);
    if (lon) formData.append('lon', lon);

    const response = await fetch(`${API_BASE_URL}/stories`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // Jangan set 'Content-Type' secara manual saat pakai FormData, browser akan atur otomatis
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      throw new Error(result.message || 'Gagal mengirim cerita.');
    }

    return result;
  }
};

export default Api;
