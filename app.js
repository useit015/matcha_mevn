const bodyParser = require('body-parser')
const express = require('express')
const mysql = require('mysql')
const cors = require('cors')
const path = require('path')
const port = process.env.PORT || 8080

const db = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '0O*ussama',
	database: 'slim'
})

db.connect((err) => {
    if(err){
        throw err;
    }
    console.log('MySql Connected...');
});

const app = express()

app.use(cors())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')))

app.get('/api/users', (req, res) => {
	db.query('SELECT * FROM users, images WHERE users.id = images.user_id AND images.profile = 1', (err, rows, fields) => {
		if (err) throw err
		res.json(rows)
	})
})

app.listen(port, () => console.log('the server has started'))
