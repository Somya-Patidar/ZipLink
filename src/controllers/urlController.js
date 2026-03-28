const service = require('../services/urlService')

exports.create = async (req, res) => {
    try {
        const { originalUrl, customAlias, expiresAt } = req.body

        const url = await service.createShortUrl(
            originalUrl,
            customAlias,
            expiresAt
        )

        res.json({
            shortUrl: `${process.env.BASE_URL}/${url.shortId}`
        })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

exports.redirect = async (req, res) => {

    console.time("redirect") // 🔥 NEW metric

    const url = await service.getOriginalUrl(req.params.shortId)

    console.timeEnd("redirect")

    if (!url) return res.status(404).send("Not found")

    res.redirect(url.originalUrl)
}