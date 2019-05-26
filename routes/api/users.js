const fs = require('fs')
const path = require('path')
const express = require('express')
const mysql = require('mysql')
const router = express.Router()
const moment = require('moment')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const upload = multer({ 
	limits: { fileSize: 4 * 1024 * 1024 },
	storage: {
		destination: (req, file, cb) => cb(null, 'uploads'),
		filename: (req, file, cb) => cb(null, file.fieldname + '-' + Date.now())
	}
})

const db = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '0O*ussama',
	database: 'slim'
})

db.connect(err => {
	if (err) throw err;
	console.log('MySql Connected...');
})

router.post('/getmatches', (req, res) => {
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
				where matches.matcher = ${req.body.id}
				AND images.profile = 1`
	db.query(sql, (err, following) => {
		if (err) throw err
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
					where matches.matched = ${req.body.id}
					AND images.profile = 1`
		db.query(sql, (err, followers) => {
			if (err) throw err
			res.json([...following, ...followers])
		})
	})
})

router.post('/gethistory', (req, res) => {
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
				WHERE history.visited = ${req.body.id}
				AND images.profile = 1`
	db.query(sql, (err, visitors) => {
		if (err) throw err
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
					WHERE history.visitor = ${req.body.id}
					AND images.profile = 1`
		db.query(sql, (err, visited) => {
			if (err) throw err
			res.json([...visitors, ...visited])
		})
	})
})

router.post('/getblocked', (req, res) => {
	const sql = `SELECT * FROM blocked where blocker = ${req.body.id} OR blocked = ${req.body.id}`
	db.query(sql, (err, blacklist) => {
		if (err) throw err
		res.json(blacklist)
	})
})

router.post('/position/:id', (req, res) => {
	const sql = `UPDATE users SET
					lat = ${req.body.lat},
					lng = ${req.body.lng}
				WHERE id = ${req.params.id}`
	db.query(sql, err => {
		if (err) throw err
		res.json('synced position')
	})
})

router.post('/isloggedin', (req, res) => {
	// MUST VALIDATE INPUT !!!!
	const sql = `SELECT * FROM users WHERE token = '${req.body.token}' AND TIME_TO_SEC(TIMEDIFF(tokenExpiration, NOW())) > 0`
	db.query(sql, (err, rows) => {
		if (err) throw err
		if (rows.length) {
			const user = rows[0]
			user.token = crypto.randomBytes(10).toString('hex')
			user.tokenExpiration = moment().add(2, 'hours').format('YYYY-MM-DD HH:mm:ss')
			const sql = `UPDATE users SET token = '${user.token}', tokenExpiration = '${user.tokenExpiration}' WHERE id = ${user.id}`
			db.query(sql, err => {
				if (err) throw err
				res.json(user)
				// jwt.sign({ user: user }, 'secret', (err, token) => {
				// 	if (err) throw err
				// })
			})
		} else {
			res.json('not logged in')
		}
	})
})

router.post('/login', (req, res) => {
	// MUST VALIDATE INPUT !!!!
	const sql = `SELECT * FROM users WHERE username = '${req.body.username}'`
	db.query(sql, (err, rows) => {
		if (err) throw err
		if (rows.length && rows[0].verified) {
			const user = rows[0]
			bcrypt.compare(req.body.password, user.password, (err, result) => {
				if (err) throw err
				if (result) {
					user.token = crypto.randomBytes(10).toString('hex')
					user.tokenExpiration = moment().add(2, 'hours').format('YYYY-MM-DD HH:mm:ss')
					const sql = `UPDATE users SET token = '${user.token}', tokenExpiration = '${user.tokenExpiration}' WHERE id = ${user.id}`
					db.query(sql, err => {
						if (err) throw err
						res.json(user)
						// jwt.sign({ user: user }, 'secret', (err, token) => {
						// 	if (err) throw err
						// })
					})
				} else {
					res.status(400).json('wrong pass')
				}
			})
		} else {
			res.status(400).json('wrong username')
		}
	})
})

router.post('/add', (req, res) => {
	// MUST VALIDATE INPUT !!!!
	const user = {
		first_name: req.body.first_name,
		last_name: req.body.last_name,
		username: req.body.username,
		email: req.body.email,
		password: bcrypt.hashSync(req.body.password, 10),
		vkey: bcrypt.genSaltSync(10)
	}
	// MUST VALIDATE USER !!!!
	// AND MUST SEND VALIDATION EMAIL !!!!
	const sql = `INSERT INTO users (first_name, last_name, username, email, password, vkey)
		VALUES ('${user.first_name}', '${user.last_name}', '${user.username}', '${user.email}', '${user.password}', '${user.vkey}')`
	db.query(sql, err => {
		if (err) throw err
		res.json('User Added')
	})
})

router.post('/update/:id', (req, res) => {
	const sql = `SELECT * FROM users WHERE id = ${req.params.id}`
	db.query(sql, (err, rows) => {
		if (err) throw err
		if (rows.length) {
			// MUST VALIDATE INPUT !!!!
			// MUST VALIDATE USER !!!!
			const user = {
				id: req.params.id,
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
				phone: req.body.phone
			}
			const sql = `UPDATE users SET
							first_name = '${user.first_name}',
							last_name = '${user.last_name}',
							username = '${user.username}',
							email = '${user.email}',
							gender = '${user.gender}',
							looking = '${user.looking}',
							birthdate = '${user.birthdate}',
							biography = '${user.biography}',
							tags = '${user.tags}',
							\`address\` = '${user.address}',
							city = '${user.city}',
							country = '${user.country}',
							rating = '${user.rating}',
							postal_code = '${user.postal_code}',
							phone = '${user.phone}'
						WHERE id = ${user.id}`
			db.query(sql, err => {
				if (err) throw err
				res.json('User Updated')
			})
		} else {
			res.status(400).json({ status: 'User not found' })
		}
	})
})

router.post('/image/:id', upload.single('image'), (req, res) => {
	return res.json([req.file, req.body])
	const base64Data = req.body.replace(/^data:image\/png;base64,/, '')
	const uploadDir = `${path.dirname(path.dirname(__dirname))}/public/uploads/`
	const imgName = `${req.params.id}-${crypto.randomBytes(10).toString('hex')}.png`
	fs.writeFile(uploadDir + imgName, base64Data, 'base64', err => {
		if (err) throw err
		const sql = `UPDATE images SET profile = 0 WHERE user_id = ${req.params.id}`
		db.query(sql, err => {
			if (err) throw err
			const sql = `INSERT INTO images (user_id, name, profile)
							VALUES (${req.params.id}, ${imgName}, 1)`
			db.query(sql, err => {
				if (err) throw err
				res.json({
					ok: true,
					name: imgName
				})
			})
		})
	})
})

router.get('/show', (req, res) => {
	const sql = 'SELECT * FROM users, images WHERE users.id = images.user_id AND images.profile = 1'
	db.query(sql, (err, rows) => {
		if (err) throw err
		res.json(rows)
	})
})

router.post('/show/:id', (req, res) => {
	const sql = `SELECT * FROM users WHERE id = ${req.params.id}`
	db.query(sql, (err, rows) => {
		if (err) throw err
		if (rows.length) {
			const user = rows[0]
			const sql = `SELECT * FROM images WHERE user_id = ${req.params.id}`
			db.query(sql, (err, rows) => {
				if (err) throw err
				user.images = rows
				const sql = `INSERT INTO history (visitor, visited) VALUES (${req.body.visitor}, ${req.params.id})`
				db.query(sql, err => {
					if (err) throw err
					res.json(user)
				})
			})
		} else {
			res.status(400).json('User doesnt exist')
		}
	})
})

router.post('/block/:id', (req, res) => {
	const sql = `SELECT * FROM blocked where blocker = '${req.body.blocker}' AND blocked = '${req.params.id}'`
	db.query(sql, (err, rows) => {
		if (err) throw err
		if (!rows.length) {
			const sql = `INSERT INTO blocked (blocker, blocked) VALUES (${req.body.blocker}, ${req.params.id})`
			db.query(sql, err => {
				if (err) throw err
				res.json('User Blocked')
			})
		} else {
			res.status(400).json('User already Blocked')
		}
	})
})

router.post('/match/:id', (req, res) => {
	if (req.body.liked) {
		const sql = `DELETE FROM matches where matcher = '${req.body.matcher}' AND matched = '${req.params.id}'`
		db.query(sql, err => {
			if (err) throw err
			res.json('User unMatched')
		})
	} else {
		const sql = `SELECT * FROM matches where matcher = '${req.body.matcher}' AND matched = '${req.params.id}'`
		db.query(sql, (err, rows) => {
			if (err) throw err
			if (!rows.length) {
				const sql = `INSERT INTO matches (matcher, matched) VALUES (${req.body.matcher}, ${req.params.id})`
				db.query(sql, err => {
					if (err) throw err
					res.json('User Matched')
				})
			} else {
				res.status(400).json('User already Matched')
			}
		})
	}
})

module.exports = router
