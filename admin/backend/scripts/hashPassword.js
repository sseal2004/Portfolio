// Run: node scripts/hashPassword.js yourChosenPassword
// Paste the printed hash into .env as ADMIN_PASSWORD_HASH.
import bcrypt from 'bcryptjs';

const password = process.argv[2];

if (!password) {
  console.log('Usage: node scripts/hashPassword.js <password>');
  process.exit(1);
}

bcrypt.hash(password, 10).then((hash) => {
  console.log('Add this to your .env as ADMIN_PASSWORD_HASH:');
  console.log(hash);
});