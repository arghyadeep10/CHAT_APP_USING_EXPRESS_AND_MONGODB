// npm and core Module Imports
const exp = require('constants');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const socket = require('socket.io');

// Package Module Imports
const mongodb_connection_info = require('./mongodb_connection_info.json');
const networking = require('./networking.json');
const router = require('./router');
const ChatItem = require('./chat_item_model');
const ChatRoomItem = require('./chat_room_item_model');

// Create an express app instance
const app = express();

function app_main(){
    console.log("Connected to database successfully");

    const server = app.listen(networking.port, ()=>{
        console.log("Server started and listenning for requests at Port: " + server.address().port);
    });

    app.set('view engine', 'ejs');
    app.use(express.static('public'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(morgan('dev'));
    app.use(session({secret: "SECRET"}));
    app.use(cookieParser());
    app.use('/', router);

    // Socket Setup
    // returns a socket.io object. The constructor needs the server that we are going to work with
    // so we pass the server object
    const io = socket(server); 

    // the io object will now we be running and waiting in the server
    // waiting for some client to connect with it
    // as soon as a client connects with it, it will create a unique socket object 
    // that represents that particular client
    // io.on() will look for an event and this event's type is 'connection'
    io.on('connection', (socket) => {
        // every socket object also has an id
        console.log('Made socket connection with socket.id = ' + socket.id);

        // now listen for event emissions from client end
        socket.on('chat-message', (data) => {
            console.log("Received data from a client. Its a new chat-message.");
            console.log("handle = " + data.handle);
            console.log("message = " + data.message);
            console.log("intendedReceiver = " + data.intendedReceiver);
            // we now need to receive the data we sent from client end
            // data is the data object that we received from this client
            // what we now want to do is to emit this message / data to all other client sockets out there
            io.sockets.emit('chat-message', data);
            console.log("chat-message emitted to all other clients");
            // Add this message to db
            const chat_item = ChatItem({
                username1: data.handle,
                username2: data.intendedReceiver,
                message: data.message
            });
            chat_item.save();
        });

        socket.on('room-chat-message', (data) => {
            console.log("Received data from a client. Its a new chat-message.");
            console.log("handle = " + data.handle);
            console.log("message = " + data.message);

            // we now need to receive the data we sent from client end
            // data is the data object that we received from this client
            // what we now want to do is to emit this message / data to all other client sockets out there
            io.sockets.emit('room-chat-message', data);
            console.log("room-chat-message emitted to all other clients");
            // Add this message to db
            const chat_room_item = ChatRoomItem({
                username: data.handle,
                message: data.message
            });
            chat_room_item.save();
        });

        // now listen for event emissions from client end
        socket.on('chat-file-send', (data) => {
            console.log("Received data from a client. Its a new chat-file-send.");
            console.log("handle = " + data.handle);
            console.log("sendFileName = " + data.sendFileName);
            console.log("intendedReceiver = " + data.intendedReceiver);
            // we now need to receive the data we sent from client end
            // data is the data object that we received from this client
            // what we now want to do is to emit this message / data to all other client sockets out there
            io.sockets.emit('chat-file-send', data);
            console.log("chat-file-send emitted to all other clients");
            let current_filename = data.sendFileName;
            let actual_filename = "";
            let j = -1;
            for(let i=0; i<current_filename.length; i++){
                if(current_filename[i] == '_'){
                    j = i+1;
                    break;
                }
            }
            for(let k=j; k<current_filename.length; k++){
                actual_filename += current_filename[k];
            }
            const default_string = "File Sent: " + actual_filename;
            // Add this message to db
            const chat_item = ChatItem({
                username1: data.handle,
                username2: data.intendedReceiver,
                message: default_string,
                sendFileName: data.sendFileName
            });
            chat_item.save();
        });

        // now listen for event emissions from client end
        socket.on('room-chat-file-send', (data) => {
            console.log("Received data from a client. Its a new room-chat-file-send.");
            console.log("handle = " + data.handle);
            console.log("sendFileName = " + data.sendFileName);
            // we now need to receive the data we sent from client end
            // data is the data object that we received from this client
            // what we now want to do is to emit this message / data to all other client sockets out there
            io.sockets.emit('room-chat-file-send', data);
            console.log("room-chat-file-send emitted to all other clients");
            let current_filename = data.sendFileName;
            let actual_filename = "";
            let j = -1;
            for(let i=0; i<current_filename.length; i++){
                if(current_filename[i] == '_'){
                    j = i+1;
                    break;
                }
            }
            for(let k=j; k<current_filename.length; k++){
                actual_filename += current_filename[k];
            }
            const default_string = "File Sent: " + actual_filename;
            // Add this message to db
            const chat_room_item = ChatRoomItem({
                username: data.handle,
                message: default_string,
                sendFileName: data.sendFileName
            });
            chat_room_item.save();
        });

        //now listen for event emissions for typing-message
        socket.on('typing-message', (data) => {
            console.log("Person typing is: " + data.handle);
            socket.broadcast.emit('typing-message', data);
        });

        //now listen for event emissions for typing-message
        socket.on('room-typing-message', (data) => {
            console.log("Person typing is: " + data.handle);
            socket.broadcast.emit('room-typing-message', data);
        });
    });
}

// Connect to mongodb - auto create a databse inside mongodb (if it doesn't exist)
const words = __dirname.split('/');
connection_uri = mongodb_connection_info.connection_uri + '/' + words[words.length-1];
mongoose.connect(connection_uri, {
    useNewUrlParser: true,
	useUnifiedTopology: true
}).then((result) => {
    app_main();
}).catch((err) => {
    console.log("Error connecting with database - Ensure that you have started your Mongo DB Local server. This can be done using: ");
    console.log("$ sudo systemctl start mongod");
    console.log("Then check status using: ");
    console.log("$ sudo systemctl status mongod");
});
