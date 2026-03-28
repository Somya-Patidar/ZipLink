const { nanoid } = require('nanoid')
const URL = require('../models/urlModel')
const { client } = require('../config/redisClient')
const validator = require('validator')

// 🔥 Metrics
let cacheHits = 0
let cacheMisses = 0

// CREATE SHORT URL
exports.createShortUrl = async (originalUrl, customAlias, expiresAt) => {

    // ✅ VALIDATION
    if (!validator.isURL(originalUrl, {
        require_protocol: true,
        require_valid_protocol: true
    })) {
        throw new Error("Invalid URL")
    }

    // ================================
    // 🔥 CASE 1: CUSTOM ALIAS PROVIDED
    // ================================
    if (customAlias) {

        // check if alias already exists
        const aliasExists = await URL.findOne({ shortId: customAlias })
        if (aliasExists) {
            throw new Error("Alias already taken")
        }

        // create new mapping (NO deduplication)
        const url = await URL.create({
            originalUrl,
            shortId: customAlias,
            expiresAt
        })

        // cache
        try {
            if (client?.isOpen) {
                await client.set(customAlias, JSON.stringify(url), { EX: 3600 })
            }
        } catch (err) {}

        return url
    }

    // ================================
    // 🔥 CASE 2: NO CUSTOM ALIAS
    // ================================

    // check if long URL already exists
    const existing = await URL.findOne({ originalUrl })
    if (existing) return existing

    // create new short ID
    const shortId = nanoid(6)

    const url = await URL.create({
        originalUrl,
        shortId,
        expiresAt
    })

    // cache
    try {
        if (client?.isOpen) {
            await client.set(shortId, JSON.stringify(url), { EX: 3600 })
        }
    } catch (err) {}

    return url
}


// GET ORIGINAL URL
exports.getOriginalUrl = async (shortId) => {

    // 🔥 CACHE FIRST
    try {
        if (client?.isOpen) {
            const cached = await client.get(shortId)
            if (cached) {
                cacheHits++
                return JSON.parse(cached)
            }
            cacheMisses++
        }
    } catch (err) {}

    // DB FALLBACK
    const url = await URL.findOne({ shortId })
    if (!url) return null

    // expiry check
    if (url.expiresAt && url.expiresAt < new Date()) {
        return null
    }

    // increment clicks
    await URL.updateOne(
        { shortId },
        { $inc: { clicks: 1 } }
    )

    // cache again
    try {
        if (client?.isOpen) {
            await client.set(shortId, JSON.stringify(url), { EX: 3600 })
        }
    } catch (err) {}

    return url
}


// CACHE METRICS
exports.getCacheStats = () => {
    const total = cacheHits + cacheMisses
    return {
        hits: cacheHits,
        misses: cacheMisses,
        hitRatio: total ? (cacheHits / total).toFixed(2) : 0
    }
}