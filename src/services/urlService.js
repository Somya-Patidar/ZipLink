const { nanoid } = require('nanoid')
const URL = require('../models/urlModel')
const { client } = require('../config/redisClient')
const validator = require('validator')

// CREATE SHORT URL
exports.createShortUrl = async (originalUrl) => {

    if (!validator.isURL(originalUrl, {
        require_protocol: true,
        require_valid_protocol: true
    })) {
        throw new Error("Invalid URL")
    }

    const shortId = nanoid(6)

    const url = await URL.create({ originalUrl, shortId })

    // ✅ TRY REDIS (NON-BLOCKING)
    try {
        if (client && client.isOpen) {
            await client.set(shortId, originalUrl, { EX: 3600 })
        }
    } catch (err) {
        console.log("Redis set failed (ignored):", err.message)
    }

    return url
}

// GET ORIGINAL URL
exports.getOriginalUrl = async (shortId) => {

    // ✅ TRY CACHE FIRST
    try {
        if (client && client.isOpen) {
            const cached = await client.get(shortId)
            if (cached) return { originalUrl: cached }
        }
    } catch (err) {
        console.log("Redis get failed (ignored):", err.message)
    }

    // ✅ FALLBACK TO DB
    const url = await URL.findOne({ shortId })

    if (!url) return null

    // ✅ TRY TO CACHE AGAIN (NON-BLOCKING)
    try {
        if (client && client.isOpen) {
            await client.set(shortId, url.originalUrl, { EX: 3600 })
        }
    } catch (err) {
        console.log("Redis cache set failed:", err.message)
    }

    return url
}