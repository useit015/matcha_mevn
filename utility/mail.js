const nodemailer = require('nodemailer')
const conf = require('../config/smtp')
console.log('config----------------->', conf)
const sendMail = async (to, key) => {
	let transporter = nodemailer.createTransport(conf)
	await transporter.sendMail({
		from: 'Matcha team',
		to,
		subject: "Hello ✔",
		text: "Hello world?",
		html: `<a href="http://134.209.195.36/api/users/verify/${key}">Click here</a>`
	})
}

module.exports = sendMail
