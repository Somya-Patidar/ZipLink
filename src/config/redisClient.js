const { createClient } = require('redis')

const client = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 3) return new Error("Retry limit reached")
      return 1000
    }
  }
})

client.connect()
  .then(() => console.log("Redis Connected"))
  .catch(() => console.log("Redis failed, continuing"))

module.exports = { client }