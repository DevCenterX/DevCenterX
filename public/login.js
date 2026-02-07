// Firebase Login Handler
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
  // Verificar si el usuario ya está autenticado
  const auth = getAuth();
  
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Usuario está autenticado, guardar datos en localStorage
      localStorage.setItem('devcenter_user_id', user.uid);
      localStorage.setItem('devcenter_email', user.email);
      localStorage.setItem('devcenter_user', user.displayName || user.email.split('@')[0]);
      localStorage.setItem('devcenter_login_time', new Date().toISOString());
      localStorage.setItem('devcenter_session_active', 'true');
      if (user.photoURL) {
        localStorage.setItem('devcenter_avatar', user.photoURL);
      }
      // Redirigir a index si no estamos en formularios de auth
      if (!window.location.hash.includes('login') && !window.location.hash.includes('create')) {
        window.location.href = '/index.html';
    } else {
      // No hay usuario autenticado
      localStorage.setItem('devcenter_session_active', 'false');
      localStorage.removeItem('devcenter_user_id');
      localStorage.removeItem('devcenter_user');
      localStorage.removeItem('devcenter_email');
      localStorage.removeItem('devcenter_login_time');
    }
  });

  const themeToggle = document.getElementById('themeToggle');
  
  // Theme toggle
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = localStorage.getItem('theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      
      if (newTheme === 'light') {
        document.documentElement.classList.add('theme-light');
      } else {
        document.documentElement.classList.remove('theme-light');
      }
    });
  }

  // Initialize theme from localStorage
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  if (savedTheme === 'light') {
    document.documentElement.classList.add('theme-light');
  }
});

// Logout handler con Firebase
function handleLogout() {
  const auth = getAuth();
  signOut(auth).then(() => {
    localStorage.removeItem('devcenter_user');
    localStorage.removeItem('devcenter_user_id');
    localStorage.removeItem('devcenter_email');
    localStorage.removeItem('devcenter_demo_mode');
    localStorage.removeItem('devcenter_login_time');
    localStorage.removeItem('devcenter_avatar');
    window.location.href = '/index.html';
  }).catch((error) => {
    console.error('Error al cerrar sesión:', error);
  });
}
