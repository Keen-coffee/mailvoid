const emailStore = require('../../store');
const { simpleParser } = require('mailparser');

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  console.log('Incoming request to /api/endpoint');
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));

  if (req.method !== 'PUT' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get raw email body
    const raw = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => data += chunk.toString());
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });

    console.log('Raw body length:', raw.length);
    console.log('Raw body preview:', raw.substring(0, 200) + '...');

    if (!raw) {
      return res.status(400).json({ error: 'Missing raw email content' });
    }

    // Get metadata from headers
    const from = req.headers['x-from'];
    const to = JSON.parse(req.headers['x-to'] || '[]');

    console.log('From:', from);
    console.log('To:', to);

    // Parse the raw email
    const parsed = await simpleParser(raw);
    const subject = parsed.subject || 'No Subject';
    const text = parsed.text || parsed.html || 'No Content';

    console.log('Parsed subject:', subject);
    console.log('Parsed text length:', text.length);

    // to might be array or string
    const toAddresses = Array.isArray(to) ? to : [to];

    let processed = false;
    for (const addr of toAddresses) {
      if (addr.endsWith('@mailvoid.win')) {
        console.log('Processing email for:', addr);
        // For testing, accept any @mailvoid.win email
        if (!emailStore.has(addr)) {
          emailStore.set(addr, { expiration: null, emails: [] });
        }
        const entry = emailStore.get(addr);
        entry.emails.push({ from, subject, text: text, receivedAt: new Date() });
        processed = true;
      }
    }

    console.log('Processed:', processed);

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