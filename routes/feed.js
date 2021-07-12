const express = require('express')

const { body } = require('express-validator/check') //for validation

const feedController = require('../controllers/feed')

const isAuth = require('../middleware/is-auth')

const router = express.Router() //set up express router.


//GET /feed/posts
router.get('/posts', isAuth, feedController.getPosts)

//Post /feed/post
router.post('/post', isAuth, [
  body('title').trim().isLength({min: 5 }),
  body('content').trim().isLength({min: 5})
], feedController.createPost)

//GET for single posts
router.get('/post/:postId', isAuth, feedController.getPost)

router.put('/post/:postId', isAuth, [
  body('title').trim().isLength({min: 5 }),
  body('content').trim().isLength({min: 5})
], feedController.updatePost );

router.delete('/post/:postId', isAuth, feedController.deletePost)

module.exports = router;