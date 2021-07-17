
const {validationResult} = require('express-validator/check') //for getting the validation result
const User = require('../models/user')
const Post = require('../models/post');

const fs = require('fs')

const path = require('path');
const io = require('../socket')



exports.getStatus = (req, res, next) => {
    // if(!errors.isEmpty()) {
    //     const error = new Error('Validation failed, entered data is incorrect.');
    //     error.statusCode = 422;
    //     throw error;
    // }
    User.findById(req.userId).then(result => {
    
        res.status(200).json({message: 'Fetched status successfully',
        status: result.status})
    }).catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
        
    })
      
}

exports.updateStatus = (req, res, next) => {
    const statusTitle = req.body.statusTitle
    User.findById(req.userId).then(user => {
        user.status = statusTitle
        return user.save()
    }).then(result => {
        console.log(result)
        res.status(201).json({meessage: 'status update successful'})
    }).catch(err => {
        if(!err.status) {
            err.statusCode = 500;
        }
        next(err)
    })
}

exports.getPosts = async (req, res, next) => {

    // const currentPage = req.query.page || 1; // to get the currentPage extract the page no from the query. this set from the frontend
    // const perPage = 2; //number of posts you want perPage
    // let totalItems;
    // Post.find().countDocuments().then(count => {
    //     totalItems = count;
    //   return  Post.find().skip((currentPage - 1) * perPage).limit(perPage)
    // }).then(posts => {
 
    //     res.status(200).json({message: 'Fetched Posts successfully',
    //      posts: posts,
    //      totalItems: totalItems})
    // }).catch(err => {
    //     if(!err.statusCode) {
    //         err.statusCode = 500;
    //     }
    //     next(err);
        
    // })

    // using async await
    const currentPage = req.query.page || 1
    const perPage = 2;
    try {
        const totalItems = await Post.find().countDocuments()
        const posts = await Post.find().populate("creator").sort({createdAt: -1}).skip((currentPage - 1) * perPage).limit(perPage)
        
        res.status(200).json({
            message:"fetched posts succesfully",
            posts: posts,
            totalItems: totalItems
        })
    } catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    }
};

exports.createPost = async (req, res, next) => {
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
    // post.save().then(result => {
    //     return User.findById(req.userId)
    // }).then(user => {
    //     console.log(user)
    //     console.log(req.userId)
    //     creator = user
    //     console.log(creator)
    //     user.posts.push(post);
    //     return user.save()
    //  }).then (result => {
    //     console.log(creator)
    //     res.status(201).json({
    //         message: 'Post created successfully',
    //         post: post,   
    //         creator: {_id: creator._id, name: creator.name}
    // })
    // }).catch(err => {
    //     if(!err.statusCode) {
    //         err.statusCode = 500;
    //     }
    //     next(err);
    // })//save method from mongoose
    // //Create post in db

    //using async await
     try {
         await post.save()
         const user = await User.findById(req.userId)
         const creator = user
         user.posts.push(post)
         await user.save()
         io.getIo().emit('posts', {
             action: 'create',
             post: {...post._doc, creator: {_id: req.userId, name: user.name}}
         }) //send a message to all connected users, send to all connected clients whenever a posts is created anywhere(from any other user)
         res.status(201).json({
             message: "post created", 
             post: post,
             creator: {_id: creator._id, name: creator.name}
         })

     } catch(err) {
        if(!err.statusCode) {
               err.statusCode = 500;
               }
                next(err);
     }
}; 

exports.getPost = async (req, res, next) => {
   const postId = req.params.postId;
//    Post.findById(postId).then(post => {
//         if(!post) {
//             const error = new  Error('Could not find post')
//             error.statusCode = 404;
//             throw error;
//         }
//        res.status(200).json({
//            messages: "Post fetched",
//            post: post
//        })
//    }).catch(err => {
//     if(!err.statusCode) {
//         err.statusCode = 500;
//     }
//     next(err);
//    })
 try {
     const post = await Post.findById(postId)
     if(!post) {
         const error = new Error('Could not find post')
         error.statusCode = 404;
         throw error
     }
     res.status(200).json({
         message: "Post fetched",
         post: post
     })

 } catch(err) {
     if(!err.statusCode) {
         err.statusCode = 500;
     }
     next(err)

 }
};  //for getting a single post

// exports.updatePost = async (req, res, next) => {
//     const postId = req.params.postId;
//     const title = req.body.title;
//     const content = req.body.content;
//     let imageUrl = req.body.image;
//     const errors = validationResult(req);
//     if(!errors.isEmpty()) {
//         const error = new Error('Validation failed, entered data is incorrect.');
//         error.statusCode = 422;
//         throw error;
//     }

//     if(req.file) {
//         imageUrl = req.file.path; //if a new image is selected;
//         console.log(req.file)
//     }
//     if(!imageUrl) {
//         const error = new Error('No file picked')
//         error.statusCode = 422;
//         throw error;
//     }
//     // Post.findById(postId).then(post => {
//     //     if(!post) {
//     //         const error = new Error('Could not find post.');
//     //         error.statusCode = 422;
//     //         throw error;
//     //     }
//     //     if(post.creator.toString() !== req.userId) {
//     //         const eroor = new Error('Not authorized')
//     //         error.statusCode = 403;
//     //         throw error;
//     //     }
//     //     if(imageUrl !== post.imageUrl) {
//     //         clearImage(post.imageUrl)
//     //     }
//     //     post.title = title;
//     //     post.imageUrl = imageUrl;
//     //     post.content = content;
//     //     return post.save().then(result => {
//     //         res.status(200).json({message: 'Post updated', post: result})
//     //     })
//     // }).catch(err => {
//     //     console.log(err)
//     //     if(!err.statusCode) {
//     //         err.statusCode = 500;
//     //     }
//     //     next(err);
//     // })
//     try {
//         const post = await Post.findById(postId).populate('creator');
//         if(!post) {
//             const error = new Error('could not find post.');
//             error.statusCode = 422;
//             throw error;
//         }
//        if(post.creator._id.toString() !== req.userId) {
//            const error = new Error('Not authorized')
//            error.statusCode = 403;
//            throw error;
//         }
//       if(imageUrl !== post.imageUrl) {
//           clearImage(post.imageUrl)
//       }
//       post.title = title;
//       post.imageUrl = imageUrl;
//       post.content = content;
//       const result = await post.save()
//       io.getIo('posts', {action: 'update', post: result})
//       res.status(200).json({message: 'Post updated', post: result})
   
//     } catch(err) {
//         if(!err.statusCode) {
//             err.statusCode = 500;
//         }
//         next(err)
//     }
// };

exports.updatePost = async (req, res, next) => {
    const postId = req.params.postId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed, entered data is incorrect.');
      error.statusCode = 422;
      throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    if (req.file) {
      imageUrl = req.file.path;
    }
    if (!imageUrl) {
      const error = new Error('No file picked.');
      error.statusCode = 422;
      throw error;
    }
    try {
      const post = await Post.findById(postId).populate('creator');
      if (!post) {
        const error = new Error('Could not find post.');
        error.statusCode = 404;
        throw error;
      }
      if (post.creator._id.toString() !== req.userId) {
        const error = new Error('Not authorized!');
        error.statusCode = 403;
        throw error;
      }
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;
      const result = await post.save();
      io.getIo().emit('posts', { action: 'update', post: result });
      res.status(200).json({ message: 'Post updated!', post: result });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };
  

exports.deletePost = async (req, res, next) => {
    const postId = req.params.postId
    // Post.findById(postId).then(post => {
    //     console.log(post)
    //     //check logged in user
    //     if(!post) {
    //         const error = new Error('Could not find post.');
    //         error.statusCode = 422;
    //         throw error;
    //     }
    //     if(post.creator.toString() !== req.userId) {
    //         const error = new Error('error validating user')
    //         error.statusCode = 422;
    //         throw error;
    //     }

    //     clearImage(post.imageUrl)
    //     return Post.findByIdAndRemove(postId)

    // }).then(result => {
    //    return User.findById(req.userId)
    // }).then(user => {
    //     user.posts.pull(postId) // to clear dlleted post and user relation
    //     return user.save()
    // }).then(result => {
    //     res.status(200).json({message: 'deleted Post.'})
    // }).catch(err => {
    //     console.log(err)
    //     if(!err.statusCode) {
    //         err.statusCode = 500;
    //     }
    //     next(err);
    // })
    try {
        const post = await Post.findById(postId)
        if(!post) {
            const error = new Error("Could not find post.");
            error.statusCode = 422;
            throw error;
        }
         if(post.creator.toString() !== req.userId) {
            const error = new Error('error validating user')
            error.statusCode = 422;
            throw error;
        }

        clearImage(post.imageUrl)
        await Post.findByIdAndRemove(postId)
        const user = await User.findById(req.userId)
        user.posts.pull(postId)
        await user.save()
        io.getIo().emit('posts', { action: 'delete', post: post });
        res.status(200).json({message: 'deleted Post.'})
    } catch(err) {
        console.log(err)
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath)
    fs.unlink(filePath, err => console.log(err))
}


// exports.getStatus = () => {
//     User.findById(req.userId).then(result => {
//         status = result.status
//     }).catch(err => {
//         console.log(err)
//         if(!err.statusCode) {
//             err.statusCode = 500;
//         }
//         next(err);
//     })
// }