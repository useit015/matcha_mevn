const express = require('express')
const mysql = require('mysql')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

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

router.post('/login', (req, res) => {
	const sql = `SELECT * FROM users WHERE users.username = '${req.body.username}' AND verified = 1`
	db.query(sql, (err, rows) => {
		if (err) throw err
		jwt.sign({ user: rows[0] }, 'secretkey', { expiresIn: '30s' }, (err, token) => {
			if (err) throw err
			res.json({ token })
		})
	})
})

router.post('/add', (req, res) => {
	const salt = bcrypt.genSaltSync(10)
	const user = {
		first_name: req.body.first_name,
		last_name: req.body.last_name,
		username: req.body.username,
		password: bcrypt.hashSync(req.body.password, salt),
		email: req.body.email,
		vkey: bcrypt.genSaltSync(10)
	}
	// MUST VALIDATE USER !!!!
	const sql = `INSERT INTO users (first_name, last_name, username, email, password, vkey)
		VALUES ('${user.first_name}', '${user.last_name}', '${user.username}', '${user.email}', '${user.password}', '${user.vkey}')`
	db.query(sql, err => {
		if (err) throw err
		res.json('User Added')
	})
})

router.get('/api/users', (req, res) => {
	db.query('SELECT * FROM users, images WHERE users.id = images.user_id AND images.profile = 1', (err, rows, fields) => {
		if (err) throw err
		res.json(rows)
	})
})

module.exports = router
