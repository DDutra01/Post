const mongoose = require ('mongoose')
const Schema = mongoose.Schema

const User = {
    nome:{
        type: String,
        require: true
    },
    email:{
        type: String,
        require: true
    },
    eAdmin: {
        type: Number,
        default: 0
    },
    password:{
        type: String,
        require: true
    }
}

mongoose.model('user', User)