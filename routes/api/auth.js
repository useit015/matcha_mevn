const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const sign = promisify(jwt.sign)
const router = require('express').Router()
const pool = require('../../utility/database')
const auth = require('../../middleware/auth')
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy

const tokenExp = { expiresIn: 7200 }

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
		clientID: process.env.OAUTH_GOOGLE_ID,
		clientSecret: process.env.OAUTH_GOOGLE_PASS,
		callbackURL: 'http://useit015.me/auth/google/redirect'
	}, async (accessToken, refreshToken, profile, done) => {
		try {
			let user, sql, result
			sql = `SELECT * FROM users WHERE google_id = ?`
			result = await pool.query(sql, [profile.id])
			if (!result.length) {
				user = {
					google_id: profile.id,
					username: profile.displayName,
					first_name: profile.name.givenName,
					last_name: profile.name.familyName,
					email: profile.emails.find(cur => cur.verified).value
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
	// ! MUST VALIDATE INPUT !!!!
	if (!req.user.id) res.json({ msg: 'not logged in' })
	try {
		let sql = `SELECT * FROM users WHERE id = ?`
		const result = await pool.query(sql, [req.user.id])
		if (result.length) {
			const user = result[0]
			delete user.password
			delete user.verified
			delete user.tokenExpiration
			sql = `SELECT * FROM images WHERE user_id = ?`
			user.images = await pool.query(sql, [user.id])
			const payload = { id: user.id }
			user.token = await sign(payload, process.env.SECRET, tokenExp)
			res.json(user)
		} else {
			res.json({ msg: 'Not logged in' })
		}
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
						user.token = await sign(payload, process.env.SECRET, tokenExp)
						res.json(user)
					} catch (err) {
						throw new Error(err)
					}
				} else {
					res.json({ msg: 'wrong pass' })
				}
			} catch (err) {
				throw new Error(err)
			}
		} else {
			res.json({ msg: 'wrong username' })
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
		let sql = `SELECT verified, id FROM users WHERE vkey = ?`
		const result = await pool.query(sql, [req.params.key])
		if (result.length) {
			const user = result[0]
			if (user.verified) return res.json({ msg: 'User already verified' })
			sql = `UPDATE users SET verified = 1 WHERE vkey = ? AND verified = 0`
			await pool.query(sql, [req.params.key])
			const payload = { id: user.id }
			const token = await sign(payload, process.env.SECRET, tokenExp)
			res.render('verify', { token })
		} else {
			res.json({ msg: 'invalid key' })
		}
	} catch (err) {
		throw new Error(err)
	}
})

module.exports = router
