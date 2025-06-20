export function setupLogoutButton() {
    const logoutBtn = document.querySelector('#logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        alert('Logout berhasil!');
        window.location.hash = '#/login';
      });
    }
  }
  