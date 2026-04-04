document.addEventListener('DOMContentLoaded', async () => {
    let currentUser = null;
    let selectedAvatar = 'color-1';
    let customAvatarUrl = null;

    const avatarGradients = {
        'color-1': 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        'color-2': 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
        'color-3': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'color-4': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'color-5': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        'color-6': 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
        'color-7': 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
        'color-8': 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
    };

    const auth = firebase.auth();
    const db = firebase.firestore();

    // Splash screen timer
    window.addEventListener('load', () => {
        setTimeout(() => {
            const splash = document.getElementById('splashScreen');
            if (splash) splash.style.display = 'none';
        }, 2400);
    });

    // Initialize app
    async function init() {
        auth.onAuthStateChanged(async (user) => {
            if (!user) {
                showNotLoggedIn();
                return;
            }

            try {
                const userDocSnap = await db.collection('users').doc(user.uid).get();

                if (!userDocSnap.exists) {
                    throw new Error('Usuario no encontrado');
                }

                currentUser = {
                    uid: user.uid,
                    email: user.email,
                    ...userDocSnap.data()
                };

                displayProfile(currentUser);
                await loadUserStats(user.uid);
            } catch (error) {
                console.error('Error al cargar perfil:', error);
                showMessage('Error al cargar el perfil', 'error');
                showNotLoggedIn();
            }
        });
    }

    function showNotLoggedIn() {
        const loadingState = document.getElementById('loadingState');
        const notLoggedInState = document.getElementById('notLoggedInState');
        const profileContent = document.getElementById('profileContent');

        loadingState.style.display = 'none';
        profileContent.style.display = 'none';
        notLoggedInState.style.display = 'block';
    }

    function displayProfile(userData) {
        const loadingState = document.getElementById('loadingState');
        const profileContent = document.getElementById('profileContent');

        loadingState.style.display = 'none';
        profileContent.style.display = 'block';

        const username = userData.username || 'Usuario';
        const email = userData.email || '';
        const avatar = userData.avatar || 'color-1';
        const initial = username[0].toUpperCase();

        // Update form fields
        document.getElementById('usuario').value = username;
        document.getElementById('email').value = email;
        document.getElementById('accountId').textContent = userData.uid || '-';
        document.getElementById('usernameDisplay').textContent = username;
        document.getElementById('emailDisplay').textContent = email;

        // Update created date
        if (userData.createdAt) {
            try {
                let timestamp = userData.createdAt;
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

        // Handle avatar display
        if (userData.avatar === 'custom' && userData.avatarUrl && userData.avatarUrl.trim() !== '') {
            customAvatarUrl = userData.avatarUrl;
            showCustomAvatar(customAvatarUrl);
            setAvatarView('custom');
            selectedAvatar = 'custom';
        } else if (avatarGradients[avatar]) {
            selectedAvatar = avatar;
            setAvatarView(avatar, initial);
        } else {
            setAvatarView('color-1', initial);
        }

        // Update avatar options
        updateAvatarOptions(selectedAvatar, initial);

        // Display user plan
        const planDisplay = userData.plan || 'Normal';
        const planElements = document.querySelectorAll('.stat-value');
        if (planElements.length > 1) {
            planElements[1].textContent = planDisplay;
        }
    }

    function setAvatarView(avatarType, initial = '') {
        const avatar = document.getElementById('userAvatar');
        const customImg = document.getElementById('customAvatarImg');
        const avatarInitial = document.getElementById('avatarInitial');

        if (avatarType === 'custom' && customAvatarUrl) {
            avatar.style.background = 'transparent';
            customImg.src = customAvatarUrl;
            customImg.style.display = 'block';
            avatarInitial.style.display = 'none';
        } else if (avatarGradients[avatarType]) {
            avatar.style.background = avatarGradients[avatarType];
            customImg.style.display = 'none';
            avatarInitial.textContent = initial || '?';
            avatarInitial.style.display = 'block';
        }
    }

    function updateAvatarOptions(selected, initial) {
        document.querySelectorAll('.avatar-option[data-color]').forEach(opt => {
            opt.classList.remove('selected');
        });

        const selectedOpt = document.querySelector(`[data-color="${selected}"]`);
        if (selectedOpt) {
            selectedOpt.classList.add('selected');
        }

        if (selected === 'custom' && document.getElementById('customAvatarOption')) {
            document.getElementById('customAvatarOption').classList.add('selected');
        }
    }

    function showCustomAvatar(url) {
        const customOption = document.getElementById('customAvatarOption');
        const customImg = document.getElementById('customOptionImg');
        
        if (customOption && customImg) {
            customOption.style.display = 'flex';
            customImg.src = url;
        }
    }

    async function loadUserStats(uid) {
        try {
            const userProjectsSnap = await db.collection('proyectos').doc(uid).get();
            const projectsArray = userProjectsSnap.exists && Array.isArray(userProjectsSnap.data()?.proyectos) 
                ? userProjectsSnap.data().proyectos 
                : [];
            
            document.getElementById('projectsCount').textContent = projectsArray.length;

            // Count applications if available
            const appsCount = projectsArray.reduce((sum, p) => sum + (p.apps?.length || 0), 0);
            document.getElementById('appsCount').textContent = appsCount;
        } catch (e) {
            console.log('Error loading stats:', e);
            document.getElementById('projectsCount').textContent = '0';
            document.getElementById('appsCount').textContent = '0';
        }
    }

    // Global functions
    window.toggleAvatarOptions = function() {
        const options = document.getElementById('avatarOptions');
        options.classList.toggle('active');
    };

    window.selectAvatar = function(color) {
        selectedAvatar = color;
        
        if (color === 'custom' && customAvatarUrl) {
            setAvatarView('custom');
        } else if (avatarGradients[color]) {
            const initial = currentUser?.username?.[0]?.toUpperCase() || '?';
            setAvatarView(color, initial);
        }
        
        updateAvatarOptions(color);
        document.getElementById('avatarOptions').classList.remove('active');
    };

    window.togglePasswordVisibility = function() {
        const input = document.getElementById('contrasena');
        const icon = document.getElementById('passwordIcon');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
    };

    // Show message utility
    function showMessage(text, type = 'success') {
        const container = document.getElementById('messageContainer');
        
        const iconSvg = type === 'success' 
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
        
        const msgEl = document.createElement('div');
        msgEl.className = `message ${type}`;
        msgEl.innerHTML = `${iconSvg}<span>${text}</span>`;
        
        container.innerHTML = '';
        container.appendChild(msgEl);
        
        setTimeout(() => {
            if (container.contains(msgEl)) {
                container.removeChild(msgEl);
            }
        }, 4000);
    }

    // Redeem code
    window.redeemCode = async function() {
        const code = document.getElementById('redeemCode').value.trim();
        
        if (!code) {
            showMessage('Ingresa un código válido', 'error');
            return;
        }

        try {
            // Validar formato del código
            if (!/^[A-Z0-9-]+$/.test(code)) {
                throw new Error('Formato de código inválido');
            }

            showMessage('Funcionalidad en desarrollo. Código: ' + code, 'success');
            document.getElementById('redeemCode').value = '';
        } catch (error) {
            showMessage(error.message, 'error');
        }
    };

    // Form submission
    document.getElementById('profileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = e.target.querySelector('button[type="submit"]');
        const newPassword = document.getElementById('contrasena').value;
        
        btn.disabled = true;
        const originalContent = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

        try {
            if (newPassword) {
                if (newPassword.length < 6) {
                    throw new Error('La contraseña debe tener al menos 6 caracteres');
                }
                await auth.currentUser.updatePassword(newPassword);
                document.getElementById('contrasena').value = '';
            }

            showMessage('Cambios guardados correctamente', 'success');
        } catch (error) {
            showMessage('Error: ' + error.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalContent;
        }
    });

    // Logout handler
    window.handleLogout = function() {
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
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

    // Allow Enter key on redeem input
    document.getElementById('redeemCode')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            window.redeemCode();
        }
    });

    init();
});
