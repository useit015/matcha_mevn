const express = require('express')
const mysql = require('mysql')
const router = express.Router()

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

router.get('/api/users', (req, res) => {
	db.query('SELECT * FROM users, images WHERE users.id = images.user_id AND images.profile = 1', (err, rows, fields) => {
		if (err) throw err
		res.json(rows)
	})
})

module.exports = router
