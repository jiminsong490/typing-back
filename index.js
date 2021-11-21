const express = require('express')
const cors = require('cors')
const mysql = require('mysql2/promise')
const app = express()
const fs = require('fs')
const bcrypt = require('bcrypt')
const { application } = require('express')
const saltRounds = 10

const multer = require('multer')
const e = require('express')
const upload = multer({ dest: 'uploads/' })

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
    console.log(idx1)
    let result = false

    const db = await connection.execute(
        'SELECT `text` FROM `typing`.`exText` WHERE  `idx` IN (?)',
        [idx1]
    )
    result = true
    let target = db[0][0]

    const text = target.text
    connection.destroy()
    res.send({
        success: result,
        text: text,
    })
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
    connection.destroy()
    res.send({ success: result })
})

app.post('/fileUpload', upload.single('testfile'), async (req, res) => {
    const connection = await mysql.createConnection({
        host: 'database-3.cjzvwuop4vpy.ap-northeast-2.rds.amazonaws.com',
        user: 'admin',
        password: 'rjHD2DB?WDHj6BDD$t&8EfJ8NTnbzGD9!=_Tp6Fdq',
        database: 'typing',
    })
    const asd = req.file
    try {
        const data = fs.readFileSync(asd.path, 'utf8')
        console.log(data)
        const db = await connection.execute(
            'INSERT INTO `typing`.`exText` (`text`) VALUES (?)',
            [data]
        )
        result = true
        connection.destroy()
    } catch (err) {
        console.error(err)
    }

    // const fileText = function (asd, callback) {
    //     fs.readFile(asd.path, 'utf8', (err, data) => {
    //         if (err) {
    //             callback(err, null)
    //             console.log(err)
    //         } else {
    //             callback(null, data.toString())
    //             console.log(data.toString())
    //         }
    //     })
    // }

    // console.log(fileText)

    // console.log('req : ', req)
    // console.log('req.body : ', req.body)
    // console.log('req.body.file : ', req.body.file)
    // console.log('req : ', typeof req)
    // console.log('req.body : ', typeof req.body)
    // console.log('req.body.file : ', typeof req.body.file)
    // connection.destroy()

    res.send({ success: result })
})
app.listen(3712)
