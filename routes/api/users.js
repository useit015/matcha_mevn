const moment = require('moment')
const multer = require('multer')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { readFile, writeFile, unlink } = require('fs')
const { dirname, resolve } = require('path')
const { promisify } = require('util')
const { randomBytes } = require('crypto')
const router = require('express').Router()
const pool = require('../../utility/database')
const distance = require('../../utility/distance')
const sendMail = require('../../utility/mail')
const validateInput = require('../../utility/validate')
const readFileAsync = promisify(readFile)
const writeFileAsync = promisify(writeFile)
const unlinkAsync = promisify(unlink)
const upload = multer({ limits: { fileSize: 4 * 1024 * 1024 } })
const auth = require('../../middleware/auth')

const randomHex = () => randomBytes(10).toString('hex')
const isExternal = url => url && (url.indexOf(':') > -1 || url.indexOf('//') > -1 || url.indexOf('www.') > -1)


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
		return res.json({ msg: 'Fatal error', err })
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
		return res.json({ msg: 'Fatal error', err })
	}
})

router.get('/getblocked', auth, async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'not logged in' })
	try {
		const sql = `SELECT * FROM blocked where blocker = ? OR blocked = ?`
		const blacklist = await pool.query(sql, [req.user.id, req.user.id])
		res.json(blacklist)
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
})

router.get('/gettags', auth, async (req, res) => {
	if (!req.user.id) res.json({ msg: 'not logged in' })
	try {
		const sql = `SELECT value FROM tags`
		const result = await pool.query(sql)
		res.json(result.map(cur => cur.value))
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
})

router.post('/add', async (req, res) => {
	if (!validateInput(req.body.first_name, 'fname'))
		return res.json({msg:'First name is invalid'})
	if (!validateInput(req.body.last_name, 'lname'))
		return res.json({msg:'Last name is invalid'})
	if (!validateInput(req.body.email, 'email'))
		return res.json({msg:'Email is invalid'})
	if (!validateInput(req.body.username, 'username'))
		return res.json({ msg:'Username is invalid' })
	if (!validateInput(req.body.password, 'password'))
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
			sql = `INSERT INTO users (first_name, last_name, username, email, password, vkey)
					VALUES (?, ?, ?, ?, ?, ?)`
			result = await pool.query(sql, Object.values(user))
			sendMail(user.email, user.vkey, 'verify')
			if (result.affectedRows) {
				return res.json({ ok: true, status: 'You have been successfully registered, please verify your email' })
			}
		}
		res.json({ msg: 'Username or Email already in use'})
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
})

router.post('/install', async (req, res) => {
	try {
		const user = {
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			username: req.body.username,
			email: req.body.email,
			password: await bcrypt.hash(req.body.password, 10),
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
	if (!req.user.id) return res.json({ msg: 'Not logged in' })
	if (!validateInput(req.body.first_name, 'fname'))
		return res.json({msg:'First name is invalid'})
	if (!validateInput(req.body.last_name, 'lname'))
		return res.json({msg:'Last name is invalid'})
	if (!validateInput(req.body.email, 'email'))
		return res.json({msg:'Email is invalid'})
	if (!validateInput(req.body.username, 'username'))
		return res.json({ msg:'Username is invalid' })
	if (!validateInput(req.body.gender, 'gender'))
		return res.json({ msg:'Gender is invalid' })
	if (!validateInput(req.body.looking, 'looking'))
		return res.json({ msg:'Looking is invalid' })
	if (req.body.birthdate && new Date(req.body.birthdate) >= new Date().getTime())
		return res.json({ msg:'Birthdate is invalid' })
	let tagList
	if (req.body.tags)
		tagList = req.body.tags.split(',')
	else
		tagList = []
	if (tagList.length > 20) return res.json({ msg:'Too many tags' })
	for (const iterator of tagList) {
		if (iterator.length > 25)
			return res.json({ msg:'Tags are invalid' })
	}
	try {
		let sql, result
		sql = `SELECT * FROM users WHERE id = ?`
		result = await pool.query(sql, [req.user.id])
		if (result.length) {
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
						return res.json({ msg: 'Fatal error', err })
					}
				}
			})
		} else {
			res.json({ ok: false, status: 'User not found' })
		}
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
})

router.post('/email', auth, async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'Not logged in' })
	if (req.user.google_id) return res.json({ msg: 'Not allowed !' })
	if (!validateInput(req.body.email, 'email'))
		return res.json({msg:'Email is invalid'})
	if (!validateInput(req.body.password, 'password'))
		return res.json({msg:'Password is invalid'})
	if (req.user.email == req.body.email)
		return res.json({ msg:'The provided email matches your current email' })
	try {
		let result = await bcrypt.compare(req.body.password, req.user.password)
		if (!result) return res.json({ msg: 'Wrong password' })
		let sql = `SELECT * FROM users WHERE email = ?`
		result = await pool.query(sql, [req.body.email])
		if (result.length) return res.json({ msg: 'Email already exists' })
		sql = `UPDATE users SET email = ? WHERE id = ?`
		result = await pool.query(sql, [req.body.email, req.user.id])
		if (!result.affectedRows) return res.json({ msg: 'Oups something went wrong' })
		res.json({ ok: true })
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
})

router.post('/password', auth, async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'Not logged in' })
	if (req.user.google_id) return res.json({ msg: 'Not allowed !' })
	if (!validateInput(req.body.password, 'password'))
		return res.json({ msg:'Password is invalid' })
	if (!validateInput(req.body.newPassword, 'password'))
		return res.json({ msg:'New password is invalid' })
	if (!req.body.confNewPassword || req.body.newPassword != req.body.confNewPassword )
		return res.json({ msg:'Confirmation password is invalid' })
	if (req.body.password == req.body.newPassword )
		return res.json({ msg:'The provided password matches your current password' })
	try {
		let result = await bcrypt.compare(req.body.password, req.user.password)
		if (!result) return res.json({ msg: 'Wrong password' })
		const hash = await bcrypt.hash(req.body.newPassword, 10)
		let sql = `UPDATE users SET password = ? WHERE id = ?`
		result = await pool.query(sql, [hash, req.user.id])
		if (!result.affectedRows) return res.json({ msg: 'Oups something went wrong' })
		res.json({ ok: true })
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
})

router.post('/image', [auth, upload.single('image')], async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'Not logged in' })
	try {
		const base64Data = req.body.image.replace(/^data:image\/png;base64,/, '')
		const uploadDir = `${dirname(dirname(__dirname))}/uploads/`
		const imgName = `${req.user.id}-${randomHex()}.png`
		let sql = `SELECT * FROM images WHERE user_id = ? AND cover = 0`
		let result = await pool.query(sql, [req.user.id])
		if (result.length < 5) {
			await writeFileAsync(uploadDir + imgName, base64Data, 'base64')
			sql = `UPDATE images SET profile = 0 WHERE user_id = ?`
			await pool.query(sql, [req.user.id])
			sql = `INSERT INTO images (user_id, name, profile) VALUES (?, ?, 1)`
			result = await pool.query(sql, [req.user.id, imgName])
			res.json({ ok: true, status: 'Image Updated', name: imgName, id: result.insertId, user_id: req.user.id })
		} else {
			res.json({ msg: 'User already has 5 photos' })
		}
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
})

router.post('/image/cover', [auth, upload.single('image')], async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'Not logged in' })
	try {
		let sql = `SELECT * FROM images WHERE cover = 1 AND user_id = ?`
		let result = await pool.query(sql, [req.user.id])
		if (result.length) {
			if (!isExternal(result[0].name)) {
				try {
					unlinkAsync(resolve(dirname(dirname(__dirname)), 'uploads', result[0].name))
				} catch (err) {
					return res.json({ msg: 'Fatal error', err })
				}
			}
			sql = `DELETE FROM images WHERE id = ? AND user_id = ?`
			await pool.query(sql, [result[0].id, req.user.id])
		}
		const uploadDir = `${dirname(dirname(__dirname))}/uploads/`
		const imgName = `${req.user.id}-${randomHex()}.png`
		await writeFileAsync(uploadDir + imgName, req.file.buffer, 'base64')
		sql = `INSERT INTO images (user_id, name, cover) VALUES (?, ?, 1)`
		result = await pool.query(sql, [req.user.id, imgName])
		if (!result.affectedRows) return res.json({ msg: 'Oups.. Something went wrong!'})
		res.json({ ok: true, status: 'Image Updated', name: imgName, id: result.insertId, user_id: req.user.id })
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
})

router.post('/image/del', auth, async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'Not logged in' })
	if (!req.body.id || isNaN(req.body.id)) return res.json({ msg: 'Invalid request' })
	try {
		let sql = `SELECT * FROM images WHERE id = ? AND user_id = ?`
		let result = await pool.query(sql, [req.body.id, req.user.id])
		if (result.length) {
			if (!isExternal(result[0].name)) {
				try {
					unlinkAsync(resolve(dirname(dirname(__dirname)), 'uploads', result[0].name))
				} catch (err) {
					return res.json({ msg: 'Fatal error', err })
				}
			}
			sql = `DELETE FROM images WHERE id = ? AND user_id = ?`
			result = await pool.query(sql, [req.body.id, req.user.id])
			if (req.body.profile) {
				sql = `UPDATE images SET profile = 1 WHERE user_id = ? AND cover = 0
						ORDER BY created_at DESC LIMIT 1`
				const result = await pool.query(sql, [req.user.id])
			}
			if (result.affectedRows) return res.json({ ok: true})
		}
		res.json({ msg: 'Oups something went wrong'})
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
})

router.post('/show', auth, async (req, res) => {
	const user = req.user
	if (!user.id) return res.json({ msg: 'Not logged in' })
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
		result = result.map(cur => {
			delete cur.password
			delete cur.vkey
			delete cur.rkey
			delete cur.verified
			delete cur.email
			delete cur.google_id
			return cur
		}).filter(cur => {
			if (!req.body.filter)
				return true
			if (user.looking == 'both')
				return cur.looking == 'both'
			if (user.looking != user.gender)
				return cur.looking != 'both' && cur.gender != user.gender && cur.gender != cur.looking
			if (user.looking == user.gender)
				return cur.looking != 'both' && cur.gender == user.gender && cur.gender == cur.looking
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
		return res.json({ msg: 'Fatal error', err })
	}
})

router.get('/show/:id', auth, async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'Not logged in' })
	if (!req.params.id || isNaN(req.params.id)) return res.json({ msg: 'Invalid request' })
	try {
		let sql = `SELECT *, GET_RATING(users.id) AS rating FROM users WHERE id = ?
					AND id NOT IN (SELECT blocked FROM blocked WHERE blocker = ?)
					AND ? NOT IN (SELECT blocked FROM blocked WHERE blocker = ?)`
		const result = await pool.query(sql, [req.params.id, req.user.id, req.user.id, req.params.id])
		if (result.length) {
			const user = result[0]
			delete user.password
			delete user.vkey
			delete user.rkey
			delete user.verified
			delete user.email
			delete user.google_id
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
		return res.json({ msg: 'Fatal error', err })
	}
})

router.post('/blacklisted', auth, async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'not logged in' })
	const blacklist = JSON.parse(req.body.ids)
	console.log(Array.isArray(blacklist))
	if (!Array.isArray(blacklist) || !blacklist.length) return res.json({ msg: 'bad query' })
	const placehoder = `(${blacklist.map(cur => '?').join(', ')})`
	try {
		let sql = `SELECT id, username, first_name, last_name FROM users WHERE id IN ${placehoder}`
		const result = await pool.query(sql, blacklist)
		res.json({
			ok: true,
			list: result
		})
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
})

module.exports = router
