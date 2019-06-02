require('dotenv').config()
const bodyParser = require('body-parser')
const express = require('express')
const cors = require('cors')
const path = require('path')
const http = require('http')
const socketIo = require('socket.io')
const port = process.env.PORT || 8080
const usersRoute = require('./routes/api/users')
const app = express()


app.use(cors())


app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use('/api/users', usersRoute)
app.use('/static', express.static(`${__dirname}/public`))

app.get(/.*/, (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')))

const server = http.createServer(app)


const io = socketIo(server, { pingInterval: 10, pingTimeout: 4000 })

let users = {}

io.on('connection', socket => {
	console.log('New client connected --> ', socket.id)
	socket.on('chat', data => {
		if (users[data.to])
			io.sockets.connected[users[data.to]].emit('chat', data)
	})
	socket.on('auth', id => {
		users[id] = socket.id
		console.log('users are', users)
	})
	socket.on('logout', () => {
		socket.disconnect()
	})
	socket.on('disconnect', () => {
		for (let key of Object.keys(users)) {
			if (users[key] === socket.id) {
				delete users[key]
				console.log('Client disconnected --> ', socket.id)
				socket.disconnect()
			}
		}
	})
})

server.listen(port, () => console.log(`The server has started on port -> ${port}`))
