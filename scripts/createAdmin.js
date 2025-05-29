require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI bulunamadı. Lütfen .env.local dosyasını kontrol edin.');
  process.exit(1);
}

if (!process.env.ADMIN_PASSWORD) {
  console.error('ADMIN_PASSWORD bulunamadı. Lütfen .env.local dosyasını kontrol edin.');
  process.exit(1);
}

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function createAdmin() {
  try {
    await client.connect();
    console.log('MongoDB\'ye bağlandı');

    const db = client.db();
    const adminCollection = db.collection('admins');

    // Check if admin already exists
    const existingAdmin = await adminCollection.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin kullanıcısı zaten mevcut');
      return;
    }

    const saltRounds = 10;
    const password = process.env.ADMIN_PASSWORD;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await adminCollection.insertOne({
      username: 'admin',
      password: hashedPassword,
      createdAt: new Date()
    });

    console.log('Admin kullanıcısı oluşturuldu');
    console.log('Şifre:', password);
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await client.close();
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

createAdmin(); 