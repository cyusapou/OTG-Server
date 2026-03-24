import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import apiRoutes from './routes/index.js'
import nearestStopRoute from './routes/nearestStop.js'

const PORT = process.env.PORT || 3001

const app = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.get('/', (_req, res) => {
  res.json({
    name: 'On The Go API',
    version: '2.0.0',
    status: 'running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  })
})

app.use('/api/v1/public/nearest-stop', nearestStopRoute)

app.use('/api/v1', apiRoutes)

async function start() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set. Create a .env file with your MongoDB connection string.')
    process.exit(1)
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'onthego' // Explicitly set database name
    })
    console.log('Connected to MongoDB Atlas')
    console.log('Database:', mongoose.connection.name)
    
    // Test database connection by checking collections
    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log('Available collections:', collections.map(c => c.name))
    
    // Test companies collection
    const Company = (await import('./models/Company.js')).default
    const companyCount = await Company.countDocuments()
    console.log('Companies count:', companyCount)
    
  } catch (err) {
    console.error('MongoDB connection failed:', err.message)
    process.exit(1)
  }

  app.listen(PORT, () => {
    console.log(`\n  On The Go API Server v2.0`)
    console.log(`  Express + Mongoose`)
    console.log(`  http://localhost:${PORT}\n`)
  })
}

start()
