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

    const now = new Date()

    // ================================
    // 🔥 CASE 1: CUSTOM ALIAS PROVIDED
    // ================================
    if (customAlias) {

        try {
            const url = await URL.create({
                originalUrl,
                shortId: customAlias,
                expiresAt: expiresAt || null
            })

            return url

        } catch (err) {

            // 🔥 HANDLE DUPLICATE ALIAS
            if (err.code === 11000) {

                // check existing alias
                const existing = await URL.findOne({ shortId: customAlias })

                // 🔥 if expired → delete and reuse
                if (existing && existing.expiresAt && existing.expiresAt < now) {

                    await URL.deleteOne({ shortId: customAlias })

                    const url = await URL.create({
                        originalUrl,
                        shortId: customAlias,
                        expiresAt: expiresAt || null
                    })

                    return url
                }

                throw new Error("Alias already taken")
            }

            throw err
        }
    }

    // ================================
    // 🔥 CASE 2: NO CUSTOM ALIAS
    // ================================

    // check if long URL already exists
    const existing = await URL
        .findOne({ originalUrl })
        .lean()
        .maxTimeMS(2000)

    if (existing) return existing

    // create new short ID
    const shortId = nanoid(6)

    const url = await URL.create({
        originalUrl,
        shortId,
        expiresAt: expiresAt || null
    })

    // cache
    try {
        if (client?.isOpen) {
            await client.set(shortId, JSON.stringify(url), { EX: 3600 })
        }
    } catch (err) { }

    return url
}


// GET ORIGINAL URL
exports.getOriginalUrl = async (shortId) => {

    console.log("STEP 1: checking cache")

    try {
        if (client?.isOpen) {
            const cached = await client.get(shortId)
            if (cached) {
                console.log("CACHE HIT")
                return JSON.parse(cached)
            }
            console.log("CACHE MISS")
        }
    } catch (err) {
        console.log("REDIS ERROR:", err)
    }

    console.log("STEP 2: querying DB")

    const url = await URL.findOne({ shortId }).maxTimeMS(2000)

    console.log("STEP 3: DB result:", url)

    if (!url) return null

    if (url.expiresAt && url.expiresAt < new Date()) {
        return null
    }

    await URL.updateOne(
        { shortId },
        { $inc: { clicks: 1 } }
    )

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