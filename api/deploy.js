// api/deploy.js
export default async function handler(req, res) {
    // ── CORS / Origin check ──────────────────────────────────────────────────
    const allowedOrigins = [
        'https://devcenterx.vercel.app',
        'https://devcenterx.com',
    ];
    const origin = req.headers.origin || req.headers.referer || '';
    const allowed = allowedOrigins.some(o => origin.startsWith(o));

    res.setHeader('Access-Control-Allow-Origin', allowed ? origin : allowedOrigins[0]);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    if (!allowed) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    // ── Basic input validation ───────────────────────────────────────────────
    const { name, files, projectSettings, target } = req.body || {};

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Missing required field: name' });
    }
    if (!files || !Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ error: 'Missing required field: files' });
    }
    // Prevent oversized payloads (max 50 files, names max 80 chars)
    if (files.length > 50) {
        return res.status(400).json({ error: 'Too many files (max 50)' });
    }

    const token = process.env.VERCEL_TOKEN;
    if (!token) {
        return res.status(500).json({ error: 'Vercel token not configured' });
    }

    try {
        const response = await fetch('https://api.vercel.com/v13/deployments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name:            name.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 52),
                files,
                projectSettings: projectSettings || { framework: null },
                target:          target === 'preview' ? 'preview' : 'production'
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: data?.error?.message || 'Deployment failed' });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('[DCX] Deployment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
