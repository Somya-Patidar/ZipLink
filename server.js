require('dotenv').config()
const express = require('express')
const path = require('path')

const connectDB = require('./src/config/db')

// ✅ just require redis (no function)
require('./src/config/redisClient')

const app = express()

app.use(express.json())

app.use(express.static(path.join(__dirname, 'public')))

connectDB()

app.use('/', require('./src/routes/urlRoutes'))

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})