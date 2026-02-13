// Initial redirect if user is already logged in
(function() {
  const user = localStorage.getItem('devcenter_user');
  if (user) {
    window.location.href = '/';
  }
})();

// Landing page animation and prompt cycling
(function() {
  const promptData = [
    {
      app: 'una app',
      audience: 'duenos de mascotas',
      feature: 'planificar comidas y generar',
      feature2: 'listas de compras basadas en preferencias',
      feature3: 'alimenticias'
    },
    {
      app: 'una plataforma',
      audience: 'estudiantes universitarios',
      feature: 'organizar notas y crear',
      feature2: 'resumenes automaticos con',
      feature3: 'inteligencia artificial'
    },
    {
      app: 'un dashboard',
      audience: 'emprendedores',
      feature: 'gestionar finanzas y visualizar',
      feature2: 'metricas de negocio en',
      feature3: 'tiempo real'
    },
    {
      app: 'una aplicacion',
      audience: 'equipos remotos',
      feature: 'colaborar en proyectos y',
      feature2: 'automatizar tareas repetitivas',
      feature3: 'facilmente'
    }
  ];

  let currentIndex = 0;

  function animatePromptText() {
    const promptApp = document.getElementById('promptApp');
    const promptAudience = document.getElementById('promptAudience');
    const promptFeature = document.getElementById('promptFeature');
    const promptFeature2 = document.getElementById('promptFeature2');
    const promptFeature3 = document.getElementById('promptFeature3');

    if (!promptApp) return;

    const elements = [promptApp, promptAudience, promptFeature, promptFeature2, promptFeature3];
    elements.forEach(el => el.classList.add('fade-out'));

    setTimeout(() => {
      currentIndex = (currentIndex + 1) % promptData.length;
      const data = promptData[currentIndex];

      promptApp.textContent = data.app;
      promptAudience.textContent = data.audience;
      promptFeature.textContent = data.feature;
      promptFeature2.textContent = data.feature2;
      promptFeature3.textContent = data.feature3;

      elements.forEach(el => {
        el.classList.remove('fade-out');
        el.classList.add('fade-in');
      });

      setTimeout(() => {
        elements.forEach(el => el.classList.remove('fade-in'));
      }, 1500);
    }, 1200);
  }

  setInterval(animatePromptText, 8000);

  document.querySelectorAll('.prompt-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.prompt-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
    });
  });

  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const landingNav = document.querySelector('.landing-nav');
  if (mobileMenuBtn && landingNav) {
    mobileMenuBtn.addEventListener('click', () => {
      landingNav.classList.toggle('mobile-open');
      mobileMenuBtn.classList.toggle('active');
    });
  }
})();

// Firebase Module - Authentication and Firestore Integration
(function() {
  async function loadFirebase() {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js");
    const { getAnalytics } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-analytics.js");
    const {
      getAuth,
      signInWithEmailAndPassword,
      createUserWithEmailAndPassword,
      GoogleAuthProvider,
      GithubAuthProvider,
      signInWithPopup,
      updateProfile,
      onAuthStateChanged,
      fetchSignInMethodsForEmail,
      updatePassword
    } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js");
    const {
      getFirestore,
      doc,
      setDoc,
      getDoc,
      serverTimestamp,
      collection,
      query,
      where,
      getDocs
    } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js");

    const firebaseConfig = {
      apiKey: "AIzaSyCsgsrFZ_nTMrtK69f6815I0Hcc1kTASHY",
      authDomain: "devcenter-agent-48c86.firebaseapp.com",
      projectId: "devcenter-agent-48c86",
      storageBucket: "devcenter-agent-48c86.firebasestorage.app",
      messagingSenderId: "911929994293",
      appId: "1:911929994293:web:1d08f68b4c507ee162557c",
      measurementId: "G-S5GTYBRVK8"
    };

    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);
    const auth = getAuth(app);
    const db = getFirestore(app);

    window.firebaseApp = app;
    window.firebaseAnalytics = analytics;
    window.firebaseAuth = auth;
    window.firebaseDB = db;
    window.firebaseProviders = {
      google: new GoogleAuthProvider(),
      github: new GithubAuthProvider()
    };

    // Firestore helpers based on FIREBASE_SCHEMA.md
    
    // Buscar usuario por email
    async function findUserByEmail(email) {
      if (!email) return null;
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          return { uid: snapshot.docs[0].id, data: snapshot.docs[0].data() };
        }
      } catch (error) {
        console.error('Error buscando usuario por email:', error);
      }
      return null;
    }

    // Vincular nuevo proveedor a usuario existente
    async function linkProviderToExistingUser(existingUid, newUser, newProvider) {
      try {
        const userRef = doc(db, 'users', existingUid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) return null;
        
        const existing = userDoc.data();
        let providers = existing.provider || 'email';
        
        // Convertir a array si es string
        if (typeof providers === 'string') {
          providers = [providers];
        } else if (!Array.isArray(providers)) {
          providers = [newProvider];
        }
        
        // Agregar nuevo provider si no existe
        if (!providers.includes(newProvider)) {
          providers.push(newProvider);
        }
        
        // Actualizar el documento
        await setDoc(userRef, {
          ...existing,
          provider: providers,
          displayName: newUser.displayName || existing.displayName,
          avatar: newUser.photoURL || existing.avatar,
          updatedAt: serverTimestamp()
        }, { merge: true });
        
        return { uid: existingUid, providers };
      } catch (error) {
        console.error('Error vinculando proveedor:', error);
        return null;
      }
    }

    // Buscar usuario por username
    async function findUserByUsername(username) {
      if (!username) return null;
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', username));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          return { uid: snapshot.docs[0].id, data: snapshot.docs[0].data() };
        }
      } catch (error) {
        console.error('Error buscando usuario por username:', error);
      }
      return null;
    }

    // Cloudinary upload (uses provided credentials) - NOTE: embedding API secret client-side is insecure
    async function cloudinaryUpload(fileBlob, fileName) {
      try {
        const cloudName = 'duybqkv24';
        const apiKey = '445151322255556';
        const apiSecret = 'zOxNfHhz-K5E4vOPx2-34H_pJgI';
        const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

        const timestamp = Math.floor(Date.now() / 1000);
        const toSign = `timestamp=${timestamp}${apiSecret}`;

        const sigBuffer = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(toSign));
        const sigArray = Array.from(new Uint8Array(sigBuffer));
        const signature = sigArray.map(b => b.toString(16).padStart(2, '0')).join('');

        const form = new FormData();
        form.append('file', fileBlob, fileName || 'upload.png');
        form.append('api_key', apiKey);
        form.append('timestamp', String(timestamp));
        form.append('signature', signature);

        const res = await fetch(url, { method: 'POST', body: form });
        const json = await res.json();
        if (json && json.secure_url) return json.secure_url;
        console.error('Cloudinary upload failed', json);
        return null;
      } catch (err) {
        console.error('Cloudinary upload error', err);
        return null;
      }
    }

    // Onboarding modal flow: professional profile completion
    window.showOnboardingModal = async function(uid, email, provider, photoURL) {
      return new Promise(async (resolve, reject) => {
        try {
          let modal = document.getElementById('onboardingModal');
          if (!modal) {
            modal = document.createElement('div');
            modal.id = 'onboardingModal';
            modal.className = 'onboarding-modal-overlay';
            modal.innerHTML = `
              <div class="onboarding-modal">
                <div class="onboarding-header">
                  <h2>Completa tu perfil</h2>
                  <p class="onboarding-subtitle">Personaliza tu cuenta en segundos</p>
                </div>
                
                <div class="onboarding-content">
                  <div class="avatar-preview-section">
                    <div class="avatar-preview" id="avatarPreview"></div>
                    <div class="avatar-preview-actions">
                      <input id="avatarFile" type="file" accept="image/*" class="avatar-file-input" />
                      <label for="avatarFile" class="avatar-btn avatar-btn-upload" type="button">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        Subir
                      </label>
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="onboardUsername">Nombre de usuario</label>
                    <input id="onboardUsername" type="text" placeholder="tuusuario" autocomplete="off" />
                    <div id="usernameError" class="error-message"></div>
                  </div>
                </div>

                <div class="onboarding-footer">
                  <button id="onboardSaveBtn" class="btn-primary">Guardar Perfil</button>
                </div>
              </div>`;
            document.body.appendChild(modal);
          }

          const usernameInput = document.getElementById('onboardUsername');
          const usernameError = document.getElementById('usernameError');
          const fileInput = document.getElementById('avatarFile');
          const saveBtn = document.getElementById('onboardSaveBtn');
          const avatarPreview = document.getElementById('avatarPreview');

          modal.style.display = 'flex';

          let chosenAvatarUrl = photoURL || null;
          
          // Display initial avatar preview
          const updateAvatarPreview = () => {
            if (chosenAvatarUrl) {
              avatarPreview.innerHTML = `<img src="${chosenAvatarUrl}" alt="Avatar" class="avatar-img" />`;
            } else if (photoURL) {
              avatarPreview.innerHTML = `<img src="${photoURL}" alt="Avatar" class="avatar-img" />`;
            } else {
              const initials = email ? email.split('@')[0][0].toUpperCase() : 'U';
              const colors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
              const bgColor = colors[Math.floor(Math.random() * colors.length)];
              avatarPreview.innerHTML = `<div class="avatar-placeholder" style="background-color: ${bgColor}">${initials}</div>`;
            }
          };

          updateAvatarPreview();
          usernameInput.focus();

          // Automatic avatar generation removed: only provider photo or upload available.

          fileInput.onchange = async () => {
            if (fileInput.files && fileInput.files[0]) {
              const label = fileInput.nextElementSibling;
              label.disabled = true;
              label.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg> Subiendo...';
              try {
                const uploaded = await cloudinaryUpload(fileInput.files[0], fileInput.files[0].name);
                if (uploaded) {
                  chosenAvatarUrl = uploaded;
                  updateAvatarPreview();
                  label.classList.add('selected');
                  showAuthMessage('Avatar subido correctamente', 'success');
                }
              } catch (err) {
                console.error('File upload error:', err);
                showAuthMessage('Error al subir imagen', 'error');
              } finally {
                label.disabled = false;
                label.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Subir';
              }
            }
          };

          saveBtn.onclick = async () => {
            usernameError.style.display = 'none';
            const username = usernameInput.value.trim();
            
            if (!username) {
              usernameError.textContent = 'Por favor ingresa un nombre de usuario';
              usernameError.style.display = 'block';
              return;
            }
            
            if (username.length < 3) {
              usernameError.textContent = 'Mínimo 3 caracteres';
              usernameError.style.display = 'block';
              return;
            }

            saveBtn.disabled = true;
            saveBtn.textContent = 'Guardando...';

            try {
              const exists = await findUserByUsername(username);
              if (exists && exists.uid !== uid) {
                usernameError.textContent = 'Este usuario ya está en uso';
                usernameError.style.display = 'block';
                saveBtn.disabled = false;
                saveBtn.textContent = 'Guardar Perfil';
                return;
              }

              const userRef = doc(db, 'users', uid);
              const userDoc = await getDoc(userRef);
              const existing = userDoc.exists() ? userDoc.data() : {};
              let providers = Array.isArray(existing.provider) ? existing.provider : (existing.provider ? [existing.provider] : []);
              if (!providers.includes(provider)) providers.push(provider);

              const updated = {
                ...existing,
                uid: uid,
                username: username,
                email: existing.email || email,
                displayName: existing.displayName || username,
                provider: providers,
                avatar: chosenAvatarUrl || existing.avatar || '',
                updatedAt: serverTimestamp()
              };

              await setDoc(userRef, updated, { merge: true });
              modal.style.display = 'none';
              showAuthMessage('Perfil guardado correctamente', 'success');
              resolve(updated);
            } catch (err) {
              console.error('Onboarding save error:', err);
              let errorMsg = 'Error al guardar';
              if (err.message && err.message.includes('permission')) {
                errorMsg = 'Error de permisos. Revisa las reglas de Firestore.';
              }
              usernameError.textContent = errorMsg;
              usernameError.style.display = 'block';
              showAuthMessage(errorMsg, 'error');
            } finally {
              saveBtn.disabled = false;
              saveBtn.textContent = 'Guardar Perfil';
            }
          };
        } catch (err) {
          console.error('Onboarding error', err);
          reject(err);
        }
      });
    };

    // Crear o actualizar usuario
    async function createOrUpdateUserRecord(user, opts = {}) {
      if (!user || !user.uid) return null;
      const uid = user.uid;
      const userRef = doc(db, 'users', uid);
      const now = serverTimestamp();

      const existing = await getDoc(userRef);
      const username = user.displayName ? user.displayName.replace(/\s+/g, '') : (user.email ? user.email.split('@')[0] : uid);

      const data = {
        uid: uid,
        email: user.email || '',
        username: username,
        displayName: user.displayName || '',
        avatar: user.photoURL || '',
        provider: opts.provider || 'email',
        updatedAt: now,
        plan: opts.plan || 'free',
        limit: opts.limit || 0
      };

      if (!existing.exists()) {
        data.createdAt = now;
      }

      await setDoc(userRef, data, { merge: true });

      // ensure proyectos doc exists
      const proyectosRef = doc(db, 'proyectos', uid);
      const projExisting = await getDoc(proyectosRef);
      if (!projExisting.exists()) {
        await setDoc(proyectosRef, {
          uid: uid,
          proyectos: [],
          createdAt: now
        });
      }

      return data;
    }

    // expose simple helpers used by the non-module script
    window.firebaseAuthHelpers = {
      signInEmail: (email, password) => signInWithEmailAndPassword(auth, email, password),
      createEmail: async (email, password, displayName) => {
        // PASO 1: Verificar si el email ya tiene métodos de inicio en Firebase Auth
        try {
          const methods = await fetchSignInMethodsForEmail(auth, email);
          if (methods && methods.length > 0) {
            const error = new Error(`Este email ya está registrado con: ${methods.join(', ')}. Por favor inicia sesión con el método existente.`);
            error.code = 'auth/email-already-registered';
            throw error;
          }
        } catch (e) {
          // Si fetchSignInMethods falla por alguna razón, fail-safe: rethrow
          console.error('Error verificando métodos de inicio para el email', e);
          throw e;
        }

        // PASO 2: Email no existe en Auth, crear nuevo usuario en Firebase Auth
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
          try { await updateProfile(userCred.user, { displayName }); } catch (e) { /* ignore */ }
        }

        // PASO 3: Crear registros en Firestore y devolver datos creados
        let userData = null;
        try { userData = await createOrUpdateUserRecord(userCred.user, { provider: 'email' }); } catch (e) { console.error('firestore user create error', e); }
        return { user: userCred.user, userData };
      },
      signInWithProvider: async (providerName) => {
        try {
          // Use popup for provider sign-in
          const result = await signInWithPopup(auth, window.firebaseProviders[providerName]);
          const newUser = result.user;
          
          // Buscar si el email ya existe en otra cuenta
          const existingUser = await findUserByEmail(newUser.email);
          
          if (existingUser) {
            // El email ya existe, vincular el nuevo proveedor
            console.log(`📎 Vinculando ${providerName} a usuario existente`, existingUser.uid);
            await linkProviderToExistingUser(existingUser.uid, newUser, providerName);
            // Devolver los datos del usuario existente para mantener continuidad
            return {
              user: { ...newUser, uid: existingUser.uid },
              existingUserId: existingUser.uid,
              existingUserData: existingUser.data
            };
          } else {
            // Email no existe, crear nuevo usuario
            console.log(`✨ Creando nuevo usuario con ${providerName}`);
            const userData = await createOrUpdateUserRecord(newUser, { provider: providerName });
            // Invoke onboarding modal for the new user
            if (userData) {
              try {
                await window.showOnboardingModal(newUser.uid, newUser.email, providerName);
              } catch (e) {
                console.error('Onboarding modal error', e);
              }
            }
            return { user: newUser, userData };
          }
        } catch (error) {
          console.error(`Error en autenticación con ${providerName}:`, error);
          // Re-throw para que el código que llama a signInWithProvider pueda manejar el error
          throw error;
        }
      },
      createOrUpdateUserRecord,
      findUserByEmail,
      linkProviderToExistingUser
    };

    // Fire an event for pages waiting for Firebase
    window.dispatchEvent(new CustomEvent('firebaseReady', { detail: { helpers: window.firebaseAuthHelpers } }));
  }

  loadFirebase().catch(err => {
    console.error('Failed to load Firebase:', err);
  });
})();

// UI Helper Functions and Event Handlers
function waitForFirebase(callback, maxAttempts = 100) {
  if (window.firebaseAuthHelpers) {
    callback(window.firebaseAuthHelpers);
    return;
  }

  let resolved = false;
  const handleEvent = (e) => {
    if (!resolved) {
      resolved = true;
      window.removeEventListener('firebaseReady', handleEvent);
      callback(e.detail?.helpers || window.firebaseAuthHelpers);
    }
  };
  window.addEventListener('firebaseReady', handleEvent);

  let attempts = 0;
  const check = () => {
    if (resolved) return;
    attempts++;
    if (window.firebaseAuthHelpers) {
      resolved = true;
      window.removeEventListener('firebaseReady', handleEvent);
      callback(window.firebaseAuthHelpers);
    } else if (attempts < maxAttempts) {
      setTimeout(check, 100);
    } else {
      console.error('Firebase auth helpers no disponibles');
    }
  };
  setTimeout(check, 100);
}

function showAuthMessage(message, type = 'error') {
  const toast = document.createElement('div');
  toast.className = 'auth-toast ' + type;
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${
        type === 'success' ? '✓' :
        type === 'info' ? 'ℹ' :
        '✕'
      }</span>
      <span class="toast-message">${message}</span>
    </div>
  `;
  document.body.appendChild(toast);

  // Trigger animation
  void toast.offsetWidth;
  toast.classList.add('show');

  const timeout = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);

  toast.addEventListener('click', () => {
    clearTimeout(timeout);
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  });
}

// Toggle mostrar formulario de email
const showEmailLoginBtn = document.getElementById('showEmailLoginBtn');
const loginFormEl = document.getElementById('loginForm');
if (showEmailLoginBtn && loginFormEl) {
  showEmailLoginBtn.addEventListener('click', () => {
    const isVisible = loginFormEl.style.display !== 'none';
    loginFormEl.style.display = isVisible ? 'none' : 'block';
    showEmailLoginBtn.style.display = isVisible ? 'flex' : 'none';
  });
}

const showEmailSignupBtn = document.getElementById('showEmailSignupBtn');
const createFormEl = document.getElementById('createForm');
if (showEmailSignupBtn && createFormEl) {
  showEmailSignupBtn.addEventListener('click', () => {
    const isVisible = createFormEl.style.display !== 'none';
    createFormEl.style.display = isVisible ? 'none' : 'block';
    showEmailSignupBtn.style.display = isVisible ? 'flex' : 'none';
  });
}

// Password visibility toggle
document.querySelectorAll('.password-toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    const input = document.getElementById(targetId);
    const eyeOpen = btn.querySelector('.eye-open');
    const eyeClosed = btn.querySelector('.eye-closed');

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

// Password strength checker
const createPasswordInput = document.getElementById('createPassword');
const strengthContainer = document.getElementById('passwordStrength');
const strengthFill = document.getElementById('strengthFill');
const strengthText = document.getElementById('strengthText');

if (createPasswordInput && strengthContainer) {
  createPasswordInput.addEventListener('input', () => {
    const password = createPasswordInput.value;
    if (password.length === 0) {
      strengthContainer.style.display = 'none';
      return;
    }

    strengthContainer.style.display = 'flex';
    let strength = 0;
    let label = '';

    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    strengthFill.className = 'strength-fill';
    strengthText.className = 'strength-text';

    if (strength <= 1) {
      label = 'Debil';
      strengthFill.classList.add('weak');
      strengthText.classList.add('weak');
    } else if (strength === 2) {
      label = 'Regular';
      strengthFill.classList.add('fair');
      strengthText.classList.add('fair');
    } else if (strength === 3) {
      label = 'Buena';
      strengthFill.classList.add('good');
      strengthText.classList.add('good');
    } else {
      label = 'Fuerte';
      strengthFill.classList.add('strong');
      strengthText.classList.add('strong');
    }

    strengthText.textContent = label;
  });
}

// Router
function navigate() {
  const hash = window.location.hash;
  const landingPage = document.getElementById('landingPage');
  const loginPage = document.getElementById('loginPage');
  const createPage = document.getElementById('createPage');
  const termsPage = document.getElementById('termsPage');
  const privacyPage = document.getElementById('privacyPage');

  function hideAll() {
    if (landingPage) landingPage.style.display = 'none';
    if (loginPage) loginPage.style.display = 'none';
    if (createPage) createPage.style.display = 'none';
    if (termsPage) termsPage.style.display = 'none';
    if (privacyPage) privacyPage.style.display = 'none';
  }

  switch(hash) {
    case '#login':
      hideAll();
      if (loginPage) loginPage.style.display = 'flex';
      break;
    case '#create':
      hideAll();
      if (createPage) createPage.style.display = 'flex';
      break;
    case '#terms':
      if (termsPage) termsPage.style.display = 'flex';
      break;
    case '#privacy':
      if (privacyPage) privacyPage.style.display = 'flex';
      break;
    default:
      hideAll();
      if (landingPage) landingPage.style.display = 'flex';
  }
}

window.addEventListener('hashchange', navigate);
window.closeLegalModal = function() {
  const termsPage = document.getElementById('termsPage');
  const privacyPage = document.getElementById('privacyPage');
  if (termsPage) termsPage.style.display = 'none';
  if (privacyPage) privacyPage.style.display = 'none';
  window.location.hash = '';
};
navigate();

waitForFirebase((authHelpers) => {
  // Login con email/password (Firebase)
  if (loginFormEl) {
    loginFormEl.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailOrUser = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const submitBtn = loginFormEl.querySelector('.split-submit-btn');

      if (!emailOrUser || !password) {
        showAuthMessage('Por favor completa todos los campos');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Iniciando sesion...';

      try {
        const email = emailOrUser; // Firebase auth uses email
        const userCred = await authHelpers.signInEmail(email, password);
        const user = userCred.user;
        try {
          await authHelpers.createOrUpdateUserRecord(user, { provider: 'email' });
        } catch (e) { console.error('createOrUpdateUserRecord error', e); }

        const sessionData = {
          usuario: user.displayName || (user.email ? user.email.split('@')[0] : 'Usuario'),
          id: user.uid,
          email: user.email,
          loginTime: new Date().toISOString(),
          avatar: user.photoURL || ''
        };

        localStorage.setItem('devcenter_user', sessionData.usuario);
        localStorage.setItem('devcenter_user_id', sessionData.id);
        localStorage.setItem('devcenter_email', sessionData.email);
        localStorage.setItem('devcenter_login_time', sessionData.loginTime);
        if (sessionData.avatar) localStorage.setItem('devcenter_avatar', sessionData.avatar);
        localStorage.setItem('devcenter_session', JSON.stringify(sessionData));

        showAuthMessage('Bienvenido ' + sessionData.usuario + '! Redirigiendo...', 'success');
        setTimeout(() => { window.location.href = '/index.html'; }, 1500);
      } catch (error) {
        showAuthMessage(error.message || 'Error iniciando sesion');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Iniciar sesion';
      }
    });
  }

  // Registro con email/password (Firebase)
  if (createFormEl) {
    createFormEl.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('createEmail').value.trim();
      const password = document.getElementById('createPassword').value;
      const submitBtn = createFormEl.querySelector('.split-submit-btn');

      if (!email || !password || password.length < 6) {
        showAuthMessage('Por favor completa todos los campos correctamente');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Creando cuenta...';

      // Check if email has existing sign-in methods to avoid duplicate accounts
      try {
        const methods = await fetchSignInMethodsForEmail(window.firebaseAuth, email);
        // If there are methods and it's not only password, inform user to sign in with existing provider
        const otherMethods = methods.filter(m => m !== 'password');
        if (otherMethods.length > 0) {
          const providerNames = otherMethods.join(', ');
          showAuthMessage(`Este correo ya está registrado con: ${providerNames}. Inicia sesión con ese proveedor y luego agrega una contraseña en tu perfil.`, 'error');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Crear cuenta';
          return;
        }
      } catch (err) {
        console.warn('No se pudo verificar métodos de inicio de sesión:', err);
        // proceed cautiously
      }

      try {
        const username = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
        const res = await authHelpers.createEmail(email, password, username);
        const user = res.user;
        const userData = res.userData;

        // If a new user was created, open onboarding modal to collect username/avatar
        if (userData) {
          await window.showOnboardingModal(user.uid, user.email, 'email');
        }

        const sessionData = {
          usuario: user.displayName || username,
          id: user.uid,
          email: user.email,
          loginTime: new Date().toISOString(),
          avatar: user.photoURL || (userData ? userData.avatar : '')
        };

        localStorage.setItem('devcenter_user', sessionData.usuario);
        localStorage.setItem('devcenter_user_id', sessionData.id);
        localStorage.setItem('devcenter_email', sessionData.email);
        localStorage.setItem('devcenter_login_time', sessionData.loginTime);
        localStorage.setItem('devcenter_session', JSON.stringify(sessionData));

        showAuthMessage('Cuenta creada! Redirigiendo...', 'success');
        setTimeout(() => { window.location.href = '/index.html'; }, 1500);
      } catch (error) {
        // Manejar error específico de email ya registrado
        if (error.code === 'auth/email-already-registered') {
          showAuthMessage(error.message + '\n\nRedirigiendo a iniciar sesión...', 'error');
          setTimeout(() => {
            window.location.hash = '#login';
            // Llenar el campo de email en el formulario de login
            setTimeout(() => {
              const loginEmailField = document.getElementById('loginEmail');
              if (loginEmailField) loginEmailField.value = email;
            }, 300);
          }, 3000);
        } else {
          showAuthMessage(error.message || 'Error creando cuenta');
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Crear cuenta';
      }
    });
  }

  // OAuth (Firebase)
  const googleLoginBtn = document.getElementById('googleLoginBtn');
  const googleSignupBtn = document.getElementById('googleSignupBtn');
  const githubLoginBtn = document.getElementById('githubLoginBtn');
  const githubSignupBtn = document.getElementById('githubSignupBtn');

  async function handleGoogleAuth() {
    try {
      showAuthMessage('Iniciando sesión con Google...', 'info');
      const result = await authHelpers.signInWithProvider('google');
      const user = result.user;

      // If a new Firestore user was created, run onboarding
      if (result.userData) {
        await window.showOnboardingModal(user.uid, user.email, 'google', user.photoURL);
      }

      // Usar uid existente si se vinculó a una cuenta, sino usar el uid del usuario actual
      const userId = result.existingUserId || user.uid;
      const userData = result.existingUserData || result.userData;

      const sessionData = {
        usuario: user.displayName || (user.email ? user.email.split('@')[0] : 'Usuario'),
        id: userId,
        email: user.email,
        loginTime: new Date().toISOString(),
        avatar: (userData && userData.avatar) ? userData.avatar : (user.photoURL || '')
      };

      localStorage.setItem('devcenter_user', sessionData.usuario);
      localStorage.setItem('devcenter_user_id', sessionData.id);
      localStorage.setItem('devcenter_email', sessionData.email);
      localStorage.setItem('devcenter_login_time', sessionData.loginTime);
      localStorage.setItem('devcenter_session', JSON.stringify(sessionData));

      const isLinked = result.existingUserId ? ' (vinculado a cuenta existente)' : '';
      showAuthMessage('¡Bienvenido ' + sessionData.usuario + '! Redirigiendo...' + isLinked, 'success');
      setTimeout(() => { window.location.href = '/index.html'; }, 1500);
    } catch (err) {
      console.error('Google Auth Error:', err);
      let friendlyMsg = 'Error iniciando sesión con Google';
      
      if (err.code === 'auth/unauthorized-domain') {
        friendlyMsg = 'DOMINIO NO AUTORIZADO: Tu dominio necesita ser agregado en Firebase Console › Authentication › Authorized domains. Tu dominio actual: ' + window.location.hostname;
      } else if (err.code === 'auth/popup-blocked') {
        friendlyMsg = 'El popup fue bloqueado. Por favor habilita popups para este sitio.';
      } else if (err.code === 'auth/network-request-failed' || err.message.includes('ERR_BLOCKED_BY_CLIENT')) {
        friendlyMsg = 'Error de red: Las solicitudes están siendo bloqueadas. Desactiva extensiones de bloqueo de anuncios o VPN para este sitio.';
      } else if (err.message && err.message.includes('Cross-Origin-Opener-Policy')) {
        friendlyMsg = 'Error de seguridad COOP. Intenta recargar la página.';
      }
      
      showAuthMessage(friendlyMsg, 'error');
    }
  }

  async function handleGitHubAuth() {
    try {
      showAuthMessage('Iniciando sesión con GitHub...', 'info');
      const result = await authHelpers.signInWithProvider('github');
      const user = result.user;

      // If a new Firestore user was created, run onboarding
      if (result.userData) {
        await window.showOnboardingModal(user.uid, user.email, 'github', user.photoURL);
      }

      // Usar uid existente si se vinculó a una cuenta, sino usar el uid del usuario actual
      const userId = result.existingUserId || user.uid;
      const userData = result.existingUserData || result.userData;

      const sessionData = {
        usuario: user.displayName || (user.email ? user.email.split('@')[0] : 'Usuario'),
        id: userId,
        email: user.email,
        loginTime: new Date().toISOString(),
        avatar: (userData && userData.avatar) ? userData.avatar : (user.photoURL || '')
      };

      localStorage.setItem('devcenter_user', sessionData.usuario);
      localStorage.setItem('devcenter_user_id', sessionData.id);
      localStorage.setItem('devcenter_email', sessionData.email);
      localStorage.setItem('devcenter_login_time', sessionData.loginTime);
      localStorage.setItem('devcenter_session', JSON.stringify(sessionData));

      const isLinked = result.existingUserId ? ' (vinculado a cuenta existente)' : '';
      showAuthMessage('¡Bienvenido ' + sessionData.usuario + '! Redirigiendo...' + isLinked, 'success');
      setTimeout(() => { window.location.href = '/index.html'; }, 1500);
    } catch (err) {
      console.error('GitHub Auth Error:', err);
      let friendlyMsg = 'Error iniciando sesión con GitHub';
      
      if (err.code === 'auth/unauthorized-domain') {
        friendlyMsg = 'DOMINIO NO AUTORIZADO: Tu dominio necesita ser agregado en Firebase Console › Authentication › Authorized domains. Tu dominio actual: ' + window.location.hostname;
      } else if (err.code === 'auth/popup-blocked') {
        friendlyMsg = 'El popup fue bloqueado. Por favor habilita popups para este sitio.';
      } else if (err.code === 'auth/network-request-failed' || err.message.includes('ERR_BLOCKED_BY_CLIENT')) {
        friendlyMsg = 'Error de red: Las solicitudes están siendo bloqueadas. Desactiva extensiones de bloqueo de anuncios o VPN para este sitio.';
      } else if (err.message && err.message.includes('Cross-Origin-Opener-Policy')) {
        friendlyMsg = 'Error de seguridad COOP. Intenta recargar la página.';
      }
      
      showAuthMessage(friendlyMsg, 'error');
    }
  }

  if (googleLoginBtn) googleLoginBtn.addEventListener('click', handleGoogleAuth);
  if (googleSignupBtn) googleSignupBtn.addEventListener('click', handleGoogleAuth);
  if (githubLoginBtn) githubLoginBtn.addEventListener('click', handleGitHubAuth);
  if (githubSignupBtn) githubSignupBtn.addEventListener('click', handleGitHubAuth);

  // Animated Stats
  const animateStats = () => {
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');

    const animateNumber = (el) => {
      const target = parseInt(el.getAttribute('data-target'));
      const duration = 2000;
      const step = target / (duration / 16);
      let current = 0;

      const updateNumber = () => {
        current += step;
        if (current < target) {
          if (target >= 1000) {
            el.textContent = Math.floor(current).toLocaleString() + '+';
          } else {
            el.textContent = Math.floor(current) + '%';
          }
          requestAnimationFrame(updateNumber);
        } else {
          if (target >= 1000) {
            el.textContent = target.toLocaleString() + '+';
          } else {
            el.textContent = target + '%';
          }
        }
      };
      updateNumber();
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateNumber(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => {
      stat.textContent = '0';
      observer.observe(stat);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', animateStats);
  } else {
    animateStats();
  }
});
