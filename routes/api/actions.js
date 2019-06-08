const router = require('express').Router()
const pool = require('../../utility/database')
const auth = require('../../middleware/auth')

router.post('/block/:id', auth, async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'Not logged in' })
	try {
		let sql = `SELECT * FROM blocked where blocker = ? AND blocked = ?`
		const data = [req.user.id, req.body.id]
		const result = await pool.query(sql, data)
		if (!result.length) {
			try {
				sql = `INSERT INTO blocked (blocker, blocked) VALUES (?, ?)`
				await pool.query(sql, data)
				res.json({ ok: true })
			} catch (err) {
				throw new Error(err)
			}
		} else {
			res.json({ msg: 'User already Blocked' })
		}
	} catch (err) {
		throw new Error(err)
	}
})

router.post('/match', auth, async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'Not logged in' })
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
			res.json({ ok: true })
		} else {
			sql = `SELECT * FROM matches where matcher = ? AND matched = ?`
			result = await pool.query(sql, data)
			if (!result.length) {
				sql = `INSERT INTO matches (matcher, matched) VALUES (?, ?)`
				await pool.query(sql, data)
				sql = `SELECT * FROM matches WHERE matcher = ? AND matched = ?`
				result = await pool.query(sql, data.reverse())
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
				}
				res.json({ ok: true })
			} else {
				res.json({ msg: 'User already Matched' })
			}
		}
	} catch (err) {
		throw new Error(err)
	}
})


module.exports = router
