import '../styles/styles.css';
import App from './pages/app.js';
import PushNotificationHelper from './utils/push-notification-helper.js';
import { VAPID_PUBLIC_KEY } from './config.js';

// Global state management
const AppState = {
  isOnline: navigator.onLine,
  isServiceWorkerRegistered: false,
  isPushNotificationEnabled: false,
  currentUser: null
};

// Authentication functions
function logout() {
  try {
    // Clear all user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    
    // Update app state
    AppState.currentUser = null;
    AppState.isPushNotificationEnabled = false;
    
    // Navigate to login
    window.location.hash = '#/login';
    updateNav();
    
    // Show logout notification
    showNotification('Logout Berhasil', 'Anda telah keluar dari aplikasi', 'success');
    
    console.log('✅ Logout berhasil');
  } catch (error) {
    console.error('❌ Error saat logout:', error);
    showNotification('Error', 'Terjadi kesalahan saat logout', 'error');
  }
}

function updateNav() {
  const token = localStorage.getItem('token');
  const loginLink = document.getElementById('login-link');
  const logoutButton = document.getElementById('logout-button');
  const userProfile = document.getElementById('user-profile');

  if (token) {
    // User is logged in
    if (loginLink) loginLink.style.display = 'none';
    if (logoutButton) logoutButton.style.display = 'inline-block';
    
    // Show user profile if available
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (userProfile && user.name) {
      userProfile.textContent = user.name;
      userProfile.style.display = 'inline-block';
    }
    
    AppState.currentUser = user;
  } else {
    // User is not logged in
    if (loginLink) loginLink.style.display = 'inline-block';
    if (logoutButton) logoutButton.style.display = 'none';
    if (userProfile) userProfile.style.display = 'none';
    
    AppState.currentUser = null;
  }
}

// Enhanced push notification initialization
async function initPushNotif() {
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('⚠️ Token tidak tersedia, skip push notification');
    return;
  }

  // Check browser support
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    console.warn('⚠️ Browser tidak mendukung push notification');
    return;
  }

  try {
    console.log('🔔 Menginisialisasi push notification...');
    
    // Wait for service worker to be ready
    await waitForServiceWorker();
    
    // Request permission
    const permissionGranted = await PushNotificationHelper.requestPermission();
    if (!permissionGranted) {
      console.warn('⚠️ Permission push notification ditolak');
      return;
    }

    // Get service worker registration
    const registration = await PushNotificationHelper.register();
    if (!registration) {
      throw new Error('Service worker registration tidak tersedia');
    }

    // Clean up old subscription
    try {
      await PushNotificationHelper.unsubscribeUserFromPush();
      console.log('🧹 Subscription lama berhasil dihapus');
    } catch (error) {
      console.warn('⚠️ Tidak ada subscription lama atau gagal menghapus:', error.message);
    }

    // Subscribe to push notifications
    await PushNotificationHelper.subscribeUserToPush(registration, VAPID_PUBLIC_KEY, token);

    // Update app state
    AppState.isPushNotificationEnabled = true;
    
    // Show success notification
    showLocalNotification('Push Notification Aktif', {
      body: 'Anda akan menerima notifikasi untuk update terbaru',
      icon: '/icons/icon-192x192.png',
      tag: 'push-init-success'
    });

    console.log('✅ Push notification berhasil diaktifkan');
  } catch (error) {
    console.error('❌ Gagal mengaktifkan push notification:', error);
    AppState.isPushNotificationEnabled = false;
    
    // Show error notification based on error type
    if (error.message.includes('permission') || error.message.includes('Permission')) {
      showNotification('Permission Diperlukan', 
        'Aktifkan notifikasi di pengaturan browser untuk mendapatkan update terbaru', 
        'warning');
    } else {
      showNotification('Push Notification Error', 
        'Gagal mengaktifkan push notification. Coba lagi nanti.', 
        'error');
    }
  }
}

// Service Worker registration with better error handling
async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('⚠️ Service Worker tidak didukung di browser ini');
    return null;
  }

  try {
    console.log('🔧 Mendaftarkan Service Worker...');
    
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/'
    });

    console.log('✅ Service Worker terdaftar:', registration.scope);
    AppState.isServiceWorkerRegistered = true;

    // Handle service worker updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      console.log('🔄 Service Worker sedang diperbarui...');
      
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            console.log('✅ Service Worker berhasil diperbarui');
            showNotification('App Diperbarui', 
              'Aplikasi telah diperbarui dengan fitur terbaru!', 
              'info');
          } else {
            console.log('✅ Service Worker berhasil diinstal untuk pertama kali');
          }
        }
      });
    });

    return registration;
  } catch (error) {
    console.error('❌ Gagal mendaftarkan Service Worker:', error);
    AppState.isServiceWorkerRegistered = false;
    return null;
  }
}

// Wait for service worker to be ready
async function waitForServiceWorker(timeout = 10000) {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Worker tidak didukung');
  }

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Timeout menunggu Service Worker'));
    }, timeout);

    navigator.serviceWorker.ready.then((registration) => {
      clearTimeout(timeoutId);
      resolve(registration);
    }).catch((error) => {
      clearTimeout(timeoutId);
      reject(error);
    });
  });
}

// Enhanced notification system
function showNotification(title, message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <h4>${title}</h4>
      <p>${message}</p>
    </div>
    <button class="notification-close">&times;</button>
  `;

  // Add to page
  const container = getOrCreateNotificationContainer();
  container.appendChild(notification);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 5000);

  // Manual close
  notification.querySelector('.notification-close').addEventListener('click', () => {
    notification.remove();
  });
}

function showLocalNotification(title, options = {}) {
  if ('Notification' in window && Notification.permission === 'granted') {
    return new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      requireInteraction: false,
      ...options
    });
  }
  return null;
}

function getOrCreateNotificationContainer() {
  let container = document.getElementById('notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'notification-container';
    document.body.appendChild(container);
  }
  return container;
}

// Network status handling
function handleOnlineStatus() {
  window.addEventListener('online', () => {
    console.log('🌐 Aplikasi kembali online');
    AppState.isOnline = true;
    showNotification('Kembali Online', 'Koneksi internet telah pulih', 'success');
    showLocalNotification('Kembali Online', {
      body: 'Koneksi internet telah pulih',
      tag: 'network-status'
    });
  });

  window.addEventListener('offline', () => {
    console.log('📱 Aplikasi sedang offline');
    AppState.isOnline = false;
    showNotification('Mode Offline', 'Aplikasi berjalan dalam mode offline', 'warning');
    showLocalNotification('Mode Offline', {
      body: 'Beberapa fitur mungkin tidak tersedia',
      tag: 'network-status'
    });
  });
}

// Enhanced view transition
function setupViewTransitions() {
  if (!document.startViewTransition) {
    console.log('⚠️ View Transition API tidak didukung');
    return;
  }

  // Handle all internal navigation links
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;

    event.preventDefault();
    const href = link.getAttribute('href');
    
    document.startViewTransition(() => {
      window.location.hash = href;
    });
  });
}

// Enhanced skip link functionality
function setupAccessibility() {
  const skipLink = document.querySelector('.skip-link');
  const mainContent = document.querySelector('#main-content');
  
  if (skipLink && mainContent) {
    skipLink.addEventListener('click', (event) => {
      event.preventDefault();
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Add keyboard navigation for drawer
  const drawerButton = document.querySelector('#drawer-button');
  const navigationDrawer = document.querySelector('#navigation-drawer');
  
  if (drawerButton && navigationDrawer) {
    drawerButton.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        drawerButton.click();
      }
    });
  }
}

// Error boundary for the app
function setupErrorHandling() {
  window.addEventListener('error', (event) => {
    console.error('❌ Global error:', event.error);
    showNotification('Terjadi Kesalahan', 
      'Aplikasi mengalami kesalahan. Silakan refresh halaman.', 
      'error');
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Unhandled promise rejection:', event.reason);
    showNotification('Terjadi Kesalahan', 
      'Terjadi kesalahan jaringan. Periksa koneksi internet Anda.', 
      'error');
  });
}

// Main initialization
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('🚀 Menginisialisasi aplikasi...');

    // Setup error handling early
    setupErrorHandling();

    // Check required elements
    const contentEl = document.querySelector('#main-content');
    const drawerButtonEl = document.querySelector('#drawer-button');
    const navigationDrawerEl = document.querySelector('#navigation-drawer');

    if (!contentEl || !drawerButtonEl || !navigationDrawerEl) {
      throw new Error('Elemen utama untuk app tidak ditemukan!');
    }

    // Initialize app
    const app = new App({
      content: contentEl,
      drawerButton: drawerButtonEl,
      navigationDrawer: navigationDrawerEl,
    });

    // Render function with error handling
    const render = async () => {
      try {
        await app.renderPage();
      } catch (error) {
        console.error('❌ Gagal merender halaman:', error);
        contentEl.innerHTML = `
          <div class="error-container">
            <h2>Oops! Terjadi Kesalahan</h2>
            <p>Gagal memuat halaman. Silakan coba lagi.</p>
            <button onclick="location.reload()" class="btn btn-primary">Muat Ulang</button>
          </div>
        `;
        showNotification('Error', 'Gagal memuat halaman', 'error');
      }
    };

    // Initial render and setup navigation
    await render();
    window.addEventListener('hashchange', render);

    // Setup authentication
    updateNav();
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', logout);
    }

    // Setup accessibility features
    setupAccessibility();

    // Setup view transitions
    setupViewTransitions();

    // Handle network status
    handleOnlineStatus();

    // Register service worker
    await registerServiceWorker();

    // Initialize push notifications (with delay to ensure SW is ready)
    setTimeout(async () => {
      await initPushNotif();
    }, 1000);

    console.log('✅ Aplikasi berhasil diinisialisasi');
    console.log('📊 App State:', AppState);
    
  } catch (error) {
    console.error('❌ Gagal menginisialisasi aplikasi:', error);
    document.body.innerHTML = `
      <div class="app-error">
        <h1>Gagal Memuat Aplikasi</h1>
        <p>Terjadi kesalahan fatal saat memuat aplikasi.</p>
        <button onclick="location.reload()">Coba Lagi</button>
      </div>
    `;
  }
});

// Export utilities for debugging
window.appDebug = {
  state: AppState,
  logout,
  updateNav,
  initPushNotif,
  showNotification,
  showLocalNotification
};