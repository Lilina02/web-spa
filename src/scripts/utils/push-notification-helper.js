// utils/push-notification-helper.js

const PushNotificationHelper = {
  // Method yang dipanggil di index.js baris 90
  async requestPermission() {
    try {
      console.log('🔔 Meminta permission untuk notifikasi...');
      
      // Check if notification is supported
      if (!('Notification' in window)) {
        console.warn('⚠️ Browser tidak mendukung notifikasi push');
        return false;
      }

      // Check current permission
      if (Notification.permission === 'granted') {
        console.log('✅ Permission notifikasi sudah diberikan sebelumnya');
        return true;
      }

      if (Notification.permission === 'denied') {
        console.warn('⚠️ Izin notifikasi telah ditolak sebelumnya');
        return false;
      }

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('✅ Permission notifikasi berhasil diberikan');
        return true;
      } else {
        console.warn('⚠️ Izin notifikasi ditolak oleh pengguna');
        return false;
      }
    } catch (error) {
      console.error('❌ Error saat meminta permission:', error);
      return false;
    }
  },

  // Method yang dipanggil di index.js baris 100
  async register() {
    try {
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker tidak didukung');
      }

      // Wait for service worker to be ready
      const registration = await navigator.serviceWorker.ready;
      console.log('✅ Service Worker registration obtained');
      return registration;
    } catch (error) {
      console.error('❌ Error getting service worker registration:', error);
      return null;
    }
  },

  // Method yang dipanggil di index.js baris 113
  async unsubscribeUserFromPush() {
    try {
      console.log('🧹 Unsubscribing dari push notifications...');

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        console.log('ℹ️ Tidak ada subscription aktif');
        return true;
      }

      // Unsubscribe from server first
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ endpoint: subscription.endpoint }),
          });

          if (!response.ok) {
            console.warn('⚠️ Gagal unsubscribe dari server, tapi lanjut unsubscribe lokal');
          } else {
            console.log('✅ Berhasil unsubscribe dari server');
          }
        } catch (error) {
          console.warn('⚠️ Error unsubscribe dari server:', error.message);
        }
      }

      // Unsubscribe locally
      const successful = await subscription.unsubscribe();
      
      if (successful) {
        console.log('✅ Berhasil unsubscribe dari push notifications');
      }

      return successful;
    } catch (error) {
      console.error('❌ Error unsubscribing from push:', error);
      throw error;
    }
  },

  // Method yang dipanggil di index.js baris 119
  async subscribeUserToPush(registration, vapidPublicKey, userToken) {
    try {
      console.log('🔔 Subscribing user to push notifications...');

      if (!registration) {
        throw new Error('Service Worker registration diperlukan');
      }

      if (!vapidPublicKey) {
        throw new Error('VAPID public key diperlukan');
      }

      if (!userToken) {
        throw new Error('User token diperlukan');
      }

      // Convert VAPID key to Uint8Array
      const applicationServerKey = this._urlBase64ToUint8Array(vapidPublicKey);

      // Subscribe to push manager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });

      console.log('✅ User berhasil di-subscribe ke browser push manager');

      // Send subscription to server
      await this._sendSubscriptionToServer(subscription, userToken);

      return subscription;
    } catch (error) {
      console.error('❌ Error subscribing to push:', error);
      throw error;
    }
  },

  // Helper method untuk mengirim subscription ke server
  async _sendSubscriptionToServer(subscription, userToken) {
    try {
      console.log('📤 Mengirim subscription ke server...');

      const pushPayload = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')))),
        },
      };

      const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(pushPayload),
      });

      if (!response.ok) {
        let message = 'Gagal melakukan subscribe notifikasi ke server.';
        try {
          const error = await response.json();
          message = error.message || message;
        } catch (_) {
          // If response is not JSON, use default message
        }
        throw new Error(message);
      }

      const result = await response.json();
      console.log('✅ Subscription berhasil dikirim ke server:', result);
      return result;
    } catch (error) {
      console.error('❌ Error mengirim subscription ke server:', error);
      // Don't throw here - subscription to push manager was successful
      // Server sync can be retried later
      console.warn('⚠️ Subscription ke browser berhasil, tapi gagal sync ke server');
    }
  },

  // Convert VAPID key from base64 to Uint8Array
  _urlBase64ToUint8Array(base64String) {
    try {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    } catch (error) {
      console.error('❌ Error converting VAPID key:', error);
      throw new Error('Invalid VAPID key format');
    }
  },

  // Check if push notifications are supported
  isSupported() {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  },

  // Get current subscription
  async getCurrentSubscription() {
    try {
      if (!this.isSupported()) return null;

      const registration = await navigator.serviceWorker.ready;
      return await registration.pushManager.getSubscription();
    } catch (error) {
      console.error('❌ Error getting current subscription:', error);
      return null;
    }
  },

  // Test notification
  showTestNotification(title = 'Test Notification', options = {}) {
    try {
      if (Notification.permission !== 'granted') {
        console.warn('⚠️ Permission belum diberikan untuk notifikasi');
        return false;
      }

      const notification = new Notification(title, {
        body: 'Push notification berfungsi dengan baik!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'test-notification',
        requireInteraction: false,
        ...options
      });

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      console.log('✅ Test notification berhasil ditampilkan');
      return true;
    } catch (error) {
      console.error('❌ Error showing test notification:', error);
      return false;
    }
  },

  // Get permission status
  getPermissionStatus() {
    if (!('Notification' in window)) {
      return 'not-supported';
    }
    return Notification.permission;
  }
};

export default PushNotificationHelper;