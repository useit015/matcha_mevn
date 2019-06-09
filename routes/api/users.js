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
// const sign = promisify(jwt.sign)
const upload = multer({ limits: { fileSize: 4 * 1024 * 1024 } })
const auth = require('../../middleware/auth')

const randomHex = () => randomBytes(10).toString('hex')

router.get('/getmatches', auth, async (req, res) => {
	if (!req.user.id) res.json({ msg: 'not logged in' })
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
	if (!req.user.id) res.json({ msg: 'not logged in' })
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
	if (!req.user.id) res.json({ msg: 'not logged in' })
	try {
		const sql = `SELECT * FROM blocked where blocker = ? OR blocked = ?`
		const blacklist = await pool.query(sql, [req.user.id, req.user.id])
		res.json(blacklist)
	} catch (err) {
		throw new Error(err)
	}
})

// router.post('/position', auth, async (req, res) => {
// 	if (!req.user.id) res.json({ msg: 'not logged in' })
// 	try {
// 		const sql = `UPDATE users SET lat = ?, lng = ? WHERE id = ?`
// 		await pool.query(sql, [req.body.lat, req.body.lng, req.user.id])
// 		res.json('synced position')
// 	} catch (err) {
// 		throw new Error(err)
// 	}
// })

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

router.post('/update', auth, async (req, res) => {
	if (!req.user.id) res.json({ msg: 'Not logged in' })
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

router.post('/image', [auth, upload.single('image')], async (req, res) => {
	if (!req.user.id) res.json({ msg: 'Not logged in' })
	try {
		const base64Data = req.body.image.replace(/^data:image\/png;base64,/, '')
		const uploadDir = `${dirname(dirname(__dirname))}/public/uploads/`
		const imgName = `${req.user.id}-${randomHex()}.png`
		await writeFileAsync(uploadDir + imgName, base64Data, 'base64')
		let sql = `UPDATE images SET profile = 0 WHERE user_id = ?`
		await pool.query(sql, [req.user.id])
		sql = `INSERT INTO images (user_id, name, profile) VALUES (?, ?, 1)`
		await pool.query(sql, [req.user.id, imgName])
		res.json({ ok: true, status: 'Image Updated', name: imgName })
	} catch (err) {
		throw new Error(err)
	}
})

router.get('/show', auth, async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'not logged in' })
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

router.get('/show/:id', auth, async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'not logged in' })
	try {
		let sql = `SELECT * FROM users WHERE id = ?`
		const result = await pool.query(sql, [req.params.id])
		if (result.length) {
			const user = result[0]
			sql = `SELECT * FROM images WHERE user_id = ?`
			user.images = await pool.query(sql, [user.id])
			sql = `INSERT INTO history (visitor, visited) VALUES (?, ?)`
			await pool.query(sql, [req.user.id, req.params.id])
			res.json(user)
		} else {
			res.json('User doesnt exist')
		}
	} catch (err) {
		throw new Error(err)
	}
})

module.exports = router
