const mongoose = require('mongoose')
const Schema = mongoose.Schema

const postSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    } //storing refernce to a user
}, {timestamps: true});
//the second arguement i.e the object that contains timestamp allows mongodb to  add timestamp whena new onject is added to the database


module.exports = mongoose.model('Post', postSchema)