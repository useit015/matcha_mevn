const moment = require('moment')
const multer = require('multer')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { writeFile, unlink } = require('fs')
const { dirname, resolve } = require('path')
const { promisify } = require('util')
const { randomBytes } = require('crypto')
const router = require('express').Router()
const pool = require('../../utility/database')
const distance = require('../../utility/distance')
const sendMail = require('../../utility/mail')
const writeFileAsync = promisify(writeFile)
const unlinkAsync = promisify(unlink)
const upload = multer({ limits: { fileSize: 4 * 1024 * 1024 } })
const auth = require('../../middleware/auth')

const randomHex = () => randomBytes(10).toString('hex')

router.get('/getmatches', auth, async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'not logged in' })
	try {
		let sql
		sql = `SELECT
					matches.matched as matched_id,
					matches.created_at as match_date,
					users.username as username,
					images.name as profile_image,
					images.profile as profile
				FROM matches
				INNER JOIN users
				ON matches.matched = users.id
				LEFT JOIN images
				ON matches.matched = images.user_id
				WHERE matches.matcher = ?`
		let following = await pool.query(sql, [req.user.id])
		following = following.filter((cur, i) => {
			for (let index = 0; index < following.length; index++) {
				if (i != index && following[index].username == cur.username)
					return cur.profile
			}
			return true
		})
		sql = `SELECT
					matches.matcher as matcher_id,
					matches.created_at as match_date,
					users.username as username,
					images.name as profile_image,
					images.profile as profile
				FROM matches
				INNER JOIN users
				ON matches.matcher = users.id
				LEFT JOIN images
				ON matches.matcher = images.user_id
				WHERE matches.matched = ?`
		let followers = await pool.query(sql, [req.user.id])
		followers = followers.filter((cur, i) => {
			for (let index = 0; index < followers.length; index++) {
				if (i != index && followers[index].username == cur.username)
					return cur.profile
			}
			return true
		})
		res.json([...following, ...followers])
	} catch (err) {
		throw new Error(err)
	}
})

router.get('/gethistory', auth, async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'not logged in' })
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
		let visitors = await pool.query(sql, [req.user.id])
		visitors = visitors.filter((cur, i) => {
			for (let index = 0; index < visitors.length; index++) {
				if (i != index && visitors[index].username == cur.username)
					return cur.profile
			}
			return true
		})
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
		let visited = await pool.query(sql, [req.user.id])
		visited = visited.filter((cur, i) => {
			for (let index = 0; index < visited.length; index++) {
				if (i != index && visited[index].username == cur.username)
					return cur.profile
			}
			return true
		})
		res.json([...visitors, ...visited])
	} catch (err) {
		throw new Error(err)
	}
})

router.get('/getblocked', auth, async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'not logged in' })
	try {
		const sql = `SELECT * FROM blocked where blocker = ? OR blocked = ?`
		const blacklist = await pool.query(sql, [req.user.id, req.user.id])
		res.json(blacklist)
	} catch (err) {
		throw new Error(err)
	}
})

router.get('/gettags', auth, async (req, res) => {
	if (!req.user.id) res.json({ msg: 'not logged in' })
	try {
		const sql = `SELECT value FROM tags`
		const result = await pool.query(sql)
		res.json(result.map(cur => cur.value))
	} catch (err) {
		throw new Error(err)
	}
})

router.post('/add', async (req, res) => {
	if (!req.body.first_name || req.body.first_name.length < 3)
		return res.json({msg:'First name is invalid'})
	if (!req.body.last_name || req.body.last_name.length < 3)
		return res.json({msg:'Last name is invalid'})
	if (!req.body.email || !(/.+@.+/.test(req.body.email)))
		return res.json({msg:'Email is invalid'})
	if (!req.body.username || req.body.username.length < 8)
		return res.json({msg:'Username is invalid'})
	if (!req.body.password || !(/^(?=.*\d)(?=.*[A-Za-z])[0-9A-Za-z!@#$%]+$/.test(req.body.password)))
		return res.json({msg:'Password is invalid'})
	try {
		const user = {
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			username: req.body.username,
			email: req.body.email,
			password: await bcrypt.hash(req.body.password, 10),
			vkey: randomHex()
		}
		let sql = `SELECT email, username FROM users WHERE username = ? OR email = ?`
		let result = await pool.query(sql, [user.username, user.email])
		if (!result.length) {
			sql = `INSERT INTO users (first_name, last_name,
							username, email, password, vkey)
							VALUES (?, ?, ?, ?, ?, ?)`
			result = await pool.query(sql, Object.values(user))
			sendMail(user.email, user.vkey)
			if (result.affectedRows) {
				return res.json({ ok: true, status: 'User Added' })
			}
		}
		res.json({ msg: 'Something went wrong'})
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
			postal_code: req.body.postal_code,
			phone: req.body.phone,
			lat: req.body.lat,
			lng: req.body.lng
		}
		let sql = `INSERT INTO users (first_name, last_name, username, email,
						password, vkey, verified, gender, looking, birthdate, biography,
						tags, address, city, country, postal_code, phone, lat, lng)
						VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
		const result = await pool.query(sql, Object.values(user))
		sql = `INSERT INTO images (user_id, name, profile) VALUES (?, ?, ?)`
		const data = {
			id: result.insertId,
			name: req.body.image,
			profile: 1
		}
		await pool.query(sql, Object.values(data))
		res.json({ ok: true, status: 'User Added' })
	} catch (err) {
		console.log('Got error here --> ', err)
	}
})

router.post('/update', auth, async (req, res) => {
	if (!req.user.id)
		return res.json({ msg: 'Not logged in' })
	if (!req.body.first_name || req.body.first_name.length < 3)
		return res.json({msg:'First name is invalid'})
	if (!req.body.last_name || req.body.last_name.length < 3)
		return res.json({msg:'Last name is invalid'})
	if (!req.body.email || !(/.+@.+/.test(req.body.email)))
		return res.json({msg:'Email is invalid'})
	if (!req.body.username || req.body.username.length < 8)
		return res.json({msg:'Username is invalid'})
	if (!req.body.password || !(/^(?=.*\d)(?=.*[A-Za-z])[0-9A-Za-z!@#$%]+$/.test(req.body.password)))
		return res.json({msg:'Password is invalid'})
	if (!req.body.gender && req.body.gender != 'male' && req.body.gender != 'female')
		return res.json({msg:'Gender is invalid'})
	if (!req.body.looking && req.body.looking != 'male' && req.body.looking != 'female' && req.body.looking != 'both')
		return res.json({msg:'Looking is invalid'})
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
				postal_code: req.body.postal_code,
				phone: req.body.phone,
				id: req.user.id
			}
			sql = `UPDATE users SET
						first_name = ?, last_name = ?, username = ?,
						email = ?, gender = ?, looking = ?, birthdate = ?,
						biography = ?, tags = ?, \`address\` = ?, city = ?,
						country = ?, postal_code = ?, phone = ?
					WHERE id = ?`
			await pool.query(sql, Object.values(user))
			res.json({ ok: true, status: 'User Updated' })
			sql = `SELECT value FROM tags`
			result = await pool.query(sql)
			const tags = result.map(cur => cur.value)
			user.tags.split(',').forEach(async cur => {
				if (!tags.includes(cur)) {
					try {
						const sql = `INSERT INTO tags (value) VALUES (?)`
						await pool.query(sql, [cur])
					} catch (err) {
						throw new Error(err)
					}
				}
			})
		} else {
			res.json({ ok: false, status: 'User not found' })
		}
	} catch (err) {
		throw new Error(err)
	}
})

router.post('/image', [auth, upload.single('image')], async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'Not logged in' })
	try {
		const base64Data = req.body.image.replace(/^data:image\/png;base64,/, '')
		const uploadDir = `${dirname(dirname(__dirname))}/public/uploads/`
		const imgName = `${req.user.id}-${randomHex()}.png`
		let sql = `SELECT * FROM images WHERE user_id = ?`
		let result = await pool.query(sql, [req.user.id])
		if (result.length < 5) {
			await writeFileAsync(uploadDir + imgName, base64Data, 'base64')
			sql = `UPDATE images SET profile = 0 WHERE user_id = ?`
			await pool.query(sql, [req.user.id])
			sql = `INSERT INTO images (user_id, name, profile) VALUES (?, ?, 1)`
			result = await pool.query(sql, [req.user.id, imgName])
			res.json({ ok: true, status: 'Image Updated', name: imgName, id:result.insertId })
		} else {
			res.json({ msg: 'user has 5 photos' })
		}
	} catch (err) {
		throw new Error(err)
	}
})

router.post('/image/del', auth, async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'Not logged in' })
	const isExternal = url => url && (url.indexOf(':') > -1 || url.indexOf('//') > -1 || url.indexOf('www.') > -1)
	try {
		let sql = `SELECT * FROM images WHERE id = ? AND user_id = ?`
		let result = await pool.query(sql, [req.body.id, req.user.id])
		if (result.length) {
			if (!isExternal(result[0].name)) {
				try {
					unlinkAsync(resolve(dirname(dirname(__dirname)), 'public/uploads', result[0].name))
				} catch (err) {
					throw new Error(err)
				}
			}
			sql = `DELETE FROM images WHERE id = ? AND user_id = ?`
			result = await pool.query(sql, [req.body.id, req.user.id])
			if (req.body.profile) {
				sql = `UPDATE images SET profile = 1 WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`
				const result = await pool.query(sql, [req.user.id])
			}
			if (result.affectedRows) return res.json({ ok: true})
		}
		res.json({ msg: 'Something went wrong'})
	} catch (err) {
		throw new Error(err)
	}
})

router.post('/show', auth, async (req, res) => {
	const user = req.user
	if (!user.id) return res.json({ msg: 'not logged in' })
	try {
		const sql = `SELECT *, GET_RATING(users.id) AS rating FROM users, images
						WHERE users.id = images.user_id
						AND images.profile = 1 ORDER BY rating DESC`
		let result = await pool.query(sql)
		let userTags = user.tags
		const userLoc = {
			lat: user.lat,
			lng: user.lng
		}
		const commonTags = a => {
			if (!a || !a.length) return 0
			const tags = a.split(',')
			return userTags.split(',').filter(val => -1 !== tags.indexOf(val)).length
		}
		result = result
			.filter(cur => {
				if (!req.body.filter) return true
				if (user.looking == 'both') return cur.looking == 'both'
				if (user.looking != user.gender) return cur.looking != 'both' && cur.gender != user.gender && cur.gender != cur.looking
				if (user.looking == user.gender) return cur.looking != 'both' && cur.gender == user.gender && cur.gender == cur.looking
				return false
			}).sort((a, b) => {
				const aLoc = { lat: a.lat, lng: a.lng }
				const bLoc = { lat: b.lat, lng: b.lng }
				const disDelta = distance(userLoc, aLoc) - distance(userLoc, bLoc) 
				if (!disDelta && userTags && userTags.length) {
					const disTag = commonTags(b.tags) - commonTags(a.tags)
					return !disTag ? b.rating - a.rating : disTag
				} else {
					return !disDelta ? b.rating - a.rating : disDelta
				}
			})
		res.json(result)
	} catch (err) {
		throw new Error(err)
	}
})

router.get('/show/:id', auth, async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'not logged in' })
	try {
		let sql = `SELECT *, GET_RATING(users.id) AS rating FROM users WHERE id = ?`
		const result = await pool.query(sql, [req.params.id])
		if (result.length) {
			const user = result[0]
			sql = `SELECT * FROM images WHERE user_id = ?`
			user.images = await pool.query(sql, [user.id])
			sql = `INSERT INTO history (visitor, visited) VALUES (?, ?)`
			await pool.query(sql, [req.user.id, req.params.id])
			sql = `INSERT INTO notifications (type, id_from, id_to) VALUES ('visit', ?, ?)`
			await pool.query(sql, [req.user.id, req.params.id])
			res.json(user)
		} else {
			res.json({msg:'User doesnt exist'})
		}
	} catch (err) {
		throw new Error(err)
	}
})

module.exports = router
