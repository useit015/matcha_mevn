const smtp = {
	host: process.env.MAIL_SMTP,
	port: process.env.MAIL_PORT,
	secure: false,
	auth: {
		user: 'ousstest015@gmail.com',
		pass: 'fuck3dupsh17'
	}
}

module.exports = smtp
