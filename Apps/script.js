// Script para la sección de Apps Públicas
// Copia el sistema de DevCenter-Community pero filtra solo apps públicas

(async function () {
  const appsGrid = document.getElementById('appsGrid');
  const searchBox = document.getElementById('searchBox');
  const emptyState = document.getElementById('emptyState');
  const loadingState = document.getElementById('loadingState');
  const appPanel = document.getElementById('appPanel');
  const panelOverlay = document.getElementById('panelOverlay');
  const panelClose = document.getElementById('panelClose');

  let allProjects = [];
  let filteredProjects = [];
  let favorites = new Set();

  // Cargar favoritos del localStorage
  function loadFavorites() {
    try {
      const saved = localStorage.getItem('appFavorites');
      if (saved) {
        favorites = new Set(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Error cargando favoritos:', e);
    }
  }

  // Guardar favoritos en localStorage
  function saveFavorites() {
    try {
      localStorage.setItem('appFavorites', JSON.stringify([...favorites]));
    } catch (e) {
      console.warn('Error guardando favoritos:', e);
    }
  }

  // Obtener datos de localStorage o Firestore
  async function loadAppsData() {
    try {
      // Intentar obtener de localStorage (userProjects)
      const stored = localStorage.getItem('userProjects');
      let projects = stored ? JSON.parse(stored) : [];

      if (!Array.isArray(projects)) {
        projects = [];
      }

      // Filtrar solo apps públicas
      allProjects = [];
      projects.forEach(project => {
        if (Array.isArray(project.apps)) {
          project.apps.forEach(app => {
            // Filtrar solo apps con status 'Pública' o 'publica' o 'published'
            const status = (app.status || '').toLowerCase();
            const isPublic = status.includes('publica') || status.includes('public') || status.includes('published');
            
            if (isPublic) {
              allProjects.push({
                ...app,
                parentTitle: project.titulo || project.title || project.name || project.nombre,
                parentId: project.id || project.numeroProyecto
              });
            }
          });
        }
      });

      console.log(`✅ ${allProjects.length} apps públicas cargadas`);
      return true;
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      return false;
    }
  }

  // Obtener título seguro
  function getAppTitle(app) {
    return (
      app.title || 
      app.titulo || 
      app.name || 
      app.nombre || 
      'App sin nombre'
    );
  }

  // Obtener descripción segura
  function getAppDescription(app) {
    return (
      app.description || 
      app.descripcion || 
      app.desc || 
      app.detalles || 
      ''
    );
  }

  // Obtener estado seguro
  function getAppStatus(app) {
    return (
      app.status || 
      app.estado || 
      app.state || 
      app.visibility || 
      'Pública'
    );
  }

  // Obtener URL segura
  function getAppUrl(app) {
    return app.url || app.link || app.enlace || '#';
  }

  // Obtener etiquetas
  function getAppTags(app) {
    const tags = app.tags || app.etiquetas || [];
    return Array.isArray(tags) ? tags : [];
  }

  // Formatear fecha
  function formatDate(dateValue) {
    if (!dateValue) return 'hace poco';
    
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'hace poco';
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'hace menos de un minuto';
    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffHours < 24) return `hace ${diffHours} h`;
    if (diffDays < 7) return `hace ${diffDays} d`;
    
    return date.toLocaleDateString('es-ES', { 
      day: 'short', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }

  // Crear tarjeta de app
  function createAppCard(app) {
    const card = document.createElement('div');
    card.className = 'app-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    const title = getAppTitle(app);
    const description = getAppDescription(app);
    const status = getAppStatus(app);
    const url = getAppUrl(app);
    const isFav = favorites.has(title);

    const dateField = app.updatedAt || app.createdAt || app.fecha;
    const formattedDate = formatDate(dateField);

    // Obtener emoji o usar genérico
    const emoji = app.emoji || app.icon || '📱';

    card.innerHTML = `
      <div class="card-header">
        <div class="card-icon">${emoji}</div>
        <div class="card-title-section">
          <h3 class="card-title" title="${title}">${title}</h3>
          <span class="card-status">Pública</span>
        </div>
      </div>
      <p class="card-description">${description || 'Sin descripción'}</p>
      <div class="card-footer">
        <span class="card-date">${formattedDate}</span>
        <button class="card-fav-btn" aria-label="Añadir a favoritos">
          ${isFav ? '★' : '☆'}
        </button>
      </div>
    `;

    // Event listeners
    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('card-fav-btn')) {
        e.stopPropagation();
        toggleFavorite(app, card);
      } else {
        openPanel(app);
      }
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openPanel(app);
      }
    });

    return card;
  }

  // Abrir panel de detalles
  function openPanel(app) {
    const title = getAppTitle(app);
    const description = getAppDescription(app);
    const status = getAppStatus(app);
    const url = getAppUrl(app);
    const emoji = app.emoji || app.icon || '📱';
    const tags = getAppTags(app);
    const dateField = app.updatedAt || app.createdAt || app.fecha;
    const formattedDate = formatDate(dateField);

    document.getElementById('panelIcon').textContent = emoji;
    document.getElementById('panelTitle').textContent = title;
    document.getElementById('panelDescription').textContent = description || 'Sin descripción';
    document.getElementById('panelStatus').textContent = status;
    document.getElementById('panelDate').textContent = formattedDate;

    const visitBtn = document.getElementById('panelVisit');
    visitBtn.href = url;
    if (url === '#') {
      visitBtn.style.pointerEvents = 'none';
      visitBtn.style.opacity = '0.5';
    } else {
      visitBtn.style.pointerEvents = 'auto';
      visitBtn.style.opacity = '1';
    }

    // Botón de favoritos
    const favBtn = document.getElementById('panelFav');
    const isFav = favorites.has(title);
    document.getElementById('favIcon').textContent = isFav ? '★' : '☆';
    favBtn.onclick = () => toggleFavorite(app);

    // Tags
    const tagsContainer = document.getElementById('panelTags');
    tagsContainer.innerHTML = '';
    tags.forEach(tag => {
      const tagEl = document.createElement('span');
      tagEl.className = 'tag';
      tagEl.textContent = tag;
      tagsContainer.appendChild(tagEl);
    });

    appPanel.setAttribute('aria-hidden', 'false');
  }

  // Cerrar panel
  function closePanel() {
    appPanel.setAttribute('aria-hidden', 'true');
  }

  // Toggle favorito
  function toggleFavorite(app, cardElement = null) {
    const title = getAppTitle(app);
    if (favorites.has(title)) {
      favorites.delete(title);
    } else {
      favorites.add(title);
    }
    saveFavorites();

    // Actualizar visual
    if (cardElement) {
      const favBtn = cardElement.querySelector('.card-fav-btn');
      favBtn.textContent = favorites.has(title) ? '★' : '☆';
    }

    const panelFavIcon = document.getElementById('favIcon');
    if (panelFavIcon) {
      panelFavIcon.textContent = favorites.has(title) ? '★' : '☆';
    }
  }

  // Actualizar grid
  function updateGrid(projects) {
    appsGrid.innerHTML = '';
    
    if (projects.length === 0) {
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';
    projects.forEach((app, index) => {
      const card = createAppCard(app);
      card.style.animationDelay = `${index * 0.05}s`;
      appsGrid.appendChild(card);
    });
  }

  // Filtrar por búsqueda
  function filterApps() {
    const query = searchBox.value.toLowerCase().trim();
    
    if (!query) {
      filteredProjects = [...allProjects];
    } else {
      filteredProjects = allProjects.filter(app => {
        const title = getAppTitle(app).toLowerCase();
        const desc = getAppDescription(app).toLowerCase();
        const tags = getAppTags(app).join(' ').toLowerCase();
        
        return title.includes(query) || desc.includes(query) || tags.includes(query);
      });
    }

    updateGrid(filteredProjects);
  }

  // Event listeners
  searchBox.addEventListener('input', filterApps);
  panelOverlay.addEventListener('click', closePanel);
  panelClose.addEventListener('click', closePanel);
  appPanel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePanel();
  });

  // Inicializar
  async function init() {
    loadFavorites();
    
    const success = await loadAppsData();
    loadingState.style.display = 'none';

    if (success && allProjects.length > 0) {
      filteredProjects = [...allProjects];
      updateGrid(filteredProjects);
    } else if (!success) {
      emptyState.innerHTML = `
        <div class="empty-icon">⚠️</div>
        <h2>Error cargando apps</h2>
        <p>Intenta recargar la página</p>
      `;
      emptyState.style.display = 'block';
    } else {
      emptyState.style.display = 'block';
    }
  }

  init();
})();
