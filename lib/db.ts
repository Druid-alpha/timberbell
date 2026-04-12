import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

let clientPromise: Promise<MongoClient>

function createClientPromise() {
  if (!uri) {
    throw new Error('Missing MONGODB_URI in environment variables')
  }
  const client = new MongoClient(uri)
  return client.connect()
}

if (process.env.NODE_ENV === 'production') {
  clientPromise = createClientPromise()
} else {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClientPromise()
  }
  clientPromise = global._mongoClientPromise
}

export async function getDb() {
  const client = await clientPromise
  return client.db()
}
