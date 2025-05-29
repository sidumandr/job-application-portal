const bcrypt = require('bcrypt');
const saltRounds = 10;

if (!process.env.ADMIN_PASSWORD) {
  console.error('ADMIN_PASSWORD is not defined in .env.local');
  process.exit(1);
}

const password = process.env.ADMIN_PASSWORD;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }
  console.log('Hashed password:', hash);
});
