const fs = require('fs')
const path = require('path')
const express = require('express')
const mysql = require('mysql')
const router = express.Router()
const moment = require('moment')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
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
	if (!req.body.id) return res.json('must include user id')
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
	db.query(sql, [req.body.id], (err, following) => {
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
					where matches.matched = ?
					AND images.profile = 1`
		db.query(sql, [req.body.id], (err, followers) => {
			if (err) throw err
			res.json([...following, ...followers])
		})
	})
})

router.post('/gethistory', (req, res) => {
	if (!req.body.id) return res.json('must include user id')
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
	db.query(sql, [req.body.id], (err, visitors) => {
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
					WHERE history.visitor = ?
					AND images.profile = 1`
		db.query(sql, [req.body.id], (err, visited) => {
			if (err) throw err
			res.json([...visitors, ...visited])
		})
	})
})

router.post('/getblocked', (req, res) => {
	if (!req.body.id) return res.json('must include user id')
	const sql = `SELECT * FROM blocked where blocker = ? OR blocked = ?`
	db.query(sql, [req.body.id, req.body.id], (err, blacklist) => {
		if (err) throw err
		res.json(blacklist)
	})
})

router.post('/position/:id', (req, res) => {
	const sql = `UPDATE users SET lat = ?, lng = ? WHERE id = ?`
	db.query(sql, [req.body.lat, req.body.lng, req.params.id], err => {
		if (err) throw err
		res.json('synced position')
	})
})

router.post('/isloggedin', (req, res) => {
	// MUST VALIDATE INPUT !!!!
	const sql = `SELECT * FROM users WHERE token = ? AND TIME_TO_SEC(TIMEDIFF(tokenExpiration, NOW())) > 0`
	db.query(sql, [req.body.token], (err, rows) => {
		if (err) throw err
		if (rows.length) {
			const user = rows[0]
			user.token = crypto.randomBytes(10).toString('hex')
			user.tokenExpiration = moment().add(2, 'hours').format('YYYY-MM-DD HH:mm:ss')
			const sql = `UPDATE users SET token = ?, tokenExpiration = '? WHERE id = ?`
			db.query(sql, [user.token, user.tokenExpiration, user.id], err => {
				if (err) throw err
				const sql = `SELECT * FROM images WHERE user_id = ?`
				db.query(sql, [user.id], (err, rows) => {
					if (err) throw err
					user.images = rows
					res.json(user)
				})
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
	// ! MUST VALIDATE INPUT !!!!
	const sql = `SELECT * FROM users WHERE username = ?`
	db.query(sql, [req.body.username], (err, rows) => {
		if (err) throw err
		if (rows.length && rows[0].verified) {
			const user = rows[0]
			bcrypt.compare(req.body.password, user.password, (err, result) => {
				if (err) throw err
				if (result) {
					user.token = crypto.randomBytes(10).toString('hex')
					user.tokenExpiration = moment().add(2, 'hours').format('YYYY-MM-DD HH:mm:ss')
					const sql = `UPDATE users SET token = ?, tokenExpiration = ? WHERE id = ?`
					db.query(sql, [user.token, user.tokenExpiration, user.id], err => {
						if (err) throw err
						const sql = `SELECT * FROM images WHERE user_id = ?`
						db.query(sql, [user.id], (err, rows) => {
							if (err) throw err
							user.images = rows
							res.json(user)
						})
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

const sendMail = async (to, key) => {
	let transporter = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 587,
		secure: false,
		auth: {
			user: 'ousstest015@gmail.com',
			pass: 'fuck3dupsh17'
		}
	})
	await transporter.sendMail({
		from: 'Matcha team',
		to,
		subject: "Hello ✔",
		text: "Hello world?",
		html: `<a href="http://134.209.195.36/api/users/verify/${key}">Click here</a>`
	})
}

router.post('/add', (req, res) => {
	// ! MUST VALIDATE INPUT !!!!
	const user = {
		first_name: req.body.first_name,
		last_name: req.body.last_name,
		username: req.body.username,
		email: req.body.email,
		password: bcrypt.hashSync(req.body.password, 10),
		vkey: crypto.randomBytes(10).toString('hex')
	}
	// // AND MUST SEND VALIDATION EMAIL !!!!
	const sql = `INSERT INTO users (first_name, last_name, username, email, password, vkey)
					VALUES (?, ?, ?, ?, ?, ?)`
	db.query(sql, Object.values(user), err => {
		if (err) throw err
		sendMail(user.email, user.vkey)
		res.json('User Added')
	})
})

router.get('/verify/:key', (req, res) => {
	if (!req.params.key) return res.json('Cant validate')
	const sql = `SELECT verified FROM users WHERE vkey = ?`
	db.query(sql, req.params.key, (err, rows) => {
		if (err) throw err
		if (rows.length) {
			if (rows[0].verified) return res.json('User already verified')
			const sql = `UPDATE users SET verified = 1 WHERE vkey = ? AND verified = 0`
			db.query(sql, req.params.key, err => {
				if (err) throw err
				res.json('User Verified')
			})
		} else {
			res.status(400).json('invalid key')
		}
	})
})

router.post('/update/:id', (req, res) => {
	const sql = `SELECT * FROM users WHERE id = ${req.params.id}`
	db.query(sql, (err, rows) => {
		if (err) throw err
		if (rows.length) {
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
				id: req.params.id
			}
			const sql = `UPDATE users SET
							first_name = ?, last_name = ?, username = ?,
							email = ?, gender = ?, looking = ?, birthdate = ?,
							biography = ?, tags = ?, \`address\` = ?, city = ?,
							country = ?, rating = ?, postal_code = ?, phone = ?
						WHERE id = ?`
			db.query(sql, Object.values(user), err => {
				if (err) throw err
				res.json('User Updated')
			})
		} else {
			res.status(400).json({ status: 'User not found' })
		}
	})
})

router.post('/image/:id', upload.single('image'), (req, res) => {
	const base64Data = req.body.image.replace(/^data:image\/png;base64,/, '')
	const uploadDir = `${path.dirname(path.dirname(__dirname))}/public/uploads/`
	const imgName = `${req.params.id}-${crypto.randomBytes(10).toString('hex')}.png`
	fs.writeFile(uploadDir + imgName, base64Data, 'base64', err => {
		if (err) throw err
		const sql = `UPDATE images SET profile = 0 WHERE user_id = ?`
		db.query(sql, [req.params.id], err => {
			if (err) throw err
			const sql = `INSERT INTO images (user_id, name, profile) VALUES (?, ?, 1)`
			db.query(sql, [req.params.id, imgName], err => {
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
	const sql = `SELECT * FROM users WHERE id = ?`
	db.query(sql, [req.params.id], (err, rows) => {
		if (err) throw err
		if (rows.length) {
			const user = rows[0]
			const sql = `SELECT * FROM images WHERE user_id = ?`
			db.query(sql, [req.params.id], (err, rows) => {
				if (err) throw err
				user.images = rows
				const sql = `INSERT INTO history (visitor, visited) VALUES (?, ?)`
				db.query(sql, [req.body.visitor, req.params.id], err => {
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
	const sql = `SELECT * FROM blocked where blocker = ? AND blocked = ?`
	db.query(sql, [req.body.blocker, req.params.id], (err, rows) => {
		if (err) throw err
		if (!rows.length) {
			const sql = `INSERT INTO blocked (blocker, blocked) VALUES (?, ?)`
			db.query(sql, [req.body.blocker, req.params.id], err => {
				if (err) throw err
				res.json('User Blocked')
			})
		} else {
			res.status(400).json('User already Blocked')
		}
	})
})

router.post('/match/:id', (req, res) => {
	const match = [req.body.matcher, req.params.id]
	if (req.body.liked) {
		const sql = `DELETE FROM matches where matcher = ? AND matched = ?`
		db.query(sql, match, err => {
			if (err) throw err
			res.json('User unMatched')
		})
	} else {
		const sql = `SELECT * FROM matches where matcher = ? AND matched = ?`
		db.query(sql, match, (err, rows) => {
			if (err) throw err
			if (!rows.length) {
				const sql = `INSERT INTO matches (matcher, matched) VALUES (?, ?)`
				db.query(sql, match, err => {
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
