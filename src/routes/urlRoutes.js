const router = require('express').Router()
const ctrl = require('../controllers/urlController')

router.post('/shorten', ctrl.create)
router.get('/r/:shortId', ctrl.redirect)

module.exports = router