const emailStore = require('../../store');

export default function handler(req, res) {
  console.log('Incoming request to /api/emails');
  console.log('Method:', req.method);
  console.log('Body:', req.body);

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email } = req.body;

    console.log('Checking emails for:', email);

    if (!email) {
      return res.status(400).json({ error: 'Email address required' });
    }

    if (!emailStore.has(email)) {
      console.log('Email not found in store');
      return res.status(404).json({ error: 'Email address not found' });
    }

    const entry = emailStore.get(email);
    if (entry.expiration && Date.now() > entry.expiration) {
      emailStore.delete(email);
      return res.status(410).json({ error: 'Email address expired' });
    }

    console.log('Returning', entry.emails.length, 'emails');
    res.status(200).json({ emails: entry.emails.slice(-5) });
  } catch (error) {
    console.error('Error in emails API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}