const emailStore = require('../../store');
const fs = require('fs');
const path = require('path');

const words = JSON.parse(fs.readFileSync(path.join(__dirname, 'words.json'), 'utf8'));

function randomWord() {
  return words[Math.floor(Math.random() * words.length)];
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { duration } = req.body;
  const word1 = randomWord();
  const word2 = randomWord();
  const digits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const email = `${word1}.${word2}${digits}@mailvoid.win`;

  const expiration = duration === 'unlimited' ? null : Date.now() + 10 * 60 * 1000;

  emailStore.set(email, { expiration, emails: [] });

  res.status(200).json({ email });
}