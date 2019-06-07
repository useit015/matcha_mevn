const jwt = require('jsonwebtoken')

function auth(req, res, next) {
	const token = req.header('x-auth-token')
	if (!token) return res.json({ msg: 'No token, authorizaton denied' })
	try {
		const decoded = jwt.verify(token, process.env.SECRET)
		req.user = decoded
		next()
	} catch (e) {
		res.json({ msg: 'Token is not valid' })
	}
}

module.exports = auth
