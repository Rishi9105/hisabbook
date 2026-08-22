import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '.env') })
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.resolve(process.cwd(), 'server', '.env') })
  dotenv.config({ path: path.resolve(process.cwd(), '.env') })
}

import app from './src/app.js'
import { connectDB } from './src/config/database.js'

const PORT = process.env.PORT || 5000

async function startServer() {
  await connectDB()

  app.listen(PORT, () => {
    console.log(`HisabBook API running on http://localhost:${PORT}`)
  })
}

startServer()