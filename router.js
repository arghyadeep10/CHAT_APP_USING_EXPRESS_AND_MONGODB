// npm and core Module Imports
const express = require('express');
const path = require('path');
const csrf = require('csurf');
const bodyParser = require('body-parser');
const multer = require('multer');

// Package Module Imports
const user_management = require('./user_management');
const { render } = require('ejs');
const User = require('./user_model');
const crypto_handler = require('./crypto_handler');
const ChatItem = require('./chat_item_model');
const ChatRoomItem = require('./chat_room_item_model');

// setup route middlewares
const csrfProtection = csrf({ cookie: true });
const parseForm = bodyParser.urlencoded({ extended: false });

// Create a router instance
const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'assets');
    },
    filename: (req, file, cb) => {
        console.log(file);
        cb(null, Date.now() + "_" + path.basename(file.originalname));
    }
});

const upload = multer({
	storage: storage
});

/*
Dict parameters for various renders:
Based on these paramaters the templates work, so this discipline must be followed
1. index
     No dict parameters (for the time being)
2. register
     - register_error_message [should be null or some other value]
     - user_data [should be null or some other value]
3. login
     - login_error [should be true or false]
     - username_registered_just_now [should be null or some other value]
*/

router.get('/', (request, response) => {
    console.log('Request for coverpage');
    if (request.session.userAuthenticatedLoginSuccessfull == true){
        // user logged in -> This is similar to @login_required in Django
        // note that we are not resetting request.session.userAuthenticatedLoginSuccessfull to false, as that will be done
        // only when user logs out of system
        response.redirect('/home');
    }
    else{
        response.render('cover');
    }
});

// @login_required
router.get('/home', (request, response) => {
    console.log('Request for index aka homepage');
    if (request.session.userAuthenticatedLoginSuccessfull == true){
        // user logged in -> This is similar to @login_required in Django
        // note that we are not resetting request.session.userAuthenticatedLoginSuccessfull to false, as that will be done
        // only when user logs out of system
        User.find({ username: { $ne: request.session.username } }).then((result) => {
            response.render('index', {
                users: result
            });
        });        
    }
    else{
        // since user is not logged in, we redirect to the cover page
        response.redirect('/')
    }    
});

// This is a route where we inject a CSRF token into our form
router.get('/register', csrfProtection, (request, response) => {
    console.log('Request for register page');
    if (request.session.userAuthenticatedLoginSuccessfull == true){
        // user logged in -> This is similar to @login_required in Django
        // note that we are not resetting request.session.userAuthenticatedLoginSuccessfull to false, as that will be done
        // only when user logs out of system
        response.redirect('/home');
    }
    let register_error_message = null;
    let failed_register_attempt_data = null;
    
    if(request.session.register_error_message != null && request.session.register_error_message != undefined){
        // since request.session.register_error_message is not null and undefined it means, it has a value
        // that means there is a error in registering
        
        // we copy the register error message in a local variable
        register_error_message = request.session.register_error_message;
        
        // we now need to reset this register error message as it is one time thing
        request.session.register_error_message = null;

        // we copy the registration data of the user who failed register attempt in a local variable
        failed_register_attempt_data = request.session.failed_register_attempt_data;
        
        // we also need to reset the failed_register_attempt_data
        request.session.failed_register_attempt_data = null;
    }    

    console.log(register_error_message);
    
    // if we are being redirected to the register route by a failed registration attempt
    // then register_error_message and user_data won't be null and will contain corresponding values
    // but if its a fresh register page request, then they will be null
    response.render('register', {
        register_error_message: register_error_message,
        user_data: failed_register_attempt_data,
        csrfToken: request.csrfToken()
    });
});

// This is a route where we inject a CSRF token into our form
router.get('/login', csrfProtection, (request, response) => {
    console.log('Request for login page');
    if (request.session.userAuthenticatedLoginSuccessfull == true){
        // user logged in -> This is similar to @login_required in Django
        // note that we are not resetting request.session.userAuthenticatedLoginSuccessfull to false, as that will be done
        // only when user logs out of system
        response.redirect('/home');
    }

    // register.login_error is true -> we are being redirected to the login page by an failed login attempt
    if(request.session.login_error == true){            
        // reset the login_error as its a one time thing
        request.session.login_error = null;

        // render the login page, but pass login_error as true and username_registered_just_now as null
        // also pass the csrfToken to the view
        response.render('login', {
            username_registered_just_now: null,
            login_error: true,
            csrfToken: request.csrfToken()
        });
    }
    // this is not a redirection from a failed login attempt
    // it can either be a fresh login page request OR
    // it can be a redirect from a successful user registration
    else{
        let username_registered_just_now = null;
        
        if(request.session.username_registered_just_now != null && request.session.username_registered_just_now != undefined){
            // since request.session.username_registered_just_now is not null and undefined it means, it has a value
            // that means this is a redirect from a successful user registration

            // we store the username in our local variable
            username_registered_just_now = request.session.username_registered_just_now;

            // reset the request.session.username_registered_just_now as its a one time thing
            request.session.username_registered_just_now = null;
        }    
        
        // render the login page but pass login_error as false
        response.render('login', {
            username_registered_just_now: username_registered_just_now,
            login_error: false,
            csrfToken: request.csrfToken()
        });
    }
});

// This is a route where we verify the csrf token that we injected in get login route above
router.post('/login_request', parseForm, csrfProtection,  (request, response) => {
    console.log("Data Received: ");
    if (request.session.userAuthenticatedLoginSuccessfull == true){
        // user logged in -> This is similar to @login_required in Django
        // note that we are not resetting request.session.userAuthenticatedLoginSuccessfull to false, as that will be done
        // only when user logs out of system
        response.redirect('/home');
    }
    console.log(request.body.username);
    console.log(request.body.password);
    user_data = {
        username: request.body.username,
        password: request.body.password
    }
    user_management.authenticateUser(user_data, request, response);
});

// This is a route where we verify the csrf token that we injected in get register route above
router.post('/new_user_registration_request', parseForm, csrfProtection, (request, response) => {
    if (request.session.userAuthenticatedLoginSuccessfull == true){
        // user logged in -> This is similar to @login_required in Django
        // note that we are not resetting request.session.userAuthenticatedLoginSuccessfull to false, as that will be done
        // only when user logs out of system
        response.redirect('/home');
    }
    console.log("Data Received: ");
    console.log(request.body.email);
    console.log(request.body.name);
    console.log(request.body.username);
    console.log(request.body.password);
    console.log(request.body.confirm_password);

    user_data = {
        email : request.body.email,
        name : request.body.name,
        username : request.body.username,
        password : request.body.password,
        confirm_password : request.body.confirm_password
    };
    
    user_management.validateUser(user_data, request, response);
});

// @login_required
router.get('/logout', (request, response) => {
    if(request.session.userAuthenticatedLoginSuccessfull == true){
        request.session.userAuthenticatedLoginSuccessfull = false;
        response.redirect('/');
    }
    else{
        response.redirect('/');
    }
});

// @login_required
router.get('/view_profile', (request, response) => {
    console.log('Request for view profile page');
    if(request.session.userAuthenticatedLoginSuccessfull == true){
        // populate it with user data
        User.find({ username: request.session.username }).then((result) => {
            user_data = {
                username: result[0].username,
                name: result[0].name,
                email: result[0].email
            };

            let password_changed_successfull = null;
            if(request.session.password_changed_successfull != null && request.session.password_changed_successfull != undefined){
                password_changed_successfull = request.session.password_changed_successfull;
                request.session.password_changed_successfull = null;
            }

            response.render('view_profile', {
                user_data: user_data,
                password_changed_successfull: password_changed_successfull
            });
        });      
    }
    else{
        response.redirect('/');
    }
});

// @login_required
router.get('/edit_profile', csrfProtection, (request, response) => {
    console.log('Request for edit profile page');
    if(request.session.userAuthenticatedLoginSuccessfull == true){
        let edit_profile_error_message = null;
        let failed_edit_profile_attempt_data = null;
        
        if(request.session.edit_profile_error_message != null && request.session.edit_profile_error_message != undefined){
            // since request.session.edit_profile_error_message is not null and undefined it means, it has a value
            // that means there is a error in edit profile
            
            // we copy the edit profile error message in a local variable
            edit_profile_error_message = request.session.edit_profile_error_message;
            
            // we now need to reset this edit profile error message as it is one time thing
            request.session.edit_profile_error_message = null;

            // we copy the edit profile data of the user who failed edit profile attempt in a local variable
            failed_edit_profile_attempt_data = request.session.failed_edit_profile_attempt_data;
            
            // we also need to reset the failed_edit_profile_attempt_data
            request.session.failed_edit_profile_attempt_data = null;
        }    

        console.log(edit_profile_error_message);
        
        // if we are being redirected to the edit profile route by a failed edit profile attempt
        // then edit_profile_error_message and user_data won't be null and will contain corresponding values
        // but if its a fresh edit profile page request, then the user data will be the current user data

        if(failed_edit_profile_attempt_data == null){
            // populate it with user data
            User.find({ username: request.session.username }).then((result) => {
                user_data = {
                    name: result[0].name,
                    email: result[0].email
                };

                response.render('edit_profile', {
                    edit_profile_error_message: edit_profile_error_message,
                    user_data: user_data,
                    csrfToken: request.csrfToken()
                });
            });
        }
        else{
            response.render('edit_profile', {
                edit_profile_error_message: edit_profile_error_message,
                user_data: failed_edit_profile_attempt_data,
                csrfToken: request.csrfToken()
            });
        }        
    }
    else{
        response.redirect('/');
    }
});

// @login_required
// This is a route where we verify the csrf token that we injected in get edit profile route above
router.post('/edit_profile_request', parseForm, csrfProtection, (request, response) => {
    if (request.session.userAuthenticatedLoginSuccessfull != true){
        response.redirect('/');
    }

    console.log("Data Received: ");
    console.log(request.body.email);
    console.log(request.body.name);

    user_data = {
        email : request.body.email,
        name : request.body.name
    };
    
    user_management.validateProfileUpdate(user_data, request, response);
});

// @login_required
// This is a route where we inject a csrf token as this route contains a form and acts like a state changing
// endpoint
router.get('/change_password', csrfProtection, (request, response) => {
    console.log("Reqest for change password route");
    if(request.session.userAuthenticatedLoginSuccessfull == true){
        let change_password_error_msg = null;
        if(request.session.change_password_error_msg != null && request.session.change_password_error_msg != undefined){
            change_password_error_msg = request.session.change_password_error_msg;
            request.session.change_password_error_msg = null;
        }
        response.render('change_password', {
            change_password_error_msg: change_password_error_msg,
            csrfToken: request.csrfToken()
        });
    }
    else{
        response.redirect('/');
    }
});

// @login_required
// This is a route where we verify the csrf token inject the get change_password route above
router.post('/change_password_request', parseForm, csrfProtection, (request, response) => {
    console.log("Request for change password request");
    if(request.session.userAuthenticatedLoginSuccessfull == true){
        user_data = {
            current_password: request.body.current_password,
            new_password: request.body.new_password,
            confirm_new_password: request.body.confirm_new_password
        }

        if(user_data.new_password != user_data.confirm_new_password){
            request.session.change_password_error_msg = "New Password and Confirm New Password do not match";
            response.redirect('/change_password');
            return;
        }

        User.find({ username: request.session.username }).then((result) => {
            if (crypto_handler.compare_psswd_with_salt(user_data.current_password, result[0].salt, result[0].password)){
                // password entered matches with that in database
                console.log("alpha-beta");
                const psswd_salt = crypto_handler.hashPsswd_with_salt(user_data.new_password);
                const userobj = result[0];
                userobj.password = psswd_salt.hashedPassword;
                userobj.salt = psswd_salt.salt;
                userobj.save().then((result) => {
                    console.log("Password updated succesfully");
                    request.session.password_changed_successfull = true;
                    response.redirect('/view_profile');
                }).catch((err)=>{
                    console.log(err);
                });
            }
            else{
                // password entered by user doesn't match with that in system
                request.session.change_password_error_msg = "Incorrect Current Password Entered";
                response.redirect('/change_password');
            }
        });
    }
    else{
        response.redirect('/');
    }
});

router.get('/chat_interface', (request, response) => {
    console.log(request.session.username);
    request.session.receiver = request.query.receiver;
    let canSendFile = false;
    if(request.session.canSendFile == true){
        canSendFile = true;
        request.session.canSendFile = false;
    }
    let fileUploadedName = null;
    if(request.session.fileUploadedName != null && request.session.fileUploadedName != undefined){
        fileUploadedName = request.session.fileUploadedName;
        request.session.fileUploadedName = null;
    }
    if(request.session.userAuthenticatedLoginSuccessfull == true){
        ChatItem.find({ $or: [ { $and: [ { username1: request.session.username }, { username2: request.query.receiver } ] } , { $and: [ { username1 : request.query.receiver }, { username2: request.session.username } ] } ] }).then((result) => {
            console.log(result);
            response.render('chat_interface', {
                handleValue: request.session.username,
                receiver: request.query.receiver,
                messages: result,
                canSendFile: canSendFile,
                fileUploadedName: fileUploadedName
            });
        });
    }
    else{
        response.redirect('/');
    }
});


router.get('/chat_room_interface', (request, response) => {
    console.log(request.session.username);
    let canSendFile = false;
    if(request.session.canSendFile == true){
        canSendFile = true;
        request.session.canSendFile = false;
    }
    let fileUploadedName = null;
    if(request.session.fileUploadedName != null && request.session.fileUploadedName != undefined){
        fileUploadedName = request.session.fileUploadedName;
        request.session.fileUploadedName = null;
    }
    if(request.session.userAuthenticatedLoginSuccessfull == true){
        ChatRoomItem.find().then((result) => {
            console.log(result);
            response.render('chat_room_interface', {
                handleValue: request.session.username,
                canSendFile: canSendFile,
                messages: result,
                fileUploadedName: fileUploadedName
            });
        });
    }
    else{
        response.redirect('/');
    }
});

router.post('/upload_file_unicast', upload.single("file_upload_alpha"), (request, response) => {
    console.log("Post request for File Upload");
    console.log("File Uploaded");
    request.session.canSendFile = true;
    request.session.fileUploadedName = request.file.filename;
    response.redirect('/chat_interface?receiver=' + request.session.receiver);
});

router.post('/upload_file_unicast_chat_room', upload.single("file_upload_alpha"), (request, response) => {
    console.log("Post request for File Upload in Chat Room");
    console.log("File Uploaded");
    request.session.canSendFile = true;
    request.session.fileUploadedName = request.file.filename;
    response.redirect('/chat_room_interface');
});

router.get('/assets', (request, response) => {
    if(request.session.userAuthenticatedLoginSuccessfull == true){
        file_path_name = "/assets/" + request.query.fname;
        response.sendFile(path.join(__dirname, file_path_name));
    }
    else{
        response.redirect('/');
    }
});

// export the router object
module.exports = router;