require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI bulunamadı. Lütfen .env.local dosyasını kontrol edin.');
  process.exit(1);
}

async function createAdmin() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('MongoDB\'ye bağlandı');

    const db = client.db('jobApplications');
    const adminPanel = db.collection('adminPanel');

    // clear collection
    await adminPanel.deleteMany({});
    console.log('Koleksiyon temizlendi');

    // create admin user
    const password = 'MySecurePass123!';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const admin = {
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date()
    };

    const result = await adminPanel.insertOne(admin);
    console.log('Admin kullanıcısı oluşturuldu:', result.insertedId);
    console.log('Kullanıcı adı:', admin.username);
    console.log('Şifre:', password);

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await client.close();
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

createAdmin(); 