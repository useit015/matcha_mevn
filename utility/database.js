const mysql = require('mysql')
const conf = require('../config/db')

console.log('i am conf --> ', conf)

const db = mysql.createConnection(conf)

db.connect(err => {
	if (err) throw err;
	console.log('MySql Connected...');
})

module.exports = db
