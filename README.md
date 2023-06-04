# About the project

This is a fully functional chat application written using Javacsript. I have used Express JS as the web framework. The front end uses Bootstrap for UI Design. The app allows users to register into the system and then perform instant messaging with one another (unicast) and also chat in a global chat group with others.

> It is still in active development and new upcoming features will be added. One such feature is the ability to create chat groups and add users to it and then chat with those users only as opposed to the current global chat group.

# Features of the chat application

1. Cover Page - which acts as home/index page for not signed in users
2. Home Page - also known as index page which is the home view for signed in users
3. Register Page
4. Login Page
5. Logout Page
6. View Profile Page
7. Edit Profile Page
8. Change Password Page
9. Session, Cookies Middleware for Handling all the above functionalities
10. Session and CSRF for Authentication
11. Database Schema for storing user data 
12. Database Model for storing user data
13. Crypto modules for password hashing and salt as per industry standards
14. Ability to perform one on one instant messaging with another user - also shows typing indicator
15. Ability to perform a group instant messaging with all other users in the application - also showing typing indicator
16. Ability to share files and multimedia using the chat interface
17. EJS has been used as the templating engine, and extensive modularity w.r.t EJS templates have been perfomed in the application.
18. MongoDB is used as DBMS - I have used local mongodb server installation and accordingly the setup to the local server using its URI is performed as follows:

**`app.js`** (Snippet)

```js
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
```

**`mongodb_connection_info.json`**

```json
{
	"connection_uri": "mongodb://localhost:27017"
}
```

17. To facilitate the real time chat functionality, websockets are the ideal choice. The `socket.io` library for websockets has been used.

# Details of application

## Dependencies

```txt
{
  "dependencies": {
    "body-parser": "^1.20.2",
    "bootstrap": "^5.3.0-alpha1",
    "cookie-parser": "^1.4.6",
    "csurf": "^1.11.0",
    "ejs": "^3.1.8",
    "express": "^4.18.2",
    "express-session": "^1.17.3",
    "mongoose": "^7.0.0",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "socket.io": "^4.6.1"
  }
}
```

## File Structure

- `CHAT_APP_USING_EXPRESS_AND_MONGODB` **dir** (repo name)
	- `assets` **dir**
	- `public`  **dir**
	- `views` **dir**
	- `app.js`
	- `chat_item_model.js`
	- `chat_room_item_model.js`
	- `crypto_handler.js`
	- `mongodb_connection_info.json`
	- `networking.json`
	- `package.json`
	- `router.js`
	- `user_management.js`
	- `user_model.js`
	- `README.md`


# How to run

> Ensure the following:
> 1. Node is installed in your system
> 2. MongoDB local server is installed in your system
> 3. The Connection URI of your local mongodb server is written in the `mongodb_connection_info.json` file

1. Open terminal inside the directory `CHAT_APP_USING_EXPRESS_AND_MONGODB`
2. Execute command

```shell
npm init
```

3. Then follow the prompts presented one by one. The dependency list is already present.
4. Execute command

```shell
npm install
```

You will now observe that a `node_modules` folder has been created with all the required npm dependencies for the project

5. Ensure that you have started your Mongo DB Local server. This can be done using: 

```shell
$ sudo systemctl start mongod
```

Then check status using: 

```shell
$ sudo systemctl status mongod
```

6. Run the application by executing the command

```shell
nodemon app
```

The application will now start in your localhost at the port no. specified in `networking.json` which by default is 8745.

You can now start using the application.
