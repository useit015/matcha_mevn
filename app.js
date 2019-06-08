require('dotenv').config()
const bodyParser = require('body-parser')
const express = require('express')
const cors = require('cors')
const path = require('path')
const http = require('http')
const socketIo = require('socket.io')
const port = process.env.PORT || 8080
const app = express()

app.use(cors())

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use('/auth', require('./routes/api/auth'))
app.use('/api/action', require('./routes/api/actions'))
app.use('/api/chat', require('./routes/api/chat'))
app.use('/api/users', require('./routes/api/users'))
app.use('/static', express.static(`${__dirname}/public`))

app.get(/.*/, (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')))

const server = http.createServer(app)

const io = socketIo(server, { pingInterval: 10, pingTimeout: 4000 })

let users = {}

io.on('connection', socket => {
	console.log('New client connected --> ', socket.id)
	socket.on('chat', data => {
		if (users[data.id_to]) {
			io.sockets.connected[users[data.id_to]].emit('chat', data)
		}
	})
	socket.on('auth', id => {
		users[id] = socket.id
		console.log('users are', users)
	})
	socket.on('logout', id => {
		// socket.disconnect()
		delete users[`${id}`]
		console.log('user logged out --> ', id)
	})
	socket.on('disconnect', () => {
		console.log('non identified Client disconnected')
		for (let key of Object.keys(users)) {
			if (users[key] === socket.id) {
				delete users[key]
				console.log('Client disconnected --> ', socket.id)
				socket.disconnect( )
			}
		}
	})
})

server.listen(port, () => console.log(`The server has started on port -> ${port}`))
