const { createClient } = require('redis')

const client = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: false // ❌ don't retry forever
  }
})

client.connect()
  .then(() => console.log("Redis Connected"))
  .catch(err => console.log("Redis failed, continuing without it"))

module.exports = { client }