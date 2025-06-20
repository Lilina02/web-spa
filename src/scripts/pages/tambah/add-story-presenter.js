import Api from '../../data/api';

export default class AddStoryPresenter {
  constructor(view) {
    this.view = view;
  }

  // Mendapatkan posisi geografis pengguna (dengan Promise)
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation tidak didukung oleh browser.'));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            reject(new Error(error.message));
          }
        );
      }
    });
  }

  // Submit cerita ke API
  async submitStory({ description, photo, lat, lon }) {
    if (!description) {
      throw new Error('Deskripsi tidak boleh kosong.');
    }
    if (!photo) {
      throw new Error('Foto harus diunggah atau diambil dari kamera.');
    }
    if (!lat || !lon) {
      throw new Error('Lokasi harus dipilih.');
    }

    try {
      this.view.showLoading();

      await Api.addStory({
        description,
        photo,
        lat,
        lon,
      });

      this.view.showSuccess('Cerita berhasil dikirim!');
    } catch (error) {
      this.view.showError(error.message);
      throw error;
    }
  }
}
