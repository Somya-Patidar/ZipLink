const service = require('../services/urlService')

exports.create = async (req, res) => {
    try {
        const url = await service.createShortUrl(req.body.originalUrl)

        res.json({
            shortUrl: `${process.env.BASE_URL}/${url.shortId}`
        })
    } catch {
        res.status(400).json({ error: "Invalid URL" })
    }
}

exports.redirect = async (req, res) => {
    const url = await service.getOriginalUrl(req.params.shortId)

    if (!url) return res.status(404).send("Not found")

    res.redirect(url.originalUrl)
}