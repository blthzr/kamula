var mongoose = require('mongoose');
var db = mongoose.connection;

db.once('open', function() {
  console.log("Connected to mongodb");
});

var User = require('../api/users.js').User;
var Utils = require('../api/utils.js');

exports.available = function(req, res) {

    if (Utils.validString(req.param('user')))
    {
        console.log("invalid user");
        res.status(200).send(JSON.stringify({available: 0, err:'user'}));
    }
    else if (Utils.validString(req.param('name')))
    {
        console.log("invalid name");
        res.status(200).send(JSON.stringify({available: 0, err:'name'}));
    }
    else
    {
        if (req.param('name').length > 30)
        {
            console.log("invalid name len");
            res.status(200).send(JSON.stringify({available : 0, err:"name_len"}));
        }
        else
        {
            User.findOne({user:req.param('user')}, function(err, user) {
                if (user) {
                    console.log("exists " + user);
                    res.status(200).send(JSON.stringify({available : 0, err:"user_exists"}));
                }
                else {
                    res.status(200).send(JSON.stringify({available : 1, err:""}));
                }
            });
        }
    }
}

exports.execute = function(req, res) {

    var username = req.param('user');
    var password = req.param('password');
    var name = req.param('name');
    var email = req.param('email');

    console.log("validating account");
    if (!Utils.validAccount( { user:username, password:password, name:name, email:email } ))
    {
        console.log("invalid user account details");
        res.status(200).send(JSON.stringify( { registerSuccess : 0, err: "invalid account details" } ));
    }

    console.log("creating user");
    var user = new User( { "user": username, "password": Utils.sha1(password), "name": name, "email": email } );
    user.save(function(err, createdUser) {
        if (!err) {
            console.log("user created" + createdUser);
            res.status(200).send(JSON.stringify( { registerSuccess : 1 } ));
        }
        else {
            console.log("error creating user" + err);
            res.status(200).send(JSON.stringify( { registerSuccess : 0, err: "error creating account" } ));
        }
    });
};

exports.display = function(req, res) {

    var currentUser = "";
    var loggendIn = false;
    
    if (req.user === undefined || req.user === null) {
        currentUser = "";
        loggedIn = false;
    }
    else
    {
        currentUser = req.user;
        loggedIn = true;
    }

    res.render('register', { loggedIn: loggedIn, currentUser: currentUser } );
};