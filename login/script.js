// ============================================
// LOGIN PAGE - Firebase Authentication + Onboarding
// ============================================

// ===== STATE VARIABLES =====
let firebaseReady = false;
let uiElementsReady = false;
let eventListenersReady = false;
let pageFullyReady = false;

let auth = null;
let db = null;
let uiInitialized_script = false;
let eventListenersAttached = false;
let currentUser = null;
let authProvider = null;

// Cloudinary config
const CLOUDINARY_NAME = 'duybqkv24';
const CLOUDINARY_UPLOAD_PRESET = 'devcenter_profile';

// ===== NOTIFICATION SYSTEM =====
const NotificationSystem = (() => {
  const container = document.getElementById('notificationContainer');
  return {
    show(msg, type = 'info', dur = 4000) {
      console.log(`[LOGIN] 💬 ${type}: ${msg}`);
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

// ===== CHECK PAGE READY =====
function checkPageReady() {
  const allReady = firebaseReady && uiElementsReady && eventListenersReady;
  
  if (allReady && !pageFullyReady) {
    pageFullyReady = true;
    window.pageFullyReady = true;
    if (window.hideLoadingAndShowContent) {
      window.hideLoadingAndShowContent('all-systems-ready');
    }
  }
  
  return allReady;
}

// ===== CLOUDINARY UPLOAD (Unsigned - Secure) =====
async function cloudinaryUpload(fileBlob, fileName) {
  try {
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/image/upload`;
    const form = new FormData();
    form.append('file', fileBlob, fileName || 'upload.png');
    form.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    form.append('folder', 'devcenter/profiles');

    const res = await fetch(url, { method: 'POST', body: form });
    
    if (!res.ok) {
      const errorData = await res.json();
      console.error('Cloudinary error:', errorData);
      throw new Error(`Upload failed: ${res.status}`);
    }
    
    const json = await res.json();
    return json?.secure_url || null;
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    throw err;
  }
}

// ===== ONBOARDING SYSTEM =====
async function showOnboardingModal(user, provider) {
  currentUser = user;
  authProvider = provider;
  
  const modal = document.createElement('div');
  modal.id = 'onboardingModal';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.7); display: flex; align-items: center;
    justify-content: center; z-index: 10000; backdrop-filter: blur(4px);
  `;
  
  const step1HTML = `
    <div style="background: #1a1f2e; border-radius: 12px; padding: 2rem; max-width: 500px; width: 90%; color: white; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
      <h2 style="margin-bottom: 1rem; font-size: 1.5rem;">Tu Foto de Perfil</h2>
      <p style="color: #b0b0b0; margin-bottom: 1.5rem;">Sube una foto o usaremos tu icono de proveedor</p>
      
      <div id="profilePreview" style="width: 120px; height: 120px; border-radius: 50%; margin: 1rem auto; overflow: hidden; background: #2a2f3e; display: flex; align-items: center; justify-content: center; border: 2px solid #0070f3;">
        ${provider === 'google' ? '<span style="font-size: 3rem;">🔵</span>' : 
          provider === 'github' ? '<span style="font-size: 3rem;">⬛</span>' : 
          '<span style="font-size: 3rem;">👤</span>'}
      </div>
      
      <input type="file" id="profileImageInput" accept="image/*" style="display: none;">
      <button onclick="document.getElementById('profileImageInput').click()" style="width: 100%; padding: 0.8rem; background: #0070f3; color: white; border: none; border-radius: 6px; cursor: pointer; margin-bottom: 0.5rem; font-weight: 500;">
        Elegir Foto
      </button>
      <p style="text-align: center; font-size: 0.9rem; color: #808080;">o continúa sin foto</p>
      
      <button id="nextStep1" style="width: 100%; padding: 0.8rem; background: rgba(0,112,243,0.1); color: #0070f3; border: 1px solid #0070f3; border-radius: 6px; cursor: pointer; margin-top: 1rem; font-weight: 500;">
        Continuar
      </button>
    </div>
  `;
  
  modal.innerHTML = step1HTML;
  document.body.appendChild(modal);
  
  const imageInput = document.getElementById('profileImageInput');
  imageInput.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await cloudinaryUpload(file, file.name);
        if (url) {
          currentUser.photoURL = url;
          document.getElementById('profilePreview').innerHTML = `<img src="${url}" style="width: 100%; height: 100%; object-fit: cover;">`;
          NotificationSystem.success('Foto cargada');
        }
      } catch (error) {
        NotificationSystem.error('Error al cargar foto');
      }
    }
  });
  
  document.getElementById('nextStep1').addEventListener('click', () => {
    showUsernameStep(modal);
  });
}

function showUsernameStep(modal) {
  modal.innerHTML = `
    <div style="background: #1a1f2e; border-radius: 12px; padding: 2rem; max-width: 500px; width: 90%; color: white; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
      <h2 style="margin-bottom: 1rem; font-size: 1.5rem;">Elige tu Nombre de Usuario</h2>
      <p style="color: #b0b0b0; margin-bottom: 1.5rem;">Este será tu nombre visible en DevCenterX</p>
      
      <input 
        type="text" 
        id="usernameInput" 
        placeholder="Tu nombre de usuario" 
        style="width: 100%; padding: 0.8rem; background: #2a2f3e; color: white; border: 1px solid #0070f3; border-radius: 6px; margin-bottom: 0.5rem; font-size: 1rem;"
      >
      <p id="usernameStatus" style="font-size: 0.9rem; color: #808080; min-height: 20px;"></p>
      
      <button id="finalizeBtn" disabled style="width: 100%; padding: 0.8rem; background: rgba(0,112,243,0.3); color: #0070f3; border: 1px solid #0070f3; border-radius: 6px; cursor: not-allowed; margin-top: 1rem; font-weight: 500;">
        Finalizar
      </button>
    </div>
  `;
  
  const usernameInput = document.getElementById('usernameInput');
  const finalizeBtn = document.getElementById('finalizeBtn');
  const statusText = document.getElementById('usernameStatus');
  
  usernameInput.addEventListener('input', async () => {
    const username = usernameInput.value.trim();
    
    if (!username) {
      finalizeBtn.disabled = true;
      finalizeBtn.style.background = 'rgba(0,112,243,0.3)';
      finalizeBtn.style.cursor = 'not-allowed';
      statusText.textContent = '';
      return;
    }
    
    if (username.length < 3) {
      statusText.textContent = '❌ Mínimo 3 caracteres';
      statusText.style.color = '#ff6b6b';
      finalizeBtn.disabled = true;
      return;
    }
    
    try {
      const { query, where, collection, getDocs } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js");
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username.toLowerCase()));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        statusText.textContent = '✅ Este nombre está disponible';
        statusText.style.color = '#51cf66';
        finalizeBtn.disabled = false;
        finalizeBtn.style.background = '#0070f3';
        finalizeBtn.style.cursor = 'pointer';
      } else {
        statusText.textContent = '❌ Este nombre ya existe';
        statusText.style.color = '#ff6b6b';
        finalizeBtn.disabled = true;
        finalizeBtn.style.background = 'rgba(0,112,243,0.3)';
      }
    } catch (error) {
      statusText.textContent = 'Error verificando nombre';
      statusText.style.color = '#ff6b6b';
    }
  });
  
  finalizeBtn.addEventListener('click', async () => {
    const username = usernameInput.value.trim().toLowerCase();
    await saveFinalUserData(username);
    modal.remove();
    NotificationSystem.success('¡Perfil completo!');
    setTimeout(() => { window.location.href = '/'; }, 800);
  });
}

async function saveFinalUserData(username) {
  if (!currentUser || !db) return;
  try {
    const { doc, setDoc, getDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js");
    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      await setDoc(userRef, { 
        username: username,
        avatar: currentUser.photoURL || '',
        updatedAt: serverTimestamp() 
      }, { merge: true });
    } else {
      await setDoc(userRef, {
        uid: currentUser.uid,
        email: currentUser.email || '',
        username: username,
        avatar: currentUser.photoURL || '',
        provider: authProvider,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        plan: 'free',
        limit: 'default'
      });
    }
    localStorage.setItem('devcenter_user_id', currentUser.uid);
    localStorage.setItem('devcenter_isLoggedIn', 'true');
  } catch (error) {
    console.error('User data save error:', error);
    NotificationSystem.error('Error al guardar perfil');
  }
}

// ===== HELPER FUNCTIONS =====
async function handleAuthSuccess(user, provider) {
  currentUser = user;
  authProvider = provider;
  NotificationSystem.success('Autenticación exitosa');
  showOnboardingModal(user, provider);
}

// ===== FIREBASE INITIALIZATION =====
(async () => {
  try {
    let firebaseApp, authModule, dbModule;
    let retries = 0;
    const maxRetries = 3;
    let lastError = null;
    
    while (retries < maxRetries) {
      try {
        retries++;
        
        const initRes = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js");
        firebaseApp = initRes.initializeApp;
        
        const authRes = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js");
        authModule = authRes;
        
        const dbRes = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js");
        dbModule = dbRes;
        
        const firebaseConfig = {
          apiKey: "AIzaSyCsgsrFZ_nTMrtK69f6815I0Hcc1kTASHY",
          authDomain: "devcenter-agent-48c86.firebaseapp.com",
          projectId: "devcenter-agent-48c86",
          storageBucket: "devcenter-agent-48c86.firebasestorage.app",
          messagingSenderId: "911929994293",
          appId: "1:911929994293:web:1d08f68b4c507ee162557c",
          measurementId: "G-S5GTYBRVK8"
        };
        
        const app = firebaseApp(firebaseConfig);
        auth = authModule.getAuth(app);
        db = dbModule.getFirestore(app);
        
        await authModule.setPersistence(auth, authModule.browserLocalPersistence);
        
        firebaseReady = true;
        checkPageReady();
        break;
        
      } catch (err) {
        lastError = err;
        console.error(`Firebase import attempt #${retries} failed:`, err.message);
        
        if (retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
    
    if (!auth || !db) {
      throw new Error(`Firebase not initialized after ${maxRetries} attempts. Last error: ${lastError?.message}`);
    }
    
  } catch (error) {
    console.error('Firebase initialization error:', error);
    NotificationSystem.error('Firebase error: ' + (error.message || 'Unknown'));
    firebaseReady = false;
  }
})();


// ===== HELPER FUNCTIONS =====
async function saveUserData(user, provider) {
  if (!user || !db) return;
  try {
    const { doc, setDoc, getDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js");
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      await setDoc(userRef, { updatedAt: serverTimestamp() }, { merge: true });
    } else {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || '',
        username: user.displayName || user.email?.split('@')[0] || 'user',
        avatar: user.photoURL || '',
        provider: provider,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        plan: 'free',
        limit: 'default'
      });
    }
    localStorage.setItem('devcenter_user_id', user.uid);
    localStorage.setItem('devcenter_isLoggedIn', 'true');
  } catch (error) {
    console.error('User data save error:', error);
  }
}

function handleAuthError(error) {
  const msgs = {
    'auth/user-not-found': 'Este email no está registrado',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/invalid-email': 'Email inválido',
    'auth/invalid-credential': 'Email o contraseña incorrectos',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
    'auth/popup-closed-by-user': 'Autenticación cancelada',
    'auth/network-request-failed': 'Error de conexión',
  };
  NotificationSystem.error(msgs[error.code] || error.message);
}

function setButtonLoading(btn, loading) {
  if (!btn) return;
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

// ===== ATTACH EVENT LISTENERS =====
function attachEventListeners() {
  if (eventListenersAttached) return;
  eventListenersAttached = true;
  
  try {
    const emailBtn = document.querySelector('.email-auth-option');
    const form = document.querySelector('.split-auth-form');
    const googleBtn = document.querySelectorAll('.social-auth-btn')[0];
    const githubBtn = document.querySelectorAll('.social-auth-btn')[1];
    const backBtn = document.querySelector('.split-auth-back');

    // Email toggle
    if (emailBtn && form) {
      emailBtn.addEventListener('click', function() {
        const isHidden = form.style.display === 'none' || form.style.display === '';
        form.style.display = isHidden ? 'block' : 'none';
        emailBtn.style.display = isHidden ? 'none' : 'flex';
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

    // Email login form
    if (form) {
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (!firebaseReady || !auth) {
          NotificationSystem.error('Sistema de autenticación no está cargado');
          return;
        }
        
        const email = form.querySelector('#email')?.value?.trim();
        const password = form.querySelector('#password')?.value;
        const submitBtn = form.querySelector('button[type="submit"]');
        
        if (!email || !password) { NotificationSystem.warning('Completa todos los campos'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { NotificationSystem.error('Email inválido'); return; }
        
        try {
          setButtonLoading(submitBtn, true);
          const { signInWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js");
          const result = await signInWithEmailAndPassword(auth, email, password);
          await handleAuthSuccess(result.user, 'email');
        } catch (error) {
          handleAuthError(error);
          setButtonLoading(submitBtn, false);
        }
      });
    }

    // Google auth
    if (googleBtn) {
      googleBtn.addEventListener('click', async function() {
        if (!firebaseReady || !auth) { 
          NotificationSystem.error('Sistema de autenticación no disponible'); 
          return; 
        }
        try {
          setButtonLoading(googleBtn, true);
          const { signInWithPopup, GoogleAuthProvider } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js");
          const provider = new GoogleAuthProvider();
          provider.setCustomParameters({ prompt: 'select_account' });
          const result = await signInWithPopup(auth, provider);
          await handleAuthSuccess(result.user, 'google');
        } catch (error) {
          console.error('Google Auth error:', error.code, error.message);
          if (error.code !== 'auth/popup-blocked') handleAuthError(error);
          setButtonLoading(googleBtn, false);
        }
      });
    }

    // GitHub auth
    if (githubBtn) {
      githubBtn.addEventListener('click', async function() {
        if (!firebaseReady || !auth) { 
          NotificationSystem.error('Sistema de autenticación no disponible'); 
          return; 
        }
        try {
          setButtonLoading(githubBtn, true);
          const { signInWithPopup, GithubAuthProvider } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js");
          const provider = new GithubAuthProvider();
          provider.setCustomParameters({ prompt: 'login' });
          const result = await signInWithPopup(auth, provider);
          await handleAuthSuccess(result.user, 'github');
        } catch (error) {
          console.error('GitHub Auth error:', error.code, error.message);
          if (error.code !== 'auth/popup-blocked') handleAuthError(error);
          setButtonLoading(githubBtn, false);
        }
      });
    }

    // Back button
    if (backBtn) {
      backBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = '/agent.html';
      });
    }

    eventListenersReady = true;
    checkPageReady();
    
  } catch (error) {
    console.error('Error attaching listeners:', error);
    eventListenersReady = false;
  }
}

// ===== INITIALIZE UI =====
function initializeUI() {
  if (uiInitialized_script) return;
  
  try {
    const emailBtn = document.querySelector('.email-auth-option');
    const form = document.querySelector('.split-auth-form');
    const googleBtn = document.querySelectorAll('.social-auth-btn')[0];
    const githubBtn = document.querySelectorAll('.social-auth-btn')[1];
    
    if (!emailBtn || !form || !googleBtn || !githubBtn) {
      return;
    }
    
    uiInitialized_script = true;
    
    [emailBtn, googleBtn, githubBtn].forEach((btn) => {
      if (btn) {
        btn.style.pointerEvents = 'auto';
        btn.style.cursor = 'pointer';
        btn.style.opacity = '1';
      }
    });
    
    uiElementsReady = true;
    attachEventListeners();
    checkPageReady();
    
  } catch (error) {
    console.error('Error initializing UI:', error);
    uiInitialized_script = false;
  }
}

// ===== MAIN INITIALIZATION =====
window.reinitializeUI = initializeUI;

// Wait for DOM to be fully ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      initializeUI();
    }, 50);
  });
} else {
  setTimeout(() => {
    initializeUI();
  }, 50);
}

// Aggressive retry loop
for (let i = 1; i <= 50; i++) {
  setTimeout(() => {
    if (!pageFullyReady && !uiInitialized_script) {
      initializeUI();
    }
  }, i * 50);
}

// Indefinite monitoring
let monitorCount = 0;
const monitor = setInterval(() => {
  monitorCount++;
  
  if (pageFullyReady) {
    clearInterval(monitor);
    console.log('===============================================');
    console.log('PAGE READY! Monitor stopped after ' + (monitorCount * 100) + 'ms');
    console.log('===============================================');
  }
}, 100);
