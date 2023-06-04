// npm and core Module Imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatRoomItemSchema = Schema({
    username:{
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

const ChatRoomItem = mongoose.model('chat_room_item', chatRoomItemSchema);

module.exports = ChatRoomItem;