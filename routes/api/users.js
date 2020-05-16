const express = require('express')
const User = require('../../../models/User')
const gravatar = require('gravatar')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const config = require('config')
const {
    check,
    validationResult
} = require('express-validator')
const router = express.Router()

//@route POST api/users
//@access public
router.post('/', [
    check('name', 'Name is required').not().isEmpty(), check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({
        min: 6
    })
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        })
    }
    const {
        name,
        email,
        password
    } = req.body
    try {
        let user = await User.findOne({
            email
        })

        if (user) {
            return res.status(400).json({
                errors: [{
                    msg: 'User already exists!'
                }]
            })
        }

        //see if the user exists

        //get users gravatar

        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })

        user = new User({
            name,
            email,
            password,
            avatar
        })
        //encrypt password

        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(password, salt)
        await user.save()

        //return jsonwebtoken
        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, config.get('jwtSecret'), {
            expiresIn: 360000
        }, (err, token) => {
            if (err) throw err
            res.json({
                token
            })
        })
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server error')
    }


})

module.exports = router