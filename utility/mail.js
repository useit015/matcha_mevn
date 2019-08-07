const nodemailer = require('nodemailer')
const conf = require('../config/smtp')
const ejs = require('ejs')
const { readFile } = require('fs')
const { resolve, dirname} = require('path')
const { promisify } = require('util')
const readFileAsync = promisify(readFile)
const { google } = require("googleapis")
const oauth2Client = new google.auth.OAuth2(
	'880775402154-f1botu7r2u16d0ecse4raa2empc8s9pp.apps.googleusercontent.com',
	'Qg0RJ61DGlz5jM-rdOYSAo8W',
	'https://developers.google.com/oauthplayground'
)
oauth2Client.setCredentials({ refresh_token: '1/EKnbvgDkoiSVml_pOw3CXzmrym-73YAUsQdwkiZFlpixZCzKsr1uRj5a3d99QXY5' })
const accessToken = oauth2Client.getAccessToken()

const sendMail = async (to, key, type) => {
	try {
		const path = resolve(dirname(__dirname), 'views', 'mail.ejs')
		const raw = await readFileAsync(path, 'utf8')
		const data = {
			title: type == 'verify' ? 'Verify email' : 'Recover password',
			body: `Please click the button to ${type == 'verify' ? 'verify your email' : 'recover your password'}`,
			action: type == 'verify' ? 'Verify' : 'Recover',
			url: `${process.env.API_URL}auth/${type}/${key}`
		}
		const html = ejs.render(raw, data)
		let transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				type: 'OAuth2',
				user: process.env.MAIL_USER,
				clientId: '880775402154-f1botu7r2u16d0ecse4raa2empc8s9pp.apps.googleusercontent.com',
				clientSecret: 'Qg0RJ61DGlz5jM-rdOYSAo8W',
				refreshToken: '1/EKnbvgDkoiSVml_pOw3CXzmrym-73YAUsQdwkiZFlpixZCzKsr1uRj5a3d99QXY5',
				accessToken: accessToken
			}
		})
		await transporter.sendMail({
			from: 'Matcha team',
			subject: data.title,
			html,
			to
		})
	} catch (err) {
		console.log('Got error here -->', err)
	}
}

module.exports = sendMail
