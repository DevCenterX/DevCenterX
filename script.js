// ==================== MENU & NAVIGATION ====================
// Funciones del menú home y navegación principal

document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('mainSidebar');
  const mainContent = document.querySelector('.main-content');
  const sidebarCollapsedControls = document.getElementById('sidebarCollapsedControls');
  const sidebarOpenBtn = document.getElementById('sidebarOpenBtn');
  const searchBtn = document.querySelector('.search-btn');
  const optionsBtn = document.getElementById('optionsBtn');
  const optionsMenu = document.getElementById('optionsMenu');

  // ==================== SIDEBAR FUNCTIONS ====================
  // Función para cerrar el sidebar
  function closeSidebar() {
    if (sidebar) sidebar.classList.add('sidebar-hidden');
    if (mainContent) mainContent.classList.add('sidebar-hidden');
    if (sidebarCollapsedControls) sidebarCollapsedControls.style.display = 'flex';
  }

  // Función para abrir el sidebar
  function openSidebar() {
    if (sidebar) sidebar.classList.remove('sidebar-hidden');
    if (mainContent) mainContent.classList.remove('sidebar-hidden');
    if (sidebarCollapsedControls) sidebarCollapsedControls.style.display = 'none';
    if (optionsMenu) optionsMenu.classList.remove('active');
  }

  // Cerrar sidebar por defecto en móvil
  if (window.innerWidth <= 768) {
    closeSidebar();
  }

  // Botón de búsqueda (cierra el sidebar)
  if (searchBtn) {
    searchBtn.addEventListener('click', closeSidebar);
  }

  // Botón para abrir el sidebar
  if (sidebarOpenBtn) {
    sidebarOpenBtn.addEventListener('click', openSidebar);
  }

  // Botón de opciones - redirige a account
  if (optionsBtn) {
    optionsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/account';
    });
  }

  // ==================== OPTIONS MENU ITEMS ====================
  const optionsMenuAccount = document.getElementById('optionsMenuAccount');
  const optionsMenuHelp = document.getElementById('optionsMenuHelp');
  const optionsMenuLogout = document.getElementById('optionsMenuLogout');
  const optionsThemeIcons = document.querySelectorAll('#optionsMenu .theme-icon');

  // Account item en options menu
  if (optionsMenuAccount) {
    optionsMenuAccount.addEventListener('click', () => {
      window.location.href = '/account';
      if (optionsMenu) optionsMenu.classList.remove('active');
    });
  }

  // Help item en options menu
  if (optionsMenuHelp) {
    optionsMenuHelp.addEventListener('click', () => {
      window.open('https://github.com/DevCenterX-Agent/docs', '_blank');
      if (optionsMenu) optionsMenu.classList.remove('active');
    });
  }

  // Logout item en options menu
  if (optionsMenuLogout) {
    optionsMenuLogout.addEventListener('click', () => {
      if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        performLogout();
      }
      if (optionsMenu) optionsMenu.classList.remove('active');
    });
  }

  // Cambiar tema (menú de opciones)
  // Funciones para manejar tema y persistencia
  function saveTheme(t) {
    try { localStorage.setItem('devcenter_theme', JSON.stringify(t)); } catch(e) {}
  }
  function loadTheme() {
    try { const v = localStorage.getItem('devcenter_theme'); return v ? JSON.parse(v) : null; } catch(e) { return null; }
  }
  function applyTheme(theme) {
    document.body.classList.remove('dark-theme','light-theme');
    if (theme === 'dark') document.body.classList.add('dark-theme');
    if (theme === 'light') document.body.classList.add('light-theme');
    // marcar iconos activos
    optionsThemeIcons.forEach(ic => ic.classList.toggle('active', ic.dataset.theme === theme));
    document.querySelectorAll('.theme-icon').forEach(ic => ic.classList.toggle('active', ic.dataset.theme === theme));
  }

  // aplicar tema guardado al inicio
  const currentSavedTheme = loadTheme();
  if (currentSavedTheme) applyTheme(currentSavedTheme);

  optionsThemeIcons.forEach(icon => {
    icon.addEventListener('click', (e) => {
      e.stopPropagation();
      const theme = icon.dataset.theme;
      applyTheme(theme);
      saveTheme(theme);
    });
  });

  // ==================== LOGO MENU ====================
  const logoBtn = document.getElementById('logoBtn');
  const logoMenu = document.getElementById('logoMenu');
  
  if (logoBtn && logoMenu) {
    logoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      logoMenu.classList.toggle('active');
    });

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!logoMenu.contains(e.target) && e.target !== logoBtn && !logoBtn.contains(e.target)) {
        logoMenu.classList.remove('active');
      }
    });
  }

  // ==================== LOGO MENU ITEMS ====================
  const menuAccount = document.getElementById('menuAccount');
  const menuHelp = document.getElementById('menuHelp');
  const menuLogout = document.getElementById('menuLogout');
  const themeIcons = document.querySelectorAll('.theme-icon');

  // Account item
  if (menuAccount) {
    menuAccount.addEventListener('click', () => {
      window.location.href = '/account';
      if (logoMenu) logoMenu.classList.remove('active');
    });
    
    // Actualizar el texto del botón Account
    const accountTextElement = document.getElementById('accountText');
    if (accountTextElement) {
      const currentUser = localStorage.getItem('devcenter_user');
      if (currentUser) {
        accountTextElement.textContent = currentUser;
      }
    }
  }

  // Help item
  if (menuHelp) {
    menuHelp.addEventListener('click', () => {
      window.open('https://github.com/DevCenterX-Agent/docs', '_blank');
      if (logoMenu) logoMenu.classList.remove('active');
    });
  }

  // Logout item
  if (menuLogout) {
    menuLogout.addEventListener('click', () => {
      if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        performLogout();
      }
      if (logoMenu) logoMenu.classList.remove('active');
    });
  }

  // Logout helper to keep behavior consistent
  function performLogout() {
    try {
      const keys = [
        'devcenter_user_id','devcenter_isLoggedIn','devcenter_user','devcenter_user_name',
        'devcenter_email','devcenter_avatar','devcenter_plan','devcenter_limit',
        'devcenter_login_time','devcenter_datos','devcenter_session','supabase_nombrepersona'
      ];
      keys.forEach(k => localStorage.removeItem(k));
      console.log('✅ Sesión cerrada (localStorage limpiado)');
    } catch (e) {
      console.warn('Error al limpiar sesión:', e);
    }
    window.location.href = '/agent.html';
  }

  // Theme icons
  themeIcons.forEach(icon => {
    icon.addEventListener('click', (e) => {
      e.stopPropagation();
      const theme = icon.dataset.theme;
      // Aplicar y guardar tema para todos los iconos (consistente con optionsThemeIcons)
      try {
        applyTheme(theme);
        saveTheme(theme);
      } catch (err) {
        console.warn('No se pudo aplicar el tema:', err);
      }
    });
  });
});

// NOTE: Section navigation handled by separate pages; do not intercept nav links to allow folder redirection.

// ==================== CREATE APP BUTTON ====================
// Botón principal "Create App" del sidebar
document.addEventListener('DOMContentLoaded', () => {
  const mainCreateBtn = document.getElementById('mainCreateBtn');
  if (mainCreateBtn) {
    mainCreateBtn.addEventListener('click', () => {
      window.location.href = '/Programar/crear-app';
    });
  }

  const userProjectsSection = document.getElementById('userProjectsSection');
  const recentAppsCountEl = document.getElementById('recentAppsCount');
  const recentAppsListEl = document.getElementById('userProjectsGrid');
  const recentAppsEmptyEl = document.getElementById('userProjectsEmpty');
  const createAppHeaderBtn = document.getElementById('createAppHeaderBtn');
  const createFirstAppBtn = document.getElementById('createFirstAppBtn');
  const createAppUrl = '/Programar/crear-app';

  const goToCreateApp = () => {
    window.location.href = createAppUrl;
  };

  [createAppHeaderBtn, createFirstAppBtn].forEach((btn) => {
    if (!btn) return;
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      goToCreateApp();
    });
  });

  function loadLocalProjects() {
    try {
      const stored = localStorage.getItem('userProjects');
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Error leyendo apps locales:', error);
      return [];
    }
  }

  function getProjectField(project, keys) {
    if (!project || !keys.length) return '';
    for (const key of keys) {
      if (!(key in project)) continue;
      const value = project[key];
      if (value === null || value === undefined) continue;
      if (typeof value === 'string' && value.trim().length === 0) continue;
      return value;
    }
    return '';
  }

  function getAppInitials(text) {
    const value = (text || '').toString().trim();
    if (!value) return 'AP';
    const words = value.split(/\s+/).filter(Boolean);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  function parseProjectDate(value) {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'number') return new Date(value);
    if (typeof value === 'string') {
      const cleaned = value.trim();
      if (cleaned.length === 0) return null;
      const numeric = Number(cleaned);
      if (!Number.isNaN(numeric)) {
        return new Date(numeric);
      }
      const iso = new Date(cleaned);
      if (!Number.isNaN(iso.getTime())) {
        return iso;
      }
      const parts = cleaned.split(/[^0-9]+/).filter(Boolean);
      if (parts.length >= 3) {
        const [first, second, third] = parts;
        if (third.length === 4) {
          // dd mm yyyy or yyyy mm dd?
          if (Number(first) > 31) {
            return new Date(Number(first), Number(second) - 1, Number(third));
          }
          return new Date(Number(third), Number(second) - 1, Number(first));
        }
      }
    }
    return null;
  }

  function getProjectDate(project) {
    if (!project) return null;
    const candidates = ['updatedAt', 'createdAt', 'fecha', 'created_at', 'fechaCreacion', 'fecha_actualizacion', 'createdAtTimestamp'];
    for (const key of candidates) {
      const value = project[key];
      const parsed = parseProjectDate(value);
      if (parsed) return parsed;
    }
    return null;
  }

  function formatProjectTimestamp(project) {
    const date = getProjectDate(project);
    if (!date) return '';
    return date.toLocaleString('es-MX', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function flattenProjectEntries(entries = []) {
    const aggregated = [];
    if (!Array.isArray(entries)) return aggregated;
    entries.forEach((entry) => {
      if (!entry) return;
      if (Array.isArray(entry.apps) && entry.apps.length) {
        entry.apps.forEach((app) => {
          aggregated.push({
            ...app,
            parentTitle: entry.titulo || entry.title || entry.name || entry.nombre,
          });
        });
      } else {
        aggregated.push(entry);
      }
    });
    return aggregated;
  }

  function getProjectTitle(project) {
    return getProjectField(project, ['title', 'titulo', 'name', 'nombre']) || 'App sin nombre';
  }

  function getProjectDescription(project) {
    return getProjectField(project, ['description', 'descripcion', 'desc', 'detalles']) || '';
  }

  function getProjectStatus(project) {
    return (
      getProjectField(project, ['status', 'estado', 'state', 'visibility', 'visibilidad', 'devcenter']) ||
      'Privada'
    );
  }

  function getProjectIdentifier(project) {
    return (
      getProjectField(project, ['id', 'numeroProyecto', 'numero_proyecto', 'projectId', 'project_id', 'slug']) ||
      ''
    );
  }

  function navigateToProject(project) {
    if (!project) {
      window.location.href = '/Programar/';
      return;
    }
    const projectId = getProjectIdentifier(project);
    if (projectId) {
      window.location.href = `/Programar/?pid=${encodeURIComponent(projectId)}`;
      return;
    }
    window.location.href = '/Programar/';
  }

  function createAppCard(project) {
    const title = getProjectTitle(project);
    const description = getProjectDescription(project);
    const statusLabel = getProjectStatus(project);
    const timestampLabel = formatProjectTimestamp(project);

    const card = document.createElement('article');
    card.className = 'project-card recent-app-card';
    card.setAttribute('role', 'button');
    card.tabIndex = 0;
    card.setAttribute('aria-label', `Abrir ${title}`);

    const meta = document.createElement('div');
    meta.className = 'recent-app-card-meta';

    const initials = document.createElement('span');
    initials.className = 'recent-app-card-initials';
    initials.textContent = getAppInitials(title);

    const titleWrapper = document.createElement('div');
    const titleEl = document.createElement('h3');
    titleEl.className = 'recent-app-card-title';
    titleEl.textContent = title;
    titleWrapper.appendChild(titleEl);

    meta.append(initials, titleWrapper);

    const descriptionEl = document.createElement('p');
    descriptionEl.className = 'recent-app-card-description';
    descriptionEl.textContent = description || 'Sin descripción';

    const footer = document.createElement('div');
    footer.className = 'recent-app-card-footer';

    const statusEl = document.createElement('span');
    statusEl.className = 'recent-app-card-status';
    statusEl.textContent = statusLabel;

    footer.appendChild(statusEl);

    if (timestampLabel) {
      const timeEl = document.createElement('span');
      timeEl.className = 'recent-app-card-timestamp';
      timeEl.textContent = timestampLabel;
      footer.appendChild(timeEl);
    }

    card.append(meta, descriptionEl, footer);

    const openProject = () => navigateToProject(project);
    card.addEventListener('click', openProject);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openProject();
      }
    });

    return card;
  }

  function setProjectsEmptyState(isEmpty) {
    if (!userProjectsSection) return;
    userProjectsSection.classList.toggle('has-empty-state', isEmpty);
  }

  function renderRecentApps(remoteProjects) {
    if (!recentAppsListEl || !recentAppsEmptyEl) return;

    const localProjects = loadLocalProjects();
    const sourceProjects = Array.isArray(remoteProjects) ? remoteProjects : [];
    const appsToRender = flattenProjectEntries(
      sourceProjects.length ? sourceProjects : localProjects
    );

    const total = appsToRender.length;
    if (recentAppsCountEl) {
      const label = total === 1 ? 'app' : 'apps';
      recentAppsCountEl.textContent = `${total} ${label}`;
    }

    recentAppsListEl.innerHTML = '';

    if (total === 0) {
      recentAppsListEl.style.display = 'none';
      recentAppsEmptyEl.style.display = 'flex';
      setProjectsEmptyState(true);
      return;
    }

    recentAppsEmptyEl.style.display = 'none';
    recentAppsListEl.style.display = 'grid';
    setProjectsEmptyState(false);

    const sorted = appsToRender
      .map((app) => ({ app, date: getProjectDate(app) }))
      .sort((a, b) => {
        const aTime = a.date ? a.date.getTime() : 0;
        const bTime = b.date ? b.date.getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 6)
      .map((entry) => entry.app);

    sorted.forEach((app) => {
      const card = createAppCard(app);
      recentAppsListEl.appendChild(card);
    });
  }

  window.addEventListener('storage', (event) => {
    if (event.key === 'userProjects') {
      renderRecentApps();
    }
  });

  renderRecentApps();

  // Cargar nombre de usuario desde Firestore y actualizar greeting
  async function loadUserAndUpdateGreeting() {
    try {
      const isLoggedIn = localStorage.getItem('devcenter_isLoggedIn');
      const uid = localStorage.getItem('devcenter_user_id');
      
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
        // Set persistence to local to validate session
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
      const username = (userData.username && userData.username.trim().length > 0) 
        ? userData.username 
        : (userData.email && userData.email.trim().length > 0 ? userData.email : 'Usuario');
      
      const plan = (userData.plan && userData.plan.trim().length > 0) 
        ? userData.plan 
        : 'Gratis';

      // Guardar nombre del usuario en localStorage
      localStorage.setItem('devcenter_user_name', username);

      // Actualizar greeting con el nombre del usuario
      const greetingText = document.getElementById('greetingText');
      if (greetingText) {
const greetings = [
  `${username}, ¿qué tal?`,
  `Hola ${username}, ¿en qué andas?`,

  `¿Qué onda ${username}?`,
  `Hola ${username}, ¿qué quieres hacer hoy?`,
  `${username}, ¿qué se te antoja hacer?`,
  `¿Cómo vas ${username}?`,
  `${username}, ¿en qué te ayudo?`,
  `Hey ${username}, dime qué necesitas`,
  `${username}, ¿qué traes en mente?`,
  `Hola ${username}, aquí estoy`,
  `${username}, ¿todo listo?`,
  `¿Qué plan hoy, ${username}?`,
  `${username}, ¿qué quieres probar?`,
  `Hola ${username}, ¿qué sigue?`,
  `${username}, ¿qué hacemos ahora?`,
  `Hey ${username}, ¿qué quieres crear?`,
  `${username}, ¿todo tranquilo?`,
  `Hola ${username}, ¿en qué te doy una mano?`,
  `${username}, ¿qué necesitas hoy?`,
  `¿Qué cuentas, ${username}?`,
  `${username}, dime qué quieres hacer`,
  `Hola ${username}, ¿qué idea traes?`,
  `${username}, ¿empezamos?`,
  `Hey ${username}, listo cuando tú digas`,
  `${username}, ¿qué quieres armar?`,
  `Hola ${username}, ¿cómo te ayudo hoy?`,
  `¿Qué sigue, ${username}?`,
  `${username}, tú dime y empezamos`
];
        
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        const usernameSpan = document.getElementById('usernameSpan');
        if (usernameSpan) {
          usernameSpan.textContent = username;
        }
        greetingText.textContent = randomGreeting;
      }

      // Cargar proyectos para actualizar sidebar con datos
      try {
        const proyectosRef = doc(db, 'proyectos', uid);
        const proyectosSnap = await getDoc(proyectosRef);
        let createdCount = 0;
        let storedProjects = [];
        if (proyectosSnap.exists()) {
          const pData = proyectosSnap.data();
          if (Array.isArray(pData.proyectos)) {
            createdCount = pData.proyectos.length;
            storedProjects = pData.proyectos;
          }
        }

        function normalizePlan(p) {
          const s = (p || '').toString().toLowerCase();
          if (s.includes('pro')) return 'Pro';
          if (s.includes('premium')) return 'Premium';
          return 'Normal';
        }

        const planKey = normalizePlan(plan);
        const limits = { 'Normal': 10, 'Premium': 15, 'Pro': 30 };
        const planLimits = limits[planKey] || 10;

        // Actualizar sidebar
        const planTitleEl = document.getElementById('userPlanTitle');
        const appsCountEl = document.getElementById('userAppsCount');
        const usageEl = document.getElementById('userAgentUsage');
        const upgradeBtn = document.getElementById('upgradeAgentBtn');

        if (planTitleEl) {
          if (planKey === 'Normal') planTitleEl.textContent = (plan && /starter/i.test(plan)) ? 'Plan Inicial' : `Plan ${plan || 'Normal'}`;
          else planTitleEl.textContent = `Plan ${plan}`;
        }

        if (appsCountEl) appsCountEl.textContent = `${createdCount}/${planLimits} creadas`;

        if (usageEl) {
          let percent = 0;
          if (planLimits > 0) percent = Math.round((createdCount / planLimits) * 100);
          if (percent > 100) percent = 100;
          usageEl.textContent = `${percent}% usado`;
        }

        if (upgradeBtn) {
          // Normalizar estado
          upgradeBtn.classList.remove('small', 'hidden');
          upgradeBtn.style.display = '';

          if (planKey === 'Pro') {
            // Ocultar completamente para usuarios Pro
            upgradeBtn.classList.add('hidden');
            upgradeBtn.style.display = 'none';
          } else if (planKey === 'Premium') {
            // Mostrar versión compacta para Premium
            upgradeBtn.classList.add('small');
            upgradeBtn.style.display = '';
            upgradeBtn.innerHTML = '<span>+</span> Mejorar';
          } else {
            // Normal/Starter
            upgradeBtn.classList.remove('small', 'hidden');
            upgradeBtn.style.display = '';
            upgradeBtn.innerHTML = '<span>+</span> Mejorar Agente';
          }
        }

        renderRecentApps(storedProjects);

        try {
          // Guardar el tema actual antes de agregar clases de plan
          const currentTheme = loadTheme() || 'dark';
          
          document.body.classList.remove('plan-normal', 'plan-premium', 'plan-pro');
          if (planKey === 'Pro') document.body.classList.add('plan-pro');
          else if (planKey === 'Premium') document.body.classList.add('plan-premium');
          else document.body.classList.add('plan-normal');
          
          // Re-aplicar el tema después de agregar las clases de plan para asegurar que se mantiene
          applyTheme(currentTheme);
        } catch (e) {
          // ignore
        }

      } catch (e) {
        console.warn('No se pudo cargar datos de proyectos:', e);
      }

      console.log('✅ Usuario y proyectos cargados');

    } catch (e) {
      console.error('❌ Error cargando usuario:', e.message);
    }
  }

  loadUserAndUpdateGreeting();
});

// ==================== RESPONSIVE RESIZE ====================
window.addEventListener('resize', () => {
  const sidebar = document.getElementById('mainSidebar');
  const mainContent = document.querySelector('.main-content');
  const sidebarCollapsedControls = document.getElementById('sidebarCollapsedControls');
  
  if (window.innerWidth > 768) {
    if (sidebar) sidebar.classList.remove('sidebar-hidden');
    if (mainContent) mainContent.classList.remove('sidebar-hidden');
    if (sidebarCollapsedControls) sidebarCollapsedControls.style.display = 'none';
  }
});

console.log('✅ Menu functions loaded');

// ==================== CHAT CONTROLS ====================
// Integración para el input de búsqueda y los distintos modos de interacción

// Prompts personalizados para cada modo
const modePrompts = {
  chat: '',
  programar: 'Eres un experto programador fullstack. Genera un código HTML5 completo, funcional y moderno para: '
};

document.addEventListener('DOMContentLoaded', () => {
  const searchBox = document.getElementById('searchBox');
  const startChatBtn = document.getElementById('startChatBtn');
  let selectedMode = 'chat'; // Modo por defecto

  const modeSelectors = document.querySelectorAll('.mode-selector');

  modeSelectors.forEach(selector => {
    selector.addEventListener('click', () => {
      // Remove active class from all selectors
      modeSelectors.forEach(s => s.classList.remove('active'));
      // Add active class to the clicked one
      selector.classList.add('active');
      // Update selectedMode variable
      selectedMode = selector.dataset.mode;
      console.log('Modo seleccionado:', selectedMode);

      // Update button text based on mode
      if (startChatBtn) {
        if (selectedMode === 'programar') {
          startChatBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
            Iniciar Agent
          `;
        } else if (selectedMode === 'docs') {
          startChatBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            Iniciar Docs
          `;
        } else {
          startChatBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 2L11 13"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
            </svg>
            Iniciar chat
          `;
        }
      }
    });
  });
  
  if (!searchBox || !startChatBtn) {
    console.log('⚠️ Chat elements not found');
    return;
  }

  console.log('✅ Chat controls ready');

  // Event listener en el botón "Iniciar" - Ejecutar acción según modo seleccionado
  if (startChatBtn) {
    startChatBtn.addEventListener('click', () => {
      console.log('🎯 Ejecutando acción para modo:', selectedMode);
      sendMessage();
    });
  }

  // Función para mostrar notificaciones personalizadas
  function showNotification(message, icon = '⚠️') {
    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.innerHTML = `
      <div class="notification-icon">${icon}</div>
      <p>${message}</p>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  // Estilos para la notificación (inyectados en el head)
  const notificationStyles = `
    .custom-notification {
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #333;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 15px;
      z-index: 10000;
      opacity: 0;
      transform: translateY(-20px);
      transition: opacity 0.3s ease, transform 0.3s ease;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    .custom-notification.show {
      opacity: 1;
      transform: translateY(0);
    }
    .notification-icon {
      font-size: 24px;
    }
  `;
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = notificationStyles;
  document.head.appendChild(styleSheet);


  // Función para enviar mensaje localmente sin redirigir
  const sendMessageLocal = () => {
    const message = searchBox.value.trim();
    
    if (!message) {
      showNotification('Por favor, escribe algo.');
      return;
    }

    console.log('📤 Sending message:', message.substring(0, 50) + '...');
    console.log('🎯 Modo actual:', selectedMode);

    // Guardar el mensaje en localStorage
    localStorage.setItem('devcenter_first_message', message);
    
    // Limpiar el input
    searchBox.value = '';

    // Mostrar notificación de que se inició el chat
    console.log('✅ Chat iniciado con mensaje: ' + message);
    alert('Chat iniciado. Redirigiendo a la interfaz de chat...');
    window.location.href = 'chat/';
  };

  // Enviar mensaje al presionar Enter o pulsar el botón
  const sendMessage = async () => {
    const message = searchBox.value.trim();
    
    if (!message) {
      showNotification('Por favor, escribe algo para empezar.');
      return;
    }

    console.log('📤 Sending message:', message.substring(0, 50) + '...');
    console.log('🎯 Modo actual:', selectedMode);

    // Limpiar el input
    searchBox.value = '';

    // Si es modo chat, redireccionar a la carpeta de chat
    if (selectedMode === 'chat') {
      console.log('💬 Redirigiendo a Chat...');
      localStorage.setItem('devcenter_first_message', message);
      // Usar setTimeout para asegurar que localStorage se guarde antes de redirigir
      setTimeout(() => {
        window.location.href = 'chat/'; // Ruta relativa para compatibilidad
      }, 100);
      return;
    }

    // Si es modo docs, redireccionar a la carpeta de docs
    if (selectedMode === 'docs') {
      console.log('📄 Redirigiendo a Docs...');
      localStorage.setItem('devcenter_docs_initial_prompt', message);
      // Usar setTimeout para asegurar que localStorage se guarde antes de redirigir
      setTimeout(() => {
        window.location.href = '/docs/'; // Ruta a docs
      }, 100);
      return;
    }

    // Para mensajes de programación, hacer una solicitud al endpoint de chat
    let originalText = ''; // Declarar fuera del try
    
    try {
      startChatBtn.disabled = true;
      originalText = startChatBtn.innerHTML;
      
      // Mostrar barra de progreso épica solo si no es chat
      if (selectedMode !== 'chat') {
        showEpicProgressBar();
      }

      console.log('🎯 Modo seleccionado:', selectedMode.toUpperCase());
      console.log('📝 Prompt usado:', selectedMode === 'chat' ? 'Respuesta conversacional' : modePrompts[selectedMode]);

      console.log('📡 Contactando la API de chat con modo:', selectedMode);

      // Construir el mensaje con el prompt del modo
      let finalMessage = message;
      if (selectedMode !== 'chat') {
        finalMessage = modePrompts[selectedMode] + message;
      }

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: finalMessage,
          mode: selectedMode,
          conversationHistory: [],
        }),
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error:', response.status, errorText);
        closeProgressBar();
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('📦 Response data:', data);

      if (data.error) {
        closeProgressBar();
        throw new Error(data.error);
      }

      if (!data.reply) {
        closeProgressBar();
      throw new Error('Sin respuesta del generador de chat');
      }

      console.log('✅ Got response:\n', data.reply);
      
      // Si es modo chat, mostrar respuesta y no buscar código
      if (selectedMode === 'chat') {
        closeProgressBar();
        // Mostrar respuesta en el UI (aquí podrías agregar un chat visual)
        console.log('💬 Respuesta del chat:', data.reply);
        searchBox.focus();
      } else {
        // Para otros modos, detectar y procesar código en la respuesta
        const codeBlocks = detectCodeBlocks(data.reply);
        
        if (codeBlocks.html) {
          // Hay código - guardar y redirigir
          console.log('✨ Código HTML detectado, guardando...');
          saveAndOpenCode(codeBlocks, message);
          // La redirección ocurre en saveAndOpenCode
        } else {
          closeProgressBar();
          console.error('❌ No se detectó código HTML. Respuesta completa:', data.reply.substring(0, 200));
          // Sin alert, simplemente intentar de nuevo
          searchBox.value = message + ' (reintentando...)';
        }
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      console.error('Stack:', error);
      closeProgressBar();
      alert('❌ Error: ' + error.message + '\n\nRevisa la consola (F12) para más detalles.');
    } finally {
      startChatBtn.disabled = false;
      if (originalText) startChatBtn.innerHTML = originalText;
      searchBox.focus();
    }
  };

  // Muestra overlay de carga mientras la IA genera código
  function showEpicProgressBar() {
    if (document.getElementById('epicProgress')) return;
    const el = document.createElement('div');
    el.id = 'epicProgress';
    el.style.cssText = 'position:fixed;inset:0;background:rgba(10,10,20,0.92);backdrop-filter:blur(6px);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:99999;';
    el.innerHTML = `
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" style="margin-bottom:18px">
        <circle cx="22" cy="22" r="18" stroke="#6366f1" stroke-width="2.5" stroke-dasharray="28 84" style="animation:dcxSpin 1s linear infinite;transform-origin:center"/>
        <circle cx="22" cy="22" r="11" stroke="#22d3ee" stroke-width="2" stroke-dasharray="17 52" style="animation:dcxSpin 0.7s linear infinite reverse;transform-origin:center"/>
      </svg>
      <p style="color:#e2e8f0;font-size:15px;font-weight:600;margin:0 0 5px;font-family:system-ui,sans-serif;">Generando código...</p>
      <p style="color:#64748b;font-size:13px;margin:0;font-family:system-ui,sans-serif;">La IA está trabajando</p>
      <style>@keyframes dcxSpin{to{stroke-dashoffset:-125.6}}</style>
    `;
    document.body.appendChild(el);
  }

  // Cierra el overlay de carga
  function closeProgressBar() {
    const progress = document.getElementById('epicProgress');
    if (progress) {
      progress.style.transition = 'opacity 0.3s';
      progress.style.opacity = '0';
      setTimeout(() => progress.remove(), 320);
    }
  }

  // Función para detectar bloques de código
  function detectCodeBlocks(text) {
    const codeBlocks = {
      html: '',
      css: '',
      javascript: ''
    };

    // Detectar HTML (más flexible)
    let htmlMatch = text.match(/```html\n([\s\S]*?)\n```/i);
    if (!htmlMatch) htmlMatch = text.match(/```html([\s\S]*?)```/i);
    if (htmlMatch) codeBlocks.html = htmlMatch[1].trim();

    // Detectar CSS (más flexible)
    let cssMatch = text.match(/```css\n([\s\S]*?)\n```/i);
    if (!cssMatch) cssMatch = text.match(/```css([\s\S]*?)```/i);
    if (cssMatch) codeBlocks.css = cssMatch[1].trim();

    // Detectar JavaScript (más flexible)
    let jsMatch = text.match(/```(?:javascript|js)\n([\s\S]*?)\n```/i);
    if (!jsMatch) jsMatch = text.match(/```(?:javascript|js)([\s\S]*?)```/i);
    if (jsMatch) codeBlocks.javascript = jsMatch[1].trim();

    console.log('🔍 Detectados bloques de código:', {html: !!codeBlocks.html, css: !!codeBlocks.css, js: !!codeBlocks.javascript});
    return codeBlocks;
  }

  // Función para guardar código y abrir en Programar
  function saveAndOpenCode(codeBlocks, prompt = '') {
    // Guardar en localStorage
    const codeData = {
      html: codeBlocks.html || '',
      css: codeBlocks.css || '',
      javascript: codeBlocks.javascript || '',
      prompt: prompt,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('devcenter_generated_code', JSON.stringify(codeData));
    console.log('✅ Código guardado correctamente');

    // Esperar un poco y luego redirigir con animación
    setTimeout(() => {
      closeProgressBar();
      
      // Crear animación de transición
      const transitionDiv = document.createElement('div');
      transitionDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        z-index: 99998;
        animation: slideOut 0.6s ease-in forwards;
      `;
      document.body.appendChild(transitionDiv);

      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideOut {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-100vh); opacity: 0; }
        }
      `;
      document.head.appendChild(style);

      // Redirigir después de la animación
      setTimeout(() => {
        window.location.href = '/Programar?generated=true';
      }, 600);
    }, 500);
  }

  // Click en botón Iniciar chat
  startChatBtn.addEventListener('click', (e) => {
    e.preventDefault();
    sendMessage();
  });

  // Enter en el textarea (pero no Shift+Enter)
  searchBox.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // ==================== RECENT DOCS PREVIEW ====================
  const recentDocsCountEl = document.getElementById('recentDocsCount');
  const recentDocsListEl = document.getElementById('recentDocsList');
  const recentDocsEmptyEl = document.getElementById('recentDocsEmpty');
  const createDocHeaderBtn = document.getElementById('createDocHeaderBtn');
  const createDocEmptyBtn = document.getElementById('createDocEmptyBtn');

  const docMeta = {
    word: {
      label: 'Documento Word',
      short: 'Word',
      iconClass: 'fa-file-word',
      themeClass: 'recent-doc-icon-word'
    },
    powerpoint: {
      label: 'Presentación PowerPoint',
      short: 'PowerPoint',
      iconClass: 'fa-file-powerpoint',
      themeClass: 'recent-doc-icon-ppt'
    },
    excel: {
      label: 'Hoja de cálculo Excel',
      short: 'Excel',
      iconClass: 'fa-file-excel',
      themeClass: 'recent-doc-icon-excel'
    }
  };

  function formatDocTimestamp(value) {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toLocaleString('es-MX', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getDocMeta(type) {
    const generator = window.DevCenterXDocGenerator;
    const normalized = generator && typeof generator.normalizeDocType === 'function'
      ? generator.normalizeDocType(type)
      : (type || 'word');
    return docMeta[normalized] || docMeta.word;
  }

  function sanitizeFileName(value) {
    if (!value) return 'Documento-DevCenterX';
    return value
      .toString()
      .trim()
      .replace(/[\\/:*?"<>|]+/g, '')
      .replace(/\s+/g, ' ')
      .replace(/ /g, '_');
  }

  function ensureDocId(doc) {
    if (!doc) return '';
    if (doc.id) return doc.id;
    const safeName = sanitizeFileName(doc.fileName || 'Documento');
    const timestamp = doc.timestamp || Date.now();
    const suffix = Math.random().toString(36).slice(2, 7);
    const newId = `doc-${safeName}-${timestamp}-${suffix}`;
    doc.id = newId;
    return newId;
  }

  async function downloadRecentDoc(doc) {
    const generator = window.DevCenterXDocGenerator;
    if (!doc || !doc.data || !generator) {
      window.location.href = '/docs/';
      return;
    }

    const typeKey = generator.normalizeDocType
      ? generator.normalizeDocType(doc.docType)
      : (doc.docType || 'word');
    const normalizedType = ['powerpoint', 'excel'].includes(typeKey) ? typeKey : 'word';
    const baseName = sanitizeFileName(doc.fileName || `Documento-${new Date(doc.timestamp || Date.now()).toISOString().slice(0, 10)}`) || `Documento-${Date.now()}`;

    try {
      let blob;
      if (normalizedType === 'powerpoint') {
        blob = await generator.generatePptxBlob(doc.data);
      } else if (normalizedType === 'excel') {
        blob = await generator.generateExcelBlob(doc.data);
      } else {
        blob = await generator.generateWordBlob(doc.data);
      }

      const extension = normalizedType === 'powerpoint'
        ? 'pptx'
        : normalizedType === 'excel'
          ? 'xlsx'
          : 'docx';

      generator.downloadBlob(blob, `${baseName}.${extension}`);
    } catch (error) {
      console.error('Error descargando doc reciente', error);
      alert('No se pudo descargar el documento. Se abrirá la sección de Docs para reintentar.');
      window.location.href = '/docs/';
    }
  }

  function deleteDocById(docId) {
    if (!docId) return;
    try {
      const stored = JSON.parse(localStorage.getItem('devcenter_generated_docs') || '[]');
      const filtered = Array.isArray(stored) ? stored.filter((entry) => entry.id !== docId) : [];
      if (!filtered.length && !stored.length) return;
      localStorage.setItem('devcenter_generated_docs', JSON.stringify(filtered));
      renderRecentDocs();
    } catch (error) {
      console.error('Error eliminando documento:', error);
    }
  }

  function createDocCard(doc) {
    const meta = getDocMeta(doc.docType);
    const fileName = doc.fileName || 'Documento sin nombre';
    const dateLabel = formatDocTimestamp(doc.timestamp);
    ensureDocId(doc);

    const card = document.createElement('div');
    card.className = 'recent-doc-card';
    card.title = fileName;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Abrir ${fileName}`);

    const iconWrapper = document.createElement('span');
    iconWrapper.className = `recent-doc-icon ${meta.themeClass}`;
    const icon = document.createElement('i');
    icon.className = `fa-solid ${meta.iconClass}`;
    icon.setAttribute('aria-hidden', 'true');
    iconWrapper.appendChild(icon);

    const top = document.createElement('div');
    top.className = 'recent-doc-card-top';
    const badge = document.createElement('span');
    badge.className = 'recent-doc-badge';
    badge.textContent = meta.short;
    const dateEl = document.createElement('span');
    dateEl.className = 'recent-doc-date';
    dateEl.textContent = dateLabel;
    top.append(badge, dateEl);

    const header = document.createElement('div');
    header.className = 'recent-doc-card-header';
    header.append(iconWrapper, top);

    const nameEl = document.createElement('p');
    nameEl.className = 'recent-doc-name';
    nameEl.textContent = fileName;

    const footer = document.createElement('div');
    footer.className = 'recent-doc-card-footer';
    const tag = document.createElement('span');
    tag.className = 'recent-doc-tag';
    tag.textContent = meta.label;

    const actions = document.createElement('div');
    actions.className = 'recent-doc-footer-actions';
    const actionSpan = document.createElement('span');
    actionSpan.className = 'recent-doc-action';
    actionSpan.textContent = 'Abrir';
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'recent-doc-delete';
    deleteBtn.textContent = 'Eliminar';
    deleteBtn.title = 'Eliminar este documento';
    deleteBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      event.preventDefault();
      if (!doc.id) return;
      if (!confirm('¿Eliminar este documento de la lista?')) return;
      deleteDocById(doc.id);
    });
    actions.append(actionSpan, deleteBtn);
    footer.append(tag, actions);

    card.append(header, nameEl, footer);

    const handleCardClick = async () => {
      card.classList.add('recent-doc-card-loading');
      try {
        await downloadRecentDoc(doc);
      } finally {
        card.classList.remove('recent-doc-card-loading');
      }
    };

    card.addEventListener('click', handleCardClick);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleCardClick();
      }
    });
    return card;
  }

  function renderRecentDocs() {
    if (!recentDocsListEl || !recentDocsCountEl || !recentDocsEmptyEl) return;
    let docs = [];
    try {
      const stored = localStorage.getItem('devcenter_generated_docs');
      docs = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Error parseando docs recientes:', error);
      docs = [];
    }

    const validDocs = Array.isArray(docs) ? docs : [];
    let needsSave = false;
    const normalizedDocs = validDocs.map((doc) => {
      const hadId = !!doc.id;
      ensureDocId(doc);
      if (!hadId && doc.id) {
        needsSave = true;
      }
      return doc;
    });
    if (needsSave) {
      try {
        localStorage.setItem('devcenter_generated_docs', JSON.stringify(normalizedDocs));
      } catch (error) {
        console.warn('Error guardando IDs generados:', error);
      }
    }

    const count = normalizedDocs.length;

    if (recentDocsCountEl) {
      const label = count === 1 ? 'documento' : 'documentos';
      recentDocsCountEl.textContent = `${count} ${label}`;
    }

    recentDocsListEl.innerHTML = '';

    if (count === 0) {
      recentDocsListEl.style.display = 'none';
      recentDocsEmptyEl.style.display = 'flex';
      return;
    }

    recentDocsEmptyEl.style.display = 'none';
    recentDocsListEl.style.display = 'grid';

    const previewDocs = normalizedDocs.slice(-6).reverse();
    previewDocs.forEach((doc) => recentDocsListEl.appendChild(createDocCard(doc)));
  }

  window.renderRecentDocs = renderRecentDocs;

  const goToDocsPage = () => window.location.href = '/docs/';
  [createDocHeaderBtn, createDocEmptyBtn].forEach((btn) => {
    if (btn) btn.addEventListener('click', goToDocsPage);
  });

  window.addEventListener('storage', (event) => {
    if (event.key === 'devcenter_generated_docs') {
      renderRecentDocs();
    }
  });

  renderRecentDocs();

  console.log('✅ Chat integration ready');
});
