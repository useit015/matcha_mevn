const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const sign = promisify(jwt.sign)
const router = require('express').Router()
const pool = require('../../utility/database')
const auth = require('../../middleware/auth')
const sendMail = require('../../utility/mail')
const validateInput = require('../../utility/validate')
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy

const { randomBytes } = require('crypto')
const randomHex = () => randomBytes(10).toString('hex')

const tokenExp = { expiresIn: 7200 }

passport.serializeUser((user, done) => {
	done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
	try {
		const sql = `SELECT * FROM users WHERE id = ?`
		const result = await pool.query(sql, [id])
		done(null, result[0])
	} catch (err) {
		done(err, false)
	}
})

passport.use(
	new GoogleStrategy({
		clientID: process.env.OAUTH_ID,
		clientSecret: process.env.OAUTH_PASS,
		callbackURL: 'https://matcha1337.herokuapp.com/auth/google/redirect'
	}, async (accessToken, refreshToken, profile, done) => {
		try {
			let user, sql, result
			sql = `SELECT * FROM users WHERE google_id = ? OR email = ?`
			result = await pool.query(sql, [profile.id, profile.emails[0].value])
			if (!result.length) {
				user = {
					google_id: profile.id,
					username: profile.displayName.replace(/ /g, ''),
					first_name: profile.name.givenName,
					last_name: profile.name.familyName,
					email: profile.emails[0].value
				}
				sql = `INSERT INTO users (google_id, username, first_name,
						last_name, email, verified) VALUES (?, ?, ?, ?, ?, 1)`
				await pool.query(sql, Object.values(user))
				sql = `SELECT * From users WHERE google_id = ?`
				result = await pool.query(sql, [profile.id])
				if (result.length) {
					sql = `INSERT INTO images (user_id, name, profile) VALUES (?, ?, ?)`
					const data = {
						id: result[0].id,
						name: profile.photos[0].value,
						profile: 1
					}
					await pool.query(sql, Object.values(data))
					user = result[0]
				}
			} else {
				user = result[0]
			}
			const payload = { id: user.id }
			user.token = await sign(payload, process.env.SECRET, tokenExp)
			done(null, user)
		} catch (err) {
			done(err, false)
		}
	})
)

router.get('/google', passport.authenticate('google', {
	scope: [
		'https://www.googleapis.com/auth/userinfo.profile',
		'https://www.googleapis.com/auth/userinfo.email'
	]
}))

router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
	res.render('verify', { token: req.user.token })
})

router.get('/isloggedin', auth, async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'Not logged in' })
	try {
		let sql = `SELECT * FROM users WHERE id = ?`
		const result = await pool.query(sql, [req.user.id])
		if (!result.length) return res.json({ msg: 'User not found' })
		const user = result[0]
		delete user.password
		delete user.verified
		delete user.tokenExpiration
		sql = `SELECT * FROM images WHERE user_id = ?`
		user.images = await pool.query(sql, [user.id])
		const payload = { id: user.id }
		user.token = await sign(payload, process.env.SECRET, tokenExp)
		res.json(user)
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
})

router.post('/login', async (req, res) => {
	if (!validateInput(req.body.username, 'username')) return res.json({ msg:'Username is invalid' })
	if (!validateInput(req.body.password, 'password')) return res.json({ msg:'Password is invalid' })
	try {
		let sql = `SELECT * FROM users WHERE username = ?`
		let result = await pool.query(sql, [req.body.username])
		if (!result.length) return res.json({ msg: 'Wrong username' })
		if (!result[0].verified) return res.json({ msg: 'Unverified user. Please verify your account' })
		const user = result[0]
		try {
			result = await bcrypt.compare(req.body.password, user.password)
			if (!result) return res.json({ msg: 'Wrong password' })
			delete user.password
			delete user.verified
			delete user.tokenExpiration
			sql = `SELECT * FROM images WHERE user_id = ?`
			user.images = await pool.query(sql, [user.id])
			const payload = { id: user.id }
			user.token = await sign(payload, process.env.SECRET, tokenExp)
			res.json(user)
		} catch (err) {
			return res.json({ msg: 'Fatal error', err })
		}
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
})

router.get('/logout', auth, (req, res) => {
	if (!req.user.id) return res.json({ msg: 'Not logged in' })
	res.json({ ok: true })
})

router.get('/verify/:key', async (req, res) => {
	if (!req.params.key) return res.json({ msg: 'Cant validate' })
	try {
		let sql = `SELECT verified, id FROM users WHERE vkey = ?`
		const result = await pool.query(sql, [req.params.key])
		if (!result.length) return res.json({ msg: 'Invalid key' })
		const user = result[0]
		if (user.verified) return res.json({ msg: 'User already verified' })
		sql = `UPDATE users SET verified = 1 WHERE vkey = ? AND verified = 0`
		await pool.query(sql, [req.params.key])
		const payload = { id: user.id }
		const token = await sign(payload, process.env.SECRET, tokenExp)
		res.render('verify', { token })
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
})

router.post('/rcheck', auth, async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'Not logged in' })
	if (!req.body.key) return res.json({ msg: 'Invalid key' })
	if (!validateInput(req.body.password, 'password'))
		return res.json({ msg:'Password is invalid' })
	try {
		const hash = await bcrypt.hash(req.body.password, 10)
		const sql = `UPDATE users set password = ?, rkey = '' WHERE id = ? AND rkey = ?`
		const result = await pool.query(sql, [hash, req.user.id, req.body.key])
		if (!result.affectedRows) return res.json({ msg: 'Oups something went wrong' })
		res.json({ ok: true })
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
})

router.post('/forgot', async (req, res) => {
	if (!validateInput(req.body.email, 'email'))
		return res.json({ msg:'Email is invalid' })
	try {
		const key = randomHex()
		const sql = `UPDATE users SET rkey = ? WHERE email = ?`
		const result = await pool.query(sql, [key, req.body.email])
		if (!result.affectedRows) return res.json({ msg: 'Email not found' })
		sendMail(req.body.email, key, 'recover')
		res.json({ ok: true })
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
})

router.get('/recover/:key', async (req, res) => {
	if (!req.params.key) return res.json({ msg: 'Invalid request' })
	try {
		const key = req.params.key
		const sql = `SELECT id FROM users WHERE rkey = ?`
		const result = await pool.query(sql, [key])
		if (!result.length) return res.redirect('/404')
		const payload = { id: result[0].id }
		const token = await sign(payload, process.env.SECRET, tokenExp)
		res.render('recover', { token, key })
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
})

router.post('/kcheck', auth, async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'Not logged in' })
	if (!req.body.key) return res.json({ msg: 'Invalid request' })
	try {
		const key = req.body.key
		const sql = `SELECT id FROM users WHERE rkey = ?`
		const result = await pool.query(sql, [key])
		if (!result.length) return res.json({ msg: 'Invalid key' })
		res.json({ ok: true })
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
})

router.get('/kdestroy', auth, async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'Not logged in' })
	try {
		const sql = `UPDATE users SET rkey = '' WHERE id = ?`
		const result = await pool.query(sql, [req.user.id])
		res.json({ ok: true })
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
})

module.exports = router
