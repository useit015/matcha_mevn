const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const sign = promisify(jwt.sign)
const router = require('express').Router()
const pool = require('../../utility/database')
const auth = require('../../middleware/auth')

router.get('/isloggedin', auth, async (req, res) => {
	// ! MUST VALIDATE INPUT !!!!
	if (!req.user.id) res.json({ msg: 'not logged in' })
	try {
		let sql = `SELECT * FROM users WHERE id = ?`
		const result = await pool.query(sql, [req.user.id])
		const user = result[0]
		delete user.password
		delete user.verified
		delete user.tokenExpiration
		sql = `SELECT * FROM images WHERE user_id = ?`
		user.images = await pool.query(sql, [user.id])
		const payload = { id: user.id }
		user.token = await sign(payload, process.env.SECRET, { expiresIn: 7200 })
		res.json(user)
	} catch (err) {
		throw new Error(err)
	}
})

router.post('/login', async (req, res) => {
	// ! MUST VALIDATE INPUT !!!!
	try {
		let sql = `SELECT * FROM users WHERE username = ?`
		let result = await pool.query(sql, [req.body.username])
		if (result.length && result[0].verified) {
			const user = result[0]
			try {
				result = await bcrypt.compare(req.body.password, user.password)
				if (result) {
					try {
						delete user.password
						delete user.verified
						delete user.tokenExpiration
						sql = `SELECT * FROM images WHERE user_id = ?`
						user.images = await pool.query(sql, [user.id])
						const payload = { id: user.id }
						user.token = await sign(payload, process.env.SECRET, { expiresIn: 7200 })
						res.json(user)
					} catch (err) {
						throw new Error(err)
					}
				} else {
					res.json({ ok: false, status: 'wrong pass' })
				}
			} catch (err) {
				throw new Error(err)
			}
		} else {
			res.json({ ok: false, status: 'wrong username' })
		}
	} catch (err) {
		throw new Error(err)
	}
})


router.get('/logout', auth, (req, res) => {
	if (!req.user.id) return res.json({ msg: 'Not logged in' })
	res.json({ ok: true })
})

router.get('/verify/:key', async (req, res) => {
	if (!req.params.key) return res.json({ msg: 'Cant validate' })
	try {
		let sql = `SELECT verified FROM users WHERE vkey = ?`
		const result = await pool.query(sql, [req.params.key])
		if (result.length) {
			if (result[0].verified) return res.json('User already verified')
			sql = `UPDATE users SET verified = 1 WHERE vkey = ? AND verified = 0`
			await pool.query(sql, [req.params.key])
			res.json({ ok: true, status: 'User Verified' })
		} else {
			res.json({ ok: false, status: 'invalid key' })
		}
	} catch (err) {
		throw new Error(err)
	}
})

module.exports = router
