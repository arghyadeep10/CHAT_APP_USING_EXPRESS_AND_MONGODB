// npm and core Module Imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatItemSchema = Schema({
    username1:{
        type:String,
        required: true
    },
    username2:{
        type:String,
        required: true
    },
    message:{
        type:String,
        required: true
    },
    sendFileName:{
        type:String,
    }
}, {timestamps: true});

const ChatItem = mongoose.model('chat_item', chatItemSchema);

module.exports = ChatItem;