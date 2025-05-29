const { MongoClient } = require('mongodb')
const bcrypt = require('bcrypt')
require('dotenv').config({ path: '.env.local' })

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env.local')
  process.exit(1)
}

if (!process.env.ADMIN_PASSWORD) {
  console.error('ADMIN_PASSWORD is not defined in .env.local')
  process.exit(1)
}

const uri = process.env.MONGODB_URI
const client = new MongoClient(uri)

async function initDb() {
  try {
    await client.connect()
    console.log('Connecting to MongoDB Atlas...')
    console.log('Connected to MongoDB Atlas')

    const db = client.db()
    const adminCollection = db.collection('admins')

    // Check if admin already exists
    const existingAdmin = await adminCollection.findOne({ username: 'admin' })
    if (existingAdmin) {
      console.log('Admin user already exists')
      return
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10)
    const result = await adminCollection.insertOne({
      username: 'admin',
      password: hashedPassword,
      createdAt: new Date()
    })

    console.log('Admin user created:', result.insertedId)

    // create an app collection
    const applicationsCollection = db.collection('applications')
    await applicationsCollection.createIndex({ email: 1 }, { unique: true })
    console.log('Applications collection initialized')

    console.log('Database initialization completed')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await client.close()
    console.log('MongoDB connection closed')
  }
}

initDb() 