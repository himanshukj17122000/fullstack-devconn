const express = require('express')
const {
    check,
    validationResult
} = require('express-validator')
const auth = require('../../../middleware/auth')
const router = express.Router()
const User = require('../../../models/User')
const Profile = require('../../../models/Profile')
const Post = require('../../../models/Post')

//@route POST api/posts
//@access private
router.post('/', [auth, [
    check('text', 'Text is required').not().isEmpty()

]], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).send({
            errors: errors.array()
        })
    }

    try {
        const user = await User.findById(req.user.id).select('-password')
        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        })

        const post = await newPost.save()
        res.json(post)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server Error')
    }
})


//@route GET api/posts
//@access private
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({
            date: -1
        })
        res.json(posts)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server Error')
    }
})


//@route GET api/posts/:post_id
//@access private
router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post) {
            return res.status(404).json({
                msg: 'Post not found'
            })
        }
        res.json(post)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server Error')
    }
})


//@route DELETE api/posts/:post_id
//@access private

router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({
                msg: 'User not authorized'
            })
        }
        await post.remove()
        res.json({
            msg: 'Post Removed'
        })
        if (!post) {
            return res.status(404).json({
                msg: 'Post not found'
            })
        }
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server Error')
    }
})



//@route PUT api/posts/like/:id
//@access private
router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({
                msg: 'Post already liked!'
            })
        }

        post.likes.unshift({
            user: req.user.id
        })

        await post.save()
        res.json(post.likes)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server Error')
    }
})

//@route PUT api/posts/unlike/:id
//@access private
router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({
                msg: 'Post has not been liked!'
            })
        }

        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id)
        post.likes.splice(removeIndex, 1)
        await post.save()
        res.json(post.likes)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server Error')
    }
})

//@route POST api/comment/:id
//@access private
router.post('/comment/:id', [auth, [
    check('text', 'Text is required').not().isEmpty()

]], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).send({
            errors: errors.array()
        })
    }

    try {
        const user = await User.findById(req.user.id).select('-password')
        const post = await Post.findById(req.params.id)
        const newComment = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        }
        post.comments.unshift(newComment)
        await post.save()
        res.json(post)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server Error')
    }
})


//@route DELETE api/comment/:id/:comment_id
//@access private

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {

    try {
        const post = await Post.findById(req.params.id)
        const newComment = post.comments.find(comment => comment.id === req.params.comment_id)
        if (!newComment) {
            return res.status(404).json({
                msg: 'Comment not found'
            })
        }
        if (newComment.user.toString() !== req.user.id) {
            return res.status(401).json({
                msg: 'User not authorized'
            })
        }
        const removeIndex = await post.comments.map(comment => comment.user.toString()).indexOf(req.params.comment_id)
        post.comments.splice(removeIndex, 1)
        await post.save()
        res.json(post.comments)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server Error')
    }
})

module.exports = router