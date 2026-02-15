// Script de la sección de Usage

document.addEventListener('DOMContentLoaded', () => {
  // Helpers para almacenamiento de datos de uso
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
    const darkBtn = document.querySelector('[data-theme="dark"]');
    const lightBtn = document.querySelector('[data-theme="light"]');
    if (darkBtn) darkBtn.classList.remove('selected');
    if (lightBtn) lightBtn.classList.remove('selected');
    if (theme === 'dark' && darkBtn) darkBtn.classList.add('selected');
    if (theme === 'light' && lightBtn) lightBtn.classList.add('selected');
  }

  // Inicializar tema
  const savedTheme = loadSetting('devcenter_theme', 'dark');
  applyTheme(savedTheme);
  
  // listeners globales para cualquier control que tenga data-theme
  document.querySelectorAll('[data-theme]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const t = btn.getAttribute('data-theme');
      if (t) applyTheme(t);
      e.stopPropagation();
    });
  });

  // Cargar datos de uso desde almacenamiento
  async function initUsageData() {
    try {
      // Verificar si está logueado
      const isLoggedIn = localStorage.getItem('devcenter_isLoggedIn');
      const uid = localStorage.getItem('devcenter_user_id');
      
      // Sin login válido, no cargar
      if (isLoggedIn !== 'true' || !uid) {
        console.log('⚠️ No hay sesión activa');
        return;
      }

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
        await setPersistence(window.__DEVCENTER_AUTH, browserLocalPersistence);
      }

      const db = window.__DEVCENTER_FIRESTORE;
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      
      if (!snap.exists()) {
        console.warn('❌ Usuario no encontrado en Firestore');
        return;
      }
      
      const userData = snap.data();

      // Procesar datos del usuario
      const plan = (userData.plan && userData.plan.trim().length > 0) 
        ? userData.plan 
        : 'Gratis';

      // Cargar proyectos para contar apps creadas
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

        // Actualizar datos de uso en DOM
        const appsCountEl = document.getElementById('appsCreatedCount');
        const appsLimitEl = document.getElementById('appsCreatedLimit');
        const currentPlanEl = document.getElementById('currentPlanName');
        const planLimitsEl = document.getElementById('planLimits');
        const userPlanTitleEl = document.getElementById('userPlanTitle');

        if (appsCountEl) appsCountEl.textContent = createdCount;
        if (appsLimitEl) appsLimitEl.textContent = `de ${planLimits}`;
        if (currentPlanEl) currentPlanEl.textContent = plan;
        if (planLimitsEl) planLimitsEl.textContent = `${planLimits} apps / ilimitados`;

        // Actualizar sidebar
        if (userPlanTitleEl) {
          if (planKey === 'Normal') userPlanTitleEl.textContent = (plan && /starter/i.test(plan)) ? 'Starter Plan' : (plan + ' Plan' || 'Starter Plan');
          else userPlanTitleEl.textContent = plan + ' Plan';
        }

        // Aplicar clase global según plan
        try {
          document.body.classList.remove('plan-normal', 'plan-premium', 'plan-pro');
          if (planKey === 'Pro') document.body.classList.add('plan-pro');
          else if (planKey === 'Premium') document.body.classList.add('plan-premium');
          else document.body.classList.add('plan-normal');
        } catch (e) {
          // ignore
        }

        // Calcular porcentaje de uso
        const usageEl = document.getElementById('userAgentUsage');
        if (usageEl) {
          let percent = 0;
          if (planLimits > 0) percent = Math.round((createdCount / planLimits) * 100);
          if (percent > 100) percent = 100;
          usageEl.textContent = `${percent}% usado`;
        }

        // Actualizar botón de upgrade
        const upgradeBtn = document.getElementById('upgradeAgentBtn');
        if (upgradeBtn) {
          upgradeBtn.classList.remove('small', 'hidden');
          if (planKey === 'Pro') {
            upgradeBtn.classList.add('hidden');
          } else if (planKey === 'Premium') {
            upgradeBtn.classList.add('small');
          }
        }

      } catch (e) {
        console.warn('No se pudo cargar datos de proyectos:', e);
      }

      console.log('✅ Datos de uso cargados');

    } catch (e) {
      console.error('❌ Error cargando datos de uso:', e.message);
    }
  }

  initUsageData();

  // Menu logout: navegar a agent.html al hacer clic
  const menuLogout = document.getElementById('menuLogout');
  if (menuLogout) {
    menuLogout.addEventListener('click', () => {
      window.location.href = '../agent.html';
    });
  }
});
