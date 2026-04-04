// api/delete-project.js
export default async function handler(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { slug } = req.query;

    if (!slug) {
        return res.status(400).json({ error: 'Missing slug parameter' });
    }

    const token = process.env.VERCEL_TOKEN;
    if (!token) {
        return res.status(500).json({ error: 'Vercel token not configured' });
    }

    try {
        const response = await fetch(`https://api.vercel.com/v9/projects/${slug}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 204) {
            res.status(200).json({ success: true });
        } else {
            const data = await response.json();
            res.status(response.status).json({ error: data?.error?.message || 'Delete failed' });
        }
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}