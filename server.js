require('dotenv').config()
const express = require('express')
const path = require('path')

const connectDB = require('./src/config/db')
require('./src/config/redisClient')

const rateLimiter = require('./src/middleware/rateLimiter')

const app = express()
app.set('trust proxy', 1)

app.use(express.json())

const urlRoutes = require('./src/routes/urlRoutes')

// ✅ API + redirect routes FIRST
app.use('/shorten', rateLimiter)
app.use('/', urlRoutes)

// ✅ THEN serve frontend
app.use(express.static(path.join(__dirname, 'public')))

// DB connect
connectDB()

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})