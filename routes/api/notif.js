const router = require('express').Router()
const pool = require('../../utility/database')
const auth = require('../../middleware/auth')

router.post('/add', auth, async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'Not logged in' })
	try {
		const sql = `INSERT INTO notifications (type, id_from, id_to) VALUES (?, ?, ?)`
		const data = [req.body.type, req.body.id_from, req.body.id_to]
		await pool.query(sql, data)
		res.json({ ok: true})
	} catch (err) {
		throw new Error(err)
	}
})

module.exports = router
