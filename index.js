const express = require('express')
const cors = require('cors')
const mysql = require('mysql2/promise')
const app = express()
const fs = require('fs')
const bcrypt = require('bcrypt')
const { application } = require('express')
const saltRounds = 10

app.use(express.json())
app.use(cors())

app.get('/randomText', async (req, res) => {
    const connection = await mysql.createConnection({
        host: 'database-3.cjzvwuop4vpy.ap-northeast-2.rds.amazonaws.com',
        user: 'admin',
        password: 'rjHD2DB?WDHj6BDD$t&8EfJ8NTnbzGD9!=_Tp6Fdq',
        database: 'typing',
    })
    const idx1 = req.query.text
    const idx2 = req.query.nextText
    let result = false

    const db = await connection.execute(
        'SELECT `text` FROM `typing`.`exText` WHERE  `idx` IN (?,?)',
        [idx1, idx2]
    )
    // const ndb = await connection.execute(
    //     'SELECT * FROM `typing`.`exText` WHERE  `idx`= ?',
    //     [nextRandomNumber]
    // )
    result = true
    let target = db[0][0]
    let nextTarget = db[0][1]
    if (idx1 > idx2) {
        target = db[0][1]
        nextTarget = db[0][0]
    }
    const text = target.text
    const nextText = nextTarget.text
    console.log(text, nextText)

    res.send({ success: result, text: text, nextText: nextText, nextIdx: idx2 })
})

app.post('/exText', async (req, res) => {
    const connection = await mysql.createConnection({
        host: 'database-3.cjzvwuop4vpy.ap-northeast-2.rds.amazonaws.com',
        user: 'admin',
        password: 'rjHD2DB?WDHj6BDD$t&8EfJ8NTnbzGD9!=_Tp6Fdq',
        database: 'typing',
    })
    const text = req.body.text
    let result = false

    const db = await connection.execute(
        'INSERT INTO `typing`.`exText` (`text`) VALUES (?)',
        [text]
    )
    result = true

    res.send({ success: result })
})

app.listen(3712)
