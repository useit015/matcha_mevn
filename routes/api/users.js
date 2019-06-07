const moment = require('moment')
const multer = require('multer')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { writeFile } = require('fs')
const { dirname } = require('path')
const { promisify } = require('util')
const { randomBytes } = require('crypto')
const router = require('express').Router()
const pool = require('../../utility/database')
const sendMail = require('../../utility/mail')
const writeFileAsync = promisify(writeFile)
const sign = promisify(jwt.sign)
const upload = multer({ limits: { fileSize: 4 * 1024 * 1024 } })
const auth = require('../../middleware/auth')

const randomHex = () => randomBytes(10).toString('hex')

router.get('/getmatches', auth, async (req, res) => {
	if (!req.user.id) res.json({ ok: false, status: 'not logged in' })
	try {
		let sql
		sql = `SELECT
					matches.matched as matched_id,
					matches.created_at as match_date,
					users.username as username,
					images.name as profile_image
				FROM matches
				INNER JOIN users
				ON matches.matched = users.id
				INNER JOIN images
				ON matches.matched = images.user_id
				where matches.matcher = ?
				AND images.profile = 1`
		const following = await pool.query(sql, [req.user.id])
		sql = `SELECT
					matches.matcher as matcher_id,
					matches.created_at as match_date,
					users.username as username,
					images.name as profile_image
				FROM matches
				INNER JOIN users
				ON matches.matcher = users.id
				INNER JOIN images
				ON matches.matcher = images.user_id
				where matches.matched = ?
				AND images.profile = 1`
		const followers = await pool.query(sql, [req.user.id])		
		res.json([...following, ...followers])
	} catch (err) {
		throw new Error(err)
	}
})

router.get('/gethistory', auth, async (req, res) => {
	if (!req.user.id) res.json({ ok: false, status: 'not logged in' })
	try {
		let sql
		sql = `SELECT
					history.visitor as visitor_id,
					history.created_at as visit_date,
					users.username as username,
					images.name as profile_image
				FROM history
				INNER JOIN users 
				ON history.visitor = users.id
				INNER JOIN images
				ON history.visitor = images.user_id
				WHERE history.visited = ?
				AND images.profile = 1`
		const visitors = await pool.query(sql, [req.user.id])
		sql = `SELECT
					history.visited as visited_id,
					history.created_at as visit_date,
					users.username as username,
					images.name as profile_image
				FROM history
				INNER JOIN users 
				ON history.visited = users.id
				INNER JOIN images
				ON history.visited = images.user_id
				WHERE history.visitor = ?
				AND images.profile = 1`
		const visited = await pool.query(sql, [req.user.id])		
		res.json([...visitors, ...visited])
	} catch (err) {
		throw new Error(err)
	}
})

router.get('/getblocked', auth, async (req, res) => {
	if (!req.user.id) res.json({ ok: false, status: 'not logged in' })
	try {
		const sql = `SELECT * FROM blocked where blocker = ? OR blocked = ?`
		const blacklist = await pool.query(sql, [req.user.id, req.user.id])
		res.json(blacklist)
	} catch (err) {
		throw new Error(err)
	}
})

router.post('/position', auth, async (req, res) => {
	if (!req.user.id) res.json({ ok: false, status: 'not logged in' })
	try {
		const sql = `UPDATE users SET lat = ?, lng = ? WHERE id = ?`
		await pool.query(sql, [req.body.lat, req.body.lng, req.user.id])
		res.json('synced position')
	} catch (err) {
		throw new Error(err)
	}
})

router.get('/isloggedin', auth, async (req, res) => {
	// ! MUST VALIDATE INPUT !!!!
	if (!req.user.id) res.json({ ok: false, status: 'not logged in' })
	try {
		let sql = `SELECT * FROM users WHERE id = ?`
		const result = await pool.query(sql, [req.user.id])
		const user = result[0]
		delete user.password
		delete user.verified
		delete user.tokenExpiration
		sql = `SELECT * FROM images WHERE user_id = ?`
		user.images = await pool.query(sql, [user.id])
		const { id, username, first_name, last_name, email } = user
		const payload = { id, username, first_name, last_name, email }
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
						const { id, username, first_name, last_name, email } = user
						const payload = { id, username, first_name, last_name, email }
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

router.post('/add', async (req, res) => {
	// ! MUST VALIDATE INPUT !!!!
	try {
		const user = {
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			username: req.body.username,
			email: req.body.email,
			password: await bcrypt.hash(req.body.password, 10),
			vkey: randomHex()
		}
		const sql = `INSERT INTO users (first_name, last_name,
						username, email, password, vkey)
						VALUES (?, ?, ?, ?, ?, ?)`
		await pool.query(sql, Object.values(user))
		sendMail(user.email, user.vkey)
		res.json({ ok: true, status: 'User Added' })
	} catch (err) {
		throw new Error(err)
	}
})

router.post('/install', async (req, res) => {
	try {
		const user = {
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			username: req.body.username,
			email: req.body.email,
			password: bcrypt.hashSync(req.body.password, 10),
			vkey: randomHex(),
			gender: req.body.gender,
			looking: req.body.looking,
			birthdate: req.body.birthdate,
			biography: req.body.biography,
			tags: req.body.tags,
			address: req.body.address,
			city: req.body.city,
			country: req.body.country,
			rating: req.body.rating,
			postal_code: req.body.postal_code,
			phone: req.body.phone,
			lat: req.body.lat,
			lng: req.body.lng
		}
		let sql = `INSERT INTO users (first_name, last_name, username, email,
						password, vkey, verified, gender, looking, birthdate, biography,
						tags, address, city, country, rating, postal_code, phone, lat, lng)
						VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
		await pool.query(sql, Object.values(user))
		sql = `SELECT id FROM users WHERE username = ?`
		const result = await pool.query(sql, [user.username])
		if (result.length) {
			sql = `INSERT INTO images (user_id, name, profile) VALUES (?, ?, ?)`
			const data = {
				id: result[0].id,
				name: req.body.image,
				profile: 1
			}
			await pool.query(sql, Object.values(data))
			res.json({ ok: true, status: 'User Added' })
		}
	} catch (err) {
		throw new Error(err)
	}
})

router.post('/logout', (req, res) => {
	res.json({ ok: true })
})

router.get('/verify/:key', async (req, res) => {
	if (!req.params.key) return res.json('Cant validate')
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

router.post('/update', auth, async (req, res) => {
	if (!req.user.id) res.json({ ok: false, status: 'not logged in' })
	try {
		let sql, result
		sql = `SELECT * FROM users WHERE id = ?`
		result = await pool.query(sql, [req.user.id])
		if (result.length) {
			// ! MUST VALIDATE INPUT !!!!
			const user = {
				first_name: req.body.first_name,
				last_name: req.body.last_name,
				username: req.body.username,
				email: req.body.email,
				gender: req.body.gender,
				looking: req.body.looking,
				birthdate: req.body.birthdate,
				biography: req.body.biography,
				tags: req.body.tags,
				address: req.body.address,
				city: req.body.city,
				country: req.body.country,
				rating: req.body.rating,
				postal_code: req.body.postal_code,
				phone: req.body.phone,
				id: req.user.id
			}
			sql = `UPDATE users SET
						first_name = ?, last_name = ?, username = ?,
						email = ?, gender = ?, looking = ?, birthdate = ?,
						biography = ?, tags = ?, \`address\` = ?, city = ?,
						country = ?, rating = ?, postal_code = ?, phone = ?
					WHERE id = ?`
			await pool.query(sql, Object.values(user))
			res.json({ ok: true, status: 'User Updated' }) 
		} else {
			res.json({ ok: false, status: 'User not found' })
		}
	} catch (err) {
		throw new Error(err)
	}
})

router.post('/image/:id', upload.single('image'), async (req, res) => {
	try {
		const base64Data = req.body.image.replace(/^data:image\/png;base64,/, '')
		const uploadDir = `${dirname(dirname(__dirname))}/public/uploads/`
		const imgName = `${req.params.id}-${randomHex()}.png`
		await writeFileAsync(uploadDir + imgName, base64Data, 'base64')
		let sql = `UPDATE images SET profile = 0 WHERE user_id = ?`
		await pool.query(sql, [req.params.id])
		sql = `INSERT INTO images (user_id, name, profile) VALUES (?, ?, 1)`
		await pool.query(sql, [req.params.id, imgName])
		res.json({ ok: true, status: 'Image Updated', name: imgName })
	} catch (err) {
		throw new Error(err)
	}
})

router.get('/show', async (req, res) => {
	try {
		const sql = `SELECT * FROM users, images
						WHERE users.id = images.user_id
						AND images.profile = 1`
		const result = await pool.query(sql)
		res.json(result)
	} catch (err) {
		throw new Error(err)
	}
})

router.post('/show/:id', async (req, res) => {
	try {
		let sql = `SELECT * FROM users WHERE id = ?`
		const result = await pool.query(sql, [req.params.id])
		if (result.length) {
			const user = result[0]
			sql = `SELECT * FROM images WHERE user_id = ?`
			user.images = await pool.query(sql, [user.id])
			sql = `INSERT INTO history (visitor, visited) VALUES (?, ?)`
			await pool.query(sql, [req.body.visitor, req.params.id])
			res.json(user)
		} else {
			res.json('User doesnt exist')
		}
	} catch (err) {
		throw new Error(err)
	}
})

router.post('/block/:id', async (req, res) => {
	try {
		let sql = `SELECT * FROM blocked where blocker = ? AND blocked = ?`
		const data = [req.body.blocker, req.params.id]
		const result = await pool.query(sql, data)
		if (!result.length) {
			try {
				sql = `INSERT INTO blocked (blocker, blocked) VALUES (?, ?)`
				await pool.query(sql, data)
				res.json('User Blocked')
			} catch (err) {
				throw new Error(err)
			}
		} else {
			res.json('User already Blocked')
		}
	} catch (err) {
		throw new Error(err)
	}
})

router.post('/match/:id', async (req, res) => {
	try {
		let sql, result
		const data = [req.body.matcher, req.params.id]
		if (req.body.liked) {
			sql = `DELETE FROM matches where matcher = ? AND matched = ?`
			await pool.query(sql, data)
			sql = `UPDATE conversations SET allowed = 0
					WHERE id_user1 = ? AND id_user2 = ?
					OR id_user2 = ? AND id_user1 = ?`
			await pool.query(sql, [...data, ...data])
			res.json('User unMatched')
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
						console.log('i am the convo --> ', result[0].allowed)
					}
				}
				res.json('User Matched')
			} else {
				res.json('User already Matched')
			}
		}
	} catch (err) {
		throw new Error(err)
	}
})

module.exports = router
