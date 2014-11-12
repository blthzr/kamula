var mongoose = require('mongoose');
var db = mongoose.connection;

db.once('open', function() {
  console.log("Connected to mongodb");
});

var User = require('../api/users.js').User;
var Status = require('../api/status.js').Status;
var Comment = require('../api/comment.js').Comment;

var getAllUsers = function(id, callback) {
    User.find({}, null, null, function (err, users) {
        if (err) {
            console.log("error retrieving userlist " + err);
        } else {

        }
        
        var userNames = [];
        for(var i = 0; i < users.length; i++) 
        {
            userNames.push(users[i].user);
        }
        
        callback(err, err ? null : userNames);
    });
}

var getAllFriends = function(user, callback) {
    User.findOne({user:user}, function(err, user) {
        if (err) {
            console.log("error retrieving friends " + err);
        } else {
            console.log("found friends " + user.friends);
        }

        callback(err, err ? null : user.friends);
    });
}

var getRecentStatusMessages = function(users, callback) {
    var statusQuery = Status.find({});

    statusQuery.where('author').in(users);
    statusQuery.where('enabled').equals(true);
    statusQuery.sort('-date');
    statusQuery.limit(5);
    
    statusQuery.exec(function(err, statusMessagesFromDb) {
        if (!err) {
            var statusIds = [];

            var statusMessages = [];
            
            for( var i = 0; i < statusMessagesFromDb.length; i++)
            {
                statusMessages[i] = {};
                statusMessages[i].date = statusMessagesFromDb[i].date.toISOString().replace(/T/, " ").replace(/\..+/, "");
                statusMessages[i].author = statusMessagesFromDb[i].author;
                statusMessages[i].id = statusMessagesFromDb[i]._id;
                statusMessages[i].body = statusMessagesFromDb[i].body;
                statusMessages[i].comments = [];
                statusIds.push(statusMessages[i].id);
            }

            var commentQuery = Comment.find({});
            
            commentQuery.where('commentTo').in(statusIds);
            commentQuery.sort('date');
        
            commentQuery.exec(function (err, commentsFromDb) {
                if (!err) {

                    for (var i = 0; i < commentsFromDb.length; i++)
                    {
                        var comment = {};
                        comment._id = commentsFromDb[i]._id;
                        comment.body = commentsFromDb[i].body;
                        comment.author = commentsFromDb[i].author;
                        comment.date = commentsFromDb[i].date.toISOString().replace(/T/, " ").replace(/\..+/, "");
                        comment.commentTo = commentsFromDb[i].commentTo;

                        for ( var j = 0; j < statusMessages.length; j++)
                        {
                            if (commentsFromDb[i].commentTo.toString() === statusMessages[j].id.toString())
                            {
                                statusMessages[j].comments.push(comment);
                                break;
                            }
                        }
                    }
                    
                    callback(err, err ? null : statusMessages);
                }
                else {
                    console.log("error finding comments for status messages");
                }
            });
        }
        else {
            console.log("error finding status messages " + err);
            
            callback(err, err ? null : statusMessages);
        }
    });
}

exports.index = function(req, res) {

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
    
    var statusMessages = [];
    
    if (loggedIn)
    {
        getAllFriends(currentUser, function(err, users) {
        
            var eligibleUsers = [];
            
            for(var userIndex = 0; userIndex < users.length; userIndex++) 
            {
                eligibleUsers.push(users[userIndex]);
            }
            eligibleUsers.push(currentUser);
            
            getRecentStatusMessages(eligibleUsers, function(err, statusMessages) {
                res.render('index', { loggedIn: loggedIn, currentUser: currentUser, users: users, statusMessages : statusMessages });
            });
        });
    }
    else
    {
        getAllUsers(null, function(err, users) {
            getRecentStatusMessages(users, function(err, statusMessages) {
                res.render('index', { loggedIn: loggedIn, currentUser: currentUser, users: users, statusMessages : statusMessages });
            });
        });
    }
};

exports.recentStatusMessages = function(req, res) {
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
    
    var statusMessages = [];
    
    if (loggedIn)
    {
        getAllFriends(currentUser, function(err, users) {
        
            var eligibleUsers = [];
            
            for(var userIndex = 0; userIndex < users.length; userIndex++) 
            {
                eligibleUsers.push(users[userIndex]);
            }
            eligibleUsers.push(currentUser);
            
            getRecentStatusMessages(eligibleUsers, function(err, statusMessages) {
                res.status(200).send({statusMessages:statusMessages, loggedIn:loggedIn});
            });
        });
    }
    else
    {
        getAllUsers(null, function(err, users) {
            getRecentStatusMessages(users, function(err, statusMessages) {
                res.status(200).send({statusMessages:statusMessages, loggedIn:loggedIn});
            });
        });
    }
};

exports.userList = function(req, res) {

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
    
    if (loggedIn)
    {
        getAllUsers(null, function(err, users) {
            res.render('users', { loggedIn: loggedIn, currentUser: currentUser, users: users } );
        });
    }
    else
    {
        res.render('error', { loggedIn : loggedIn, currentUser : currentUser, reason : 'Tarvitsee olla kirjautunut pystyäkseen tekemään kavereita' } );
    }
}
