const mongoose = require('mongoose')

const urlSchema = new mongoose.Schema({
    originalUrl: {
        type: String,
        required: true
    },
    shortId: {
        type: String,
        required: true
    },
    clicks: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date
    }
})

// 🔥 NEW (Performance optimization)
urlSchema.index({ shortId: 1 }, { unique: true })
urlSchema.index({ originalUrl: 1 })

module.exports = mongoose.model('URL', urlSchema)