const router = require('express').Router()
const pool = require('../../utility/database')


router.get('/', (req, res) => {
	res.json({ ok: true })
})

module.exports = router
