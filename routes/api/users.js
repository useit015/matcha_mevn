const express = require('express')
const mysql = require('mysql')
const router = express.Router()
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
	db.query(`SELECT * FROM users WHERE users.username = '${req.body.username}' AND verified = 1`, (err, rows, fields) => {
		if (err) throw err
		jwt.sign({ user: rows[0] }, 'secretkey', { expiresIn: '30s' }, (err, token) => {
			res.json({ token })
		})
	})
})

router.get('/api/users', (req, res) => {
	db.query('SELECT * FROM users, images WHERE users.id = images.user_id AND images.profile = 1', (err, rows, fields) => {
		if (err) throw err
		res.json(rows)
	})
})

module.exports = router
