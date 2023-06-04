// Package Module Imports
const User = require('./user_model');
const crypto_handler = require('./crypto_handler');

function validateUser(user_data, request, response){
    let validation_result = {};

    if(user_data.password != user_data.confirm_password){
        validation_result.valid = false;
        validation_result.error_message = "Password and Confirm Password do not match";
        console.log("alpha");
        if(validation_result.valid == true){
            addUser(user_data);
            console.log("User Registered Successfully");
            request.session.username_registered_just_now = user_data.username;
            response.redirect('/login');        
        }
        else{
            request.session.register_error_message = validation_result.error_message;
            console.log(request.session.register_error_message);
            request.session.failed_register_attempt_data = user_data;
            response.redirect('/register');
        }
        return;
    }

    User.find({ username: user_data.username }).then((result) => {
        console.log(result);
        console.log(result.length);
        if(result.length != 0){
            validation_result.valid = false;
            validation_result.error_message = "A user with this username already exists";
            console.log("beta");
            if(validation_result.valid == true){
                addUser(user_data);
                console.log("User Registered Successfully");
                request.session.username_registered_just_now = user_data.username;
                response.redirect('/login');        
            }
            else{
                request.session.register_error_message = validation_result.error_message;
                console.log(request.session.register_error_message);
                request.session.failed_register_attempt_data = user_data;
                response.redirect('/register');
            }
            return;
        }
        else{
            User.find({ email: user_data.email }).then((result) => {
                console.log(result);
                console.log(result.length);
                if(result.length != 0){
                    validation_result.valid = false;
                    validation_result.error_message = "A user with this email already exists";
                    console.log("gamma");
                    if(validation_result.valid == true){
                        addUser(user_data);
                        console.log("User Registered Successfully");
                        request.session.username_registered_just_now = user_data.username;
                        response.redirect('/login');        
                    }
                    else{
                        request.session.register_error_message = validation_result.error_message;
                        console.log(request.session.register_error_message);
                        request.session.failed_register_attempt_data = user_data;
                        response.redirect('/register');
                    }
                    return;
                }
                else{
                    validation_result.valid = true;
                    console.log("delta");
                    if(validation_result.valid == true){
                        addUser(user_data);
                        console.log("User Registered Successfully");
                        request.session.username_registered_just_now = user_data.username;
                        response.redirect('/login');        
                    }
                    else{
                        request.session.register_error_message = validation_result.error_message;
                        console.log(request.session.register_error_message);
                        request.session.failed_register_attempt_data = user_data;
                        response.redirect('/register');
                    }
                    return;
                }
            }); 
        }
    });   
}

function addUser(user_data){
    const psswd_salt = crypto_handler.hashPsswd_with_salt(user_data.password);
    const new_user = User({
        username: user_data.username,
        email: user_data.email,
        name: user_data.name,
        password: psswd_salt.hashedPassword,
        salt: psswd_salt.salt
    });

    new_user.save().then((result) => {
        console.log("New User Data saved in database successfully");
    }).catch((err) => {
        console.log(err);
    });
}

function authenticateUser(user_data, request, response){
    User.find({ username: user_data.username }).then((result) => {
        if(result.length == 0){
            // there is no user with that username
            request.session.login_error = true;
            response.redirect('/login');
        }
        else{
            // there is a user with that username
            if (crypto_handler.compare_psswd_with_salt(user_data.password, result[0].salt, result[0].password)){
                // password entered matches with that in database
                request.session.userAuthenticatedLoginSuccessfull = true;
                request.session.username = user_data.username;
                response.redirect('/');
            }
            else{
                // password entered by user doesn't match with that in system
                request.session.login_error = true;
                response.redirect('/login');
            }
        }
    });
}

function validateProfileUpdate(user_data, request, response){
    let validation_result = {};

    User.find({ email: user_data.email }).then((result) => {
        // the new email entered by user should not belong to an existing user
        // now suppose, if user doesn't change the email, so that field contains same email as current email
        // when user pressed Submit button
        // but this user_data.email will match with a record in the database, the user's own records !
        // So when submitted email matches with a record in system, an extra check to be done
        // that whether the matched record username is current logged in (session) user's username or not
        console.log(result);
        console.log(result.length);
        if(result.length != 0 && result[0].username != request.session.username){            
            validation_result.valid = false;
            validation_result.error_message = "A user with this email already exists";
            console.log("gamma");
            
            request.session.edit_profile_error_message = validation_result.error_message;
            console.log(request.session.edit_profile_error_message);
            request.session.failed_edit_profile_attempt_data = user_data;
            response.redirect('/edit_profile');
            
            return;
        }
        else{          
            // data submitted by user is valid against database
            // so the user's records must accordingly be updated in db
            User.find({ username: request.session.username }).then((result) => {
                userobj = result[0];
                userobj.email = user_data.email;
                userobj.name = user_data.name;

                userobj.save();

                validation_result.valid = true;
                console.log("User Profile Updated Successfully");
                response.redirect('/view_profile'); 
            });
            
            return;
        }
    });   
}

exports.validateUser = validateUser;
exports.addUser = addUser;
exports.authenticateUser = authenticateUser;
exports.validateProfileUpdate = validateProfileUpdate;