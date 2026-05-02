require('dotenv').config()
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { RateLimiterMemory } = require('rate-limiter-flexible')

const authRoutes = require('./routes/auth.routes')
const projectRoutes = require('./routes/project.routes')
const taskRoutes = require('./routes/task.routes')
const commentRoutes = require('./routes/comment.routes')
const notificationRoutes = require('./routes/notification.routes')
const activityRoutes = require('./routes/activity.routes')
const memberRoutes = require('./routes/member.routes')
const dashboardRoutes = require('./routes/dashboard.routes')

const app = express()

const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
}

app.use(helmet())
app.options('*', cors(corsOptions))
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

const authLimiter = new RateLimiterMemory({ points: 10, duration: 60 })
const authRateMiddleware = async (req, res, next) => {
  try {
    await authLimiter.consume(req.ip)
    next()
  } catch {
    res.status(429).json({ message: 'Too many requests, please try again later' })
  }
}

app.use('/api/auth', authRateMiddleware, authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/activity', activityRoutes)
app.use('/api/members', memberRoutes)
app.use('/api/dashboard', dashboardRoutes)

app.get('/health', (_, res) => res.json({ status: 'ok' }))

module.exports = app
