const User = require('../models/user');

const { validationResult} = require('express-validator/check')

const jwt = require('jsonwebtoken')

const bcrypt = require('bcryptjs')


exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    bcrypt.hash(password, 12).then(hashedpass => {
        const user = new User({
           email: email,
           password: hashedpass,
           name: name 
        });
        return user.save();
    }).then(result => {
        res.status(201).json({message: 'User created', userId: result._id})
    }).catch(err => {
        if(!error.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    })
    
}

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    User.findOne({email: email}).then(user => {
        if (!user) {
            const error = new Error('user does not exist')
            error.statusCode = 401;
            throw error;
        }
        loadedUser = user;
       return bcrypt.compare(password, user.password)
    }).then(isEqual => {
        if (!isEqual) {
            const error = new Error('Wrong password');
            error.statusCode = 401;
            throw error;
        }
        //generate JSON web Token
        const token = jwt.sign({email: loadedUser.email, userId: loadedUser._id.toString()}, 'somesupersecret', {expiresIn: '1h'}) //sign creates a new signature
        res.status(200).json({token: token, userId: loadedUser._id.toString()})
    }).catch(err => {
        console.log(err)
        if(!error.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    })
}