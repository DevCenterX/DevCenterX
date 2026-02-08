/**
 * Vercel Serverless Function: /api/config
 * Exposes ONLY public API keys (sensitive URLs stay on server)
 * 
 * Environment variables (set in Vercel Dashboard):
 * - GEMINI_API_KEY (public key from Google)
 */

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Return ONLY public configuration (no sensitive URLs)
  const config = {
    // Public API keys only
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    
    // URLs stay on server - loaded from new.html inline Firebase config
    // Do NOT expose URLs for security reasons:
    // - GEMINI_API_URL (use default)
    // - GITHUB_API_URL (use default)  
    // - Firebase config (in HTML inline script)
    // - Supabase (deprecated - using Firebase now)
  };

  // Cache for 1 hour
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.setHeader('Content-Type', 'application/json');

  return res.status(200).json(config);
}

