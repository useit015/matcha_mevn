// const fs = require('fs')
// const path = require('path')
const moment = require('moment')
const crypto = require('crypto')
// const multer = require('multer')
const bcrypt = require('bcryptjs')
// const jwt = require('jsonwebtoken')
// const { promisify } = require('util')
const router = require('express').Router()
// const db = require('../../utility/database')
const pool = require('../../utility/database')
const sendMail = require('../../utility/mail')
// const upload = multer({ limits: { fileSize: 4 * 1024 * 1024 } })

// const writeFileAsync = promisify(fs.writeFile)

router.post('/getmatches', async (req, res) => {
	if (!req.body.id) return res.json('must include user id')
	try {
		const sql = `SELECT
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
		const following = await pool.query(sql, [req.body.id])
		try {
			const sql = `SELECT
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
			const followers = await pool.query(sql, [req.body.id])		
			res.json([...following, ...followers])
		} catch (err) {
			throw new Error(err)
		}
	} catch (err) {
		throw new Error(err)
	}
})

router.post('/gethistory', async (req, res) => {
	if (!req.body.id) return res.json('must include user id')
	try {
		const sql = `SELECT
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
		const visitors = await pool.query(sql, [req.body.id])
		try {
			const sql = `SELECT
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
			const visited = await pool.query(sql, [req.body.id])		
			res.json([...visitors, ...visited])
		} catch (err) {
			throw new Error(err)
		}
	} catch (err) {
		throw new Error(err)
	}
})

router.post('/getblocked', async (req, res) => {
	if (!req.body.id) return res.json('must include user id')
	try {
		const sql = `SELECT * FROM blocked where blocker = ? OR blocked = ?`
		const blacklist = await pool.query(sql, [req.body.id, req.body.id])
		res.json(blacklist)
	} catch (err) {
		throw new Error(err)
	}
})

router.post('/position/:id', async (req, res) => {
	try {
		const sql = `UPDATE users SET lat = ?, lng = ? WHERE id = ?`
		await pool.query(sql, [req.body.lat, req.body.lng, req.params.id])
		res.json('synced position')
	} catch (err) {
		throw new Error(err)
	}
})

router.post('/isloggedin', async (req, res) => {
	// ! MUST VALIDATE INPUT !!!!
	try {
		const sql = `SELECT * FROM users WHERE token = ?
						AND TIME_TO_SEC(TIMEDIFF(tokenExpiration, NOW())) > 0`
		const result = await pool.query(sql, [req.body.token])
		if (result.length) {
			try {
				const user = {
					...result[0],
					token: crypto.randomBytes(10).toString('hex'),
					tokenExpiration: moment().add(2, 'hours').format('YYYY-MM-DD HH:mm:ss')
				}
				const sql = `UPDATE users SET token = ?, tokenExpiration = ? WHERE id = ?`
				await pool.query(sql, [user.token, user.tokenExpiration, user.id])
				try {
					const sql = `SELECT * FROM images WHERE user_id = ?`
					user.images = await pool.query(sql, [user.token, user.tokenExpiration, user.id])
					res.json(user)
					// jwt.sign({ user: user }, 'secret', (err, token) => {
					// 	if (err) throw err
					// })
				} catch (err) {
					throw new Error(err)
				}
			} catch (err) {
				throw new Error(err)
			}
		} else {
			res.json('not logged in')
		}
	} catch (err) {
		throw new Error(err)
	}
})

router.post('/login', async (req, res) => {
	// ! MUST VALIDATE INPUT !!!!
	try {
		const sql = `SELECT * FROM users WHERE username = ?`
		const result = await pool.query(sql, [req.body.username])
		if (result.length && result[0].verified) {
			const user = result[0]
			try {
				const result = bcrypt.compare(req.body.password, user.password)
				if (result) {
					try {
						user.token = crypto.randomBytes(10).toString('hex')
						user.tokenExpiration = moment().add(2, 'hours').format('YYYY-MM-DD HH:mm:ss')
						const sql = `UPDATE users SET token = ?, tokenExpiration = ? WHERE id = ?`
						await pool.query(sql, [user.token, user.tokenExpiration, user.id])
						try {
							const sql = `SELECT * FROM images WHERE user_id = ?`
							user.images = await pool.query(sql, [user.id])
							res.json(user)
							// jwt.sign({ user: user }, 'secret', (err, token) => {
							// 	if (err) throw err
							// })
						} catch (err) {
							throw new Error(err)
						}
					} catch (err) {
						throw new Error(err)
					}
				} else {
					res.status(400).json('wrong pass')
				}
			} catch (err) {
				throw new Error(err)
			}
		} else {
			res.status(400).json('wrong username')
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
			password: bcrypt.hashSync(req.body.password, 10),
			vkey: crypto.randomBytes(10).toString('hex')
		}
		const sql = `INSERT INTO users (first_name, last_name,
						username, email, password, vkey)
						VALUES (?, ?, ?, ?, ?, ?)`
		await pool.query(sql, Object.values(user))
		sendMail(user.email, user.vkey)
		res.json('User Added')
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
			vkey: crypto.randomBytes(10).toString('hex'),
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
		const sql = `INSERT INTO users (first_name, last_name, username, email,
						password, vkey, verified, gender, looking, birthdate, biography,
						tags, address, city, country, rating, postal_code, phone, lat, lng)
						VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
		await pool.query(sql, Object.values(user))
		try {
			const sql = `SELECT id FROM users WHERE username = ?`
			const result = await pool.query(sql, [user.username])
			if (result.length) {
				try {
					const sql = `INSERT INTO images (user_id, name, profile) VALUES (?, ?, ?)`
					const data = {
						id: result[0].id,
						name: req.body.image,
						profile: 1
					}
					await pool.query(sql, Object.values(data))
					res.json('user added !!')
				} catch (err) {
					throw new Error(err)
				}
			}
		} catch (err) {
			throw new Error(err)
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
		const sql = `SELECT verified FROM users WHERE vkey = ?`
		const result = await pool.query(sql, [req.params.key])
		if (result.length) {
			if (result[0].verified) return res.json('User already verified')
			try {
				const sql = `UPDATE users SET verified = 1 WHERE vkey = ? AND verified = 0`
				await pool.query(sql, [req.params.key])
				res.json('User Verified')
			} catch (err) {
				throw new Error(err)
			}
		} else {
			res.status(400).json('invalid key')
		}
	} catch (err) {
		throw new Error(err)
	}
})

// router.post('/update/:id', async (req, res) => {
// 	const sql = `SELECT * FROM users WHERE id = ${req.params.id}`
// 	db.query(sql, (err, rows) => {
// 		if (err) throw err
// 		if (rows.length) {
// 			// ! MUST VALIDATE INPUT !!!!
// 			const user = {
// 				first_name: req.body.first_name,
// 				last_name: req.body.last_name,
// 				username: req.body.username,
// 				email: req.body.email,
// 				gender: req.body.gender,
// 				looking: req.body.looking,
// 				birthdate: req.body.birthdate,
// 				biography: req.body.biography,
// 				tags: req.body.tags,
// 				address: req.body.address,
// 				city: req.body.city,
// 				country: req.body.country,
// 				rating: req.body.rating,
// 				postal_code: req.body.postal_code,
// 				phone: req.body.phone,
// 				id: req.params.id
// 			}
// 			const sql = `UPDATE users SET
// 							first_name = ?, last_name = ?, username = ?,
// 							email = ?, gender = ?, looking = ?, birthdate = ?,
// 							biography = ?, tags = ?, \`address\` = ?, city = ?,
// 							country = ?, rating = ?, postal_code = ?, phone = ?
// 						WHERE id = ?`
// 			db.query(sql, Object.values(user), err => {
// 				if (err) throw err
// 				res.json('User Updated')
// 			})
// 		} else {
// 			res.status(400).json({ status: 'User not found' })
// 		}
// 	})
// })

// router.post('/image/:id', upload.single('image'), async (req, res) => {
// 	const base64Data = req.body.image.replace(/^data:image\/png;base64,/, '')
// 	const uploadDir = `${path.dirname(path.dirname(__dirname))}/public/uploads/`
// 	const imgName = `${req.params.id}-${crypto.randomBytes(10).toString('hex')}.png`
// 	fs.writeFile(uploadDir + imgName, base64Data, 'base64', err => {
// 		if (err) throw err
// 		const sql = `UPDATE images SET profile = 0 WHERE user_id = ?`
// 		db.query(sql, [req.params.id], err => {
// 			if (err) throw err
// 			const sql = `INSERT INTO images (user_id, name, profile) VALUES (?, ?, 1)`
// 			db.query(sql, [req.params.id, imgName], err => {
// 				if (err) throw err
// 				res.json({
// 					ok: true,
// 					name: imgName
// 				})
// 			})
// 		})
// 	})
// })

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
		const sql = `SELECT * FROM users WHERE id = ?`
		const result = await pool.query(sql, [req.params.id])
		if (result.length) {
			const user = result[0]
			let sql = `SELECT * FROM images WHERE user_id = ?`
			user.images = await pool.query(sql, [user.id])
			sql = `INSERT INTO history (visitor, visited) VALUES (?, ?)`
			await pool.query(sql, [req.body.visitor, req.params.id])
			res.json(user)
		} else {
			res.status(400).json('User doesnt exist')
		}
	} catch (err) {
		throw new Error(err)
	}
})

router.post('/block/:id', async (req, res) => {
	try {
		const sql = `SELECT * FROM blocked where blocker = ? AND blocked = ?`
		const data = [req.body.blocker, req.params.id]
		const result = await pool.query(sql, data)
		if (!result.length) {
			try {
				const sql = `INSERT INTO blocked (blocker, blocked) VALUES (?, ?)`
				await pool.query(sql, data)
				res.json('User Blocked')
			} catch (err) {
				throw new Error(err)
			}
		} else {
			res.status(400).json('User already Blocked')
		}
	} catch (err) {
		throw new Error(err)
	}
})

router.post('/match/:id', async (req, res) => {
	const data = [req.body.matcher, req.params.id]
	if (req.body.liked) {
		try {
			const sql = `DELETE FROM matches where matcher = ? AND matched = ?`
			await pool.query(sql, data)
			res.json('User unMatched')
		} catch (err) {
			throw new Error(err)
		}
	} else {
		try {
			const sql = `SELECT * FROM matches where matcher = ? AND matched = ?`
			const result = await pool.query(sql, data)
			if (!result.length) {
				try {
					const sql = `INSERT INTO matches (matcher, matched) VALUES (?, ?)`
					await pool.query(sql, data)
					res.json('User Matched')
				} catch (err) {
					throw new Error(err)
				}
			} else {
				res.status(400).json('User already Matched')
			}
		} catch (err) {
			throw new Error(err)
		}
	}
})

module.exports = router
