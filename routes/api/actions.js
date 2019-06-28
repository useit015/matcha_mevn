const router = require('express').Router()
const pool = require('../../utility/database')
const auth = require('../../middleware/auth')

router.post('/position', auth, async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'not logged in' })
	if (!req.body.lat || !req.body.lng || isNaN(req.body.lat) || isNaN(req.body.lng))
		return res.json({ msg: 'Invalid request' })
	try {
		const sql = `UPDATE users SET lat = ?, lng = ? WHERE id = ?`
		const result = await pool.query(sql, [req.body.lat, req.body.lng, req.user.id])
		if (!result.affectedRows) return res.json({ msg: 'Oups something went wrong'})
		res.json({ ok: true })
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
})

router.post('/block', auth, async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'Not logged in' })
	if (!req.body.id || isNaN(req.body.id)) return res.json({ msg: 'Invalid request' })
	try {
		let sql = `SELECT * FROM blocked where blocker = ? AND blocked = ?`
		const data = [req.user.id, req.body.id]
		const result = await pool.query(sql, data)
		if (!result.length) {
			sql = `INSERT INTO blocked (blocker, blocked) VALUES (?, ?)`
			await pool.query(sql, data)
			sql = `UPDATE conversations SET allowed = 0 WHERE (id_user1 = ?
					AND id_user2 = ?) OR (id_user1 = ? AND id_user2 = ?)`
			await pool.query(sql, [req.user.id, req.body.id, req.body.id, req.user.id])
			sql = `DELETE FROM matches WHERE (matcher = ? AND matched = ?)
					OR (matcher = ? AND matched = ?)`
			await pool.query(sql, [req.user.id, req.body.id, req.body.id, req.user.id])
			sql = `DELETE FROM notifications WHERE (id_from = ? AND id_to = ?)
					OR (id_from = ? AND id_to = ?)`
			await pool.query(sql, [req.user.id, req.body.id, req.body.id, req.user.id])
			sql = `DELETE FROM chat WHERE id_conversation IN (
						SELECT id_conversation FROM conversations
						WHERE (id_user1 = ? AND id_user2 = ?)
						OR (id_user1 = ? AND id_user2 = ?)
					)`
			await pool.query(sql, [req.user.id, req.body.id, req.body.id, req.user.id])
			res.json({ ok: true })
		} else {
			res.json({ msg: 'User already Blocked' })
		}
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
})

router.post('/unblock', auth, async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'Not logged in' })
	if (!req.body.id || isNaN(req.body.id)) return res.json({ msg: 'Invalid request' })
	try {
		let sql = `DELETE FROM blocked WHERE blocker = ? AND blocked = ?`
		const result = await pool.query(sql, [req.user.id, req.body.id])
		if (!result.affectedRows) return res.json({ msg: 'Cannot unblock user' })
		res.json({ ok: true })
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
})

router.post('/report', auth, async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'Not logged in' })
	if (!req.body.id || isNaN(req.body.id)) return res.json({ msg: 'Invalid request' })
	try {
		let sql = `UPDATE users SET reports = reports + 1 WHERE id = ?`
		const result = await pool.query(sql, [req.body.id, req.body.id])
		if (result.affectedRows == 1) {
			res.json({ ok: true })
		} else {
			res.json({ msg: 'Cannot report user' })
		}
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
})

router.post('/match', auth, async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'Not logged in' })
	if (typeof req.body.liked !== 'boolean' || !req.body.id || isNaN(req.body.id))
		return res.json({ msg: 'Invalid request' })
	try {
		let sql, result
		const data = [req.user.id, req.body.id]
		if (req.body.liked) {
			sql = `DELETE FROM matches where matcher = ? AND matched = ?`
			await pool.query(sql, data)
			sql = `UPDATE conversations SET allowed = 0
					WHERE id_user1 = ? AND id_user2 = ?
					OR id_user2 = ? AND id_user1 = ?`
			await pool.query(sql, [...data, ...data])
			sql = `INSERT INTO notifications (type, id_from, id_to) VALUES (?, ?, ?)`
			await pool.query(sql, ['unlike', ...data])
			res.json({ ok: true })
		} else {
			sql = `SELECT * FROM matches where matcher = ? AND matched = ?`
			result = await pool.query(sql, data)
			if (!result.length) {
				sql = `INSERT INTO matches (matcher, matched) VALUES (?, ?)`
				await pool.query(sql, data)
				sql = `SELECT * FROM matches WHERE matcher = ? AND matched = ?`
				result = await pool.query(sql, [...data].reverse())
				if (result.length) {
					sql = `SELECT * FROM conversations
							WHERE id_user1 = ? AND id_user2 = ?
							OR id_user2 = ? AND id_user1 = ?`
					result = await pool.query(sql, [...data, ...data])
					if (!result.length) {
						sql = `INSERT INTO conversations (id_user1, id_user2) VALUES (?, ?)`
						await pool.query(sql, data)
					} else if (result[0].allowed == 0) {
						sql = `UPDATE conversations SET allowed = 1 WHERE id_conversation = ?`
						await pool.query(sql, [result[0].id_conversation])
					}
					sql = `INSERT INTO notifications (type, id_from, id_to) VALUES (?, ?, ?)`
					await pool.query(sql, ['like_back', ...data])
				} else {
					sql = `INSERT INTO notifications (type, id_from, id_to) VALUES (?, ?, ?)`
					await pool.query(sql, ['like', ...data])
				}
				res.json({ ok: true })
			} else {
				res.json({ msg: 'User already Matched' })
			}
		}
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
})

module.exports = router
