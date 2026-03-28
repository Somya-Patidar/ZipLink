require('dotenv').config()
const express = require('express')
const path = require('path')

const connectDB = require('./src/config/db')
require('./src/config/redisClient')

const rateLimiter = require('./src/middleware/rateLimiter') // 🔥 NEW

const app = express()
app.set('trust proxy', 1)

app.use(express.json())

// 🔥 Apply rate limit only to shorten API
app.use('/shorten', rateLimiter)

// serve frontend
app.use(express.static(path.join(__dirname, 'public')))

// DB connect
connectDB()

// routes
app.use('/', require('./src/routes/urlRoutes'))

// fallback
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})