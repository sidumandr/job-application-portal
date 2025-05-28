import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local')
}

const uri = process.env.MONGODB_URI

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    console.log('Creating new MongoDB connection...')
    client = new MongoClient(uri)
    globalWithMongo._mongoClientPromise = client.connect()
      .then(client => {
        console.log('MongoDB connected successfully')
        return client
      })
      .catch(error => {
        console.error('MongoDB connection error:', error)
        throw error
      })
  }
  clientPromise = globalWithMongo._mongoClientPromise!
} else {
  // In production mode, it's best to not use a global variable.
  console.log('Creating new MongoDB connection...')
  client = new MongoClient(uri)
  clientPromise = client.connect()
    .then(client => {
      console.log('MongoDB connected successfully')
      return client
    })
    .catch(error => {
      console.error('MongoDB connection error:', error)
      throw error
    })
}

// Test the connection
clientPromise
  .then(client => {
    console.log('MongoDB connection test successful')
    return client.db('jobApplications').command({ ping: 1 })
  })
  .then(() => {
    console.log('MongoDB ping successful')
  })
  .catch(error => {
    console.error('MongoDB connection test failed:', error)
  })

export default clientPromise
