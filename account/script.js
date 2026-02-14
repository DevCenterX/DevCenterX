document.addEventListener('DOMContentLoaded', async () => {
    let currentUser = null;
    let selectedAvatar = 'color-1';
    let customAvatarUrl = null;

    const avatarGradients = {
        'color-1': 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        'color-2': 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
        'color-3': 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        'color-4': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'color-5': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        'color-6': 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
        'color-7': 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
        'color-8': 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
    };

    // Get Firebase instances
    const auth = firebase.auth();
    const db = firebase.firestore();

    async function init() {
        try {
            // Configurar listener para cambios de autenticación
            auth.onAuthStateChanged(async (user) => {
                if (!user) {
                    showNotLoggedIn();
                    return;
                }

                try {
                    // Cargar datos del usuario desde Firestore
                    const userDocSnap = await db.collection('users').doc(user.uid).get();

                    if (!userDocSnap.exists) {
                        throw new Error('Usuario no encontrado en la base de datos');
                    }

                    currentUser = {
                        uid: user.uid,
                        email: user.email,
                        ...userDocSnap.data()
                    };

                    displayProfile(currentUser);
                    await loadUserStats(user.uid);

                } catch (error) {
                    console.error('Error cargando perfil:', error);
                    showMessage('Error al cargar el perfil: ' + error.message, 'error');
                    document.getElementById('loading').style.display = 'none';
                    document.getElementById('profileContent').style.display = 'block';
                }
            });

        } catch (error) {
            console.error('Error en inicialización:', error);
            showNotLoggedIn();
        }
    }

    function showNotLoggedIn() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('notLoggedIn').style.display = 'block';
    }

    function displayProfile(userData) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('profileContent').style.display = 'block';

        const username = userData.username || 'Usuario';
        const email = userData.email || '';
        const avatar = userData.avatar || 'color-1';
        const initial = username[0].toUpperCase();

        // Actualizar campos del formulario
        document.getElementById('usuario').value = username;
        document.getElementById('email').value = email;
        document.getElementById('accountId').textContent = userData.uid || '-';
        document.getElementById('usernameDisplay').textContent = username;
        document.getElementById('emailDisplay').textContent = email;

        // Mostrar fecha de creación
        if (userData.createdAt) {
            try {
                let timestamp = userData.createdAt;
                // Si es un timestamp de Firestore
                if (timestamp.toDate && typeof timestamp.toDate === 'function') {
                    timestamp = timestamp.toDate();
                } else if (typeof timestamp === 'string') {
                    timestamp = new Date(timestamp);
                }
                
                document.getElementById('createdAt').textContent = timestamp.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            } catch (e) {
                document.getElementById('createdAt').textContent = '-';
            }
        }

        // Manejar visualización del avatar
        if (userData.avatar === 'custom' && userData.avatarUrl && userData.avatarUrl.trim() !== '') {
            customAvatarUrl = userData.avatarUrl;
            showCustomAvatar(customAvatarUrl, initial);
            document.getElementById('customAvatarImg').style.display = 'block';
            document.getElementById('customAvatarImg').src = customAvatarUrl;
            document.getElementById('avatarInitial').style.display = 'none';
            selectedAvatar = 'custom';
        } else if (avatarGradients[avatar]) {
            selectedAvatar = avatar;
            document.getElementById('userAvatar').style.background = avatarGradients[avatar];
            document.getElementById('avatarInitial').textContent = initial;
            document.getElementById('customAvatarImg').style.display = 'none';
            document.getElementById('avatarInitial').style.display = 'block';
        } else {
            document.getElementById('avatarInitial').textContent = initial;
            document.getElementById('customAvatarImg').style.display = 'none';
            document.getElementById('avatarInitial').style.display = 'block';
        }

        // Actualizar opciones de avatar
        document.querySelectorAll('.avatar-option:not(.custom-avatar-option)').forEach(opt => {
            opt.textContent = initial;
            opt.classList.remove('selected');
            if (opt.classList.contains(selectedAvatar)) {
                opt.classList.add('selected');
            }
        });

        if (selectedAvatar === 'custom') {
            document.getElementById('customAvatarOption').classList.add('selected');
        }

        // Mostrar plan del usuario
        const planDisplay = userData.plan || 'Normal';
        const planElements = document.querySelectorAll('.stat-value');
        if (planElements.length > 1) {
            planElements[1].textContent = planDisplay;
        }
    }

    function showCustomAvatar(url, initial) {
        const customOption = document.getElementById('customAvatarOption');
        const customImg = document.getElementById('customOptionImg');
        
        if (customOption && customImg) {
            customOption.style.display = 'flex';
            customImg.src = url;
        }
    }

    async function loadUserStats(uid) {
        try {
            // Cargar cantidad de proyectos desde la colección 'proyectos'
            const userProjectsSnap = await db.collection('proyectos').doc(uid).get();

            if (userProjectsSnap.exists) {
                const proyectosData = userProjectsSnap.data();
                const projectsArray = Array.isArray(proyectosData.proyectos) ? proyectosData.proyectos : [];
                document.getElementById('projectsCount').textContent = projectsArray.length;
            } else {
                document.getElementById('projectsCount').textContent = '0';
            }
        } catch (e) {
            console.log('No se pudieron cargar estadísticas:', e);
            document.getElementById('projectsCount').textContent = '0';
        }
    }

    window.toggleAvatarOptions = function() {
        const options = document.getElementById('avatarOptions');
        options.classList.toggle('active');
    };

    window.selectAvatar = function(color) {
        selectedAvatar = color;
        
        document.querySelectorAll('.avatar-option').forEach(opt => {
            opt.classList.remove('selected');
        });

        if (color === 'custom' && customAvatarUrl) {
            document.getElementById('customAvatarImg').style.display = 'block';
            document.getElementById('customAvatarImg').src = customAvatarUrl;
            document.getElementById('avatarInitial').style.display = 'none';
            document.getElementById('userAvatar').style.background = 'var(--bg-tertiary)';
            document.getElementById('customAvatarOption').classList.add('selected');
        } else if (avatarGradients[color]) {
            document.getElementById('customAvatarImg').style.display = 'none';
            document.getElementById('avatarInitial').style.display = 'block';
            document.getElementById('userAvatar').style.background = avatarGradients[color];
            
            document.querySelectorAll('.avatar-option').forEach(opt => {
                if (opt.classList.contains(color)) {
                    opt.classList.add('selected');
                }
            });
        }
        
        document.getElementById('avatarOptions').classList.remove('active');
    };

    window.togglePassword = function() {
        const input = document.getElementById('contrasena');
        const icon = document.getElementById('passwordIcon');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    };

    function showMessage(text, type) {
        const msgEl = document.getElementById('message');
        const icon = type === 'success' 
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
        
        msgEl.innerHTML = `<div class="message ${type}">${icon}<span>${text}</span></div>`;
        setTimeout(() => msgEl.innerHTML = '', 5000);
    }

    function showRedeemMessage(text, type) {
        const msgEl = document.getElementById('redeemMessage');
        const icon = type === 'success' 
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
        
        msgEl.innerHTML = `<div class="message ${type}">${icon}<span>${text}</span></div>`;
        setTimeout(() => msgEl.innerHTML = '', 5000);
    }

    window.redeemCode = async function() {
        // Funcionalidad de canjeo en desarrollo
        showRedeemMessage('Funcionalidad de canjeo en desarrollo', 'error');
    };

    document.getElementById('profileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = document.getElementById('saveBtn');
        const newPassword = document.getElementById('contrasena').value;
        
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

        try {
            if (newPassword) {
                if (newPassword.length < 6) {
                    throw new Error('La contraseña debe tener al menos 6 caracteres');
                }
                // Actualizar contraseña en Firebase Auth
                await auth.currentUser.updatePassword(newPassword);
            }

            showMessage('Cambios guardados correctamente', 'success');
            document.getElementById('contrasena').value = '';

        } catch (error) {
            showMessage('Error: ' + error.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Guardar Cambios';
        }
    });

    window.handleLogout = function() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            auth.signOut().then(() => {
                localStorage.removeItem('devcenter_user_id');
                localStorage.removeItem('devcenter_isLoggedIn');
                window.location.href = '/';
            }).catch((error) => {
                console.error('Error al cerrar sesión:', error);
                showMessage('Error al cerrar sesión', 'error');
            });
        }
    };

    document.getElementById('redeemCode').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            window.redeemCode();
        }
    });

    init();
});
