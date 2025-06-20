const BASE_URL = 'https://story-api.dicoding.dev/v1';

const StoryApi = {
  getToken() {
    return localStorage.getItem('token');
  },

  async getAllStoriesWithLocation() {
    const token = this.getToken();
    if (!token) throw new Error('Token tidak ditemukan. Harap login terlebih dahulu.');

    const response = await fetch(`${BASE_URL}/stories?location=1`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Gagal ambil data cerita');
    }

    return result.listStory;
  },

  // ✅ Fungsi tambahan untuk akses publik tanpa token
  async getAllStoriesWithLocationPublic() {
    const response = await fetch(`${BASE_URL}/stories?location=1`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Gagal ambil data cerita (publik)');
    }

    return result.listStory;
  },

  async postNewStory({ description, photo, lat, lon }) {
    const token = this.getToken();
    if (!token) throw new Error('Token tidak ditemukan. Harap login terlebih dahulu.');

    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photo);
    if (lat && lon) {
      formData.append('lat', lat);
      formData.append('lon', lon);
    }

    const response = await fetch(`${BASE_URL}/stories`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Gagal mengirim cerita');
    }

    return result;
  },
};

export default StoryApi;
