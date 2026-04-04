'use strict';
// ==================== GLOBALS ====================
let currentTab = 'html';
let isGenerating = false;
let chatHistory = [];
let currentChatId = null;
let chatStarted = false;
let hasUnsavedChanges = false;
const findState = { query:'', matches:[], currentMatch:-1, caseSensitive:false, useRegex:false };

// ==================== THEME ====================
function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    // Sun shown in light mode, moon shown in dark mode
    document.querySelectorAll('.icon-sun').forEach(el => el.style.display = t === 'light' ? 'block' : 'none');
    document.querySelectorAll('.icon-moon').forEach(el => el.style.display = t === 'dark' ? 'block' : 'none');
    const sdTheme = document.getElementById('sdThemeBtn');
    if (sdTheme) sdTheme.textContent = t === 'dark' ? 'Oscuro' : 'Claro';
}
function initTheme() {
    const saved = localStorage.getItem('dcx_theme');
    const osDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    // Priority: user-saved → OS → dark
    applyTheme(saved || (osDark ? 'dark' : 'light'));

    // Manual toggle button
    document.getElementById('themeToggleBtn')?.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme');
        const next = cur === 'dark' ? 'light' : 'dark';
        localStorage.setItem('dcx_theme', next);
        applyTheme(next);
    });

    // Auto-follow OS if user hasn't manually picked a theme
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('dcx_theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });
}

// ==================== SINGLE-PASS TOKENIZER ====================
// Collects ALL token positions on the escaped string first,
// then builds output in one forward pass — spans NEVER get re-processed
function esc(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function buildOutput(escaped, hits) {
    // Sort by start position, longest match wins on tie
    hits.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));
    const kept = []; let fence = 0;
    for (const h of hits) {
        if (h.start >= fence && h.end > h.start) { kept.push(h); fence = h.end; }
    }
    let out = '', pos = 0;
    for (const h of kept) {
        out += escaped.slice(pos, h.start);
        out += `<span class="${h.cls}">${escaped.slice(h.start, h.end)}</span>`;
        pos = h.end;
    }
    return out + escaped.slice(pos);
}

function collectHits(escaped, rules) {
    const hits = [];
    for (const rule of rules) {
        rule.re.lastIndex = 0;
        let m;
        while ((m = rule.re.exec(escaped)) !== null) {
            if (rule.parts) {
                // multi-group: each capture group → own class
                let cursor = m.index;
                for (let i = 0; i < rule.parts.length; i++) {
                    const val = m[i + 1];
                    if (val != null && val.length > 0) {
                        hits.push({ start: cursor, end: cursor + val.length, cls: rule.parts[i] });
                        cursor += val.length;
                    }
                }
            } else if (rule.g != null) {
                // single capture group
                const val = m[rule.g];
                if (val) {
                    const start = m.index + m[0].indexOf(val);
                    hits.push({ start, end: start + val.length, cls: rule.cls });
                }
            } else {
                hits.push({ start: m.index, end: m.index + m[0].length, cls: rule.cls });
            }
        }
    }
    return hits;
}

// ==================== HTML HIGHLIGHTER ====================
function hlHtml(raw) {
    const s = esc(raw);
    const hits = collectHits(s, [
        { re: /(&lt;!--[\s\S]*?--&gt;)/g,  cls: 'hl-comment' },
        { re: /(&lt;!DOCTYPE\b[^&>]*&gt;)/gi, cls: 'hl-doctype' },
        { re: /([^\u0000-\u007F]+)/g,       cls: 'hl-entity' },
        { re: /(&amp;[a-zA-Z#][a-zA-Z0-9]*;)/g, cls: 'hl-entity' },
        // Closing tag: 3 parts </tag>
        { re: /(&lt;\/)([\w:-]+)(\s*&gt;)/g, parts: ['hl-punct','hl-tag','hl-punct'] },
        // Opening tag: <tag
        { re: /(&lt;)([\w:-]+)/g,            parts: ['hl-punct','hl-tag'] },
        // End bracket > or />
        { re: /(\s*\/&gt;|(?<![=])\s*&gt;)/g, cls: 'hl-punct' },
        // SVG attrs (before general attr so teal wins)
        { re: /\b(cx|cy|r|rx|ry|x1|y1|x2|y2|d|viewBox|fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|stroke-dasharray|stroke-dashoffset|opacity|points|offset|gradientUnits|stop-color|patternUnits|preserveAspectRatio|stdDeviation|dx|dy|fx|fy|spreadMethod|filterUnits|result|markerWidth|markerHeight|refX|refY)\b(?=\s*=)/g, cls: 'hl-svg-attr' },
        // Boolean attrs (no =)
        { re: /\b(required|disabled|checked|selected|readonly|multiple|autofocus|autoplay|controls|loop|muted|hidden|defer|async|novalidate|reversed|scoped|open|download|draggable|spellcheck)\b(?!\s*=)/g, cls: 'hl-builtin' },
        // attr="value" — 3 parts
        { re: /([\w:-]+)(=)(&quot;[\s\S]*?&quot;)/g, parts: ['hl-attr-name','hl-punct','hl-string'] },
        // attr= (no quotes)
        { re: /\b(class|id|src|href|type|name|value|placeholder|action|method|rel|target|alt|title|lang|charset|content|property|role|style|media|crossorigin|tabindex|width|height|for|rows|cols|colspan|rowspan|enctype|pattern|min|max|step|size|data-[\w-]+|aria-[\w-]+|onclick|onload|onerror|onchange|oninput|onsubmit|onkeydown|onkeyup)\b(?=\s*=)/g, cls: 'hl-attr-name' },
        // transform attr
        { re: /\b(transform)\b(?=\s*=)/g, cls: 'hl-svg-attr' },
    ]);
    return buildOutput(s, hits);
}

// ==================== CSS HIGHLIGHTER ====================
function hlCss(raw) {
    const s = esc(raw);
    const hits = collectHits(s, [
        { re: /(\/\*[\s\S]*?\*\/)/g,         cls: 'hl-comment' },
        { re: /(@media\b[^{]*)/g,             cls: 'hl-media' },
        { re: /(@keyframes)\s+([\w-]+)/g,     parts: ['hl-keyword','hl-anim-name'] },
        { re: /(@[\w-]+)/g,                   cls: 'hl-keyword' },
        { re: /(--[\w-]+)/g,                  cls: 'hl-cssvar' },
        { re: /(::?[\w-]+(?:\([^)]*\))?)/g,   cls: 'hl-pseudo' },
        { re: /([.#][a-zA-Z_-][\w-]*)/g,      cls: 'hl-class-name' },
        // Element selectors — only at selector positions (before {)
        { re: /(?:^|[ \t,>+~])(html|body|div|span|a|p|h[1-6]|ul|ol|li|table|tr|td|th|form|input|button|select|textarea|section|article|nav|header|footer|main|aside|figure|img|video|audio|canvas|svg|path|circle|rect|polygon|line|g|defs|linearGradient|stop)\b/gm, cls: 'hl-tag', g: 1 },
        // Keyframe % stops
        { re: /\b(\d+%)\s*(?=\{)/g,           cls: 'hl-number' },
        // Property names — word before single colon
        { re: /(?:^|[{;])[ \t]*([\w-]+)[ \t]*(?=:(?!:))/gm, cls: 'hl-property', g: 1 },
        { re: /(!important)/g,                cls: 'hl-important' },
        { re: /(#[0-9a-fA-F]{3,8})\b/g,       cls: 'hl-hex-color' },
        { re: /\b(red|green|blue|white|black|gray|grey|yellow|orange|purple|pink|cyan|magenta|lime|teal|navy|maroon|olive|silver|gold|coral|salmon|indigo|violet|crimson|turquoise|aqua|fuchsia|transparent)\b/g, cls: 'hl-color-kw' },
        { re: /\b(ease(?:-in)?(?:-out)?(?:-in-out)?|linear|step-start|step-end|cubic-bezier|steps)\b/g, cls: 'hl-timing' },
        { re: /\b(none|auto|inherit|initial|unset|normal|bold|italic|flex|grid|block|inline-block|inline-flex|absolute|relative|fixed|sticky|static|visible|hidden|scroll|clip|center|left|right|top|bottom|middle|nowrap|wrap|reverse|collapse|separate|both|forwards|backwards|alternate|alternate-reverse|infinite|running|paused|currentColor|solid|dashed|dotted|double|round|space-between|space-around|space-evenly|stretch|contain|cover|fill|no-repeat|repeat|pointer|default|crosshair|move|grab|not-allowed|row|column|flex-start|flex-end|baseline)\b/g, cls: 'hl-value' },
        // Number + unit (2 parts)
        { re: /([\d.]+)(px|em|rem|%|vh|vw|vmin|vmax|s|ms|deg|turn|rad|fr|ch|ex|pt|pc|cm|mm|in)\b/g, parts: ['hl-number','hl-unit'] },
        { re: /(?<![a-zA-Z#-])\b(\d+\.?\d*)\b/g, cls: 'hl-number', g: 1 },
        // CSS functions rgba() url() etc
        { re: /([\w-]+)\(/g,                  cls: 'hl-function', g: 1 },
        { re: /('(?:[^'\\]|\\.)*'|&quot;(?:[^&]|&(?!quot;))*&quot;)/g, cls: 'hl-string' },
    ]);
    return buildOutput(s, hits);
}

// ==================== JS HIGHLIGHTER ====================
function hlJs(raw) {
    const s = esc(raw);
    const hits = collectHits(s, [
        { re: /(`(?:[^`\\]|\\.)*`)/g,         cls: 'hl-string' },
        { re: /(\/\*[\s\S]*?\*\/)/g,           cls: 'hl-comment' },
        { re: /(\/\/[^\n]*)/g,                 cls: 'hl-comment' },
        { re: /(@[A-Z][\w.]*)/g,               cls: 'hl-decorator' },
        { re: /\b(const|let|var|function|return|if|else|for|while|do|switch|case|default|break|continue|try|catch|finally|throw|new|delete|void|typeof|instanceof|in|of|import|export|from|class|extends|super|this|static|async|await|yield|get|set|debugger)\b/g, cls: 'hl-keyword' },
        { re: /\b(true|false|null|undefined|NaN|Infinity|arguments)\b/g, cls: 'hl-boolean' },
        { re: /\b(console|window|document|navigator|location|history|screen|globalThis|process|module|require|exports|Array|Object|String|Number|Boolean|Symbol|BigInt|Math|JSON|Date|RegExp|Error|TypeError|RangeError|SyntaxError|Map|Set|WeakMap|WeakSet|Promise|Proxy|Reflect|Intl|URL|URLSearchParams|fetch|XMLHttpRequest|WebSocket|Worker|localStorage|sessionStorage|indexedDB|setTimeout|setInterval|clearTimeout|clearInterval|requestAnimationFrame|cancelAnimationFrame|alert|confirm|prompt|performance|crypto|Blob|File|FileReader|FormData|Headers|Request|Response|EventSource|MutationObserver|IntersectionObserver|ResizeObserver|CustomEvent|Event|AbortController|HTMLElement|Element|Node|NodeList|DOMParser|SVGElement|getComputedStyle|structuredClone|queueMicrotask)\b/g, cls: 'hl-builtin' },
        { re: /\b([A-Z][a-zA-Z0-9_$]{1,})\b/g, cls: 'hl-class-name' },
        { re: /('(?:[^'\\]|\\.)*'|&quot;(?:[^&\\]|\\.)*&quot;)/g, cls: 'hl-string' },
        { re: /(=&gt;)/g,                       cls: 'hl-arrow' },
        { re: /\b(0x[0-9a-fA-F]+n?|0b[01]+n?|0o[0-7]+n?|[0-9]+\.?[0-9]*(?:[eE][+-]?[0-9]+)?n?)\b/g, cls: 'hl-number' },
        { re: /(===|!==|==|!=|&lt;=|&gt;=|&lt;&lt;|&gt;&gt;&gt;|&gt;&gt;|\?\?=?|\?\.|&amp;&amp;=?|\|\|=?|\+\+|--|[+\-*/%^~]=?|[=!&|?](?![=&|]))/g, cls: 'hl-operator' },
        // Function calls
        { re: /\b([a-zA-Z_$][\w$]*)\s*(?=\()/g, cls: 'hl-function', g: 1 },
        // Property access .something
        { re: /(?<!\.)\.([a-zA-Z_$][\w$]*)/g,  cls: 'hl-property', g: 1 },
    ]);
    return buildOutput(s, hits);
}

// ==================== UPDATE HIGHLIGHT ====================
function updateHighlight(editorId) {
    const editor = document.getElementById(editorId);
    const pre    = document.getElementById(editorId.replace('Editor','Highlight'));
    if (!editor || !pre) return;

    let code = pre.querySelector('code');
    if (!code) {
        code = document.createElement('code');
        pre.innerHTML = '';
        pre.appendChild(code);
    }

    let html = '';
    if      (editorId === 'htmlEditor') html = hlHtml(editor.value);
    else if (editorId === 'cssEditor')  html = hlCss(editor.value);
    else if (editorId === 'jsEditor')   html = hlJs(editor.value);

    code.innerHTML = html;

    // Sync scroll — works because pre has overflow:scroll
    pre.scrollTop  = editor.scrollTop;
    pre.scrollLeft = editor.scrollLeft;
}

// ==================== GUTTER ====================
function updateGutter(editorId) {
    const editor = document.getElementById(editorId);
    const gutter = document.getElementById(editorId.replace('Editor','Gutter'));
    if (!editor || !gutter) return;
    const lines = editor.value.split('\n'), total = lines.length;
    const curLine = editor.value.substring(0, editor.selectionStart).split('\n').length;
    if (parseInt(gutter.dataset.lc||'0') !== total) {
        const frag = document.createDocumentFragment();
        for (let i=1;i<=total;i++){const sp=document.createElement('span');sp.className='gutter-line'+(i===curLine?' active-line':'');sp.textContent=i;frag.appendChild(sp);}
        gutter.innerHTML=''; gutter.appendChild(frag); gutter.dataset.lc=total;
    } else {
        gutter.querySelectorAll('.gutter-line').forEach((el,i)=>el.classList.toggle('active-line',i+1===curLine));
    }
    gutter.scrollTop = editor.scrollTop;
}
function updateMinimap(){}
function setupMinimapClick(){}

// ==================== CURSOR ====================
function updateCursorPos(editor) {
    if (!editor) return;
    const text = editor.value.substring(0, editor.selectionStart);
    const lines = text.split('\n');
    const pos = document.getElementById('cursorPosition');
    if (pos) pos.textContent = `Ln ${lines.length}, Col ${lines[lines.length-1].length+1}`;
    const selLen = Math.abs(editor.selectionEnd - editor.selectionStart);
    const si = document.getElementById('selectionInfo'), sc = document.getElementById('selCount');
    if (si) si.style.display = selLen>0?'inline':'none';
    if (sc) sc.textContent = selLen;
    const lc = document.getElementById('lineCountDisplay'), total = editor.value.split('\n').length;
    if (lc) lc.textContent = `· ${total} línea${total!==1?'s':''}`;
}

// ==================== PREVIEW ====================
function updatePreview() {
    const html = document.getElementById('htmlEditor')?.value||'';
    const css  = document.getElementById('cssEditor')?.value||'';
    const js   = document.getElementById('jsEditor')?.value||'';
    const frame = document.getElementById('previewFrame'); if(!frame) return;
    const es = document.getElementById('previewEmptyState');
    if(es) es.style.display = (html+css+js).trim()?'none':'flex';
    const doc = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${css}</style></head><body>${html}<script>
(function(){const o={log:console.log,error:console.error,warn:console.warn,info:console.info};
['log','error','warn','info'].forEach(t=>{console[t]=function(...a){o[t](...a);window.parent.postMessage({type:'console',level:t,msg:a.map(x=>typeof x==='object'?JSON.stringify(x):String(x)).join(' ')},\'*\');}});
window.onerror=(m,s,l,c,e)=>window.parent.postMessage({type:'console',level:'error',msg:m},\'*\');
}());\n<\/script><script>${js}<\/script></body></html>`;
    const blob = new Blob([doc],{type:'text/html'});
    const url = URL.createObjectURL(blob);
    frame.src = url;
    setTimeout(()=>URL.revokeObjectURL(url),8000);
}

// ==================== TAB SWITCH ====================
function updateStatusLang(ft) {
    const el = document.getElementById('statusLang'); if(!el) return;
    const c={html:'#f97316',js:'#fbbf24',css:'#06b6d4'}, n={html:'HTML',js:'JavaScript',css:'CSS'};
    el.innerHTML=`<svg width="11" height="11" viewBox="0 0 11 11" fill="none"><rect x="0.5" y="0.5" width="10" height="10" rx="2" stroke="${c[ft]||'#818cf8'}" stroke-width="1"/></svg> ${n[ft]||ft.toUpperCase()}`;
}
function switchTab(fileType) {
    if (fileType!=='agent') currentTab=fileType;
    document.querySelectorAll('.file-tab').forEach(t=>t.classList.remove('active'));
    document.querySelector(`.file-tab[data-file="${fileType}"]`)?.classList.add('active');
    const aw=document.getElementById('agentPanelWrapper');
    if(aw&&fileType!=='agent') aw.style.display='none';
    ['html','js','css'].forEach(l=>document.getElementById(l+'EditorWrapper')?.classList.remove('active'));
    const pv=document.getElementById('previewContainer');
    if(pv){pv.style.display='none';pv.classList.remove('visible');}
    if (fileType==='preview') {
        if(pv){pv.style.display='flex';pv.classList.add('visible');}
        updatePreview();
    } else if (fileType==='agent') {
        if(aw) {
            aw.style.display='flex';
            // Focus the input after a frame so layout is ready
            requestAnimationFrame(()=>{
                document.getElementById('agentPanelInput')?.focus();
            });
        }
    } else {
        document.getElementById(fileType+'EditorWrapper')?.classList.add('active');
        const ed=document.getElementById(fileType+'Editor');
        if(ed){ed.focus();updateCursorPos(ed);updateHighlight(fileType+'Editor');updateStatusLang(fileType);requestAnimationFrame(()=>updateGutter(fileType+'Editor'));}
    }
}

// ==================== EDITOR EVENTS ====================
function setupEditorEvents() {
    ['htmlEditor','jsEditor','cssEditor'].forEach(id => {
        const ed = document.getElementById(id);
        if (!ed) return;

        function syncScroll() {
            const hl = document.getElementById(id.replace('Editor','Highlight'));
            if (hl) { hl.scrollTop = ed.scrollTop; hl.scrollLeft = ed.scrollLeft; }
            const gu = document.getElementById(id.replace('Editor','Gutter'));
            if (gu) gu.scrollTop = ed.scrollTop;
        }

        ed.addEventListener('input', () => {
            updateHighlight(id); // syncs scroll internally
            updateGutter(id);
            updateCursorPos(ed);
            markUnsaved();
        });

        ed.addEventListener('scroll', () => {
            syncScroll();
            requestAnimationFrame(syncScroll); // second frame catches async browser repaints
        });

        ed.addEventListener('click',  () => { updateCursorPos(ed); updateGutter(id); });
        ed.addEventListener('keyup',  () => { updateCursorPos(ed); updateGutter(id); });
        ed.addEventListener('keydown', () => {
            // After keydown browser may auto-scroll to keep caret visible — catch it
            requestAnimationFrame(() => { syncScroll(); updateCursorPos(ed); updateGutter(id); });
        });
    });
}

// ==================== FIREBASE PROJECT INTEGRATION ====================
// ==================== FIREBASE PROJECT INTEGRATION ====================
// Rules require request.auth.uid == uid — we MUST restore Firebase Auth session first
const DCX_FIREBASE_CONFIG = {
    apiKey:            "AIzaSyCsgsrFZ_nTMrtK69f6815I0Hcc1kTASHY",
    authDomain:        "devcenter-agent-48c86.firebaseapp.com",
    projectId:         "devcenter-agent-48c86",
    storageBucket:     "devcenter-agent-48c86.firebasestorage.app",
    messagingSenderId: "911929994293",
    appId:             "1:911929994293:web:1d08f68b4c507ee162557c",
    measurementId:     "G-S5GTYBRVK8",
};

let dcxApp       = null;
let dcxAuth      = null;
let dcxDb        = null;
let dcxUser      = null;   // Firebase Auth user object (has .uid)
let dcxProjectId = null;   // from URL ?pid=
let dcxUid       = null;   // confirmed after auth
let dcxProjectData = null;

// Initialize Firebase App + Auth + Firestore, then wait for auth state
// Returns the authenticated user or null
async function dcxInit() {
    if (dcxUser) return dcxUser;
    try {
        const [appMod, authMod, storeMod] = await Promise.all([
            import('https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js'),
            import('https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js'),
            import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js'),
        ]);

        // Initialize app only once
        if (!window.__DCX_APP) {
            window.__DCX_APP = appMod.initializeApp(DCX_FIREBASE_CONFIG);
        }
        dcxApp  = window.__DCX_APP;
        dcxAuth = authMod.getAuth(dcxApp);
        dcxDb   = storeMod.getFirestore(dcxApp);

        // Wait for auth state to restore (Firebase restores from IndexedDB persistence automatically)
        const user = await new Promise((resolve) => {
            const unsub = authMod.onAuthStateChanged(dcxAuth, (u) => {
                unsub(); // stop listening after first result
                resolve(u);
            });
        });

        if (user) {
            dcxUser = user;
            dcxUid  = user.uid;
            // Keep localStorage in sync
            localStorage.setItem('devcenter_user_id', user.uid);
            localStorage.setItem('devcenter_isLoggedIn', 'true');
            localStorage.setItem('devcenter_user_name', user.displayName || user.email?.split('@')[0] || 'Usuario');
        } else {
            // No Firebase session — check localStorage as fallback
            const lsUid = localStorage.getItem('devcenter_user_id');
            const lsLoggedIn = localStorage.getItem('devcenter_isLoggedIn') === 'true';
            if (lsUid && lsLoggedIn) {
                dcxUid = lsUid; // will likely get permissions error but we try
            }
        }

        return dcxUser;
    } catch(e) {
        console.warn('[DCX] Firebase init failed:', e);
        return null;
    }
}

// Show a full-screen error in the editor area (project not found / permission denied)
function showProjectError(code, msg) {
    const container = document.getElementById('htmlEditorWrapper') || document.querySelector('.editor-container');
    const overlay = document.createElement('div');
    overlay.id = 'dcxProjectError';
    overlay.style.cssText = `
        position:absolute; inset:0; z-index:200;
        display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px;
        background:var(--bg0); text-align:center; padding:40px;
    `;
    overlay.innerHTML = `
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path d="M24 4L44 40H4L24 4Z" stroke="#ef4444" stroke-width="2.5" stroke-linejoin="round"/>
            <path d="M24 18V28M24 34V36" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
        <div style="font-size:20px;font-weight:800;color:#f87171">Error ${code}</div>
        <div style="font-size:14px;color:var(--text2);max-width:380px;line-height:1.7">${msg}</div>
        <div style="display:flex;gap:10px;margin-top:8px;">
            <a href="/" style="padding:9px 20px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;color:var(--text1);font-size:13px;text-decoration:none;font-family:var(--font-ui);">Ir al inicio</a>
            <button onclick="location.reload()" style="padding:9px 20px;background:linear-gradient(135deg,#4f46e5,#7c3aed);border:none;border-radius:8px;color:white;font-size:13px;cursor:pointer;font-family:var(--font-ui);">Reintentar</button>
        </div>
    `;
    // Append to editor-container or body
    const editorContainer = document.getElementById('editorContainer') || document.querySelector('.main-container') || document.body;
    editorContainer.appendChild(overlay);
}

// Load project from Firestore — requires authenticated user
async function loadProjectFromFirebase(pid) {
    try {
        const user = await dcxInit();
        const uid  = dcxUid;
        if (!uid) {
            showProjectError(401, 'No hay sesión activa. Inicia sesión para acceder a tus proyectos.');
            return false;
        }

        const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
        const snap = await getDoc(doc(dcxDb, 'proyectos', uid));

        if (!snap.exists()) {
            showProjectError(404, 'No se encontró ningún proyecto para este usuario.');
            return false;
        }

        const projects = snap.data()?.proyectos || [];
        const project  = projects.find(p => p.id === pid);

        if (!project) {
            showProjectError(404, `El proyecto <strong>${pid}</strong> no existe o fue eliminado.`);
            return false;
        }

        dcxProjectData = project;

        // Populate editors
        ['html','css','js'].forEach(lang => {
            const ed = document.getElementById(lang + 'Editor');
            if (ed) ed.value = project[lang] || '';
        });

        // Project name in nav
        const nameSpan = document.getElementById('projectName');
        if (nameSpan) {
            nameSpan.textContent = project.name || 'DevProject';
            nameSpan.style.opacity = ''; // restore from skeleton state
        }

        // Project info bar
        const infoBar = document.getElementById('projectInfoBar');
        const pibDesc = document.getElementById('pibDesc');
        const pibTags = document.getElementById('pibTags');
        const pibLink = document.getElementById('pibLink');
        if (infoBar) {
            if (pibDesc) pibDesc.textContent = project.description || '';
            if (pibTags) {
                pibTags.innerHTML = '';
                (project.tags || []).forEach(tag => {
                    const el = document.createElement('span');
                    el.className = 'pib-tag'; el.textContent = '#' + tag;
                    pibTags.appendChild(el);
                });
            }
            if (pibLink && project.deployUrl) {
                pibLink.href = project.deployUrl;
                pibLink.style.display = 'flex';
                const pibLinkSpan = pibLink.querySelector('span');
                if (pibLinkSpan) pibLinkSpan.textContent = project.deployUrl.replace('https://','');
            }
            if (project.description || project.tags?.length || project.deployUrl) {
                infoBar.style.display = 'flex';
            }
        }

        // localStorage backup
        try {
            localStorage.setItem('dcx_code', JSON.stringify({ html: project.html||'', css: project.css||'', js: project.js||'', savedAt: Date.now() }));
            localStorage.setItem('dcx_project_name', project.name || 'DevProject');
        } catch(_) {}

        // Load user-specific data now that uid is confirmed
        ensureUserDocument();
        loadUserPill();
        loadAgentLimitFromFirebase();

        return true;
    } catch(e) {
        console.error('[DCX] Error:', e);
        const isPerms = e?.code === 'permission-denied' || e?.message?.includes('permissions');
        if (isPerms) {
            showProjectError(403, 'Sin permisos para acceder a este proyecto. Asegúrate de estar autenticado con la cuenta correcta.');
        } else {
            showProjectError(500, `Error al cargar el proyecto: ${e.message || e}`);
        }
        return false;
    }
}

// Save code to Firestore
async function saveToFirebase(html, css, js) {
    if (!dcxUid || !dcxProjectId) return false;
    try {
        await dcxInit();
        const { doc, getDoc, updateDoc } =
            await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
        const ref  = doc(dcxDb, 'proyectos', dcxUid);
        const snap = await getDoc(ref);
        if (!snap.exists()) return false;
        const now = new Date().toISOString(); // ISO string — safe inside arrays
        const updated = (snap.data()?.proyectos || []).map(p =>
            p.id === dcxProjectId ? { ...p, html, css, js, updatedAt: now } : p
        );
        await updateDoc(ref, { proyectos: updated });
        if (dcxProjectData) { dcxProjectData.html=html; dcxProjectData.css=css; dcxProjectData.js=js; }
        return true;
    } catch(e) {
        console.warn('[DCX] saveToFirebase failed:', e);
        return false;
    }
}

// Update project name in Firestore
async function saveProjectNameToFirebase(name) {
    if (!dcxUid || !dcxProjectId) return;
    try {
        await dcxInit();
        const { doc, getDoc, updateDoc } =
            await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
        const ref  = doc(dcxDb, 'proyectos', dcxUid);
        const snap = await getDoc(ref);
        if (!snap.exists()) return;
        const now = new Date().toISOString();
        const updated = (snap.data()?.proyectos || []).map(p =>
            p.id === dcxProjectId ? { ...p, name, updatedAt: now } : p
        );
        await updateDoc(ref, { proyectos: updated });
        if (dcxProjectData) dcxProjectData.name = name;
    } catch(e) { console.warn('[DCX] saveProjectName failed:', e); }
}

// Update deploy URL in Firestore (called after successful Vercel deploy)
async function saveDeployUrlToFirebase(url) {
    if (!dcxUid || !dcxProjectId) return;
    try {
        await dcxInit();
        const { doc, getDoc, updateDoc } =
            await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
        const ref  = doc(dcxDb, 'proyectos', dcxUid);
        const snap = await getDoc(ref);
        if (!snap.exists()) return;
        const now = new Date().toISOString();
        const updated = (snap.data()?.proyectos || []).map(p =>
            p.id === dcxProjectId ? { ...p, deployUrl: url, updatedAt: now } : p
        );
        await updateDoc(ref, { proyectos: updated });
        if (dcxProjectData) dcxProjectData.deployUrl = url;
        // Show in info bar
        const pibLink = document.getElementById('pibLink');
        if (pibLink) {
            pibLink.href = url; pibLink.style.display = 'flex';
            const sp = pibLink.querySelector('span');
            if (sp) sp.textContent = url.replace('https://','');
        }
        const infoBar = document.getElementById('projectInfoBar');
        if (infoBar) infoBar.style.display = 'flex';
    } catch(e) { console.warn('[DCX] saveDeployUrl failed:', e); }
}

// ==================== SAVE ====================
function markUnsaved() {
    hasUnsavedChanges=true;
    const btn=document.getElementById('saveBtn'), txt=document.getElementById('saveBtnText');
    if(btn){btn.classList.remove('saved','saving');}
    if(txt) txt.textContent='Guardar';
}
async function saveToLocal() {
    const html = document.getElementById('htmlEditor')?.value||'';
    const css  = document.getElementById('cssEditor')?.value||'';
    const js   = document.getElementById('jsEditor')?.value||'';
    try { localStorage.setItem('dcx_code', JSON.stringify({ html, css, js, savedAt: Date.now() })); hasUnsavedChanges=false; } catch(e) {}
    const btn=document.getElementById('saveBtn'), txt=document.getElementById('saveBtnText');
    if(btn) { btn.classList.remove('saving'); btn.classList.add('saved'); }
    if(txt) txt.textContent='Guardando…';
    const ok = await saveToFirebase(html, css, js);
    if(txt) { txt.textContent = ok ? 'Guardado ✓' : 'Guardado local'; setTimeout(()=>{ if(txt) txt.textContent='Guardar'; }, 1800); }
}
function loadFromLocal() {
    try{
        const raw=localStorage.getItem('dcx_code'); if(!raw) return;
        const d=JSON.parse(raw);
        const he=document.getElementById('htmlEditor'),ce=document.getElementById('cssEditor'),je=document.getElementById('jsEditor');
        if(he&&d.html!==undefined)he.value=d.html;
        if(ce&&d.css!==undefined)ce.value=d.css;
        if(je&&d.js!==undefined)je.value=d.js;
    }catch(e){}
}

// ==================== FIND & REPLACE ====================
function getActiveEditor(){return document.getElementById(currentTab+'Editor')||document.getElementById('htmlEditor');}
function openFindPanel(mode='find'){
    const p=document.getElementById('findReplacePanel');const rr=document.getElementById('replaceRow');
    if(!p)return;p.style.display='block';if(rr)rr.style.display=mode==='replace'?'flex':'none';
    const fi=document.getElementById('findInput');if(fi){const ed=getActiveEditor();if(ed){const sel=ed.value.substring(ed.selectionStart,ed.selectionEnd);if(sel&&sel.length<80)fi.value=sel;}fi.focus();fi.select();doFind();}
}
function closeFindPanel(){const p=document.getElementById('findReplacePanel');if(p)p.style.display='none';}
function doFind(){
    const query=document.getElementById('findInput')?.value||'';findState.query=query;findState.matches=[];findState.currentMatch=-1;
    const cnt=document.getElementById('findCount');if(!query){if(cnt)cnt.textContent='';return;}
    const ed=getActiveEditor();if(!ed)return;let rx;
    try{rx=findState.useRegex?new RegExp(query,findState.caseSensitive?'g':'gi'):new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),findState.caseSensitive?'g':'gi');}catch(e){if(cnt)cnt.textContent='bad regex';return;}
    let m;while((m=rx.exec(ed.value))!==null&&findState.matches.length<500)findState.matches.push({start:m.index,end:m.index+m[0].length});
    if(findState.matches.length){findState.currentMatch=0;scrollToMatch(ed,findState.matches[0]);}
    if(cnt)cnt.textContent=findState.matches.length?`${findState.currentMatch+1}/${findState.matches.length}`:'0/0';
}
function scrollToMatch(ed,match){if(!match)return;ed.focus();ed.setSelectionRange(match.start,match.end);const lh=parseFloat(getComputedStyle(ed).lineHeight)||22;ed.scrollTop=Math.max(0,ed.value.substring(0,match.start).split('\n').length*lh-ed.clientHeight/2);}
function findNext(){if(!findState.matches.length)return;findState.currentMatch=(findState.currentMatch+1)%findState.matches.length;scrollToMatch(getActiveEditor(),findState.matches[findState.currentMatch]);const cnt=document.getElementById('findCount');if(cnt)cnt.textContent=`${findState.currentMatch+1}/${findState.matches.length}`;}
function findPrev(){if(!findState.matches.length)return;findState.currentMatch=(findState.currentMatch-1+findState.matches.length)%findState.matches.length;scrollToMatch(getActiveEditor(),findState.matches[findState.currentMatch]);const cnt=document.getElementById('findCount');if(cnt)cnt.textContent=`${findState.currentMatch+1}/${findState.matches.length}`;}

// ==================== KEYBOARD SHORTCUTS ====================
function toggleComment(ed,lang){const s=ed.selectionStart,lines=ed.value.split('\n');const li=ed.value.substring(0,s).split('\n').length-1;const line=lines[li],trimmed=line.trim(),indent=line.match(/^(\s*)/)[1];const cm={html:['<!-- ',' -->'],js:['// '],css:['/* ',' */']};const[open,close]=cm[lang]||['// '];if(close){if(trimmed.startsWith(open.trim())&&trimmed.endsWith(close.trim()))lines[li]=indent+trimmed.slice(open.length,-close.length).trim();else lines[li]=indent+open+trimmed+close;}else{if(trimmed.startsWith(open.trim()))lines[li]=indent+trimmed.slice(open.trim().length).trimStart();else lines[li]=indent+open+trimmed;}ed.value=lines.join('\n');ed.dispatchEvent(new Event('input'));}
function duplicateLine(ed){const s=ed.selectionStart,lines=ed.value.split('\n');const i=ed.value.substring(0,s).split('\n').length-1;lines.splice(i+1,0,lines[i]);ed.value=lines.join('\n');ed.dispatchEvent(new Event('input'));}
function moveLine(ed,dir){const s=ed.selectionStart,lines=ed.value.split('\n');const i=ed.value.substring(0,s).split('\n').length-1,t=i+dir;if(t<0||t>=lines.length)return;[lines[i],lines[t]]=[lines[t],lines[i]];ed.value=lines.join('\n');ed.dispatchEvent(new Event('input'));}
function setupPowerKeyboard(){
    ['htmlEditor','jsEditor','cssEditor'].forEach(id=>{
        const ed=document.getElementById(id);if(!ed)return;
        const lang=id.replace('Editor','');
        ed.addEventListener('keydown',e=>{
            const ctrl=e.ctrlKey||e.metaKey;
            if(e.key==='Tab'&&!ctrl){e.preventDefault();const s=ed.selectionStart,en=ed.selectionEnd;if(s!==en&&e.shiftKey){const lines=ed.value.split('\n');const sl=ed.value.substring(0,s).split('\n').length-1,el=ed.value.substring(0,en).split('\n').length-1;for(let i=sl;i<=el;i++)if(lines[i].startsWith('  '))lines[i]=lines[i].slice(2);ed.value=lines.join('\n');ed.dispatchEvent(new Event('input'));return;}ed.value=ed.value.substring(0,s)+'  '+ed.value.substring(en);ed.selectionStart=ed.selectionEnd=s+2;ed.dispatchEvent(new Event('input'));return;}
            if(ctrl&&e.key==='/')  {e.preventDefault();toggleComment(ed,lang);return;}
            if(ctrl&&e.key==='d')  {e.preventDefault();duplicateLine(ed);return;}
            if(e.altKey&&e.key==='ArrowUp')  {e.preventDefault();moveLine(ed,-1);return;}
            if(e.altKey&&e.key==='ArrowDown'){e.preventDefault();moveLine(ed,1);return;}
            if(ctrl&&e.key==='Enter'){e.preventDefault();switchTab('preview');return;}
            if(e.key==='Escape'){closeFindPanel();document.getElementById('shortcutsModal')&&(document.getElementById('shortcutsModal').style.display='none');return;}
            const pairs={'(':')','[':']','{':'}','"':'"',"'":"'","`":"`"};
            if(pairs[e.key]&&!ctrl){const s=ed.selectionStart,en=ed.selectionEnd,sel=ed.value.substring(s,en);if(sel){e.preventDefault();ed.value=ed.value.substring(0,s)+e.key+sel+pairs[e.key]+ed.value.substring(en);ed.selectionStart=s+1;ed.selectionEnd=en+1;ed.dispatchEvent(new Event('input'));return;}const next=ed.value[s];if(['"',"'","`"].includes(e.key)&&next===e.key){e.preventDefault();ed.selectionStart=ed.selectionEnd=s+1;return;}if(!['"',"'","`"].includes(e.key)){e.preventDefault();ed.value=ed.value.substring(0,s)+e.key+pairs[e.key]+ed.value.substring(s);ed.selectionStart=ed.selectionEnd=s+1;ed.dispatchEvent(new Event('input'));return;}}
            if(e.key==='Backspace'&&ed.selectionStart===ed.selectionEnd){const s=ed.selectionStart,before=ed.value[s-1],after=ed.value[s],cp={'(':')','[':']','{':'}','"':'"',"'":"'","`":"`"};if(before&&cp[before]===after){e.preventDefault();ed.value=ed.value.substring(0,s-1)+ed.value.substring(s+1);ed.selectionStart=ed.selectionEnd=s-1;ed.dispatchEvent(new Event('input'));return;}}
            if(e.key==='Enter'&&!ctrl){const s=ed.selectionStart;const lineStart=ed.value.lastIndexOf('\n',s-1)+1;const indent=ed.value.substring(lineStart,s).match(/^(\s*)/)[1];const before=ed.value[s-1],after=ed.value[s];const op={'(':')','[':']','{':'}'};if(op[before]===after){e.preventDefault();const ins='\n'+indent+'  \n'+indent;ed.value=ed.value.substring(0,s)+ins+ed.value.substring(s);ed.selectionStart=ed.selectionEnd=s+indent.length+3;ed.dispatchEvent(new Event('input'));return;}if(indent){e.preventDefault();const extra=op[before]?'  ':'';const nl='\n'+indent+extra;ed.value=ed.value.substring(0,s)+nl+ed.value.substring(s);ed.selectionStart=ed.selectionEnd=s+nl.length;ed.dispatchEvent(new Event('input'));return;}}
        });
    });
    document.addEventListener('keydown',e=>{const ctrl=e.ctrlKey||e.metaKey;if(ctrl&&e.key==='f'){e.preventDefault();openFindPanel('find');}if(ctrl&&e.key==='h'){e.preventDefault();openFindPanel('replace');}if(ctrl&&e.key==='s'){e.preventDefault();saveToLocal();}});
}

// ==================== CHAT & AI ====================
function saveChatHistory(){try{localStorage.setItem('dcx_chats',JSON.stringify(chatHistory.slice(0,20)));}catch(e){}}
function createNewChat(){const id='chat_'+Date.now();chatHistory.unshift({id,title:'Nuevo Chat',messages:[],created:Date.now()});currentChatId=id;saveChatHistory();return id;}
function loadChat(chatId){
    const chat=chatHistory.find(c=>c.id===chatId);if(!chat)return;
    currentChatId=chatId;
    const tl=document.getElementById('currentChatTitle');if(tl)tl.textContent=chat.title;
    const msgs=document.getElementById('chatMessages');if(!msgs)return;
    if(!chat.messages?.length){chatStarted=false;const hb=document.getElementById('chatHeaderBar');if(hb)hb.style.display='none';const wm=document.getElementById('welcomeMessage');if(wm)wm.style.display='flex';Array.from(msgs.children).forEach(c=>{if(c.id!=='welcomeMessage')c.remove();});}
    else{chatStarted=true;const hb=document.getElementById('chatHeaderBar');if(hb)hb.style.display='flex';const wm=document.getElementById('welcomeMessage');if(wm)wm.style.display='none';Array.from(msgs.children).forEach(c=>{if(c.id!=='welcomeMessage')c.remove();});chat.messages.slice(-40).forEach(m=>appendMessage(m.content,m.type,false));msgs.scrollTop=msgs.scrollHeight;}
}
function initChatSystem(){const saved=localStorage.getItem('dcx_chats');if(saved)try{chatHistory=JSON.parse(saved);}catch(e){}if(!chatHistory.length)createNewChat();else loadChat(chatHistory[0].id);}
function startChat(){if(!chatStarted){chatStarted=true;const wm=document.getElementById('welcomeMessage');if(wm)wm.style.display='none';const hb=document.getElementById('chatHeaderBar');if(hb)hb.style.display='flex';}}
function appendMessage(content,type,save=true){
    const msgs=document.getElementById('chatMessages');if(!msgs)return null;
    const wm=document.getElementById('welcomeMessage');if(wm)wm.style.display='none';
    const div=document.createElement('div');div.className='chat-message '+type;
    const lbl=document.createElement('div');lbl.className='msg-label';lbl.textContent=type==='user'?'Tú':type==='error'?'Error':'Agent';
    const mc=document.createElement('div');mc.className='message-content';mc.textContent=content;
    div.appendChild(lbl);div.appendChild(mc);msgs.appendChild(div);msgs.scrollTop=msgs.scrollHeight;
    if(save&&currentChatId){const chat=chatHistory.find(c=>c.id===currentChatId);if(chat){if(!chat.messages)chat.messages=[];chat.messages.push({content,type,ts:Date.now()});if(type==='user'&&chat.title==='Nuevo Chat'){chat.title=content.substring(0,28)+(content.length>28?'…':'');const tl=document.getElementById('currentChatTitle');if(tl)tl.textContent=chat.title;}saveChatHistory();}}
    return div;
}
function sendMessage(){
    const input=document.getElementById('chatInput');
    const message=input?.value?.trim();
    if(!message||isGenerating)return;
    if(dcxAgentUsed>=dcxAgentMax){showToast(`Límite de mensajes alcanzado (${dcxAgentMax}/${dcxAgentMax})`,'warn');return;}
    input.value='';input.style.height='auto';startChat();appendMessage(message,'user');generateCode(message);
}

async function generateCode(prompt){
    isGenerating=true;const btn=document.getElementById('sendBtn');if(btn)btn.disabled=true;
    const msgs=document.getElementById('chatMessages');const previewTab=document.getElementById('previewTab');
    const phases=['Analizando...','Generando HTML...','Aplicando CSS...','Codificando JS...','Optimizando...','Compilando...'];
    const loadingDiv=document.createElement('div');loadingDiv.className='chat-message ai';
    loadingDiv.innerHTML=`<div class="msg-label">Agent</div><div class="ai-generating"><div class="ai-gen-header"><div class="ai-gen-pulse"></div><span>Generando</span></div><div class="ai-gen-phase"><div class="phase-dot" style="background:var(--accent)"></div><span id="genPhaseText">${phases[0]}</span></div><div class="ai-gen-bar-wrapper"><div class="ai-gen-bar-label"><span id="genBarLabel">${phases[0]}</span><span id="genBarPct" style="font-family:var(--font-mono)">0%</span></div><div class="ai-gen-bar-track"><div class="ai-gen-bar-fill" id="genBarFill" style="width:0%"></div></div></div></div>`;
    msgs?.appendChild(loadingDiv);if(msgs)msgs.scrollTop=msgs.scrollHeight;
    let pct=0;const bf=loadingDiv.querySelector('#genBarFill'),bp=loadingDiv.querySelector('#genBarPct'),pt=loadingDiv.querySelector('#genPhaseText'),bl=loadingDiv.querySelector('#genBarLabel');
    const iv=setInterval(()=>{pct=Math.min(pct+Math.random()*5+1.5,90);if(bf)bf.style.width=pct+'%';if(bp)bp.textContent=Math.round(pct)+'%';const pi=Math.min(Math.floor((pct/90)*(phases.length-1)),phases.length-1);if(pt)pt.textContent=phases[pi];if(bl)bl.textContent=phases[pi];},350);
    try{
        const htmlCode=document.getElementById('htmlEditor')?.value||'',cssCode=document.getElementById('cssEditor')?.value||'',jsCode=document.getElementById('jsEditor')?.value||'';
        const context=htmlCode||cssCode||jsCode?`Código actual:\nHTML:\n${htmlCode}\nCSS:\n${cssCode}\nJS:\n${jsCode}\n\n`:'';
        const fullPrompt=`${context}Solicitud: ${prompt}\n\nGenera una app web completa. Responde SOLO con JSON puro sin markdown:\n{"html":"...","css":"...","js":"...","message":"..."}`;
        const res=await fetch('/api/gemini',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:fullPrompt,mode:'programar'})});
        if(!res.ok){const ed=await res.json().catch(()=>({}));throw new Error(`API ${res.status}: ${ed?.error||res.statusText}`);}
        const data=await res.json();const rawText=data.reply||'';
        let parsed;try{parsed=JSON.parse(rawText);}catch(e){const m=rawText.match(/\{[\s\S]*\}/);if(m)parsed=JSON.parse(m[0]);else throw new Error('La IA no devolvió JSON válido.');}
        clearInterval(iv);if(bf)bf.style.width='100%';if(bp)bp.textContent='100%';
        await new Promise(r=>setTimeout(r,350));loadingDiv.remove();
        const he=document.getElementById('htmlEditor'),ce=document.getElementById('cssEditor'),je=document.getElementById('jsEditor');
        if(he&&parsed.html!==undefined){he.value=parsed.html;updateHighlight('htmlEditor');updateGutter('htmlEditor');}
        if(ce&&parsed.css!==undefined){ce.value=parsed.css;updateHighlight('cssEditor');updateGutter('cssEditor');}
        if(je&&parsed.js!==undefined){je.value=parsed.js;updateHighlight('jsEditor');updateGutter('jsEditor');}
        updatePreview();appendMessage(parsed.message||`Listo: "${prompt}"`,'ai');
        if(previewTab)previewTab.classList.add('has-new-content');
        saveToLocal();switchTab('preview');
        incrementAgentUsage(); // count successful message
    }catch(err){clearInterval(iv);loadingDiv.remove();appendMessage('Error: '+String(err.message||err),'error');console.error('[DCX]',err);}
    finally{isGenerating=false;if(btn)btn.disabled=false;}
}

// ==================== AGENT USAGE LIMIT (from Firebase users/{uid}.limit) ====================
const AGENT_MAX = 10; // default max if DB doesn't specify

let dcxAgentMax  = AGENT_MAX; // will be updated from users/{uid}.limit
let dcxAgentUsed = 0;         // will be loaded from users/{uid}.limit (tracks current usage)

// Load limit and usage from Firestore users/{uid}
async function loadAgentLimitFromFirebase() {
    if (!dcxUid) return;
    try {
        await dcxInit();
        const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
        const snap = await getDoc(doc(dcxDb, 'users', dcxUid));
        if (!snap.exists()) return;
        const data = snap.data();
        // limit field = number of messages already used (starts at 0)
        dcxAgentUsed = parseInt(data.limit || '0');
        // Plan-based max: Normal=10, Premium=25, Pro=unlimited(99)
        const planMax = { Normal: 10, Premium: 25, Pro:80};
        dcxAgentMax  = planMax[data.plan] || AGENT_MAX;
        renderAgentUsage();
    } catch(e) {
        console.warn('[DCX] loadAgentLimit failed:', e);
        // fall back to localStorage
        dcxAgentUsed = parseInt(localStorage.getItem('dcx_agent_usage') || '0');
    }
}

// Increment limit counter in Firebase
async function incrementLimitInFirebase() {
    if (!dcxUid || !dcxDb) return;
    try {
        const { doc, updateDoc, increment } =
            await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
        await updateDoc(doc(dcxDb, 'users', dcxUid), {
            limit: increment(1)
        });
    } catch(e) { console.warn('[DCX] incrementLimit failed:', e); }
}

function renderAgentUsage() {
    const fill  = document.getElementById('agentUsageFill');
    const text  = document.getElementById('agentUsageText');
    const wrap  = document.getElementById('agentUsageWrap');
    const used  = dcxAgentUsed;
    const max   = dcxAgentMax;
    const pct   = Math.min((used / max) * 100, 100);
    if (fill) fill.style.width = pct + '%';
    if (text) text.textContent = used + '/' + max;
    if (wrap) wrap.title = `Uso del Agent: ${used}/${max} mensajes`;

    const color = used < Math.floor(max * 0.7) ? '#22c55e'
                : used < max                   ? '#fbbf24'
                :                                '#ef4444';
    if (fill) fill.style.background = color;
    if (text) text.style.color = color;

    const limitReached = used >= max;
    const chatInput    = document.getElementById('chatInput');
    const sendBtn      = document.getElementById('sendBtn');
    const agpInput     = document.getElementById('agentPanelInput');
    const agpSend      = document.getElementById('agentPanelSendBtn');
    if (chatInput) chatInput.disabled = limitReached;
    if (sendBtn)   sendBtn.disabled   = limitReached;
    if (agpInput)  agpInput.disabled  = limitReached;
    if (agpSend)   agpSend.disabled   = limitReached;
    if (limitReached) {
        const msg = `⛔ Límite de mensajes alcanzado (${max}/${max})`;
        if (chatInput) chatInput.placeholder = msg;
        if (agpInput)  agpInput.placeholder  = msg;
    }
}
              
function incrementAgentUsage() {
    dcxAgentUsed++;
    localStorage.setItem('dcx_agent_usage', String(dcxAgentUsed)); // local backup
    renderAgentUsage();
    incrementLimitInFirebase(); // async, fire and forget
    if (dcxAgentUsed >= dcxAgentMax) {
        appendMessage(`⛔ Has llegado a tu límite de ${dcxAgentMax} mensajes.`, 'error');
        showToast(`Límite de mensajes alcanzado (${dcxAgentMax}/${dcxAgentMax})`, 'warn');
    }
}

// ==================== DEPLOY CREDITS ====================
const DEPLOY_MAX = 50;

function getDeployCredits() {
    const saved = localStorage.getItem('dcx_deploy_credits');
    return saved === null ? DEPLOY_MAX : parseInt(saved);
}
function setDeployCredits(n) {
    localStorage.setItem('dcx_deploy_credits', String(Math.max(0, n)));
}

function renderDeployCredits() {
    const credits = getDeployCredits();
    const el      = document.getElementById('deployCredits');
    const btn     = document.getElementById('publishBtn');
    const btnTxt  = document.getElementById('publishBtnText');
    if (el) {
        el.textContent = credits;
        el.style.color = credits > 10 ? '#94a3b8' : credits > 0 ? '#fbbf24' : '#ef4444';
        el.title = `Créditos de deploy restantes: ${credits}`;
    }
    if (credits <= 0 && btn) {
        btn.disabled = true;
        btn.title = 'Sin créditos de deploy disponibles';
        if (btnTxt) btnTxt.textContent = 'Sin créditos';
    }
}

function spendDeployCredit() {
    const c = getDeployCredits();
    if (c <= 0) return false;
    setDeployCredits(c - 1);
    renderDeployCredits();
    return true;
}

// ==================== VERCEL DEPLOY ====================

// Convert project name → Vercel slug, always appending -devx to avoid conflicts
function projectNameToSlug(name) {
    const base = (name || 'devproject')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 44) || 'devproject';
    return base + '-devx';
}

// Get current project name from the nav
function getProjectName() {
    return document.getElementById('projectName')?.textContent?.trim() || 'DevProject';
}

// Deploy history stored in localStorage
function loadDeployHistory() {
    try { return JSON.parse(localStorage.getItem('dcx_deploys') || '[]'); } catch { return []; }
}
function saveDeployHistory(list) {
    try { localStorage.setItem('dcx_deploys', JSON.stringify(list.slice(0, 20))); } catch(_) {}
}

// Restore deploy URL bar on load
function restoreDeployBar() {
    const slug    = projectNameToSlug(getProjectName());
    const history = loadDeployHistory();
    const latest  = history.find(d => d.slug === slug);
    if (latest) {
        showDeployBar(latest.shortUrl, latest.fullUrl);
        updatePublishButtonState(true);
    } else {
        hideDeployBar();
        updatePublishButtonState(false);
    }
}

function showDeployBar(shortUrl, fullUrl) {
    const urlBar  = document.getElementById('deployUrlBar');
    const urlText = document.getElementById('deployUrlText');
    const urlOpen = document.getElementById('deployUrlOpen');
    if (urlBar)  urlBar.style.display = 'flex';
    if (urlText) urlText.textContent  = shortUrl;
    if (urlOpen) { urlOpen.href = fullUrl; urlOpen.title = fullUrl; }
}
function hideDeployBar() {
    const urlBar = document.getElementById('deployUrlBar');
    if (urlBar) urlBar.style.display = 'none';
}

function updatePublishButtonState(hasExisting) {
    const btn    = document.getElementById('publishBtn');
    const btnTxt = document.getElementById('publishBtnText');
    const pubIco = btn?.querySelector('.publish-icon');
    const updIco = btn?.querySelector('.update-icon');
    if (!btn || !btnTxt) return;
    if (hasExisting) {
        btnTxt.textContent = 'Update';
        btn.title = 'Actualizar deploy en Vercel';
        if (pubIco) pubIco.style.display = 'none';
        if (updIco) updIco.style.display = 'block';
    } else {
        btnTxt.textContent = 'Publish';
        btn.title = 'Publicar en Vercel';
        if (pubIco) pubIco.style.display = 'block';
        if (updIco) updIco.style.display = 'none';
    }
}

async function deployToVercel() {
    const btn    = document.getElementById('publishBtn');
    const btnTxt = document.getElementById('publishBtnText');

    const html = document.getElementById('htmlEditor')?.value || '';
    const css  = document.getElementById('cssEditor')?.value  || '';
    const js   = document.getElementById('jsEditor')?.value   || '';

    if (!html.trim() && !css.trim() && !js.trim()) {
        showToast('Escribe algo de código antes de publicar.', 'warn');
        return;
    }

    // Check deploy credits
    if (getDeployCredits() <= 0) {
        showToast('Sin créditos de deploy disponibles.', 'error');
        return;
    }

    const projectName = getProjectName();
    const slug        = projectNameToSlug(projectName);
    const isUpdate    = btnTxt?.textContent === 'Update';

    btn.disabled = true;
    if (btnTxt) btnTxt.textContent = isUpdate ? 'Actualizando…' : 'Publicando…';
    btn.style.opacity = '0.7';

    // Send HTML/CSS/JS as separate files — exactly as written in the editor
    // index.html references style.css and script.js just like a real project
    const indexHtml = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${projectName}</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
${html}
<script src="script.js"><\/script>
</body>
</html>`;

    try {
        const res = await fetch('/api/deploy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: slug,
                files: [
                    { file: 'index.html', data: indexHtml,   encoding: 'utf-8' },
                    { file: 'style.css',  data: css || '',   encoding: 'utf-8' },
                    { file: 'script.js',  data: js  || '',   encoding: 'utf-8' }
                ],
                projectSettings: { framework: null },
                target: 'production'
            })
        });

        const data = await res.json();
        if (!res.ok || !data.url) throw new Error(data?.error || `HTTP ${res.status}`);

        // Short canonical URL based on project slug
        const shortUrl = slug + '.vercel.app';
        const fullUrl  = 'https://' + shortUrl;

        // Save to history (replace existing entry for this slug)
        const history = loadDeployHistory().filter(d => d.slug !== slug);
        history.unshift({
            slug, projectName, shortUrl, fullUrl,
            aliasUrl: 'https://' + data.url,
            deployId: data.id || null,
            deployedAt: Date.now()
        });
        saveDeployHistory(history);

        showDeployBar(shortUrl, fullUrl);
        updatePublishButtonState(true);
        spendDeployCredit();
        saveDeployUrlToFirebase(fullUrl); // persist deploy URL in Firebase

        btn.style.background = 'linear-gradient(135deg,#059669,#10b981)';
        btn.style.opacity    = '1';
        if (btnTxt) btnTxt.textContent = isUpdate ? 'Updated ✓' : 'Published ✓';
        showToast((isUpdate ? '¡Actualizado' : '¡Publicado') + ' en Vercel 🚀  ' + shortUrl, 'success');

        setTimeout(() => {
            btn.style.background = '';
            btn.disabled = false;
            updatePublishButtonState(true);
        }, 3500);

    } catch (err) {
        console.error('[Vercel Deploy]', err);
        showToast('Error al publicar: ' + String(err.message || err), 'error');
        btn.style.opacity = '1';
        btn.disabled = false;
        updatePublishButtonState(isUpdate);
    }
}

// Delete project from Vercel cloud
async function deleteVercelProject(slug) {
    try {
        const res = await fetch(`/api/delete-project?slug=${encodeURIComponent(slug)}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        return res.ok && data.success;
    } catch(e) {
        return false;
    }
}

// Deploy history panel
function openDeployHistory() {
    const modal = document.getElementById('deployHistoryModal');
    const body  = document.getElementById('dhmBody');
    if (!modal || !body) return;

    const history = loadDeployHistory();
    const curSlug = projectNameToSlug(getProjectName());

    if (!history.length) {
        body.innerHTML = '<div class="dhm-empty">Sin deploys aún. Haz clic en Publish para subir tu app.</div>';
    } else {
        body.innerHTML = '';
        history.forEach((d, i) => {
            const date = new Date(d.deployedAt);
            const fmt  = date.toLocaleDateString('es', {day:'2-digit', month:'short', year:'numeric'}) +
                         ' · ' + date.toLocaleTimeString('es', {hour:'2-digit', minute:'2-digit'});
            const isCurrent = d.slug === curSlug;

            const card = document.createElement('div');
            card.className = 'dhm-card' + (isCurrent ? ' dhm-card-current' : '');
            card.innerHTML = `
                <div class="dhm-card-top">
                    <div class="dhm-card-info">
                        <div class="dhm-card-name">
                            ${isCurrent ? '<span class="dhm-badge">actual</span>' : ''}
                            ${d.projectName}
                        </div>
                        <a class="dhm-card-url" href="${d.fullUrl}" target="_blank" rel="noopener">${d.shortUrl}</a>
                        <div class="dhm-card-date">${fmt}</div>
                    </div>
                    <div class="dhm-card-actions">
                        <a class="dhm-btn dhm-btn-open" href="${d.fullUrl}" target="_blank" rel="noopener">
                            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 9L9 2M9 2H4M9 2V7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                            Abrir
                        </a>
                        <button class="dhm-btn dhm-btn-redeploy" data-idx="${i}" title="Re-deploy">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6C2 3.8 3.8 2 6 2c1.2 0 2.3.5 3 1.3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M10 6c0 2.2-1.8 4-4 4-1.2 0-2.3-.5-3-1.3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M9 1.5v2.3H6.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 10.5V8.2h2.3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            Re-deploy
                        </button>
                        <button class="dhm-btn dhm-btn-del" data-idx="${i}" data-slug="${d.slug}" title="Eliminar proyecto de Vercel">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M2 3H10M4.5 3V2h3V3M9 3l-.5 7.5H3.5L3 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M5 5.5v3M7 5.5v3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                            </svg>
                        </button>
                    </div>
                </div>`;
            body.appendChild(card);
        });

        // Re-deploy
        body.querySelectorAll('.dhm-btn-redeploy').forEach(btn => {
            btn.addEventListener('click', () => {
                closeDeployHistory();
                deployToVercel();
            });
        });

        // Delete from cloud — confirm dialog
        body.querySelectorAll('.dhm-btn-del').forEach(btn => {
            btn.addEventListener('click', async () => {
                const slug = btn.dataset.slug;
                const idx  = parseInt(btn.dataset.idx);
                const list = loadDeployHistory();
                const d    = list[idx];

                // Show confirmation
                const confirmed = await showConfirm(
                    `¿Eliminar "${d.projectName}" de Vercel?`,
                    `Esto eliminará el proyecto <strong>${slug}.vercel.app</strong> de la nube permanentemente. No se puede deshacer.`
                );
                if (!confirmed) return;

                btn.textContent = '…';
                btn.disabled = true;

                const ok = await deleteVercelProject(slug);
                if (ok) {
                    list.splice(idx, 1);
                    saveDeployHistory(list);
                    if (slug === projectNameToSlug(getProjectName())) {
                        hideDeployBar();
                        updatePublishButtonState(false);
                    }
                    showToast('Proyecto eliminado de Vercel.', 'info');
                    openDeployHistory(); // refresh
                } else {
                    showToast('No se pudo eliminar. Puede que ya no exista.', 'warn');
                    openDeployHistory();
                }
            });
        });
    }

    modal.style.display = 'flex';
}

function closeDeployHistory() {
    const modal = document.getElementById('deployHistoryModal');
    if (modal) modal.style.display = 'none';
}

// Custom confirm dialog (returns Promise<boolean>)
function showConfirm(title, bodyHtml) {
    return new Promise(resolve => {
        let overlay = document.getElementById('dcxConfirmOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'dcxConfirmOverlay';
            overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);';
            document.body.appendChild(overlay);
        }
        overlay.innerHTML = `
            <div style="background:var(--bg1);border:1px solid var(--border2);border-radius:14px;padding:28px 28px 22px;max-width:400px;width:90%;box-shadow:0 24px 60px rgba(0,0,0,0.5);">
                <div style="font-size:15px;font-weight:700;color:var(--text0);margin-bottom:10px;">${title}</div>
                <div style="font-size:13px;color:var(--text2);line-height:1.6;margin-bottom:22px;">${bodyHtml}</div>
                <div style="display:flex;gap:10px;justify-content:flex-end;">
                    <button id="dcxConfirmNo"  style="padding:8px 18px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;color:var(--text1);font-size:13px;font-family:var(--font-ui);cursor:pointer;">Cancelar</button>
                    <button id="dcxConfirmYes" style="padding:8px 18px;background:linear-gradient(135deg,#dc2626,#ef4444);border:none;border-radius:8px;color:white;font-size:13px;font-weight:600;font-family:var(--font-ui);cursor:pointer;">Sí, eliminar</button>
                </div>
            </div>`;
        overlay.style.display = 'flex';
        overlay.querySelector('#dcxConfirmYes').onclick = () => { overlay.style.display='none'; resolve(true);  };
        overlay.querySelector('#dcxConfirmNo').onclick  = () => { overlay.style.display='none'; resolve(false); };
    });
}

// ── Ensure user document exists in Firestore with correct structure ──
async function ensureUserDocument() {
    if (!dcxUser || !dcxDb) return;
    try {
        const { doc, getDoc, setDoc, updateDoc, serverTimestamp } =
            await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
        const ref  = doc(dcxDb, 'users', dcxUser.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
            // Create with correct structure
            await setDoc(ref, {
                uid:       dcxUser.uid,
                email:     dcxUser.email || '',
                username:  dcxUser.displayName || dcxUser.email?.split('@')[0] || 'user_' + dcxUser.uid.substring(0, 8),
                avatar:    dcxUser.photoURL || '',
                provider:  dcxUser.providerData?.[0]?.providerId?.replace('.com','') || 'email',
                createdAt: serverTimestamp(),
                plan:      'Normal',
                limit:     0,
            });
        } else {
            // Ensure all required fields exist (migrate old docs)
            const d = snap.data();
            const patch = {};
            if (d.limit   === undefined) patch.limit   = 0;
            if (d.plan    === undefined) patch.plan    = 'Normal';
            if (d.username === undefined) patch.username = dcxUser.displayName || dcxUser.email?.split('@')[0] || 'Usuario';
            if (Object.keys(patch).length) await updateDoc(ref, patch);
        }
    } catch(e) { console.warn('[DCX] ensureUserDocument failed:', e); }
}

// ── Load username and show user pill ──
async function loadUserPill() {
    // First try localStorage (fast)
    const lsName = localStorage.getItem('devcenter_user_name');
    if (lsName) {
        document.getElementById('userPillName')?.setAttribute('data-name', lsName);
        const name = document.getElementById('userPillName');
        const avatar = document.getElementById('userPillAvatar');
        if (name) name.textContent = lsName;
        if (avatar) avatar.textContent = lsName.charAt(0).toUpperCase();
    }
    // Then load from Firebase for latest
    if (!dcxUid || !dcxDb) return;
    try {
        const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
        const snap = await getDoc(doc(dcxDb, 'users', dcxUid));
        if (!snap.exists()) return;
        const username = snap.data()?.username || lsName || 'Usuario';
        const name   = document.getElementById('userPillName');
        const avatar = document.getElementById('userPillAvatar');
        if (name)   name.textContent   = username;
        if (avatar) avatar.textContent = username.charAt(0).toUpperCase();
        localStorage.setItem('devcenter_user_name', username);
    } catch(e) {}
}

// ── Project switcher ──
async function setupProjectSwitcher() {
    const dropBtn = document.getElementById('projectDropdown');
    const panel   = document.getElementById('projectSwitcherPanel');
    const list    = document.getElementById('pspList');
    if (!dropBtn || !panel) return;

    dropBtn.addEventListener('click', e => {
        e.stopPropagation();
        if (panel.style.display === 'flex') {
            panel.style.display = 'none';
        } else {
            panel.style.display = 'flex';
            loadProjectList();
        }
    });

    document.addEventListener('click', e => {
        if (panel.style.display === 'flex' && !panel.contains(e.target) && e.target !== dropBtn && !dropBtn.contains(e.target)) {
            panel.style.display = 'none';
        }
    });

    async function loadProjectList() {
        if (!dcxUid || !dcxDb) {
            if (list) list.innerHTML = '<div class="psp-loading">Sin sesión activa</div>';
            return;
        }
        if (list) list.innerHTML = '<div class="psp-loading">Cargando proyectos…</div>';
        try {
            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
            const snap = await getDoc(doc(dcxDb, 'proyectos', dcxUid));
            const projects = snap.exists() ? (snap.data()?.proyectos || []) : [];

            if (!projects.length) {
                list.innerHTML = '<div class="psp-loading">Sin proyectos. Crea uno nuevo.</div>';
                return;
            }

            list.innerHTML = '';
            // Sort newest first
            [...projects].sort((a, b) => {
                const ta = new Date(a.createdAt?.seconds ? a.createdAt.toDate?.() || a.createdAt : a.createdAt || 0);
                const tb = new Date(b.createdAt?.seconds ? b.createdAt.toDate?.() || b.createdAt : b.createdAt || 0);
                return tb - ta;
            }).forEach(proj => {
                const isCurrent = proj.id === dcxProjectId;
                const item = document.createElement('div');
                item.className = 'psp-item' + (isCurrent ? ' active' : '');
                const initials = (proj.name || 'P').substring(0, 2).toUpperCase();
                const date = proj.createdAt
                    ? new Date(proj.createdAt?.seconds ? proj.createdAt.seconds * 1000 : proj.createdAt).toLocaleDateString('es', {day:'2-digit', month:'short'})
                    : '—';
                item.innerHTML = `
                    <div class="psp-item-icon">${initials}</div>
                    <div class="psp-item-info">
                        <div class="psp-item-name">${proj.name}</div>
                        <div class="psp-item-date">${date}</div>
                    </div>
                    <button class="psp-item-open" title="Abrir proyecto">
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 9L9 2M9 2H4M9 2V7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                    </button>`;

                item.querySelector('.psp-item-open').addEventListener('click', e => {
                    e.stopPropagation();
                    panel.style.display = 'none';
                    window.location.href = `/Programar/?pid=${proj.id}`;
                });
                item.addEventListener('click', () => {
                    panel.style.display = 'none';
                    if (!isCurrent) window.location.href = `/Programar/?pid=${proj.id}`;
                });
                list.appendChild(item);
            });
        } catch(e) {
            list.innerHTML = `<div class="psp-loading">Error: ${e.message}</div>`;
        }
    }
}

// ── Project info modal ──
function setupProjectInfoModal() {
    const btn      = document.getElementById('projectInfoBtn');
    const modal    = document.getElementById('projInfoModal');
    const backdrop = document.getElementById('pimBackdrop');
    const closeBtn = document.getElementById('pimClose');
    const body     = document.getElementById('pimBody');
    if (!btn || !modal) return;

    btn.addEventListener('click', () => {
        renderProjectInfo();
        modal.style.display = 'flex';
    });
    closeBtn?.addEventListener('click', () => { modal.style.display = 'none'; });
    backdrop?.addEventListener('click', () => { modal.style.display = 'none'; });

    function renderProjectInfo() {
        if (!body) return;
        const proj = dcxProjectData;
        if (!proj) {
            body.innerHTML = '<div style="color:var(--text3);font-size:13px;padding:8px 0">No hay proyecto cargado.</div>';
            return;
        }

        const fmt = (iso) => {
            if (!iso) return '—';
            try {
                const d = new Date(iso?.seconds ? iso.seconds * 1000 : iso);
                return d.toLocaleDateString('es', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' });
            } catch { return String(iso); }
        };

        const tagsHtml = (proj.tags || []).length
            ? proj.tags.map(t => `<span class="pim-tag">#${t}</span>`).join('')
            : '<span class="pim-no-value">Sin etiquetas</span>';

        const deployHtml = proj.deployUrl
            ? `<a href="${proj.deployUrl}" target="_blank" class="pim-deploy-link">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 9L9 2M9 2H4M9 2V7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                ${proj.deployUrl.replace('https://', '')}
              </a>`
            : '<span class="pim-no-value">No publicado aún</span>';

        body.innerHTML = `
            <div class="pim-row">
                <div class="pim-label">Nombre</div>
                <div class="pim-value">${proj.name || '—'}</div>
            </div>
            <div class="pim-row">
                <div class="pim-label">ID del proyecto</div>
                <div class="pim-value mono">${proj.id || '—'}</div>
            </div>
            <div class="pim-row">
                <div class="pim-label">Descripción</div>
                <div class="pim-value">${proj.description || '<span class="pim-no-value">Sin descripción</span>'}</div>
            </div>
            <div class="pim-row">
                <div class="pim-label">Etiquetas</div>
                <div class="pim-tags">${tagsHtml}</div>
            </div>
            <div class="pim-row">
                <div class="pim-label">Creado</div>
                <div class="pim-value">${fmt(proj.createdAt)}</div>
            </div>
            <div class="pim-row">
                <div class="pim-label">Última modificación</div>
                <div class="pim-value">${fmt(proj.updatedAt)}</div>
            </div>
            <div class="pim-row">
                <div class="pim-label">Deploy URL</div>
                <div class="pim-value">${deployHtml}</div>
            </div>
            <div class="pim-row">
                <div class="pim-label">Estado</div>
                <div class="pim-value">${proj.status || 'development'}</div>
            </div>`;
    }
}

// ── Project name inline edit ──
function setupProjectEdit() {
    const editBtn  = document.getElementById('editProjectBtn');
    const nameSpan = document.getElementById('projectName');
    if (!editBtn || !nameSpan) return;

    // Load saved project name — Firebase takes priority, then localStorage
    if (!dcxProjectData) {
        const saved = localStorage.getItem('dcx_project_name');
        if (saved) nameSpan.textContent = saved;
    }

    editBtn.addEventListener('click', () => {
        const current = nameSpan.textContent.trim();
        const inp = document.createElement('input');
        inp.type = 'text';
        inp.value = current;
        inp.maxLength = 40;
        inp.style.cssText = 'background:var(--bg0);border:1px solid var(--accent);border-radius:5px;color:var(--text0);font-size:12px;font-family:var(--font-ui);font-weight:500;padding:2px 8px;outline:none;width:140px;';
        nameSpan.replaceWith(inp);
        inp.focus(); inp.select();

        function commit() {
            const val = inp.value.trim() || current;
            const sp  = document.createElement('span');
            sp.id = 'projectName'; sp.textContent = val;
            inp.replaceWith(sp);
            localStorage.setItem('dcx_project_name', val);
            saveProjectNameToFirebase(val); // also update Firebase
            restoreDeployBar();
        }
        inp.addEventListener('keydown', e => {
            if (e.key === 'Enter') { e.preventDefault(); commit(); }
            if (e.key === 'Escape') { const sp = document.createElement('span'); sp.id='projectName'; sp.textContent=current; inp.replaceWith(sp); }
        });
        inp.addEventListener('blur', commit);
    });
}

// Toast notification helper
function showToast(msg, type = 'info') {
    let toast = document.getElementById('dcxToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'dcxToast';
        document.body.appendChild(toast);
    }
    toast.className = 'dcx-toast dcx-toast-' + type;
    toast.textContent = msg;
    toast.style.display = 'flex';
    toast.style.opacity = '1';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => { toast.style.display = 'none'; }, 350);
    }, 5000);
}

// ==================== ALL LISTENERS ====================
function setupAllListeners(){
    document.getElementById('fileTabs')?.addEventListener('click',e=>{const tab=e.target.closest('.file-tab');if(tab?.dataset.file)switchTab(tab.dataset.file);});
    document.getElementById('sendBtn')?.addEventListener('click',sendMessage);
    document.getElementById('chatInput')?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}});
    document.getElementById('chatInput')?.addEventListener('input',function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,120)+'px';});
    document.getElementById('saveBtn')?.addEventListener('click',saveToLocal);
    document.getElementById('homeBtn')?.addEventListener('click',()=>{saveToLocal();window.location.href='/';});
    document.getElementById('refreshPreview')?.addEventListener('click',updatePreview);
    document.getElementById('fullscreenBtn')?.addEventListener('click',()=>{const pc=document.getElementById('previewContainer');if(!document.fullscreenElement)pc?.requestFullscreen?.();else document.exitFullscreen?.();});
    document.querySelectorAll('.pv-size').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.pv-size').forEach(b=>b.classList.remove('active'));btn.classList.add('active');const f=document.getElementById('previewDeviceFrame');if(f){f.className='preview-device-frame';if(btn.dataset.size!=='desktop')f.classList.add(btn.dataset.size);}}));
    let pzoom=1;const zl=document.getElementById('zoomLevel');const az=()=>{const f=document.getElementById('previewFrame');if(f){f.style.transform=`scale(${pzoom})`;f.style.transformOrigin='top left';}if(zl)zl.textContent=Math.round(pzoom*100)+'%';};
    document.getElementById('zoomIn')?.addEventListener('click',()=>{pzoom=Math.min(2,pzoom+0.1);az();});
    document.getElementById('zoomOut')?.addEventListener('click',()=>{pzoom=Math.max(0.3,pzoom-0.1);az();});
    document.getElementById('zoomReset')?.addEventListener('click',()=>{pzoom=1;az();});
    // Console
    const tl=document.getElementById('toggleLogs'),cl=document.getElementById('consoleLogs'),cc=document.getElementById('closeConsoleBtn');
    let lc=0,ec=0;
    function openCon(){if(cl)cl.style.display='flex';if(tl)tl.classList.add('logs-open');const b=document.getElementById('logBadge');if(b){b.style.display='none';b.textContent='0';}lc=0;}
    function closeCon(){if(cl)cl.style.display='none';if(tl)tl.classList.remove('logs-open');}
    tl?.addEventListener('click',()=>cl&&(cl.style.display==='none'||!cl.style.display)?openCon():closeCon());
    cc?.addEventListener('click',closeCon);
    document.getElementById('clearLogs')?.addEventListener('click',()=>{const c=document.getElementById('consoleContent');if(c)c.innerHTML='';lc=0;ec=0;const b=document.getElementById('logBadge');if(b){b.textContent='0';b.style.display='none';}const eb=document.getElementById('errBadge');if(eb)eb.textContent='0';});
    window.addEventListener('message',ev=>{if(!ev.data||ev.data.type!=='console')return;const content=document.getElementById('consoleContent');if(!content)return;const ts=new Date().toTimeString().split(' ')[0],lvl=ev.data.level||'log';const d=document.createElement('div');d.className='clog clog-'+(lvl==='log'?'log':lvl==='warn'?'warn':lvl==='info'?'info':'error');d.innerHTML=`<span class="clog-ts">${ts}</span>${String(ev.data.msg).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}`;content.appendChild(d);content.scrollTop=content.scrollHeight;lc++;if(cl&&(cl.style.display==='none'||!cl.style.display)){const b=document.getElementById('logBadge');if(b){b.textContent=lc;b.style.display='inline-flex';}}if(lvl==='error'){ec++;const eb=document.getElementById('errBadge');if(eb)eb.textContent=ec;}});
    document.getElementById('previewTab')?.addEventListener('click',()=>document.getElementById('previewTab')?.classList.remove('has-new-content'));
    // Find
    document.getElementById('findInput')?.addEventListener('input',doFind);
    document.getElementById('findInput')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.shiftKey?findPrev():findNext();}if(e.key==='Escape')closeFindPanel();});
    document.getElementById('findNextBtn')?.addEventListener('click',findNext);
    document.getElementById('findPrevBtn')?.addEventListener('click',findPrev);
    document.getElementById('closeFindBtn')?.addEventListener('click',closeFindPanel);
    document.getElementById('caseBtn')?.addEventListener('click',function(){findState.caseSensitive=!findState.caseSensitive;this.classList.toggle('active',findState.caseSensitive);doFind();});
    document.getElementById('regexBtn')?.addEventListener('click',function(){findState.useRegex=!findState.useRegex;this.classList.toggle('active',findState.useRegex);doFind();});
    document.getElementById('replaceOneBtn')?.addEventListener('click',()=>{const ed=getActiveEditor();if(!ed||!findState.matches.length)return;const rv=document.getElementById('replaceInput')?.value||'';const m=findState.matches[Math.max(0,findState.currentMatch)];if(!m)return;ed.value=ed.value.substring(0,m.start)+rv+ed.value.substring(m.end);ed.dispatchEvent(new Event('input'));doFind();});
    document.getElementById('replaceAllBtn')?.addEventListener('click',()=>{const ed=getActiveEditor();if(!ed||!findState.query)return;const rv=document.getElementById('replaceInput')?.value||'';let rx;try{const fl=findState.caseSensitive?'g':'gi';rx=findState.useRegex?new RegExp(findState.query,fl):new RegExp(findState.query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),fl);}catch(e){return;}ed.value=ed.value.replace(rx,rv);ed.dispatchEvent(new Event('input'));doFind();});
    document.getElementById('shortcutsHintBtn')?.addEventListener('click',()=>{const m=document.getElementById('shortcutsModal');if(m)m.style.display='flex';});
    document.getElementById('closeShortcutsBtn')?.addEventListener('click',()=>{const m=document.getElementById('shortcutsModal');if(m)m.style.display='none';});
    document.getElementById('shortcutsModal')?.addEventListener('click',e=>{if(e.target.id==='shortcutsModal')e.target.style.display='none';});
    document.querySelectorAll('.welcome-chip').forEach(chip=>chip.addEventListener('click',()=>{const inp=document.getElementById('chatInput');if(inp){inp.value=chip.dataset.prompt||'';inp.focus();inp.style.height='auto';inp.style.height=Math.min(inp.scrollHeight,120)+'px';}}));
    document.getElementById('publishBtn')?.addEventListener('click', deployToVercel);
    document.getElementById('deploySettingsBtn')?.addEventListener('click', e => { e.stopPropagation(); openDeployHistory(); });
    document.getElementById('dhmClose')?.addEventListener('click', closeDeployHistory);
    document.getElementById('dhmBackdrop')?.addEventListener('click', closeDeployHistory);
}

// ==================== SETTINGS ====================
function setupSettings(){
    const btn=document.getElementById('settingsBtn'),panel=document.getElementById('settingsPanel');
    if(!btn||!panel)return;
    btn.addEventListener('click',e=>{e.stopPropagation();panel.style.display=panel.style.display==='none'||!panel.style.display?'block':'none';});
    document.addEventListener('click',e=>{if(!panel.contains(e.target)&&e.target!==btn)panel.style.display='none';});
    const sdTheme=document.getElementById('sdThemeBtn');
    if(sdTheme){sdTheme.addEventListener('click',()=>{const n=document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';localStorage.setItem('dcx_theme',n);applyTheme(n);});}
    let fs=parseInt(localStorage.getItem('dcx_fontsize')||'13');
    const fsd=document.getElementById('fontSizeDisplay');
    function setFs(n){fs=Math.max(10,Math.min(20,n));document.documentElement.style.setProperty('--editor-font-size',fs+'px');if(fsd)fsd.textContent=fs;localStorage.setItem('dcx_fontsize',fs);}
    setFs(fs);
    document.getElementById('fontDecBtn')?.addEventListener('click',e=>{e.stopPropagation();setFs(fs-1);});
    document.getElementById('fontIncBtn')?.addEventListener('click',e=>{e.stopPropagation();setFs(fs+1);});
    const ast=document.getElementById('autoSaveLocalEnabled');
    if(ast){const sv=localStorage.getItem('dcx_autosave');if(sv!==null)ast.checked=sv==='true';ast.addEventListener('change',()=>localStorage.setItem('dcx_autosave',ast.checked));}
    setInterval(()=>{if(hasUnsavedChanges)saveToLocal();},120000);
}

// ==================== SIDEBAR ====================
function setupSidebar(){
    const sidebar=document.getElementById('leftSidebar'),openBtn=document.getElementById('openSidebarBtn');
    const agentTab=document.getElementById('agentTab'),closeBtn=document.getElementById('closeSidebarBtn');
    const agentWrapper=document.getElementById('agentPanelWrapper');
    if(!sidebar)return;
    window.collapseSidebar=function(){sidebar.classList.add('collapsed');sidebar.style.width='0';sidebar.style.minWidth='0';if(openBtn)openBtn.style.display='flex';if(agentTab)agentTab.style.display='flex';};
    window.expandSidebar=function(){sidebar.classList.remove('collapsed');const w=Math.max(220,parseInt(localStorage.getItem('dcx_sidebar_w')||'300'));sidebar.style.width=w+'px';sidebar.style.minWidth=w+'px';if(openBtn)openBtn.style.display='none';if(agentTab)agentTab.style.display='none';if(agentWrapper&&agentWrapper.style.display!=='none'){agentWrapper.style.display='none';switchTab('html');}};
    if(closeBtn)closeBtn.addEventListener('click',window.collapseSidebar);
    if(openBtn) openBtn.addEventListener('click',window.expandSidebar);
    if(agentTab)agentTab.addEventListener('click',()=>switchTab('agent'));
    document.getElementById('agentPanelCloseBtn')?.addEventListener('click',window.expandSidebar);
    const handle=document.getElementById('sidebarResizeHandle');
    if(handle&&sidebar){let drag=false,sx=0,sw=0;handle.addEventListener('mousedown',e=>{drag=true;sx=e.clientX;sw=sidebar.getBoundingClientRect().width;handle.classList.add('dragging');document.body.style.cursor='col-resize';document.body.style.userSelect='none';e.preventDefault();});document.addEventListener('mousemove',e=>{if(!drag)return;const w=Math.max(220,Math.min(520,sw+e.clientX-sx));sidebar.style.width=w+'px';sidebar.style.minWidth=w+'px';});document.addEventListener('mouseup',()=>{if(!drag)return;drag=false;handle.classList.remove('dragging');document.body.style.cursor='';document.body.style.userSelect='';try{localStorage.setItem('dcx_sidebar_w',parseInt(sidebar.style.width));}catch(_){}});}
    document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='b'){e.preventDefault();sidebar.classList.contains('collapsed')?window.expandSidebar():window.collapseSidebar();}});
    try{const sw=parseInt(localStorage.getItem('dcx_sidebar_w')||'300');if(sw>=220){sidebar.style.width=sw+'px';sidebar.style.minWidth=sw+'px';}}catch(_){}
    // Reflow editor on sidebar resize
    if(window.ResizeObserver)new ResizeObserver(()=>{const ec=document.getElementById('editorContainer');if(ec)ec.style.minWidth='0';}).observe(sidebar);
    sidebar.addEventListener('transitionend',()=>{['htmlEditor','jsEditor','cssEditor'].forEach(id=>{const w=document.getElementById(id+'EditorWrapper');if(w&&w.classList.contains('active')){updateHighlight(id);updateGutter(id);}});});
}

// ==================== CHAT HISTORY PANEL ====================
function setupChatHistory(){
    const histBtn=document.getElementById('chatHistoryBtn'),histPanel=document.getElementById('chatHistoryPanel');
    const histClose=document.getElementById('chatHistoryClose'),chpNew=document.getElementById('chpNewChatBtn');
    const newChatBtn=document.getElementById('newChatBtn');
    function openHP(){if(!histPanel)return;renderCHPList();histPanel.style.display='flex';}
    function closeHP(){if(histPanel)histPanel.style.display='none';}
    histBtn?.addEventListener('click',e=>{e.stopPropagation();histPanel?.style.display==='none'||!histPanel?.style.display?openHP():closeHP();});
    histClose?.addEventListener('click',closeHP);
    chpNew?.addEventListener('click',()=>{createNewChat();loadChat(currentChatId);closeHP();});
    newChatBtn?.addEventListener('click',()=>{createNewChat();loadChat(currentChatId);});
    document.addEventListener('click',e=>{if(histPanel&&histPanel.style.display!=='none'&&!histPanel.contains(e.target)&&e.target!==histBtn)closeHP();});
    function timeAgo(ts){const d=Date.now()-(ts||Date.now()),m=Math.floor(d/60000);if(m<1)return'ahora';if(m<60)return m+'m';const h=Math.floor(m/60);if(h<24)return h+'h';return Math.floor(h/24)+'d';}
    function getInit(t){const w=(t||'NC').replace(/[^a-zA-Z0-9\s]/g,'').trim().split(/\s+/);return w.length>=2?(w[0][0]+w[1][0]).toUpperCase():(t||'NC').substring(0,2).toUpperCase();}
    window.renderCHPList=function(){
        const list=document.getElementById('chatList');if(!list)return;
        if(!chatHistory.length){list.innerHTML='<div style="padding:20px;text-align:center;font-size:11.5px;color:var(--text3)">Sin conversaciones</div>';return;}
        list.innerHTML='';
        chatHistory.forEach(chat=>{
            const item=document.createElement('div');item.className='chp-item'+(chat.id===currentChatId?' active':'');
            item.innerHTML=`<div class="chp-item-icon">${getInit(chat.title)}</div><div class="chp-item-info"><div class="chp-item-title">${chat.title||'Nuevo Chat'}</div><div class="chp-item-meta">${(chat.messages||[]).length} msg · ${timeAgo(chat.created)}</div></div><button class="chp-item-rename" style="width:22px;height:22px;display:flex;align-items:center;justify-content:center;background:transparent;border:none;color:var(--text3);border-radius:4px;cursor:pointer;opacity:0;transition:opacity 0.15s"><svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M7 1.5L9.5 4L3.5 10H1V7.5L7 1.5Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg></button><button class="chp-item-del" style="width:22px;height:22px;display:flex;align-items:center;justify-content:center;background:transparent;border:none;color:var(--text3);border-radius:4px;cursor:pointer;opacity:0;transition:opacity 0.15s"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2L8 8M8 2L2 8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg></button>`;
            item.addEventListener('mouseenter',()=>item.querySelectorAll('.chp-item-rename,.chp-item-del').forEach(b=>b.style.opacity='1'));
            item.addEventListener('mouseleave',()=>item.querySelectorAll('.chp-item-rename,.chp-item-del').forEach(b=>b.style.opacity='0'));
            item.addEventListener('click',e=>{
                if(e.target.closest('.chp-item-del')||e.target.closest('.chp-item-rename'))return;
                loadChat(chat.id);
                // Always show the label bar after switching
                const hb=document.getElementById('chatHeaderBar');
                if(hb) hb.style.display='flex';
                const tl=document.getElementById('currentChatTitle');
                if(tl) tl.textContent=chat.title||'Nuevo Chat';
                closeHP();
            });
            item.querySelector('.chp-item-rename').addEventListener('click',e=>{e.stopPropagation();const te=item.querySelector('.chp-item-title'),old=chat.title||'Nuevo Chat';const inp=document.createElement('input');inp.type='text';inp.value=old;inp.style.cssText='width:100%;background:var(--bg0);border:1px solid var(--accent);border-radius:4px;color:var(--text0);font-size:12px;font-family:var(--font-ui);padding:2px 6px;outline:none;';te.replaceWith(inp);inp.focus();inp.select();function commit(){const nt=inp.value.trim()||old;chat.title=nt;saveChatHistory();const sp=document.createElement('div');sp.className='chp-item-title';sp.textContent=nt;inp.replaceWith(sp);if(chat.id===currentChatId){const tl=document.getElementById('currentChatTitle');if(tl)tl.textContent=nt;}}inp.addEventListener('keydown',e2=>{if(e2.key==='Enter'){e2.preventDefault();commit();}if(e2.key==='Escape'){const sp=document.createElement('div');sp.className='chp-item-title';sp.textContent=old;inp.replaceWith(sp);}});inp.addEventListener('blur',commit);});
            item.querySelector('.chp-item-del').addEventListener('click',e=>{e.stopPropagation();const idx=chatHistory.findIndex(c=>c.id===chat.id);if(idx!==-1)chatHistory.splice(idx,1);saveChatHistory();if(chat.id===currentChatId){if(chatHistory.length)loadChat(chatHistory[0].id);else createNewChat();}else window.renderCHPList();});
            list.appendChild(item);
        });
    };
    window.renderChatDropdown=window.renderCHPList;
}

// ==================== PREVIEW EMPTY STATE ====================
function setupPreviewEmptyState(){
    const fw=document.getElementById('previewFrameWrapper')||document.querySelector('.preview-frame-wrapper');if(!fw)return;
    const es=document.createElement('div');es.className='preview-empty-state';es.id='previewEmptyState';
    es.innerHTML='<div class="preview-empty-icon"><svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="2" y="2" width="24" height="24" rx="4" stroke="currentColor" stroke-width="1.5"/><path d="M2 8H26M8 2V8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="5" cy="5" r="1" fill="currentColor"/><circle cx="8.5" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="5" r="1" fill="currentColor"/><path d="M9 16L13 19L9 22M15 22H19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div><h4>Sin página disponible</h4><p>Escribe código o pídele al Agent que genere algo.</p>';
    fw.appendChild(es);
    function checkCode(){const h=document.getElementById('htmlEditor')?.value||'',c=document.getElementById('cssEditor')?.value||'',j=document.getElementById('jsEditor')?.value||'';es.style.display=(h+c+j).trim()?'none':'flex';}
    ['htmlEditor','cssEditor','jsEditor'].forEach(id=>document.getElementById(id)?.addEventListener('input',()=>{if(document.querySelector('.preview-container.visible'))checkCode();}));
    checkCode();
}

// ==================== AGENT PANEL ====================
function setupAgentPanel(){
    const agpIn      = document.getElementById('agentPanelInput');
    const agpSnd     = document.getElementById('agentPanelSendBtn');
    const agpMsgs    = document.getElementById('agentPanelMessages');
    const agpList    = document.getElementById('agpChatList');
    const agpNewBtn  = document.getElementById('agpNewChatBtn');
    const agpDropNewBtn = document.getElementById('agpDropdownNewBtn');
    const agpTitle   = document.getElementById('agpCurrentTitle');
    const agpSelector= document.getElementById('agpChatSelector');
    const agpDropdown= document.getElementById('agpDropdown');
    const agpWelcome = document.getElementById('agpWelcome');
    const previewTab = document.getElementById('previewTab');
    if (!agpIn || !agpSnd) return;

    let agpChats = [];
    let agpCurId = null;
    try { const s=localStorage.getItem('dcx_agp_chats'); if(s) agpChats=JSON.parse(s); } catch(e) {}

    function saveAGP() { try { localStorage.setItem('dcx_agp_chats', JSON.stringify(agpChats.slice(0,30))); } catch(e) {} }
    function timeAgo(ts) { const d=Date.now()-(ts||Date.now()),m=Math.floor(d/60000); if(m<1)return'ahora'; if(m<60)return m+'m'; const h=Math.floor(m/60); if(h<24)return h+'h'; return Math.floor(h/24)+'d'; }
    function getInit(t) { const w=(t||'NC').replace(/[^a-zA-Z0-9\s]/g,'').trim().split(/\s+/); return w.length>=2?(w[0][0]+w[1][0]).toUpperCase():(t||'NC').substring(0,2).toUpperCase(); }

    function createAGPC() {
        const id='agp_'+Date.now();
        agpChats.unshift({id,title:'Nuevo Chat',messages:[],created:Date.now()});
        saveAGP(); return id;
    }

    function clearAGPMsgs() {
        if (!agpMsgs) return;
        Array.from(agpMsgs.children).forEach(c => { if (!c.id || c.id !== 'agpWelcome') c.remove(); });
    }

    function loadAGPC(id) {
        agpCurId = id;
        const chat = agpChats.find(c=>c.id===id);
        if (!chat) return;
        if (agpTitle) agpTitle.textContent = chat.title || 'Nuevo Chat';
        clearAGPMsgs();
        if (agpWelcome) agpWelcome.style.display = chat.messages?.length ? 'none' : 'flex';
        if (chat.messages?.length) {
            chat.messages.slice(-60).forEach(m => agpAppend(m.content, m.type, true));
        }
        if (agpMsgs) agpMsgs.scrollTop = agpMsgs.scrollHeight;
        renderDropdown();
        closeDropdown();
    }

    /* ── Dropdown ── */
    function openDropdown()  { if (agpDropdown) agpDropdown.style.display = 'flex'; renderDropdown(); }
    function closeDropdown() { if (agpDropdown) agpDropdown.style.display = 'none'; }
    function toggleDropdown() { agpDropdown?.style.display === 'flex' ? closeDropdown() : openDropdown(); }

    agpSelector?.addEventListener('click', e => { e.stopPropagation(); toggleDropdown(); });
    document.addEventListener('click', e => {
        if (agpDropdown && agpDropdown.style.display==='flex' && !agpDropdown.contains(e.target) && e.target!==agpSelector) closeDropdown();
    });

    function renderDropdown() {
        if (!agpList) return;
        agpList.innerHTML = '';
        if (!agpChats.length) {
            agpList.innerHTML = '<div style="padding:16px;text-align:center;font-size:11.5px;color:var(--text3)">Sin conversaciones</div>';
            return;
        }
        agpChats.forEach(chat => {
            const item = document.createElement('div');
            item.className = 'agp-drop-item' + (chat.id===agpCurId ? ' active' : '');
            const init = getInit(chat.title);
            const msgs = (chat.messages||[]).length;
            item.innerHTML = `
                <div class="agp-drop-avatar">${init}</div>
                <div class="agp-drop-info">
                    <div class="agp-drop-title">${chat.title||'Nuevo Chat'}</div>
                    <div class="agp-drop-meta">${msgs} msg · ${timeAgo(chat.created)}</div>
                </div>
                <button class="agp-drop-del" title="Eliminar">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2L8 8M8 2L2 8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                </button>`;
            item.addEventListener('click', e => {
                if (e.target.closest('.agp-drop-del')) return;
                loadAGPC(chat.id);
            });
            item.querySelector('.agp-drop-del').addEventListener('click', e => {
                e.stopPropagation();
                const idx = agpChats.findIndex(c=>c.id===chat.id);
                if (idx!==-1) agpChats.splice(idx,1);
                saveAGP();
                if (chat.id===agpCurId) {
                    if (agpChats.length) loadAGPC(agpChats[0].id);
                    else { agpCurId=null; clearAGPMsgs(); if(agpWelcome) agpWelcome.style.display='flex'; if(agpTitle) agpTitle.textContent='Nuevo Chat'; closeDropdown(); }
                } else renderDropdown();
            });
            agpList.appendChild(item);
        });
    }

    /* ── Append message ── */
    function agpAppend(content, type, nosave) {
        if (agpWelcome) agpWelcome.style.display = 'none';
        const div = document.createElement('div'); div.className = 'agp-msg ' + type;
        const lbl = document.createElement('div'); lbl.className = 'agp-msg-label';
        lbl.textContent = type==='user' ? 'Tú' : type==='error' ? 'Error' : 'Agent';
        const bub = document.createElement('div'); bub.className = 'agp-msg-bubble';
        bub.textContent = content;
        div.appendChild(lbl); div.appendChild(bub);
        if (agpMsgs) { agpMsgs.appendChild(div); agpMsgs.scrollTop = agpMsgs.scrollHeight; }
        if (!nosave && agpCurId) {
            const chat = agpChats.find(c=>c.id===agpCurId);
            if (chat) {
                if (!chat.messages) chat.messages=[];
                chat.messages.push({content,type,ts:Date.now()});
                if (type==='user' && chat.title==='Nuevo Chat') {
                    chat.title = content.substring(0,32) + (content.length>32?'…':'');
                    if (agpTitle) agpTitle.textContent = chat.title;
                }
                saveAGP();
            }
        }
    }

    /* ── Send ── */
    async function agpSend() {
        const msg = agpIn.value.trim();
        if (!msg || isGenerating) return;

        // Check usage limit
        if (dcxAgentUsed >= dcxAgentMax) {
            showToast(`Límite de mensajes alcanzado (${dcxAgentMax}/${dcxAgentMax})`, 'warn');
            return;
        }

        if (!agpCurId) { agpCurId = createAGPC(); renderDropdown(); }
        agpIn.value = ''; agpIn.style.height = 'auto';
        agpAppend(msg, 'user');
        appendMessage(msg, 'user', true); startChat();

        const phases = ['Analizando...','Generando HTML...','Aplicando CSS...','Codificando JS...','Optimizando...','Compilando...'];
        const gd = document.createElement('div'); gd.className = 'agp-msg ai';
        gd.innerHTML = `<div class="agp-msg-label">Agent</div>
            <div class="agp-generating">
                <div class="agp-gen-header"><div class="agp-gen-pulse"></div><span>Generando</span></div>
                <div style="display:flex;align-items:center;gap:7px;font-size:11.5px;color:var(--text2)">
                    <div style="width:6px;height:6px;border-radius:50%;background:#3b82f6;flex-shrink:0"></div>
                    <span id="agpPT">${phases[0]}</span>
                </div>
                <div style="display:flex;flex-direction:column;gap:5px">
                    <div style="display:flex;justify-content:space-between;font-size:10.5px;color:var(--text3);font-family:var(--font-mono)">
                        <span id="agpBL">${phases[0]}</span><span id="agpBP">0%</span>
                    </div>
                    <div style="height:3px;background:var(--bg2);border-radius:2px;overflow:hidden">
                        <div id="agpBF" style="height:100%;border-radius:2px;background:linear-gradient(90deg,#3b82f6,#22d3ee);width:0%;transition:width 0.5s ease"></div>
                    </div>
                </div>
            </div>`;
        if (agpMsgs) { agpMsgs.appendChild(gd); agpMsgs.scrollTop = agpMsgs.scrollHeight; }

        let pct=0;
        const bf=gd.querySelector('#agpBF'), bp=gd.querySelector('#agpBP');
        const pt=gd.querySelector('#agpPT'), bl=gd.querySelector('#agpBL');
        const iv = setInterval(()=>{
            pct = Math.min(pct + Math.random()*5 + 1.5, 90);
            if(bf) bf.style.width=pct+'%'; if(bp) bp.textContent=Math.round(pct)+'%';
            const pi = Math.min(Math.floor((pct/90)*(phases.length-1)), phases.length-1);
            if(pt) pt.textContent=phases[pi]; if(bl) bl.textContent=phases[pi];
        }, 350);

        try {
            if (typeof generateCode !== 'function') throw new Error('generateCode no disponible. Configura la API key.');
            await generateCode(msg);
            clearInterval(iv); if(bf) bf.style.width='100%'; if(bp) bp.textContent='100%';
            await new Promise(r=>setTimeout(r,350));
            gd.remove();
            agpAppend('Listo. Tu app está generada. Haz clic en Preview para verla.', 'ai');
            if (previewTab) previewTab.classList.add('has-new-content');
            incrementAgentUsage();
        } catch(err) {
            clearInterval(iv); gd.remove();
            agpAppend('Error: ' + String(err.message||err), 'error');
        }
    }

    /* ── Init ── */
    if (!agpChats.length) agpCurId = createAGPC();
    else agpCurId = agpChats[0].id;
    loadAGPC(agpCurId);

    agpNewBtn?.addEventListener('click', () => { agpCurId = createAGPC(); loadAGPC(agpCurId); });
    agpDropNewBtn?.addEventListener('click', () => { agpCurId = createAGPC(); loadAGPC(agpCurId); closeDropdown(); });

    agpIn.addEventListener('input', function() { this.style.height='auto'; this.style.height=Math.min(this.scrollHeight,150)+'px'; });
    agpSnd.addEventListener('click', agpSend);
    agpIn.addEventListener('keydown', e => { if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); agpSend(); } });

    document.querySelectorAll('.agp-chip').forEach(c => c.addEventListener('click', ()=>{
        agpIn.value = c.dataset.prompt||'';
        agpIn.focus();
        agpIn.style.height = 'auto';
        agpIn.style.height = Math.min(agpIn.scrollHeight,150)+'px';
    }));

    // Re-render dropdown when panel opens
    const agpWrapper = document.getElementById('agentPanelWrapper');
    if (agpWrapper) new MutationObserver(()=>{
        if (agpWrapper.style.display!=='none') { renderDropdown(); requestAnimationFrame(()=>agpIn?.focus()); }
    }).observe(agpWrapper, {attributes:true, attributeFilter:['style']});
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', async function init(){
    // Show loading bar briefly while the UI shell is built
    const loadingBar = document.getElementById('loadingBar');
    const progressBar = document.getElementById('loadingProgressBar');
    if (loadingBar) loadingBar.style.display = 'flex';
    if (progressBar) progressBar.style.width = '10%';

    // Read project params from URL (?pid=... ?generated=true)
    const urlParams = new URLSearchParams(window.location.search);
    dcxProjectId = urlParams.get('pid') || null;
    const isGenerated = urlParams.get('generated') === 'true';

    initTheme();
    if (progressBar) progressBar.style.width = '25%';

    // ── Handle generated code from dashboard (instant — no network) ──────────
    if (isGenerated) {
        try {
            const raw = localStorage.getItem('devcenter_generated_code');
            if (raw) {
                const d = JSON.parse(raw);
                const he = document.getElementById('htmlEditor');
                const ce = document.getElementById('cssEditor');
                const je = document.getElementById('jsEditor');
                if (he) he.value = d.html || '';
                if (ce) ce.value = d.css  || '';
                if (je) je.value = d.javascript || d.js || '';
                try {
                    localStorage.setItem('dcx_code', JSON.stringify({
                        html: d.html || '', css: d.css || '',
                        js: d.javascript || d.js || '', savedAt: Date.now()
                    }));
                } catch(_) {}
                localStorage.removeItem('devcenter_generated_code');
                history.replaceState(null, '', '/Programar/');
            } else {
                loadFromLocal();
            }
        } catch(e) {
            console.warn('[DCX] Error cargando código generado:', e);
            loadFromLocal();
        }
    } else if (!dcxProjectId) {
        // No project in URL — load last working copy from localStorage immediately
        loadFromLocal();
    } else {
        // Has ?pid= — show skeleton name while Firebase loads in background
        const nameSpan = document.getElementById('projectName');
        if (nameSpan) {
            nameSpan.textContent = 'Cargando...';
            nameSpan.style.opacity = '0.5';
        }
        loadFromLocal(); // show whatever is in localStorage right away
    }
    if (progressBar) progressBar.style.width = '50%';

    // ── Set up all UI immediately (no Firebase dependency) ───────────────────
    initChatSystem();
    setupEditorEvents();
    setupAllListeners();
    setupPowerKeyboard();
    setupSettings();
    setupSidebar();
    setupChatHistory();
    setupPreviewEmptyState();
    setupAgentPanel();
    setupProjectEdit();
    setupProjectSwitcher();
    setupProjectInfoModal();
    restoreDeployBar();
    renderAgentUsage();
    renderDeployCredits();
    ['htmlEditor','cssEditor','jsEditor'].forEach(id=>{updateHighlight(id);updateGutter(id);});
    switchTab('html');
    setInterval(()=>{ if(hasUnsavedChanges) saveToLocal(); }, 60000);
    if (progressBar) progressBar.style.width = '100%';

    // ── Hide loading bar — UI is ready, Firebase loads in background ─────────
    setTimeout(() => {
        if (loadingBar) {
            loadingBar.style.opacity = '0';
            loadingBar.style.visibility = 'hidden';
        }
    }, 350);

    // ── Now load Firebase data asynchronously (doesn't block the UI) ─────────
    if (dcxProjectId) {
        // Load the selected project in the background and update editors when ready
        loadProjectFromFirebase(dcxProjectId).then(loaded => {
            if (!loaded) {
                // Error overlay already shown by loadProjectFromFirebase
                console.warn('[DCX] Project load failed, keeping local data');
            }
            // Refresh highlight after data arrives
            ['htmlEditor','cssEditor','jsEditor'].forEach(id=>{
                updateHighlight(id);
                updateGutter(id);
            });
        }).catch(e => console.warn('[DCX] Firebase project load error:', e));
    } else {
        // No specific project — load Firebase user data only
        dcxInit().then(() => {
            if (dcxUid && dcxDb) {
                ensureUserDocument();
                loadUserPill();
                loadAgentLimitFromFirebase();
            }
        }).catch(e => console.warn('[DCX] dcxInit error:', e));
    }
});
