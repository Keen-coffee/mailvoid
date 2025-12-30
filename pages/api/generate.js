const emailStore = require('../../store');

async function fetchRandomWord() {
  const response = await fetch('https://random-word-api.herokuapp.com/word');
  const word = await response.text();
  return word;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { duration } = req.body;
  const word1 = await fetchRandomWord();
  const word2 = await fetchRandomWord();
  const digits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const email = `${word1}.${word2}${digits}@mailvoid.win`;

  const expiration = duration === 'unlimited' ? null : Date.now() + 10 * 60 * 1000;

  emailStore.set(email, { expiration, emails: [] });

  res.status(200).json({ email });
}