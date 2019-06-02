const smtp = {
	host: process.env.MAIL_SMTP,
	port: process.env.MAIL_PORT,
	secure: false,
	auth: {
		user: process.env.MAIL,
		pass: process.env.MAIL_PASS
	}
}

module.exports = smtp
