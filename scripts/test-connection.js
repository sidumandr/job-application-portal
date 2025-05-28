const { MongoClient } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

async function testConnection() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not defined in .env.local')
    process.exit(1)
  }

  console.log('MongoDB URI:', process.env.MONGODB_URI)
  const client = new MongoClient(process.env.MONGODB_URI)

  try {
    console.log('Connecting to MongoDB Atlas...')
    await client.connect()
    console.log('Successfully connected to MongoDB Atlas')

    const db = client.db('jobApplications')
    console.log('Successfully connected to database: jobApplications')

    // Test admin collection
    const adminCollection = db.collection('adminPanel')
    const adminCount = await adminCollection.countDocuments()
    console.log('Number of admin users:', adminCount)

    // Test applications collection
    const applicationsCollection = db.collection('applications')
    const applicationsCount = await applicationsCollection.countDocuments()
    console.log('Number of applications:', applicationsCount)

  } catch (error) {
    console.error('Connection test failed:', {
      name: error?.name || 'Unknown',
      message: error?.message || 'No message',
      stack: error?.stack || 'No stack trace'
    })
  } finally {
    await client.close()
    console.log('Connection closed')
  }
}

testConnection() 