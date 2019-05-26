const bodyParser = require('body-parser')
const express = require('express')
const cors = require('cors')
const path = require('path')
const users = require('./routes/api/users')
const port = process.env.PORT || 8080
const app = express()

app.use(cors())

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use('/api/users', users)
app.use('/static', express.static(`${__dirname}/public`))

app.get(/.*/, (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')))

app.listen(port, () => console.log(`The server has started on port -> ${port}`))
