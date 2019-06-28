require('dotenv').config()
const bodyParser = require('body-parser')
const express = require('express')
const cors = require('cors')
const path = require('path')
const http = require('http')
const socketIo = require('socket.io')
const port = process.env.PORT || 8080
const app = express()
const passport = require('passport')
const pool = require('./utility/database')
const ejs = require('ejs')

app.use(passport.initialize())

app.use(cors())

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.set('view engine', 'ejs')

app.use('/auth', require('./routes/api/auth'))
app.use('/api/action', require('./routes/api/actions'))
app.use('/api/chat', require('./routes/api/chat'))
app.use('/api/notif', require('./routes/api/notif'))
app.use('/api/users', require('./routes/api/users'))
app.use('/uploads', express.static(`${__dirname}/uploads`))
app.use(express.static(`${__dirname}/public`))

app.get(/.*/, (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')))

const server = http.createServer(app)

const io = socketIo(server, { pingInterval: 10, pingTimeout: 4000 })

let users = {}

io.on('connection', socket => {
	socket.on('chat', data => {
		const id = users[data.id_to]
		if (id) io.sockets.connected[id].emit('chat', data)
	})
	socket.on('typing', data => {
		const id = users[data.id_to]
		if (id) io.sockets.connected[id].emit('typing', data)
	})
	socket.on('seenConvo', data => {
		const id = users[data.user]
		if (id) io.sockets.connected[id].emit('seenConvo', data.convo)
	})
	socket.on('match', data => {
		const id = users[data.id_to]
		if (id) io.sockets.connected[id].emit('match', data)
	})
	socket.on('visit', data => {
		const id = users[data.id_to]
		if (id) io.sockets.connected[id].emit('visit', data)
	})
	socket.on('block', data => {
		const id = users[data.id_to]
		if (id) io.sockets.connected[id].emit('block', data.id_from)
	})
	socket.on('auth', id => {
		users[id] = socket.id
		io.emit('online', Object.keys(users))
	})
	socket.on('logout', id => {
		try {
			const sql = `UPDATE users SET status = NOW() WHERE id = ?`
			pool.query(sql, [id])
		} catch (err) {
			console.log('Got error here -->', err)
		}
		delete users[id]
		io.emit('out', Object.keys(users))
	})
	socket.on('disconnect', () => {
		for (let key of Object.keys(users)) {
			if (users[key] === socket.id) {
				try {
					const sql = `UPDATE users SET status = NOW() WHERE id = ?`
					pool.query(sql, [key])
				} catch (err) {
					console.log('Got error here -->', err)
				}
				delete users[key]
				io.emit('online', Object.keys(users))
				socket.disconnect()
			}
		}
	})
})

server.listen(port, () => console.log(`The server has started on port -> ${port}`))
