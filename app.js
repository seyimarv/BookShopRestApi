const express = require('express'); //import express

const path = require('path')

const bodyParser = require('body-parser')  //import body-parser

const mongoose = require('mongoose') //importing mongoose

const multer = require('multer'); //for file storage

const feedRoutes = require('./routes/feed')  //needed to register the route
const authRoutes = require('./routes/auth');  //needed to register the route


const app = express(); //create the express app.

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || 
    file.mimetype === 'image/jpg' || 
    file.mimetype === 'image/jpeg') {
        cb(null, true); //if we want to store the data
    } else {
        cb(null, false); //if we dont want to store the data
    }
}

app.use(bodyParser.json()); // this is the bodyparser method which is used to parse json i.e application/json
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image')) //middleware for file upload, 'image' corresponds to the name of the input. single means it has to do with only one file
app.use('/images', express.static(path.join(__dirname, 'images')))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type, Authorization');
    next();
});  //used to solve the Cors Error to allow client(frontend) and server(backend) run on different domains

app.use('/feed', feedRoutes) // /feed is added to filter rewuests that start with 'feed'
app.use('/auth', authRoutes) // /feed is added to filter rewuests that start with 'auh'

app.use((error, req, next) => {
    console.log(error)
    const status = error.statusCode || 500
    const message = error.message;
    const data = error.data
    res.status(status).join({message: message, data: data})

}) //the speaciall error handling middleware

mongoose.connect('mongodb+srv://Marvelous:Tomilayo1@cluster0.yopfs.mongodb.net/messages')
.then(result => {
    const server = app.listen(8080)
    const io = require('./socket').init(server
    ); //setting up socket.io conection
    io.on('connection', socket => {
        console.log('Client connected')
    });
}).catch(err => {
    console.log(err)
})//establish a mongoose connection

// app.listen(8080); //listen to incoming request on the specified port.