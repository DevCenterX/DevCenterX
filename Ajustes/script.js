// Script de la sección de Ajustes

document.addEventListener('DOMContentLoaded', () => {
  // Helpers para almacenamiento de ajustes
  function saveSetting(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('No se pudo guardar en localStorage', e);
    }
  }

  function loadSetting(key, defaultValue) {
    try {
      const v = localStorage.getItem(key);
      return v === null ? defaultValue : JSON.parse(v);
    } catch (e) {
      return defaultValue;
    }
  }

  // Aplicar tema (usa misma convención que script.js)
  function applyTheme(theme) {
    document.body.classList.remove('dark-theme', 'light-theme');
    if (theme === 'dark') document.body.classList.add('dark-theme');
    if (theme === 'light') document.body.classList.add('light-theme');
    saveSetting('devcenter_theme', theme);
    // marcar el botón seleccionado visualmente
    setSelectedThemeButton(theme);
  }

  function setSelectedThemeButton(theme) {
    const dark = document.getElementById('themeDarkBtn');
    const light = document.getElementById('themeLightBtn');
    if (dark) dark.classList.remove('selected');
    if (light) light.classList.remove('selected');
    if (theme === 'dark' && dark) dark.classList.add('selected');
    if (theme === 'light' && light) light.classList.add('selected');
  }

  // Inicializar controles y sincronizarlos con localStorage
  const darkBtn = document.getElementById('themeDarkBtn');
  const lightBtn = document.getElementById('themeLightBtn');
  const exportDataBtn = document.getElementById('exportDataBtn');
  const clearCacheBtn = document.getElementById('clearCacheBtn');
  const deleteAccountBtn = document.getElementById('deleteAccountBtn');
  // no hay configureIntegrationBtn en esta versión

  // Tema
  const savedTheme = loadSetting('devcenter_theme', 'dark');
  applyTheme(savedTheme);
  // listeners en botones grandes
  if (darkBtn) darkBtn.addEventListener('click', () => applyTheme('dark'));
  if (lightBtn) lightBtn.addEventListener('click', () => applyTheme('light'));
  // listeners globales para cualquier control que tenga data-theme (incluye logo-menu pequeño)
  document.querySelectorAll('[data-theme]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const t = btn.getAttribute('data-theme');
      if (t) applyTheme(t);
      e.stopPropagation();
    });
  });

  // No hay checkboxes de Integraciones/Privacidad en esta versión
  const checkboxIds = [];

  // Otros botones (acciones simples que también se persisten si aplica)
  if (exportDataBtn) {
    exportDataBtn.addEventListener('click', () => {
      alert('Exportando datos...');
    });
  }
  if (clearCacheBtn) {
    clearCacheBtn.addEventListener('click', () => {
      // ejemplo: limpiar keys relacionadas
      checkboxIds.forEach(k => localStorage.removeItem(k));
      alert('Caché limpiada localmente. Ajustes restablecidos en esta página.');
      // recargar para aplicar estado por defecto
      location.reload();
    });
  }
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', () => {
      if (confirm('¿Seguro que deseas eliminar tu cuenta? Esta acción es irreversible.')) {
        alert('Cuenta eliminada.');
      }
    });
  }
  // configureIntegrationBtn eliminado (no action)

  // Cargar perfil de usuario desde Firestore
  async function initFirebaseAndLoadUser() {
    try {
      // Verificar si está logueado
      const isLoggedIn = localStorage.getItem('devcenter_isLoggedIn');
      const uid = localStorage.getItem('devcenter_user_id');
      
      // Sin login válido, no cargar
      if (isLoggedIn !== 'true' || !uid) {
        console.log('⚠️ No hay sesión activa');
        const spinnerEl = document.getElementById('profileSpinner');
        if (spinnerEl) spinnerEl.style.display = 'none';
        return;
      }

      // Mostrar spinner mientras carga
      const spinnerEl = document.getElementById('profileSpinner');
      if (spinnerEl) spinnerEl.style.display = 'block';

      // Import Firebase modules
      const appMod = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js');
      const authMod = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js');
      const firestoreMod = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
      const { initializeApp } = appMod;
      const { getAuth, setPersistence, browserLocalPersistence } = authMod;
      const { getFirestore, doc, getDoc } = firestoreMod;

      const firebaseConfig = {
        apiKey: "AIzaSyCsgsrFZ_nTMrtK69f6815I0Hcc1kTASHY",
        authDomain: "devcenter-agent-48c86.firebaseapp.com",
        projectId: "devcenter-agent-48c86",
        storageBucket: "devcenter-agent-48c86.firebasestorage.app",
        messagingSenderId: "911929994293",
        appId: "1:911929994293:web:1d08f68b4c507ee162557c",
        measurementId: "G-S5GTYBRVK8"
      };

      // Initialize app
      if (!window.__DEVCENTER_FIREBASE_APP) {
        window.__DEVCENTER_FIREBASE_APP = initializeApp(firebaseConfig);
        window.__DEVCENTER_FIRESTORE = getFirestore(window.__DEVCENTER_FIREBASE_APP);
        window.__DEVCENTER_AUTH = getAuth(window.__DEVCENTER_FIREBASE_APP);
        // Set persistence to local to validate session
        await setPersistence(window.__DEVCENTER_AUTH, browserLocalPersistence);
      }

      const db = window.__DEVCENTER_FIRESTORE;
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      
      if (!snap.exists()) {
        console.warn('❌ Usuario no encontrado en Firestore');
        if (spinnerEl) spinnerEl.style.display = 'none';
        const nameEl = document.getElementById('profileName');
        if (nameEl) nameEl.textContent = 'Usuario no encontrado';
        return;
      }
      
      const data = snap.data();

      // Procesar datos con fallbacks
      const avatar = (data.avatar && typeof data.avatar === 'string' && data.avatar.trim().length > 0) 
        ? data.avatar 
        : '../Images/avatar.png';
      
      const username = (data.username && data.username.trim().length > 0) 
        ? data.username 
        : (data.email && data.email.trim().length > 0 ? data.email : 'Usuario');
      
      const plan = (data.plan && data.plan.trim().length > 0) 
        ? data.plan 
        : 'Gratis';
      
      const limit = data.limit || 'default';

      // Actualizar DOM
      const avatarEl = document.getElementById('avatarImg');
      const nameEl = document.getElementById('profileName');
      const planEl = document.getElementById('profilePlan');
      
      if (avatarEl) {
        avatarEl.src = avatar;
        // Fallback si imagen no existe
        avatarEl.onerror = function() {
          this.src = '../Images/avatar.png';
        };
      }
      
      if (nameEl) nameEl.textContent = username;
      if (planEl) planEl.textContent = `Plan: ${plan}`;

      console.log('✅ Perfil cargado desde Firestore:', { username, plan, limit });

      // --- Cargar proyectos del usuario para calcular apps creadas ---
      try {
        const proyectosRef = doc(db, 'proyectos', uid);
        const proyectosSnap = await getDoc(proyectosRef);
        let createdCount = 0;
        if (proyectosSnap.exists()) {
          const pData = proyectosSnap.data();
          if (Array.isArray(pData.proyectos)) createdCount = pData.proyectos.length;
        }

        // Normalizar nombre de plan y límites
        function normalizePlan(p) {
          const s = (p || '').toString().toLowerCase();
          if (s.includes('pro')) return 'Pro';
          if (s.includes('premium')) return 'Premium';
          return 'Normal';
        }

        const planKey = normalizePlan(plan);
        const limits = { 'Normal': 10, 'Premium': 15, 'Pro': 30 };
        const planLimits = limits[planKey] || 10;

        // Etiqueta para apps según plan
        const appsLabelMap = { 'Normal': 'Free Apps', 'Premium': 'Premium Apps', 'Pro': 'Pro Apps' };
        const appsLabel = appsLabelMap[planKey] || 'Free Apps';

        // Actualizar sidebar (IDs: userPlanTitle, userAppsCount, userAgentUsage)
        const planTitleEl = document.getElementById('userPlanTitle');
        const appsCountEl = document.getElementById('userAppsCount');
        const usageEl = document.getElementById('userAgentUsage');
        const upgradeBtn = document.getElementById('upgradeAgentBtn');

        if (planTitleEl) {
          // Mostrar el nombre tal cual viene o con sufijo "Plan" para Normal
          if (planKey === 'Normal') planTitleEl.textContent = (plan && /starter/i.test(plan)) ? 'Starter Plan' : (plan + ' Plan' || 'Starter Plan');
          else planTitleEl.textContent = plan + ' Plan';
        }

          // Aplicar clase global según plan para ajustar estilos (plan-normal, plan-premium, plan-pro)
          try {
            document.body.classList.remove('plan-normal', 'plan-premium', 'plan-pro');
            if (planKey === 'Pro') document.body.classList.add('plan-pro');
            else if (planKey === 'Premium') document.body.classList.add('plan-premium');
            else document.body.classList.add('plan-normal');
          } catch (e) {
            // ignore
          }

        // Separar etiqueta (stat-label) del valor para evitar duplicados
        if (appsCountEl) appsCountEl.textContent = `${createdCount}/${planLimits} created`;
        try {
          const appsLabelEl = appsCountEl ? appsCountEl.parentElement.querySelector('.stat-label') : null;
          if (appsLabelEl) appsLabelEl.textContent = appsLabel;
        } catch (e) {
          // no hacer nada si la estructura DOM es diferente
        }

        // Calcular porcentaje de uso relativo al límite del plan
        let percent = 0;
        if (planLimits > 0) percent = Math.round((createdCount / planLimits) * 100);
        if (percent > 100) percent = 100;
        if (usageEl) usageEl.textContent = `${percent}% used`;

        // Ajustar boton Upgrade: pequeño si Premium, oculto si Pro
        if (upgradeBtn) {
          upgradeBtn.classList.remove('small', 'hidden');
          if (planKey === 'Pro') {
            upgradeBtn.classList.add('hidden');
          } else if (planKey === 'Premium') {
            upgradeBtn.classList.add('small');
          }
        }
      } catch (e) {
        console.warn('No se pudo cargar proyectos para conteo:', e);
      }

      // Ocultar spinner
      if (spinnerEl) spinnerEl.style.display = 'none';
    } catch (e) {
      console.error('❌ Error cargando perfil:', e.message);
      const spinnerEl = document.getElementById('profileSpinner');
      if (spinnerEl) spinnerEl.style.display = 'none';
      const nameEl = document.getElementById('profileName');
      if (nameEl) nameEl.textContent = 'Error al conectar';
    }
  }

  initFirebaseAndLoadUser();

  // Menu logout: navegar a agent.html al hacer clic
  const menuLogout = document.getElementById('menuLogout');
  if (menuLogout) {
    menuLogout.addEventListener('click', () => {
      window.location.href = '../agent.html';
    });
  }
});
