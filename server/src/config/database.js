import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') })
  dotenv.config({ path: path.resolve(process.cwd(), 'server', '.env') })
  dotenv.config({ path: path.resolve(process.cwd(), '.env') })
}

export async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is missing or undefined in server/.env')
    }

    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 })
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.warn('Primary MongoDB connection failed:', error.message)
    try {
      console.log('Starting in-memory MongoDB instance for development...')
      const { MongoMemoryServer } = await import('mongodb-memory-server')
      const mongoServer = await MongoMemoryServer.create()
      const mongoUri = mongoServer.getUri()
      await mongoose.connect(mongoUri)
      console.log('MongoDB connected successfully (in-memory dev database)')
    } catch (memErr) {
      console.error('In-memory MongoDB connection failed:', memErr.message)
    }
  }
}




