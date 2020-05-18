const express = require('express');
const User = require('../../../models/User');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const auth = require('../../../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const {
    check,
    validationResult
} = require('express-validator');
const router = express.Router();
const {
    sendEmail
} = require('../../emails/accounts');
const path = require('path');
//@route POST api/users
//@access public
router.post(
    '/',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check(
            'password',
            'Please enter a password with 6 or more characters'
        ).isLength({
            min: 6,
        }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
            });
        }
        const {
            name,
            email,
            password
        } = req.body;
        try {
            let user = await User.findOne({
                email,
            });

            if (user) {
                return res.status(400).json({
                    errors: [{
                        msg: 'User already exists!',
                    }, ],
                });
            }

            //see if the user exists

            //get users gravatar

            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm',
            });

            user = new User({
                name,
                email,
                password,
                avatar,
            });
            //encrypt password

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();
            sendEmail(user.email, user.name);
            //return jsonwebtoken
            const payload = {
                user: {
                    id: user.id,
                },
            };

            jwt.sign(
                payload,
                process.env.jwtSecret, {
                    expiresIn: 360000,
                },
                (err, token) => {
                    if (err) throw err;
                    res.json({
                        token,
                    });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, path.join(__dirname, '/uploads/'));
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + file.originalname);
//     },
// });

// const fileFilter = (req, file, cb) => {
//     if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
//         return cb(null, false);
//     }
//     return cb(null, true);
// };

// const upload = multer({
//     storage: storage,
//     limits: {
//         fileSize: 1024 * 1024 * 5,
//     },
//     fileFilter: fileFilter,
// });

// /* 
//     stores image in uploads folder
//     using multer and creates a reference to the 
//     file
// */
// router
//     .route('/avatar')
//     .put(upload.single('imageData'), auth, async (req, res, next) => {
//         const avatar = req.file.path

//     try {
//         const user = await User.findById(req.user.id);
//         user.avatar = avatar;
//         await user.save();
//         res.json(user);
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send('Server Error');
//     }
// });

/*
    upload image in base64 format, thereby,
    directly storing it in mongodb datanase
    along with images uploaded using firebase
    storage
*/
router.route("/avatar")
    .put(auth, async (req, res, next) => {
        try {
            const user = await User.findById(req.user.id);
            user.avatar = req.body.avatar;
            await user.save();
            res.json(user);
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server Error');
            next(error)
        }
    });


module.exports = router;