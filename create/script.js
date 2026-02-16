// ============================================
// CREATE ACCOUNT PAGE - Firebase Authentication
// ============================================

console.log('[CREATE] 🚀 Script loading');

// State variables
let firebaseReady = false;
let auth = null;
let db = null;
let uiElementsReady = false;
let eventListenersReady = false;
let pageFullyReady = false;
let firebaseInitStartTime = Date.now();
let uiInitialized_script = false;
let eventListenersAttached = false;
let initAttempts = 0;

console.log('[CREATE] 📋 State initialized');

// Notification System
const NotificationSystem = (() => {
  const container = document.getElementById('notificationContainer');
  return {
    show(msg, type = 'info', dur = 4000) {
      console.log(`[CREATE] 💬 ${type}: ${msg}`);
      if (!container) return;
      const notification = document.createElement('div');
      notification.className = `notification notification-${type}`;
      const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
      notification.innerHTML = `<span class="notification-icon">${icons[type] || '•'}</span><span>${msg}</span><button class="notification-close">×</button>`;
      container.appendChild(notification);
      const closeBtn = notification.querySelector('.notification-close');
      const remove = () => { notification.classList.add('removing'); setTimeout(() => notification.remove(), 300); };
      closeBtn?.addEventListener('click', remove);
      if (dur > 0) setTimeout(remove, dur);
      return notification;
    },
    success(m, d) { return this.show(m, 'success', d); },
    error(m, d) { return this.show(m, 'error', d || 5000); },
    info(m, d) { return this.show(m, 'info', d); },
    warning(m, d) { return this.show(m, 'warning', d); }
  };
})();

// Ready Check
function checkPageReady() {
  if (firebaseReady && uiElementsReady && eventListenersReady && !pageFullyReady) {
    pageFullyReady = true;
    console.log('[CREATE] 🎉 PAGE READY!');
    window.pageFullyReady = true;
    if (window.hideLoadingAndShowContent) {
      window.hideLoadingAndShowContent('all-systems-ready');
    }
  }
  return firebaseReady && uiElementsReady && eventListenersReady;
}


// Firebase Init
console.log('[CREATE] ⏱️ Firebase init start');
(async () => {
  try {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js");
    const { getAuth, setPersistence, browserLocalPersistence } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js");
    const { getFirestore } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js");

    const app = initializeApp({
      apiKey: "AIzaSyCsgsrFZ_nTMrtK69f6815I0Hcc1kTASHY",
      authDomain: "devcenter-agent-48c86.firebaseapp.com",
      projectId: "devcenter-agent-48c86",
      storageBucket: "devcenter-agent-48c86.firebasestorage.app",
      messagingSenderId: "911929994293",
      appId: "1:911929994293:web:1d08f68b4c507ee162557c",
      measurementId: "G-S5GTYBRVK8"
    });

    auth = getAuth(app);
    db = getFirestore(app);
    await setPersistence(auth, browserLocalPersistence);
    
    firebaseReady = true;
    console.log('[CREATE] ✅ Firebase ready (' + (Date.now() - firebaseInitStartTime) + 'ms)');
    checkPageReady();
  } catch (error) {
    console.error('[CREATE] ❌ Firebase error:', error.message);
    NotificationSystem.error('Error cargando autenticación');
  }
})();

// Helpers
async function saveUserData(user, provider) {
  if (!user || !db) return;
  try {
    const { doc, setDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js");
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email || '',
      username: user.displayName || user.email?.split('@')[0] || 'user',
      avatar: user.photoURL || '',
      provider: provider,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      plan: 'Normal',
      limit: '0'
    });
    localStorage.setItem('devcenter_user_id', user.uid);
    localStorage.setItem('devcenter_isLoggedIn', 'true');
    localStorage.setItem('devcenter_user_name', user.displayName || user.email?.split('@')[0] || 'Usuario');
    console.log('[CREATE] ✅ User saved');
  } catch (error) {
    console.error('[CREATE] ❌ Save error:', error);
  }
}

function handleAuthError(error) {
  const msgs = {
    'auth/email-already-in-use': 'Email ya registrado',
    'auth/weak-password': 'Contraseña muy corta',
    'auth/invalid-email': 'Email inválido',
    'auth/network-request-failed': 'Error de conexión',
  };
  NotificationSystem.error(msgs[error.code] || error.message);
}

function setButtonLoading(btn, loading) {
  if (loading) {
    btn.disabled = true;
    btn.classList.add('loading');
    btn.dataset.originalText = btn.innerText;
  } else {
    btn.disabled = false;
    btn.classList.remove('loading');
    if (btn.dataset.originalText) btn.innerText = btn.dataset.originalText;
  }
}


// Event Listeners
function attachEventListeners() {
  if (eventListenersAttached) return;
  eventListenersAttached = true;
  console.log('[CREATE] 🔗 Attaching listeners...');
  
  const emailBtn = document.querySelector('.email-auth-option');
  const form = document.querySelector('.split-auth-form');
  const googleBtn = document.querySelectorAll('.social-auth-btn')[0];
  const githubBtn = document.querySelectorAll('.social-auth-btn')[1];
  const backBtn = document.querySelector('.split-auth-back');

  // Email toggle
  if (emailBtn && form) {
    emailBtn.addEventListener('click', function() {
      form.style.display = form.style.display === 'none' ? 'block' : 'none';
      emailBtn.style.display = form.style.display === 'none' ? 'flex' : 'none';
    });
  }

  // Password visibility
  document.querySelectorAll('.password-toggle-btn').forEach((btn) => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const input = this.parentElement.querySelector('input');
      const eyeOpen = this.querySelector('.eye-open');
      const eyeClosed = this.querySelector('.eye-closed');
      if (input.type === 'password') {
        input.type = 'text';
        eyeOpen.style.display = 'none';
        eyeClosed.style.display = 'block';
      } else {
        input.type = 'password';
        eyeOpen.style.display = 'block';
        eyeClosed.style.display = 'none';
      }
    });
  });

  // Email register
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      if (!firebaseReady || !auth) {
        NotificationSystem.error('Sistema no cargado');
        return;
      }
      const email = form.querySelector('#email')?.value.trim();
      const pwd = form.querySelector('#password')?.value;
      const pwdConfirm = form.querySelector('#confirm-password')?.value;
      const btn = form.querySelector('button[type="submit"]');
      
      if (!email || !pwd) { NotificationSystem.warning('Completa campos'); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { NotificationSystem.error('Email inválido'); return; }
      if (pwd.length < 6) { NotificationSystem.error('Contraseña muy corta'); return; }
      if (pwdConfirm && pwd !== pwdConfirm) { NotificationSystem.error('No coinciden'); return; }
      
      try {
        setButtonLoading(btn, true);
        const { createUserWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js");
        const result = await createUserWithEmailAndPassword(auth, email, pwd);
        await saveUserData(result.user, 'email');
        NotificationSystem.success('¡Creada!');
        setTimeout(() => window.location.href = '/', 800);
      } catch (error) {
        handleAuthError(error);
        setButtonLoading(btn, false);
      }
    });
  }

  // Google
  if (googleBtn) {
    googleBtn.addEventListener('click', async function() {
      if (!checkPageReady()) { NotificationSystem.error('Cargando...'); return; }
      try {
        setButtonLoading(googleBtn, true);
        const { signInWithPopup, GoogleAuthProvider } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js");
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await signInWithPopup(auth, provider);
        await saveUserData(result.user, 'google');
        NotificationSystem.success('¡Creada!');
        setTimeout(() => window.location.href = '/', 800);
      } catch (error) {
        if (error.code !== 'auth/popup-blocked') handleAuthError(error);
        setButtonLoading(googleBtn, false);
      }
    });
  }

  // GitHub
  if (githubBtn) {
    githubBtn.addEventListener('click', async function() {
      if (!checkPageReady()) { NotificationSystem.error('Cargando...'); return; }
      try {
        setButtonLoading(githubBtn, true);
        const { signInWithPopup, GithubAuthProvider } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js");
        const provider = new GithubAuthProvider();
        provider.setCustomParameters({ prompt: 'login' });
        const result = await signInWithPopup(auth, provider);
        await saveUserData(result.user, 'github');
        NotificationSystem.success('¡Creada!');
        setTimeout(() => window.location.href = '/', 800);
      } catch (error) {
        if (error.code !== 'auth/popup-blocked') handleAuthError(error);
        setButtonLoading(githubBtn, false);
      }
    });
  }

  // Back
  if (backBtn) {
    backBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = '/agent.html';
    });
  }
  
  eventListenersReady = true;
  console.log('[CREATE] ✅ Listeners ready');
  checkPageReady();
}

// UI Init
function initializeUI() {
  initAttempts++;
  if (uiInitialized_script) return;
  
  const emailBtn = document.querySelector('.email-auth-option');
  const form = document.querySelector('.split-auth-form');
  const googleBtn = document.querySelectorAll('.social-auth-btn')[0];
  const githubBtn = document.querySelectorAll('.social-auth-btn')[1];
  
  if (!emailBtn && !form && !googleBtn && !githubBtn) {
    console.log('[CREATE] ⏳ Elements not ready');
    setTimeout(initializeUI, 100);
    return;
  }
  
  uiInitialized_script = true;
  [emailBtn, googleBtn, githubBtn].forEach((btn) => {
    if (btn) {
      btn.style.pointerEvents = 'auto';
      btn.style.cursor = 'pointer';
    }
  });
  
  uiElementsReady = true;
  console.log('[CREATE] 🎨 UI ready');
  
  attachEventListeners();
  checkPageReady();
}

// Init
window.reinitializeUI = initializeUI;
console.log('[CREATE] 🌐 exposed');

console.log('[CREATE] 🚀 Attempting init (DOM: ' + document.readyState + ')');
initializeUI();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[CREATE] ✅ DOMContentLoaded');
    setTimeout(initializeUI, 50);
  });
}

console.log('[CREATE] 🔄 Aggressive retries...');
for (let i = 1; i <= 20; i++) {
  setTimeout(() => {
    if (!pageFullyReady) {
      const ready = checkPageReady();
      if (i <= 5 || i % 5 === 0) {
        console.log(`[CREATE] ⏱️ Retry #${i} (${i}00ms): ${ready ? '✅' : '⏳'}`);
      }
      if (!ready) initializeUI();
    }
  }, i * 100);
}

console.log('[CREATE] 📊 Monitoring indefinitely (NO TIMEOUT)...');
let mon = 0;
const monInt = setInterval(() => {
  mon++;
  if (mon % 5 === 0) {
    console.log(`[CREATE] 📊 Mon #${mon}: FB=${firebaseReady} UI=${uiElementsReady} L=${eventListenersReady} READY=${pageFullyReady}`);
  }
  if (pageFullyReady) {
    clearInterval(monInt);
    console.log('[CREATE] ✅✅✅ PAGE FULLY READY - Stopping monitor after ' + (mon * 100) + 'ms');
  }
}, 100);

// NO TIMEOUT - Let monitoring continue indefinitely
console.log('[CREATE] 🔄 Will keep monitoring until pageFullyReady=true (NO MAXIMUM TIME LIMIT)');

console.log('[CREATE] ✅ Loaded!');
