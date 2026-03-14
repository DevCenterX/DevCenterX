// DevCenterX IDE - Gemini 3.1 Flash Lite Integration
const API_KEY = 'AIzaSyA97PuXr3T8JXhjapAHwPWgBL-W5jwkebE';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

// Get DOM Elements
const promptInput = document.getElementById('promptInput');
const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');
const previewFrame = document.getElementById('previewFrame');
const codeOutput = document.getElementById('codeOutput').querySelector('code');
const charCount = document.querySelector('.char-count');
const statusMessage = document.getElementById('statusMessage');
const tokenCount = document.getElementById('tokenCount');
const loadingOverlay = document.getElementById('loadingOverlay');
const refreshBtn = document.getElementById('refreshBtn');
const copyBtn = document.getElementById('copyBtn');

// Menu Items
const menuItems = document.querySelectorAll('.menu-item');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    updateCharCount();
});

function initializeEventListeners() {
    // Character counter
    promptInput.addEventListener('input', updateCharCount);

    // Generate Button
    generateBtn.addEventListener('click', generateHTML);

    // Clear Button
    clearBtn.addEventListener('click', clearAll);

    // Menu Navigation
    menuItems.forEach(item => {
        item.addEventListener('click', switchPanel);
    });

    // Preview Refresh
    refreshBtn.addEventListener('click', refreshPreview);

    // Copy Code
    copyBtn.addEventListener('click', copyToClipboard);

    // Enter to Generate (Ctrl+Shift+Enter)
    promptInput.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'Enter') {
            generateHTML();
        }
    });
}

function updateCharCount() {
    const length = promptInput.value.length;
    charCount.textContent = `${length}/2000`;
    
    if (length > 2000) {
        promptInput.value = promptInput.value.substring(0, 2000);
        charCount.textContent = '2000/2000';
    }
}

function switchPanel(e) {
    const tab = e.currentTarget.getAttribute('data-tab');
    
    // Remove active class from all items and panels
    menuItems.forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(panel => panel.classList.remove('active'));
    
    // Add active class to clicked item and corresponding panel
    e.currentTarget.classList.add('active');
    document.getElementById(`${tab}-panel`).classList.add('active');
}

async function generateHTML() {
    const prompt = promptInput.value.trim();

    if (!prompt) {
        statusMessage.textContent = '❌ Por favor, escribe algo en el editor';
        return;
    }

    if (prompt.length > 2000) {
        statusMessage.textContent = '❌ El prompt es demasiado largo (máx. 2000 caracteres)';
        return;
    }

    // Disable button and show loading
    generateBtn.disabled = true;
    loadingOverlay.classList.remove('hidden');
    statusMessage.textContent = '⏳ Generando con IA...';

    try {
        const htmlContent = await callGeminiAPI(prompt);
        
        // Update outputs
        codeOutput.textContent = htmlContent;
        updatePreview(htmlContent);
        
        // Switch to preview
        switchToPanel('preview');
        
        statusMessage.textContent = '✅ Código generado exitosamente';
        tokenCount.textContent = 'Tokens: ' + estimateTokens(prompt + htmlContent);
    } catch (error) {
        console.error('Error:', error);
        statusMessage.textContent = '❌ Error al generar: ' + error.message;
        codeOutput.textContent = 'Error: ' + error.message;
    } finally {
        generateBtn.disabled = false;
        loadingOverlay.classList.add('hidden');
    }
}

async function callGeminiAPI(prompt) {
    const systemPrompt = `Eres un experto en HTML, CSS y JavaScript. Tu tarea es generar código HTML completo y funcional basado en el prompt del usuario.

IMPORTANTE:
- Devuelve SOLO el código HTML, sin explicaciones adicionales
- Incluye estilos CSS dentro de etiquetas <style> en el <head>
- Incluye JavaScript dentro de etiquetas <script> si es necesario
- Asegúrate de que el HTML sea válido y se vea bien en un navegador
- Si el usuario pide una "página", crea una página HTML completa con estructura adecuada
- Si pide un "componente", crea un componente HTML autocontenido

El HTML debe ser:
1. Completamente funcional
2. Responsivo (si es necesario)
3. Bien estructurado
4. Visualmente atractivo`;

    const requestBody = {
        contents: [{
            parts: [
                {
                    text: systemPrompt + "\n\nPrompt del usuario: " + prompt
                }
            ]
        }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4000
        }
    };

    try {
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error('No content generated');
        }

        let htmlContent = data.candidates[0].content.parts[0].text;
        
        // Clean up markdown formatting if present
        htmlContent = htmlContent.replace(/^```html\n/, '').replace(/\n```$/, '');
        htmlContent = htmlContent.replace(/^```\n/, '').replace(/\n```$/, '');

        return htmlContent;
    } catch (error) {
        throw new Error('API Error: ' + error.message);
    }
}

function updatePreview(htmlContent) {
    try {
        const iframe = document.getElementById('previewFrame');
        iframe.srcdoc = htmlContent;
    } catch (error) {
        console.error('Preview error:', error);
        statusMessage.textContent = '⚠️ Error al mostrar preview';
    }
}

function refreshPreview() {
    const currentCode = codeOutput.textContent;
    if (currentCode) {
        updatePreview(currentCode);
        statusMessage.textContent = '🔄 Preview actualizado';
    }
}

function switchToPanel(panelName) {
    const menuItem = document.querySelector(`[data-tab="${panelName}"]`);
    if (menuItem) {
        menuItem.click();
    }
}

function copyToClipboard() {
    const code = codeOutput.textContent;
    if (!code) {
        statusMessage.textContent = '❌ No hay código para copiar';
        return;
    }

    navigator.clipboard.writeText(code).then(() => {
        statusMessage.textContent = '✅ Código copiado al portapapeles';
        copyBtn.textContent = '✓ Copiado';
        setTimeout(() => {
            copyBtn.textContent = '📋 Copiar';
        }, 2000);
    }).catch(() => {
        statusMessage.textContent = '❌ Error al copiar';
    });
}

function clearAll() {
    promptInput.value = '';
    codeOutput.textContent = '';
    previewFrame.srcdoc = '';
    statusMessage.textContent = 'Esperando input...';
    tokenCount.textContent = 'Tokens: 0';
    updateCharCount();
}

function estimateTokens(text) {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
}