// Run: node scripts/generateHash.js yourPasswordHere
// Paste the printed hash into ADMIN_PASSWORD_HASH in your .env file.
// This way the real password never sits in plaintext anywhere.

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('Usage: node scripts/generateHash.js <password>');
  process.exit(1);
}

bcrypt.hash(password, 10).then((hash) => {
  console.log('\nAdd this to your .env as ADMIN_PASSWORD_HASH:\n');
  console.log(hash);
  console.log('');
});
