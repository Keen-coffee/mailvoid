const emailStore = require('../../store');

export default function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, from, subject, text } = req.body;

  if (!emailStore.has(to)) {
    return res.status(404).json({ error: 'Email address not found' });
  }

  const entry = emailStore.get(to);
  if (entry.expiration && Date.now() > entry.expiration) {
    emailStore.delete(to);
    return res.status(410).json({ error: 'Email address expired' });
  }

  entry.emails.push({ from, subject, text, receivedAt: new Date() });

  res.status(200).json({ success: true });
}