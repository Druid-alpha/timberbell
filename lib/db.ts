import { MongoClient } from 'mongodb'

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

const uri = process.env.MONGODB_URI

let clientPromise: Promise<MongoClient> | undefined

function getClientPromise() {
  if (process.env.NODE_ENV !== 'production' && global._mongoClientPromise) {
    return global._mongoClientPromise
  }

  if (!clientPromise) {
    if (!uri) {
      throw new Error('Missing MONGODB_URI in environment variables')
    }
    const client = new MongoClient(uri)
    clientPromise = client.connect()

    if (process.env.NODE_ENV !== 'production') {
      global._mongoClientPromise = clientPromise
    }
  }

  return clientPromise
}

export async function getDb() {
  const client = await getClientPromise()
  return client.db()
}
