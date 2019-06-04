const router = require('express').Router()
const pool = require('../../utility/database')

router.post('/all', async (req, res) => {
	try {
		const sql = `SELECT
						id_conversation, last_update,
						users.username as username,
						users.first_name as first_name,
						users.last_name as last_name,
						users.status as status,
						images.name as profile_image
					FROM conversations
					INNER JOIN users ON conversations.id_user2 = users.id
					INNER JOIN images ON conversations.id_user2 = images.user_id
					WHERE conversations.id_user1 = ?
					UNION SELECT
						id_conversation, last_update,
						users.username as username,
						users.first_name as first_name,
						users.last_name as last_name,
						users.status as status,
						images.name as profile_image
					FROM conversations
					INNER JOIN users ON conversations.id_user1 = users.id
					INNER JOIN images ON conversations.id_user1 = images.user_id
					WHERE conversations.id_user2 = ?
					ORDER BY last_update DESC`
		const result = await pool.query(sql, [req.body.id, req.body.id])
		res.json(result)
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
		const sql = `INSERT INTO chat (id_conversation, id_from, message) VALUES (?, ?, ?)`
		await pool.query(sql, Object.values(msg))
		res.json('Message added')
	} catch (err) {
		throw new Error(err)
	}
})

module.exports = router
