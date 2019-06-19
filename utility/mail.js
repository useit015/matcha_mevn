const nodemailer = require('nodemailer')
const conf = require('../config/smtp')

const sendMail = async (to, key) => {
	try {
		let transporter = nodemailer.createTransport(conf)
		await transporter.sendMail({
			from: 'Matcha team',
			to,
			subject: "Hello ✔",
			text: "Hello world?",
			html: `<a href="http://134.209.195.36/auth/recover/${key}">Click here</a>`
		})
	} catch (err) {
		throw new Error(err)
	}
}

module.exports = sendMail
