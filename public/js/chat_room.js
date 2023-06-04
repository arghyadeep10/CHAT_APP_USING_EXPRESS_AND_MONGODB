// Make a connection to the server
const socket = io.connect("http://localhost:8745");

// We need to query the DOM inorder to interact with the 4 most important DOM elements with ids
// 1. message
// 2. handle
// 3. send
// 4. output

var message = document.getElementById('message');
var handle = document.getElementById('handle');
var btn = document.getElementById('send');
var btnFileSend = document.getElementById('send_uploaded_file');
var sendFileName = document.getElementById('uploaded_file_beta_id').value;
var output = document.getElementById('output');
var feedback = document.getElementById('feedback');

console.log("handle: " + handle.value);

// Add an event listenner for the message box
// so that whenever a user starts keypressing, we broadcast the message
message.addEventListener('keypress', () => {
    console.log("Person typing is: " + handle.value);
    socket.emit('room-typing-message', {
        handle: handle.value
    });
});

// Emit an event when someone clicks Send button
btn.addEventListener('click', () => {
    console.log("Received a Button Click");
    console.log("Data Obtained: ");
    console.log("handle.value = " + handle.value);
    console.log("message.value = " + message.value);
    if(message.value != "" && message.value != undefined && message.value != null){
        console.log("Will now be sending this chat-message to server.");
        // the emit() method takes two arguments:
        // 1. name of the message here we give: 'chat-message'
        // 2. what the actual message / data is
        socket.emit('room-chat-message', {
            message: message.value,
            handle: handle.value,
        });
        message.value = "";
    }    
});

btnFileSend.addEventListener('click', () => {
    console.log("Received a Button Click for File Sending");
    console.log("File Send Name: " + sendFileName);
    console.log("handle.value = " + handle.value);
    if(sendFileName != "" && sendFileName != undefined && sendFileName != null){
        console.log("Will now be sending this chat-message to server.");
        // the emit() method takes two arguments:
        // 1. name of the message here we give: 'chat-message'
        // 2. what the actual message / data is
        socket.emit('room-chat-file-send', {
            sendFileName: sendFileName,
            handle: handle.value,
        });
        location.reload();
    }    
});

// Listen for events in front end
socket.on('room-chat-message', (data) => {
    console.log("Received a chat message emit from server");
    console.log("handle = " + data.handle);
    console.log("message = " + data.message);
    feedback.innerHTML = "";
    output.innerHTML += '<p><strong>' + data.handle + ': </strong>' + data.message + '</p>';
});

socket.on('room-chat-file-send', (data) => {
    console.log("Received a chat-file-send emit from server");
    console.log("handle = " + data.handle);
    console.log("sendFileName = " + data.sendFileName);
    
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
    //set innerHTML of feedback to empty string
    feedback.innerHTML = "";
    output.innerHTML += '<p><strong>' + data.handle + ': </strong>' + 'File sent: ' + actual_filename + '<a target="_blank" style="margin-left: 10px;" href="/assets?fname=' + data.sendFileName + '" type="button" class="btn btn-outline-success me-2">View File</a></p>';
});

//Listen for typing-message in front end
socket.on('room-typing-message', (data) => {
    console.log("Person typing is: " + data.handle);
    feedback.innerHTML = '<p><em>' + data.handle + ' is typing a message ... </em></p>';
});