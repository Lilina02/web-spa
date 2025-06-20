import L from 'leaflet';
import AddStoryPresenter from './add-story-presenter.js';
import '../../../styles/add-story.css';

export default class AddStoryPage {
  constructor() {
    this.presenter = new AddStoryPresenter(this);

    this.mediaStream = null;
    this.capturedImageBlob = null;
    this.marker = null;
    this.map = null;
  }

  async render() {
    if (document.startViewTransition) {
      document.startViewTransition(() => {});
    }

    return `
      <main id="main-content" class="add-story-page">
        <a href="#main-content" class="skip-link">Lewati ke konten utama</a>
        <div class="container">
          <h1>Tambah Cerita</h1>
          <form id="form-tambah" class="form-tambah" enctype="multipart/form-data">
            <div class="form-group">
              <label for="description">Deskripsi</label>
              <textarea id="description" name="description" rows="4" required></textarea>
            </div>

            <div class="form-group">
              <label>Ambil Foto dari Kamera</label>
              <button type="button" id="start-camera" class="camera-button">Buka Kamera</button>
            </div>

            <div class="form-group">
              <label for="uploadPhoto">Atau Unggah Foto dari Galeri/File</label>
              <input type="file" id="uploadPhoto" name="uploadPhoto" accept="image/*" />
            </div>

            <div class="form-group">
              <label for="map">Pilih Lokasi</label>
              <div id="map" class="map-add"></div>
              <p>Latitude: <span id="latDisplay">-</span>, Longitude: <span id="lonDisplay">-</span></p>
            </div>

            <input type="hidden" id="lat" name="lat" />
            <input type="hidden" id="lon" name="lon" />

            <button type="submit" class="submit-button">Kirim Cerita</button>
            <p id="form-message" class="form-message" aria-live="polite"></p>
          </form>
        </div>

        <!-- Popup kamera -->
        <div id="camera-modal" class="camera-modal hidden">
          <video id="camera-preview" autoplay playsinline></video>
          <button id="capture-photo" class="capture-button" aria-label="Ambil Foto">📸</button>
          <button id="close-camera" class="close-button" aria-label="Tutup Kamera">✕</button>
        </div>
        <canvas id="camera-canvas" style="display:none;"></canvas>
      </main>
    `;
  }

  async afterRender() {
    this.cacheElements();
    this.bindEvents();
    this.initMap();
    await this.setCurrentLocation();
  }

  cacheElements() {
    this.form = document.querySelector('#form-tambah');
    this.messageEl = document.querySelector('#form-message');
    this.latInput = document.querySelector('#lat');
    this.lonInput = document.querySelector('#lon');
    this.latDisplay = document.querySelector('#latDisplay');
    this.lonDisplay = document.querySelector('#lonDisplay');
    this.uploadInput = document.querySelector('#uploadPhoto');

    this.startCameraBtn = document.querySelector('#start-camera');
    this.modal = document.querySelector('#camera-modal');
    this.video = document.querySelector('#camera-preview');
    this.canvas = document.querySelector('#camera-canvas');
    this.captureBtn = document.querySelector('#capture-photo');
    this.closeBtn = document.querySelector('#close-camera');
  }

  bindEvents() {
    this.startCameraBtn.addEventListener('click', () => this.openCamera());
    this.captureBtn.addEventListener('click', () => this.capturePhoto());
    this.closeBtn.addEventListener('click', () => this.closeCamera());
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  async openCamera() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.video.srcObject = this.mediaStream;
      this.modal.classList.remove('hidden');
    } catch (err) {
      alert('Tidak dapat mengakses kamera: ' + err.message);
    }
  }

  capturePhoto() {
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;
    this.canvas.getContext('2d').drawImage(this.video, 0, 0);

    this.canvas.toBlob((blob) => {
      this.capturedImageBlob = blob;
    }, 'image/jpeg');

    this.closeCamera();
  }

  closeCamera() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    this.modal.classList.add('hidden');
  }

  initMap() {
    this.map = L.map('map').setView([-2.5489, 118.0149], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    this.map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      this.setLocation(lat, lng);
    });
  }

  setLocation(lat, lng) {
    this.latInput.value = lat ?? '';
    this.lonInput.value = lng ?? '';
    this.latDisplay.textContent = (lat != null && !isNaN(lat)) ? lat.toFixed(5) : '-';
    this.lonDisplay.textContent = (lng != null && !isNaN(lng)) ? lng.toFixed(5) : '-';

    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else if (lat != null && lng != null) {
      this.marker = L.marker([lat, lng]).addTo(this.map);
    }
  }

  async setCurrentLocation() {
    try {
      const pos = await this.presenter.getCurrentPosition();
      this.map.setView([pos.latitude, pos.longitude], 13);
      this.setLocation(pos.latitude, pos.longitude);
    } catch (err) {
      console.warn('Lokasi tidak tersedia:', err.message);
    }
  }

  async handleSubmit(event) {
    event.preventDefault();

    const description = this.form.description.value.trim();
    const uploadFile = this.uploadInput.files[0];
    const photo = this.capturedImageBlob || uploadFile;
    const lat = parseFloat(this.latInput.value);
    const lon = parseFloat(this.lonInput.value);

    try {
      await this.presenter.submitStory({ description, photo, lat, lon });
      this.messageEl.textContent = 'Cerita berhasil dikirim! Mengarahkan ke halaman utama...';
      this.messageEl.className = 'form-message success';
      setTimeout(() => {
        window.location.hash = '/';
      }, 1500);
    } catch (error) {
      this.messageEl.textContent = 'Gagal mengirim cerita: ' + error.message;
      this.messageEl.className = 'form-message error';
    }
  }

  showLoading() {
    this.messageEl.textContent = 'Mengirim cerita...';
    this.messageEl.className = 'form-message';
  }

  showError(message) {
    this.messageEl.textContent = message;
    this.messageEl.className = 'form-message error';
  }

  showSuccess(message) {
    this.messageEl.textContent = message;
    this.messageEl.className = 'form-message success';
  }
}
