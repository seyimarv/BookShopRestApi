const {validationResult} = require('express-validator/check') //for getting the validation result
const User = require('../models/user')
const Post = require('../models/post');

const fs = require('fs')

const path = require('path')

exports.getPosts = (req, res, next) => {

    const currentPage = req.query.page || 1; // to get the currentPage extract the page no from the query. this set from the frontend
    const perPage = 2; //number of posts you want perPage
    let totalItems;
    Post.find().countDocuments().then(count => {
        totalItems = count;
      return  Post.find().skip((currentPage - 1) * perPage).limit(perPage)
    }).then(posts => {
        console.log(posts)
        res.status(200).json({message: 'Fetched Posts successfully',
         posts: posts,
         totalItems: totalItems})
    }).catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
        
    })
};

exports.createPost = (req, res, next) => {
    console.log(req.userId)
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }
    const image = req.file
    console.log(req.file)
    if(!image) {
        const error = new Error('No image provided.')
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = image.path;
    let creator;

     const post = new Post({
        title: title, 
        content: content, 
        imageUrl: imageUrl,
        creator: req.userId,
    })
    post.save().then(result => {
        return User.findById(req.userId)
    }).then(user => {
        console.log(user)
        console.log(req.userId)
        creator = user
        console.log(creator)
        user.posts.push(post);
        return user.save()
     }).then (result => {
        console.log(creator)
        res.status(201).json({
            message: 'Post created successfully',
            post: post,   
            creator: {_id: creator._id, name: creator.name}
    })
    }).catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })//save method from mongoose
    //Create post in db
};

exports.getPost = (req, res, next) => {
   const postId = req.params.postId;
   Post.findById(postId).then(post => {
        if(!post) {
            const error = new  Error('Could not find post')
            error.statusCode = 404;
            throw error;
        }
       res.status(200).json({
           messages: "Post fetched",
           post: post
       })
   }).catch(err => {
    if(!err.statusCode) {
        err.statusCode = 500;
    }
    next(err);
   })
};  //for getting a single post

exports.updatePost = (req, res, next) => {
    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }

    if(req.file) {
        imageUrl = req.file.path; //if a new image is selected;
        console.log(req.file)
    }
    if(!imageUrl) {
        const error = new Error('No file picked')
        error.statusCode = 422;
        throw error;
    }
    Post.findById(postId).then(post => {
        if(!post) {
            const error = new Error('Could not find post.');
            error.statusCode = 422;
            throw error;
        }
        if(post.creator.toString() !== req.userId) {
            const eroor = new Error('Not authorized')
            error.statusCode = 403;
            throw error;
        }
        if(imageUrl !== post.imageUrl) {
            clearImage(post.imageUrl)
        }
        post.title = title;
        post.imageUrl = imageUrl;
        post.content = content;
        return post.save().then(result => {
            
            res.status(200).json({message: 'Post updated', post: result})
        })
    }).catch(err => {
        console.log(err)
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
};

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId
    Post.findById(postId).then(post => {
        console.log(post)
        //check logged in user
        if(!post) {
            const error = new Error('Could not find post.');
            error.statusCode = 422;
            throw error;
        }
        if(post.creator.toString() !== req.userId) {
            const eroor = new Error('error validating user')
            error.statusCode = 422;
            throw error;
        }

        clearImage(post.imageUrl)
        return Post.findByIdAndRemove(postId)

    }).then(result => {
       return User.findById(req.userId)
    }).then(user => {
        user.posts.pull(postId) // to clear dlleted post and user relation
        return user.save()
    }).then(result => {
        res.status(200).json({message: 'deleted Post.'})
    }).catch(err => {

    })
}

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath)
    fs.unlink(filePath, err => console.log(err))
}
