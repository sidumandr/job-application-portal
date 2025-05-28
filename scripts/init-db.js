const { MongoClient } = require('mongodb')
const bcrypt = require('bcryptjs')
require('dotenv').config({ path: '.env.local' })

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env.local')
  process.exit(1)
}

const uri = process.env.MONGODB_URI
const client = new MongoClient(uri)

async function initDb() {
  try {
    console.log('Connecting to MongoDB Atlas...')
    await client.connect()
    console.log('Connected to MongoDB Atlas')

    const db = client.db('jobApplications')
    
    // Admin kullanıcısını kontrol et
    const adminCollection = db.collection('adminPanel')
    const existingAdmin = await adminCollection.findOne({ username: 'admin' })

    if (!existingAdmin) {
      console.log('Creating admin user...')
      const hashedPassword = await bcrypt.hash('MySecurePass123!', 10)
      
      await adminCollection.insertOne({
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date()
      })
      console.log('Admin user created successfully')
    } else {
      console.log('Admin user already exists')
    }

    // Applications koleksiyonunu oluştur
    const applicationsCollection = db.collection('applications')
    await applicationsCollection.createIndex({ email: 1 }, { unique: true })
    console.log('Applications collection initialized')

    console.log('Database initialization completed')
  } catch (error) {
    console.error('Database initialization failed:', error)
  } finally {
    await client.close()
    console.log('MongoDB connection closed')
  }
}

initDb() 