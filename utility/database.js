const mysql = require('mysql')
const conf = require('../config/db')

const db = mysql.createConnection(conf)

db.connect(err => {
	if (err) throw err;
	console.log('MySql Connected...');
})

module.exports = db
