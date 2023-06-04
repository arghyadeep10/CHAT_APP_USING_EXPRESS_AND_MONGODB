// npm and core Module Imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = Schema({
    username:{
        type:String,
        required: true,
        unique: true
    },
    email:{
        type:String,
        required: true,
        unique: true
    },
    name:{
        type:String,
        required: true,
        unique: true
    },
    password:{
        type:String,
        required: true,
        unique: true
    },
    salt:{
        type:String,
        required: true,
        unique: true
    }
}, {timestamps: true});

const User = mongoose.model('user', userSchema);

module.exports = User;