const emailStore = require('../../store');
const { simpleParser } = require('mailparser');

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { from, to, raw } = req.body;

    if (!raw) {
      return res.status(400).json({ error: 'Missing raw email content' });
    }

    // Parse the raw email
    const parsed = await simpleParser(raw);
    const subject = parsed.subject || 'No Subject';
    const text = parsed.text || parsed.html || 'No Content';

    // to might be array or string
    const toAddresses = Array.isArray(to) ? to : [to];

    let processed = false;
    for (const addr of toAddresses) {
      if (emailStore.has(addr)) {
        const entry = emailStore.get(addr);
        if (entry.expiration && Date.now() > entry.expiration) {
          emailStore.delete(addr);
          continue;
        }
        entry.emails.push({ from, subject, text, receivedAt: new Date() });
        processed = true;
      }
    }

    if (processed) {
      res.status(200).json({ success: true });
    } else {
      res.status(404).json({ error: 'No valid email addresses found' });
    }
  } catch (error) {
    console.error('Error processing email:', error);
    res.status(500).json({ error: 'Internal server error processing email' });
  }
}