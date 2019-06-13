const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const sign = promisify(jwt.sign)
const router = require('express').Router()
const pool = require('../../utility/database')
const auth = require('../../middleware/auth')
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy

passport.serializeUser((user, done) => {
	done(null, user.id);
})

passport.deserializeUser(async (id, done) => {
	const sql = `SELECT * FROM users WHERE id = ?`
	const result = await pool.query(sql, [id])
	done(null, result[0]);
})

passport.use(
	new GoogleStrategy({
		clientID: process.env.OAUTH_ID,
		clientSecret: process.env.OAUTH_PASS,
		callbackURL: 'http://useit015.me/auth/google/redirect'
	}, async (accessToken, refreshToken, profile, done) => {
		let user, sql, result
		try {
			sql = `SELECT * FROM users WHERE google_id = ?`
			result = await pool.query(sql, [profile.id])
			if (!result.length) {
				user = {
					first_name: profile.name.givenName,
					last_name: profile.name.familyName,
					username: profile.displayName,
					email: profile.id,
					password: await bcrypt.hash('123456abc', 10),
					google_id: profile.id,
				}
				sql = `INSERT INTO users (first_name, last_name, username,
						email, password, google_id, vkey, verified)
						VALUES (?, ?, ?, ?, ?, ?, 'aa', 1)`
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
				}
			} else {
				user = result[0]
			}
			const payload = { id: user.id }
			user.token = await sign(payload, process.env.SECRET, { expiresIn: 7200 })
		} catch (err) {
			throw new Error(err)
		}
		done(null, user)
	})
)

router.get('/google', passport.authenticate('google', {
	scope: ['profile', 'email']
}))

router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
	res.json(req.user);
})

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
