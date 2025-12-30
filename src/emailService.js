// Word lists for generating random email addresses
const adjectives = [
  'swift', 'bright', 'calm', 'eager', 'fancy', 'gentle', 'happy', 'jolly',
  'kind', 'light', 'mighty', 'neat', 'quick', 'rare', 'swift', 'tidy',
  'vivid', 'wise', 'young', 'zesty', 'agile', 'bold', 'cool', 'daring',
  'easy', 'fresh', 'grand', 'humble', 'icy', 'keen', 'loud', 'merry',
  'nice', 'odd', 'proud', 'quiet', 'royal', 'silly', 'tiny', 'unique',
  'vast', 'warm', 'crazy', 'divine', 'epic', 'fierce', 'glossy', 'holy',
  'ideal', 'jazzy', 'kind', 'loyal', 'magic', 'noble', 'odd', 'plain',
  'quirky', 'recent', 'snappy', 'trendy', 'ultra', 'vacant', 'witty', 'yellow'
];

const nouns = [
  'panda', 'tiger', 'eagle', 'shark', 'wolf', 'dragon', 'phoenix', 'whale',
  'salmon', 'falcon', 'raven', 'leopard', 'cougar', 'badger', 'otter', 'fox',
  'lynx', 'bear', 'deer', 'moose', 'bison', 'zebra', 'lion', 'cheetah',
  'giraffe', 'hippo', 'rhino', 'elephant', 'camel', 'horse', 'buffalo', 'antelope',
  'seal', 'otter', 'beaver', 'squirrel', 'rabbit', 'hare', 'chipmunk', 'porcupine',
  'skunk', 'raccoon', 'opossum', 'armadillo', 'anteater', 'sloth', 'lemur', 'monkey',
  'gorilla', 'orangutan', 'chimpanzee', 'baboon', 'macaque', 'gibbon', 'kangaroo', 'koala'
];

/**
 * Get a random item from an array
 */
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate a random 4-digit number
 */
function getRandomDigits() {
  return Math.floor(Math.random() * 10000).toString().padStart(4, '0');
}

/**
 * Generate a temporary email address
 * Format: randomword.randomword4randomdigits@mailvoid.win
 */
function generateTempEmail() {
  const adj = getRandomItem(adjectives);
  const noun = getRandomItem(nouns);
  const digits = getRandomDigits();
  
  return `${adj}.${noun}${digits}@mailvoid.win`;
}

/**
 * Get all temporary emails associated with a personal email
 */
function getTempEmailsByPersonalEmail(personalEmail, emailMappings) {
  return Object.values(emailMappings).filter(mapping => 
    mapping.personalEmail.toLowerCase() === personalEmail.toLowerCase()
  );
}

/**
 * Get the personal email associated with a temporary email
 */
function getPersonalEmailByTempEmail(tempEmail, emailMappings) {
  const mapping = emailMappings[tempEmail.toLowerCase()];
  return mapping ? mapping.personalEmail : null;
}

/**
 * Clean up expired emails from the storage
 */
function cleanupExpiredEmails(emailMappings) {
  const now = Date.now();
  let deletedCount = 0;

  for (const [tempEmail, mapping] of Object.entries(emailMappings)) {
    if (mapping.expiresAt <= now) {
      delete emailMappings[tempEmail];
      deletedCount++;
    }
  }

  if (deletedCount > 0) {
    console.log(`Cleanup: Deleted ${deletedCount} expired email(s)`);
  }
}

module.exports = {
  generateTempEmail,
  getTempEmailsByPersonalEmail,
  getPersonalEmailByTempEmail,
  cleanupExpiredEmails,
};
