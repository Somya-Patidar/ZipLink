require('dotenv').config()
const express = require('express')
const path = require('path')

const connectDB = require('./src/config/db')
require('./src/config/redisClient') // auto connect

const app = express()

app.use(express.json())

// serve frontend
app.use(express.static(path.join(__dirname, 'public')))

// connect DB
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