const router = require('express').Router()
const pool = require('../../utility/database')
const auth = require('../../middleware/auth')

router.post('/add', auth, async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'Not logged in' })
	try {
		const sql = `INSERT INTO notifications (type, id_from, id_to, id_conversation) VALUES (?, ?, ?, ?)`
		const data = [req.body.type, req.body.id_from, req.body.id_to, req.body.id_conversation]
		await pool.query(sql, data)
		res.json({ ok: true})
	} catch (err) {
		throw new Error(err)
	}
})

router.get('/all', auth, async (req, res) => {
	if (!req.user.id) res.json({ msg: 'not logged in' })
	try {
		const sql = `SELECT
						notifications.id_from as id_from,
						notifications.created_at as date,
						notifications.is_read as is_read,
						notifications.type as type,
						users.username as username,
						images.name as profile_image
					FROM notifications
					INNER JOIN users
					ON notifications.id_from = users.id
					INNER JOIN images
					ON notifications.id_from = images.user_id
					where notifications.id_to = ?
					AND images.profile = 1`
		const result = await pool.query(sql, [req.user.id])
		res.json(result)
	} catch (err) {
		throw new Error(err)
	}
})

router.get('/update', auth, async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'Not logged in' })
	try {
		const sql = `UPDATE notifications SET is_read = 1 WHERE type != 'chat' AND id_to = ?`
		await pool.query(sql, [req.user.id])
		res.json({ ok: true})
	} catch (err) {
		throw new Error(err)
	}
})

module.exports = router
