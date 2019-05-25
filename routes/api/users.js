const express = require('express')
const mysql = require('mysql')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const moment = require('moment')

const db = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'root',
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
			res.json({ status: 'not logged in' })
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
					res.json({ status: 'wrong pass' })
				}
			})
		} else {
			res.json({ status: 'wrong username' })
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

router.get('/', (req, res) => {
	db.query('SELECT * FROM users, images WHERE users.id = images.user_id AND images.profile = 1', (err, rows, fields) => {
		if (err) throw err
		res.json(rows)
	})
})

module.exports = router
