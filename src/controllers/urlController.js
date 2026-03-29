const service = require('../services/urlService')

exports.create = async (req, res) => {
    try {
        const { originalUrl, customAlias, expiresAt } = req.body

        const url = await service.createShortUrl(
            originalUrl,
            customAlias,
            expiresAt
        )

        // 🔥 FIX: add /r/ prefix
        res.json({
            shortUrl: `${process.env.BASE_URL}/r/${url.shortId}`,
            expiryTime: url.expiresAt
        })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

exports.redirect = async (req, res) => {

    console.time("redirect")

    const url = await service.getOriginalUrl(req.params.shortId)

    console.timeEnd("redirect")

    if (!url) return res.status(404).send("Not found")

    let redirectUrl = url.originalUrl

    // ensure protocol
    if (!redirectUrl.startsWith("http://") && !redirectUrl.startsWith("https://")) {
        redirectUrl = "https://" + redirectUrl
    }

    res.redirect(redirectUrl)
}