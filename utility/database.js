const mysql = require('mysql')
const conf = require('../config/db')
const { promisify } = require('util')

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

pool.query = promisify(pool.query)

module.exports = pool
