const emailStore = require('../../store');

const words = [
  "apple", "banana", "cherry", "grape", "lemon", "orange", "peach", "pear", "plum", "berry",
  "mango", "kiwi", "melon", "papaya", "fig", "date", "olive", "coconut", "pineapple", "strawberry",
  "blueberry", "raspberry", "blackberry", "cranberry", "watermelon", "cantaloupe", "honeydew", "apricot", "nectarine", "persimmon",
  "carrot", "potato", "tomato", "onion", "garlic", "pepper", "lettuce", "spinach", "broccoli", "cauliflower",
  "cucumber", "zucchini", "eggplant", "pumpkin", "squash", "corn", "wheat", "rice", "oat", "barley"
];

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