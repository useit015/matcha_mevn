// const mysql = require('mysql')
// const conf = require('../config/db')

// const db = mysql.createConnection(conf)

// db.connect(err => {
// 	if (err) throw err;
// 	console.log('MySql Connected...');
// })

// module.exports = db

const mysql = require('mysql')
const util = require('util')
const conf = require('../config/db')

const pool = mysql.createPool(conf)

pool.getConnection((err, connection) => {
	if (err) {
		switch (err.code) {
			case 'PROTOCOL_CONNECTION_LOST':
				console.log('Database connection was closed.')
				break
			case 'ER_CON_COUNT_ERROR':
				console.log('Database has too many connections.')
				break
			case 'ECONNREFUSED':
				console.log('Database connection was refused.')
				break
		}
	}
	if (connection) connection.release()
	return
})

pool.query = util.promisify(pool.query)

module.exports = pool
