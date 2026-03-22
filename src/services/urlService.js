const { nanoid } = require('nanoid')
const URL = require('../models/urlModel')
const { client } = require('../config/redisClient')
const validator = require('validator')

exports.createShortUrl = async (originalUrl) => {

    // ✅ FIXED VALIDATION
    if (!validator.isURL(originalUrl, {
        require_protocol: true,
        require_valid_protocol: true
    })) {
        throw new Error("Invalid URL")
    }

    const shortId = nanoid(6)

    const url = await URL.create({ originalUrl, shortId })

    await client.set(shortId, originalUrl, { EX: 3600 })

    return url
}

exports.getOriginalUrl = async (shortId) => {
    const cached = await client.get(shortId)

    if (cached) return { originalUrl: cached }

    const url = await URL.findOne({ shortId })

    if (!url) return null

    await client.set(shortId, url.originalUrl, { EX: 3600 })

    return url
}