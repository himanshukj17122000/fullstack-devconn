const express = require('express');
const auth = require('../../../middleware/auth');
const router = express.Router();
const Profile = require('../../../models/Profile');
const User = require('../../../models/User');
const request = require('request');
const Post = require('../../../models/Post');
const {
    cancelEmail
} = require('../../emails/accounts');
const {
    check,
    validationResult
} = require('express-validator');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: process.env.SERVICE_PROVIDER,
    auth: {
        user: process.env.SENDER,
        pass: process.env.PASSWORD
    }
});


//@route GET api/profile/me
//@access private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id,
        }).populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(400).json({
                msg: 'There is no profile set up for you',
            });
        }
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

//@route POST api/profile
//@access private
router.post(
    '/',
    [
        auth,
        [
            check('status', 'Status is required').not().isEmpty(),
            check('skills', 'Skills is required').not().isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
            });
        }

        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            linkedin,
            instagram,
        } = req.body;

        //build profile object
        const profileFields = {};
        profileFields.user = req.user.id;
        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername = githubusername;
        if (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }

        //build social object
        profileFields.social = {};
        if (youtube) profileFields.social.youtube = youtube;
        if (facebook) profileFields.social.facebook = facebook;
        if (twitter) profileFields.social.twitter = twitter;
        if (instagram) profileFields.social.instagram = instagram;
        if (linkedin) profileFields.social.linkedin = linkedin;

        try {
            let profile = await Profile.findOne({
                user: req.user.id,
            });

            if (profile) {
                //update
                profile = await Profile.findOneAndUpdate({
                    user: req.user.id,
                }, {
                    $set: profileFields,
                }, {
                    new: true,
                });

                return res.json(profile);
            }

            //create a new user
            profile = new Profile(profileFields);

            await profile.save();
            return res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

//@route GET api/profile
//@access public

router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route GET api/profile/user/:user_id
//@access public

router.get('/user/:user_id', async (req, res) => {
    try {
        const profiles = await Profile.findOne({
            user: req.params.user_id,
        }).populate('user', ['name', 'avatar']);
        if (!profiles) {
            return res.status(400).json({
                msg: 'There is no profile for this user ID',
            });
        }
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        // if (err.kind == 'ObjectId') {
        //     return res.status(400).json({
        //         msg: 'There is no profile for this user ID'
        //     })
        // }
        res.status(500).send('Server Error');
    }
});

//@route DELETE api/profile
//@access private
router.delete('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        // cancelEmail(user.email, user.name);
        const mailOptions = {
            from: 'devconnecthkj@gmail.com', // sender address
            to: user.email, // list of receivers
            subject: 'Sorry about cancelling!', // Subject line
            html: `<p>We are said that you are leaving our app, ${user.name}! Let me know the problems.</p>`, // plain text body
            replyTo: 'devconnecthkj@gmail.com'
        };
        transporter.sendMail(mailOptions, function (err, info) {
            if (err)
                console.log(err)
            else
                console.log(info);
        });
        //remove user posts
        await Post.deleteMany({
            user: req.user.id,
        });
        //remove profile
        await Profile.findOneAndRemove({
            user: req.user.id,
        });
        await User.findOneAndRemove({
            _id: req.user.id,
        });
        res.json({
            msg: 'User Removed',
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route PUT api/profile/experience
//@access private
router.put(
    '/experience',
    [
        auth,
        [
            check('title', 'Title is required').not().isEmpty(),
            check('company', 'Company is required').not().isEmpty(),
            check('from', 'From date is required').not().isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
            });
        }
        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description,
        } = req.body;
        const saveExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description,
        };

        try {
            const profile = await Profile.findOne({
                user: req.user.id,
            });

            profile.experience.unshift(saveExp);
            await profile.save();
            res.json(profile);
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server Error');
        }
    }
);

//@route DELETE api/profile/experience/:exp_id
//@access private

router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id,
        });
        const removeIndex = profile.experience
            .map(item => item.id)
            .indexOf(req.params.exp_id);
        profile.experience.splice(removeIndex, 1);
        await profile.save();
        await res.send(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route PUT api/profile/education
//@access private
router.put(
    '/education',
    [
        auth,
        [
            check('school', 'School is required').not().isEmpty(),
            check('degree', 'Degree is required').not().isEmpty(),
            check('fieldofstudy', 'Field of Study is required').not().isEmpty(),
            check('from', 'From date is required').not().isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
            });
        }
        const {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description,
        } = req.body;
        const saveExp = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description,
        };

        try {
            const profile = await Profile.findOne({
                user: req.user.id,
            });

            profile.education.unshift(saveExp);
            await profile.save();
            res.json(profile);
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server Error');
        }
    }
);

//@route DELETE api/profile/education/:edu_id
//@access private

router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id,
        });
        const removeIndex = profile.education
            .map(item => item.id)
            .indexOf(req.params.exp_id);
        profile.education.splice(removeIndex, 1);
        await profile.save();
        await res.send(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route GET api/profile/github/:username
//@access public

router.get('/github/:username', async (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${process.env.githubClientId}&client_secret=${process.env.githubClientSecret}`,
            method: 'GET',
            headers: {
                'user-agent': 'node.js',
            },
        };
        request(options, (error, response, body) => {
            if (error) console.error(error);
            if (response.statusCode !== 200) {
                return res.status(404).send({
                    msg: 'No github profile found',
                });
            }

            res.json(JSON.parse(body));
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;