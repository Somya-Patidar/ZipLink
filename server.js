require('dotenv').config()
const express = require('express')
const path = require('path')

const connectDB = require('./src/config/db')
const { connectRedis } = require('./src/config/redisClient')

const app = express()

app.use(express.json())

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')))

connectDB()
connectRedis()

app.use('/', require('./src/routes/urlRoutes'))

// fallback route
app.use((req, res) => {
    res.status(404).send("Page not found")
})

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`)
})