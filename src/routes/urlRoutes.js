const router = require('express').Router()
const ctrl = require('../controllers/urlController')

router.post('/shorten', ctrl.create)
router.get('/:shortId', ctrl.redirect)

module.exports = router