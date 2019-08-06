const smtp = {
	host: process.env.MAIL_SMTP,
	port: process.env.MAIL_PORT,
	secure: false,
	auth: {
		type: 'OAuth2',
		user: process.env.MAIL_USER,
		pass: process.env.MAIL_PASS
	}
}

module.exports = smtp
