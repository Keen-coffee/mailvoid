const emailStore = require('../../store');

export default function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email } = req.body;

    if (!emailStore.has(email)) {
      return res.status(404).json({ error: 'Email address not found' });
    }

    const entry = emailStore.get(email);
    if (entry.expiration && Date.now() > entry.expiration) {
      emailStore.delete(email);
      return res.status(410).json({ error: 'Email address expired' });
    }

    res.status(200).json({ emails: entry.emails });
  } catch (error) {
    console.error('Error in emails API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}