// In-memory store for temporary emails
// email -> { expiration: timestamp or null, emails: [] }

const emailStore = new Map();

module.exports = emailStore;