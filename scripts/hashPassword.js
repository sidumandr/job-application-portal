const bcrypt = require('bcrypt');

const password = "MySecurePass123!"; 
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error("Hashleme hatası:", err);
    process.exit(1);
  }
  console.log("Hashlenmiş şifre:", hash);
});
