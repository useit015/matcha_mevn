const router = require('express').Router()
const pool = require('../../utility/database')
const auth = require('../../middleware/auth')

router.get('/all', auth, async (req, res) => {
	try {
		if (req.user.id) {
			const sql = `SELECT
							users.id as user_id,
							id_conversation, last_update,
							users.username as username,
							users.first_name as first_name,
							users.last_name as last_name,
							users.status as status,
							images.name as profile_image,
							images.profile
						FROM conversations
						INNER JOIN users ON conversations.id_user2 = users.id
						INNER JOIN images ON conversations.id_user2 = images.user_id
						WHERE conversations.id_user1 = ?
						AND images.profile = 1
						AND conversations.allowed = 1
						UNION SELECT
							users.id as user_id,
							id_conversation, last_update,
							users.username as username,
							users.first_name as first_name,
							users.last_name as last_name,
							users.status as status,
							images.name as profile_image,
							images.profile
						FROM conversations
						INNER JOIN users ON conversations.id_user1 = users.id
						INNER JOIN images ON conversations.id_user1 = images.user_id
						WHERE conversations.id_user2 = ?
						AND images.profile = 1
						AND conversations.allowed = 1`
			const result = await pool.query(sql, [req.user.id, req.user.id])
			res.json(result)
		}
	} catch (err) {
		throw new Error(err)
	}
})

router.get('/single/:id', async (req, res) => {
	try {
		const sql = `SELECT * FROM chat WHERE id_conversation = ?`
		const result = await pool.query(sql, [req.params.id])
		res.json(result)
	} catch (err) {
		throw new Error(err)
	}
})

router.post('/send', async (req, res) => {
	// ! MUST VALIDATE USER INPUT
	try {
		const msg = {
			id_conversation: req.body.id_conversation,
			id_from: req.body.id_from,
			message: req.body.message
		}
		let sql = `INSERT INTO chat (id_conversation, id_from, message) VALUES (?, ?, ?)`
		await pool.query(sql, Object.values(msg))
		sql = `UPDATE conversations SET last_update = NOW() WHERE id_conversation = ?`
		await pool.query(sql, [msg.id_conversation])
		res.json('Message added')
	} catch (err) {
		throw new Error(err)
	}
})

module.exports = router
