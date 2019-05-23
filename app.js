const bodyParser = require('body-parser')
const express = require('express')
// const mysql = require('mysql')
const cors = require('cors')
const path = require('path')
const users = require('./routes/api/users')
const port = process.env.PORT || 8080
const app = express()

app.use(cors())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/api/users', users)

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')))

app.listen(port, () => console.log('the server has started'))
