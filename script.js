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
  `${username}, ¿creamos algo hoy?`,
  `¿Listo ${username}? Vamos a crear`,
  `${username}, ¿qué haremos?`,
  `¡Bienvenido ${username}! ¿Qué construimos?`,
  `${username}, es hora de crear`,
  `¿Qué le parece ${username}? Empecemos`,
  `${username}, ¡creemos juntos!`,
  `${username}, manos a la obra`,
  `¿Qué sigue, ${username}?`,
  `¡A darle, ${username}!`,
  `${username}, ¿qué sigue en la lista?`,
  `¡Hola ${username}! A diseñar`,
  `${username}, materializa tu idea`,
  `¿Inspirado, ${username}?`,
  `${username}, hagamos magia`,
  `¡Dale, ${username}! Empieza ahora`,
  `${username}, el lienzo es tuyo`
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
        if (proyectosSnap.exists()) {
          const pData = proyectosSnap.data();
          if (Array.isArray(pData.proyectos)) createdCount = pData.proyectos.length;
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

// ==================== GEMINI CHAT INTEGRATION ====================
// Integración con Gemini 1.5 Flash para el input de búsqueda

// Prompts personalizados para cada modo
const modePrompts = {
  chat: '',
  programar: 'Eres un experto programador fullstack. Genera un código HTML5 completo, funcional y moderno para: '
};

document.addEventListener('DOMContentLoaded', () => {
  const searchBox = document.getElementById('searchBox');
  const startChatBtn = document.getElementById('startChatBtn');
  let selectedMode = 'chat'; // Modo por defecto
  
  if (!searchBox || !startChatBtn) {
    console.log('⚠️ Chat elements not found');
    return;
  }

  console.log('✅ Gemini chat elements loaded');

  // Event listeners para los botones de modo selector
  const modeSelectors = document.querySelectorAll('.mode-selector');
  modeSelectors.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Remover clase active de todos los botones
      modeSelectors.forEach(btn => btn.classList.remove('active'));
      
      // Agregar clase active al botón clickeado
      button.classList.add('active');
      
      // Actualizar modo seleccionado
      selectedMode = button.dataset.mode;
      console.log('🎯 Modo seleccionado:', selectedMode);
      
      // Actualizar placeholder basado en el modo
      updatePlaceholder(selectedMode);
    });
  });

  // Función para actualizar el placeholder
  function updatePlaceholder(mode) {
    const placeholders = {
      chat: 'Escribe tu pregunta o idea...',
      programar: 'Describe el código que necesitas...'
    };
    searchBox.placeholder = placeholders[mode] || 'Escribe tu idea...';
  }

  // Event listener en el botón "Iniciar Chat" - Forzar modo chat
  if (startChatBtn) {
    startChatBtn.addEventListener('click', () => {
      selectedMode = 'chat'; // Forzar modo chat
      console.log('🎯 Botón Iniciar Chat: Modo forzado a chat');
      // Marcar el botón chat como activo
      const chatModeBtn = document.querySelector('.mode-selector[data-mode="chat"]');
      if (chatModeBtn) {
        modeSelectors.forEach(btn => btn.classList.remove('active'));
        chatModeBtn.classList.add('active');
      }
      sendMessage();
    });
  }

  // Enviar mensaje al presionar Enter o pulsar el botón
  const sendMessage = async () => {
    const message = searchBox.value.trim();
    
    if (!message) {
      console.log('⚠️ Empty message');
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

    // Para mensajes de programación, hacer una solicitud a Gemini
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

      console.log('📡 Contacting /api/gemini with mode:', selectedMode);

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
        throw new Error('Sin respuesta de Gemini');
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

  // Función para mostrar barra de progreso épica
  function showEpicProgressBar() {
    const progressHTML = `
      <div id="epicProgress" style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 99999;
      ">
        <div style="text-align: center;">
          <h1 style="
            color: white;
            font-size: 48px;
            margin: 0 0 30px 0;
            animation: pulse 2s infinite;
          ">✨ Generando tu código...</h1>
          
          <div style="
            width: 300px;
            height: 8px;
            background: rgba(255,255,255,0.3);
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 30px;
          ">
            <div id="progressBar" style="
              width: 0%;
              height: 100%;
              background: linear-gradient(90deg, #4CAF50, #45a049, #4CAF50);
              background-size: 200% 200%;
              animation: moveGradient 2s infinite, fillProgress 8s ease-in-out forwards;
            "></div>
          </div>

          <p style="
            color: white;
            font-size: 18px;
            margin: 0;
            animation: fadeInOut 3s infinite;
          ">Espera mientras la IA crea magia... 🚀</p>
        </div>

        <style>
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }
          
          @keyframes fillProgress {
            0% { width: 0%; }
            90% { width: 90%; }
            100% { width: 100%; }
          }
          
          @keyframes moveGradient {
            0% { background-position: 0% 0%; }
            100% { background-position: 200% 0%; }
          }
          
          @keyframes fadeInOut {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
          }
        </style>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', progressHTML);
  }

  // Función para cerrar la barra de progreso
  function closeProgressBar() {
    const progress = document.getElementById('epicProgress');
    if (progress) {
      progress.style.animation = 'fadeOut 0.5s ease forwards';
      setTimeout(() => progress.remove(), 500);
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

  // ==================== GENERATED DOCUMENTS MANAGEMENT ====================
  const docsBtn = document.getElementById('docsBtn');
  const generatedDocsSection = document.getElementById('generatedDocsSection');
  const generatedDocsList = document.getElementById('generatedDocsList');

  // Cargar y mostrar documentos generados
  function loadGeneratedDocs() {
    try {
      const docs = JSON.parse(localStorage.getItem('devcenter_generated_docs') || '[]');
      if (docs.length === 0) {
        if (generatedDocsSection) generatedDocsSection.classList.add('hidden');
        return;
      }

      if (generatedDocsSection) generatedDocsSection.classList.remove('hidden');
      if (generatedDocsList) {
        generatedDocsList.innerHTML = '';
        docs.slice(-5).reverse().forEach((doc, index) => {
          const docEl = document.createElement('button');
          docEl.type = 'button';
          docEl.className = 'w-full text-left px-3 py-2 rounded bg-slate-700/50 hover:bg-slate-600 text-xs text-slate-300 hover:text-slate-100 transition-colors flex justify-between items-center';
          const date = new Date(doc.timestamp).toLocaleDateString('es-ES', {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'});
          docEl.innerHTML = `
            <span>${doc.docType === 'word' ? '📄 Word' : doc.docType === 'powerpoint' ? '📊 PowerPoint' : '📋 Excel'} - ${doc.fileName || 'Sin nombre'}</span>
            <span class="text-slate-500 text-xs">${date}</span>
          `;
          docEl.addEventListener('click', () => goToDocsWithConfig(doc.docType, doc.fileName));
          if (generatedDocsList) generatedDocsList.appendChild(docEl);
        });
      }
    } catch (e) {
      console.warn('Error al cargar documentos generados:', e);
    }
  }

  // Ir a docs con configuración preseleccionada
  function goToDocsWithConfig(docType, fileName) {
    localStorage.setItem('devcenter_docs_config', JSON.stringify({
      docType: docType,
      fileName: fileName,
      timestamp: new Date().toISOString()
    }));
    window.location.href = '/docs/';
  }

  // Click en botón Docs
  if (docsBtn) {
    docsBtn.addEventListener('click', () => {
      window.location.href = '/docs/';
    });
  }

  // Cargar documentos al inicio
  loadGeneratedDocs();

  console.log('✅ Gemini chat integration ready');
});
