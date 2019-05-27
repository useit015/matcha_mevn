const bodyParser = require('body-parser')
const express = require('express')
const cors = require('cors')
const path = require('path')
const users = require('./routes/api/users')
const port = process.env.PORT || 8080
const app = express()
const mailer = require('express-mailer')

app.use(cors())

app.set('views', __dirname + '/views')
app.set('view engine', 'pug')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


mailer.extend(app, {
	from: 'ousstest015@gmail.com',
	host: 'smtp.gmail.com', // hostname
	secureConnection: true, // use SSL
	port: 465, // port for secure SMTP
	transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
	auth: {
		user: 'ousstest015@gmail.com', // generated ethereal user
		pass: 'fuck3dupsh17' // generated ethereal password
	}
})

app.use('/api/users', users)
app.use('/static', express.static(`${__dirname}/public`))

app.get('/mail', (req, res) => {
	var mailOptions = {
		to: 'useit015@gmail.com',
		subject: 'Email from SMTP sever',
		user: {
			name: 'Arjun PHP',
			message: 'Welcome to arjunphp.com'
		}
	  }
	 
	// Send email.
	app.mailer.send('email', mailOptions, function (err, message) {
		if (err) {
			console.log(err)
			return res.send('There was an error sending the email')
		}
		return res.send('Email has been sent!')
	})
})

app.get(/.*/, (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')))

app.listen(port, () => console.log(`The server has started on port -> ${port}`))
