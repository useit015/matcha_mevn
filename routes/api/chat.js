const router = require('express').Router()
const pool = require('../../utility/database')
const validateInput = require('../../utility/validate')
const auth = require('../../middleware/auth')

router.get('/all', auth, async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'Not logged in' })
	try {
		const sql = `SELECT
						users.id as user_id,
						conversations.id_conversation, last_update,
						users.username as username,
						users.first_name as first_name,
						users.last_name as last_name,
						users.status as status,
						images.name as profile_image,
						chat.message as message,
						chat.id_from as message_from,
						images.profile
					FROM conversations
					INNER JOIN users ON conversations.id_user2 = users.id
					LEFT JOIN images ON conversations.id_user2 = images.user_id
					LEFT JOIN chat ON conversations.last_msg = chat.id
					WHERE conversations.id_user1 = ?
					AND conversations.allowed = 1
					UNION SELECT
						users.id as user_id,
						conversations.id_conversation, last_update,
						users.username as username,
						users.first_name as first_name,
						users.last_name as last_name,
						users.status as status,
						images.name as profile_image,
						chat.message as message,
						chat.id_from as message_from,
						images.profile
					FROM conversations
					INNER JOIN users ON conversations.id_user1 = users.id
					LEFT JOIN images ON conversations.id_user1 = images.user_id
					LEFT JOIN chat ON conversations.last_msg = chat.id
					WHERE conversations.id_user2 = ?
					AND conversations.allowed = 1`
		let result = await pool.query(sql, [req.user.id, req.user.id])
		result = result.filter((cur, i) => {
			for (let j = 0; j < result.length; j++) {
				if (i != j && result[j].user_id == cur.user_id)
					return cur.profile
			}
			return true
		})
		res.json(result)
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
})

router.post('/single', auth, async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'Not logged in' })
	if (!req.body.id || isNaN(req.body.id)) return res.json({ msg: 'Invalid request' })
	if (typeof req.body.page === 'undefined') return res.json({ msg: 'Invalid request' })
	const page = req.body.page
	try {
		let sql = `SELECT * FROM chat WHERE id_conversation = ?
					ORDER BY created_at DESC LIMIT ?, 50`
		const result = await pool.query(sql, [req.body.id, page * 50])
		res.json(result.reverse())
		sql = `UPDATE chat SET is_read = 1 WHERE id_conversation = ? AND id_from != ?`
		await pool.query(sql, [req.body.id, req.user.id])
		sql = `UPDATE notifications SET is_read = 1 WHERE type = 'chat'
					AND id_conversation = ? AND id_from != ?`
		await pool.query(sql, [req.body.id, req.user.id])
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
})

router.post('/update', auth, async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'Not logged in' })
	if (!req.body.id || isNaN(req.body.id)) return res.json({ msg: 'Invalid request' })
	try {
		let sql = `UPDATE chat SET is_read = 1 WHERE id_conversation = ? AND id_from != ?`
		await pool.query(sql, [req.body.id, req.user.id])
		sql = `UPDATE notifications SET is_read = 1 WHERE type = 'chat' AND id_conversation = ? AND id_from != ?`
		await pool.query(sql, [req.body.id, req.user.id])
		res.json({ ok: true})
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
})

router.post('/send', auth, async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'Not logged in' })
	if (!req.body.id_conversation || isNaN(req.body.id_conversation)) return res.json({ msg: 'Invalid request' })
	if (!req.body.id_from || isNaN(req.body.id_from)) return res.json({ msg: 'Invalid request' })
	if (!validateInput(req.body.message, 'msg')) return res.json({ msg:'Invalid message' })
	// ! MUST VALIDATE USER INPUT
	try {
		const msg = {
			id_conversation: req.body.id_conversation,
			id_from: req.body.id_from,
			message: req.body.message.trim(),
			date: new Date().toISOString().substr(0, 19)
		}
		if (msg.message.length > 2048) return res.json({msg:'Message too long'})
		let sql = `SELECT * FROM conversations WHERE id_conversation = ? AND (id_user1 = ? OR id_user2 = ?)`
		let result = await pool.query(sql, [msg.id_conversation, msg.id_from, msg.id_from])
		if (!result.length) return res.json({msg:'Bad conversation'})
		sql = `INSERT INTO chat (id_conversation, id_from, message, created_at) VALUES (?, ?, ?, ?)`
		result = await pool.query(sql, Object.values(msg))
		sql = `UPDATE conversations SET last_update = ?, last_msg = ? WHERE id_conversation = ?`
		await pool.query(sql, [msg.date, result.insertId, msg.id_conversation])
		res.json({ ok:true })
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
})

module.exports = router
