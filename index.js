const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const mysql = require('mysql2/promise')
const app = express()
const fs = require('fs')
const bcrypt = require('bcrypt')
// const busboy = require('busboy')
// const bcryptjs = requaire('bcryptjs')
const { application } = require('express')
const saltRounds = 10
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

app.use(express.json())
app.use(cors())

app.get('/randomText', async (req, res) => {
    const connection = await mysql.createConnection({
        host: process.env.DE_HOST,
        user: process.env.DE_USER,
        password: process.env.DE_PASSWORD,
        database: process.env.DE_DATABASE,
    })
    try {
        const language = req.query.language
        let result = false

        const db = await connection.execute(
            'SELECT `text` FROM `typing`.`exText` WHERE  `language` IN (?)',
            [language]
        )
        result = true
        let target = db[0][0]
        const text = target.text
        connection.destroy()
        res.send({
            success: result,
            text: text,
        })
    } catch (e) {
        res.send({
            success: false,
        })
    }
})

// const connection = await mysql.createConnection({
//     host: process.env.DE_HOST,
//     user: process.env.DE_USER,
//     password: process.env.DE_PASSWORD,
//     database: process.env.DE_DATABASE,
// })
//     console.log(req.body)
//     const text = req.body.text
//     let result = false

//     const db = await connection.execute(
//         'INSERT INTO `typing`.`exText` (`text`) VALUES (?)',
//         [text]
//     )
//     result = true
//     connection.destroy()
//     res.send({ success: result })
// })

app.get('/findall', async (req, res) => {
    let email = req.query.email
    let result = false
    const phoneNumber = req.query.tel
    const name = req.query.username

    const connection = await mysql.createConnection({
        host: process.env.DE_HOST,
        user: process.env.DE_USER,
        password: process.env.DE_PASSWORD,
        database: process.env.DE_DATABASE,
    })

    const db = await connection.execute(
        'SELECT * FROM `users`.`users` WHERE  `phoneNumber`= ? AND `name` = ?',
        [phoneNumber, name]
    )
    result = true
    const target = db[0][0]
    email = target.email
    res.send({ result, email })
})

app.get('/checktoken', function (req, res) {
    const token = req.headers['token'] // client에게서 받은 토큰
    const result = false
    /* 토큰이 없으면 403 에러 응답 처리 */
    try {
        if (!token) {
            return res.status(403).json({
                success: false,
                message: 'not logged in',
            })
        }
        /* 토큰 유효성 검사 */
        const p = new Promise((resolve, reject) => {
            jwt.verify(token, 'SeCrEtKeYfOrHaShInG', (err, decoded) => {
                if (err) reject(err)
                else resolve(decoded)
            })
        })
        /* 유효하지 않은 토큰으로 403 에러 처리 */
        const onError = (error) => {
            res.status(403).json({
                success: false,
                message: error.message,
            })
        }
        p.then((decoded) => {
            res.send(decoded.name)
        }).catch(onError)
    } catch (e) {
        res.send({ success: result })
    }
})

app.post('/login', async (req, res) => {
    let result = true
    const reqEmail = req.body.email
    const password = req.body.password
    // console.log(password, bcrypt.hashSync(password, saltRounds))
    const connection = await mysql.createConnection({
        host: process.env.DE_HOST,
        user: process.env.DE_USER,
        password: process.env.DE_PASSWORD,
        database: process.env.DE_DATABASE,
    })
    const db = await connection.execute(
        'SELECT `idx`, `email`, `password`, `name`, `phoneNumber`, `signupDate` FROM `users`.`users` WHERE  `email`= ?',
        [reqEmail]
    )
    const target = db[0][0]
    if (target == undefined || !bcrypt.compareSync(password, target.password)) {
        console.log(bcrypt.compareSync(password, target.password))
        result = false
    }
    const getToken = () => {
        return new Promise((resolve, reject) => {
            jwt.sign(
                {
                    name: `${target.name}`,
                    email: `${target.email}`,
                },

                'SeCrEtKeYfOrHaShInG', // secrec Key

                {
                    expiresIn: '7d',
                    issuer: 'inyongTest', // options
                    subject: 'userInfo',
                },

                function (err, token) {
                    if (err) reject(err)
                    // callback
                    else resolve(token)
                }
            )
        })
    }
    getToken().then((token) => {
        res.send({ token: token, result: result })
    })
})

app.post('/signup', async (req, res) => {
    const connection = await mysql.createConnection({
        host: process.env.DE_HOST,
        user: process.env.DE_USER,
        password: process.env.DE_PASSWORD,
        database: process.env.DE_DATABASE,
    })
    console.log(req.body)
    const email = req.body.email
    const password = bcrypt.hashSync(req.body.password, saltRounds)
    const phoneNumber = req.body.tel
    const name = req.body.username
    let result = false
    console.log(email, password, phoneNumber, name)
    const db = await connection.execute(
        'INSERT INTO `users`.`users` (`email`, `password`, `name`, `phoneNumber`) VALUES (?,?,?,?)',
        [email, password, name, phoneNumber]
    )
    result = true
    res.send({ success: result })
})

app.post('/fileUpload', upload.single('testfile'), async (req, res) => {
    const connection = await mysql.createConnection({
        host: process.env.DE_HOST,
        user: process.env.DE_USER,
        password: process.env.DE_PASSWORD,
        database: process.env.DE_DATABASE,
    })
    const asd = req.file
    console.log(asd)

    const data = fs.readFileSync(asd.path, 'utf8')
    console.log(data)
    const db = await connection.execute(
        'INSERT INTO `typing`.`exText` (`text`) VALUES (?)',
        [data]
    )
    result = true
    fs.unlinkSync(asd.path)
    connection.destroy()
    res.send({ success: result })
})

app.delete('/delete', async (req, res) => {
    let success = false
    let errorMsg
    const connection = await mysql.createConnection({
        host: process.env.DE_HOST,
        user: process.env.DE_USER,
        password: process.env.DE_PASSWORD,
        database: process.env.DE_DATABASE,
    })
    const reqEmail = req.body.email
    const password = req.body.password

    const db = await connection.execute(
        'SELECT * FROM `users`.`users` WHERE `email`=?',
        [reqEmail]
    )
    const target = db[0][0]
    console.log(target)

    if (target) {
        if (bcrypt.compareSync(password, target.password)) {
            await connection.execute(
                'DELETE FROM `users`.`users` WHERE `email`=?',
                [reqEmail]
            )
            success = true
        } else {
            errorMsg = '비밀번호가 잘못 됨'
        }
    } else {
        errorMsg = '해당 게시물을 찾을 수 없음'
    }
    res.send({ success, errorMsg })
})

app.put('/change', async (req, res) => {
    let success = false
    let errorMsg
    const email = req.body.email
    const reqPassword = req.body.password
    const newPasswordHash = bcrypt.hashSync(req.body.changePassword, saltRounds)

    const connection = await mysql.createConnection({
        host: process.env.DE_HOST,
        user: process.env.DE_USER,
        password: process.env.DE_PASSWORD,
        database: process.env.DE_DATABASE,
    })
    const db = await connection.query(
        'SELECT * FROM `users`.`users` WHERE  `email`= ?',
        [email]
    )

    const target = db[0][0]

    if (target) {
        if (bcrypt.compareSync(reqPassword, target.password)) {
            await connection.query(
                'UPDATE `users`.`users` SET `password`=? WHERE  `idx`=?',
                [newPasswordHash, target.idx]
            )
            success = true
        } else {
            errorMsg = '비밀번호를 잘못 입력하셨습니다. 다시 입력하여 주세요.'
        }
    } else {
        errorMsg = '잘못된 이메일 주소를 입력하셨습니다. 다시 입력하여 주세요.'
    }
    res.send({ success, errorMsg })
})

app.listen(3712)
