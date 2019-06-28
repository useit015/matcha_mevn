const jwt = require('jsonwebtoken')
const pool = require('../utility/database')

const auth = async (req, res, next) => {
	const token = req.header('x-auth-token')
	if (!token) return res.json({ msg: 'No token, authorizaton denied' })
	try {
		const decoded = jwt.verify(token, process.env.SECRET)
		req.user = decoded
		if (decoded.id) {
			try {
				const sql = `SELECT * FROM users WHERE id = ?`
				const result = await pool.query(sql, [decoded.id])
				if (result.length) req.user = result[0]
			} catch (err) {
				console.log('Got error here -->', err)
			}
		}
		next()
	} catch (e) {
		res.json({ msg: 'Token is not valid' })
	}
}

module.exports = auth
