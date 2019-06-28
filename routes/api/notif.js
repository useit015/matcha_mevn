const router = require('express').Router()
const pool = require('../../utility/database')
const validateInput = require('../../utility/validate')
const auth = require('../../middleware/auth')

router.post('/add', auth, async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'Not logged in' })
	if (!req.body.id_from || isNaN(req.body.id_from)) return res.json({ msg: 'Invalid request' })
	if (!req.body.id_to || isNaN(req.body.id_to)) return res.json({ msg: 'Invalid request' })
	if (!req.body.id_conversation || isNaN(req.body.id_conversation)) return res.json({ msg: 'Invalid request' })
	if (!req.body.type) return res.json({ msg: 'Invalid request' })
	try {
		const sql = `INSERT INTO notifications (type, id_from, id_to, id_conversation) VALUES (?, ?, ?, ?)`
		const data = [req.body.type, req.body.id_from, req.body.id_to, req.body.id_conversation]
		await pool.query(sql, data)
		res.json({ ok: true})
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
})

router.get('/all', auth, async (req, res) => {
	if (!req.user.id) res.json({ msg: 'not logged in' })
	try {
		const sql = `SELECT
						notifications.id,
						notifications.id_from as id_from,
						notifications.created_at as date,
						notifications.is_read as is_read,
						notifications.type as type,
						users.username as username,
						images.name as profile_image,
						images.profile as profile,
						images.cover as cover
					FROM notifications
					INNER JOIN users
					ON notifications.id_from = users.id
					LEFT JOIN images
					ON notifications.id_from = images.user_id
					where notifications.id_to = ?
					AND users.id NOT IN (
						SELECT blocker FROM blocked WHERE blocked = ? 
						UNION 
						SELECT blocked FROM blocked WHERE blocker = ?
					)`
		let result = await pool.query(sql, [req.user.id, req.user.id, req.user.id])
		result = result.filter((cur, i) => {
			for (let index = 0; index < result.length; index++) {
				if (i != index && result[index].id == cur.id) {
					return cur.profile 
				}
			}
			return true
		}).map(cur => {
			if (cur.cover)
				cur.profile_image = ''
				return cur
		})
		res.json(result)
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
})

router.get('/update', auth, async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'Not logged in' })
	try {
		const sql = `UPDATE notifications SET is_read = 1 WHERE type != 'chat' AND id_to = ?`
		await pool.query(sql, [req.user.id])
		res.json({ ok: true})
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
})

module.exports = router
