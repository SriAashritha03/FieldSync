import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDb } from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import submissionRoutes from './routes/submissionRoutes.js'
import reportRoutes from './routes/reportRoutes.js'
import userRoutes from './routes/userRoutes.js'
import projectRoutes from './routes/projectRoutes.js'
import auditRoutes from './routes/auditRoutes.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'

dotenv.config()

const app = express()

const corsOrigin = process.env.CLIENT_ORIGIN || '*'

app.use(
  cors({
    origin: corsOrigin,
    credentials: corsOrigin !== '*',
  })
)
app.use(express.json())
app.use('/uploads', express.static('uploads'))

app.get('/', (req, res) => {
  res.send('NGO API Running')
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/audit', auditRoutes)
app.use('/api/submissions', submissionRoutes)
app.use('/api/reports', reportRoutes)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error('Failed to start server:', error.message)
    process.exit(1)
  })