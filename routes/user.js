var mongoose = require('mongoose');
var db = mongoose.connection;

db.once('open', function() {
  console.log("Connected user.js to mongodb");
});

var User = require('../api/users.js').User;
var Status = require('../api/status.js').Status;
var Comment = require('../api/comment.js').Comment;
var Utils = require('../api/utils.js');

var getNonFriendUsers = function(currentUser, callback) {
    User.find({}, null, null, function (err, users) {
        if (err) {
            console.log(err);
        } else {
            console.log(users);
        }
        
        User.findOne({user:currentUser}, function(err, user) {
            if (user) {
            
                var userNames = [];
                for(var i = 0; i < users.length; i++) 
                {
                    if (users[i].user === currentUser)
                        continue;
                        
                    if (user.friends.indexOf(users[i].user) == -1)
                        userNames.push(users[i].user);
                }
                
                callback(err, err ? null : userNames);
            }
            else {
                callback(err, err ? null : []);
            }
        });
    });
}

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
    
    User.findOne({user:req.params.user}, function(err, user) {
        console.log(user);
        if (user) {
            Status.find( {author: user.user }, null, {sort: {date: -1}}, function(err, statusMessages) {
            
                if (!err) {
                
                    var statusIds = [];
                    
                    for( var i = 0; i < statusMessages.length; i++)
                    {
                        statusMessages[i].comments = [];
                        statusIds.push(statusMessages[i]._id);
                    }
                
                    var commentQuery = Comment.find({});
                    
                    commentQuery.where('commentTo').in(statusIds);
                    commentQuery.sort('date');
                
                    commentQuery.exec(function (err, comments) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            
                            for (var i = 0; i < comments.length; i++)
                            {
                                for ( var j = 0; j < statusMessages.length; j++)
                                {
                                    if (comments[i].commentTo.toString() === statusMessages[j]._id.toString())
                                    {
                                        statusMessages[j].comments.push(comments[i]);
                                        break;
                                    }
                                }
                            }
                            
                            console.log(statusMessages);
                            
                            getNonFriendUsers(currentUser, function(err, users) {
                            
                                res.render('user', { loggedIn : loggedIn, 
                                                     currentUser : currentUser, 
                                                     personalPage : currentUser == req.params.user, 
                                                     browsedUser : req.params.user,
                                                     userEmail : user.email,
                                                     userName : user.name,
                                                     users : users,
                                                     statusMessages : statusMessages } );
                            });
                        }
                    });
                }
                else {
                    res.render('error', { reason : 'Tuntematon virhe haettaessa kuulumisia' } );
                }
            });
        }
        else {
            res.render('error', { reason : 'Haettua käyttäjää ei ole olemassa' } );
        }
    });
}

exports.addFriend = function(req, res) {

    if (req.user !== req.params.user)
    {
        res.status(200).send(JSON.stringify({ added : 0, err: "käyttäjällä ei ole käyttöoikeuksia"}));
    }
    else
    {
        var initiator = req.params.user;
        var target = req.param('friend');

        // find friendship initiators account
        User.findOne({user:initiator}, function(err, initiatingUser) {
            if (initiatingUser) {
            
                if (initiatingUser.friends.indexOf(target) != -1)
                {
                    res.status(200).send(JSON.stringify( { added : 0, err : "valittu käyttäjä on jo kaveri" } ));
                }
                else
                {
                    // add target to initiators friends
                    var updatedFriends = initiatingUser.friends;
                    updatedFriends.push(target);

                    // update initiators account
                    User.findOneAndUpdate({user:initiator}, { friends : updatedFriends }, {upsert:true}, function(err, user) {
                        if (!err) {

                            // find friendship targets account
                            User.findOne({user:target}, function(err, targetUser) {
                                if (targetUser) {

                                    // add initiator to targets friends
                                    var updatedFriendsForTarget = targetUser.friends;
                                    updatedFriendsForTarget.push(initiator);
                                
                                    // update targets account
                                    User.findOneAndUpdate({user:target}, { friends : updatedFriendsForTarget }, {upsert:true}, function(err, user) {
                                        if (!err) {
                                            res.status(200).send(JSON.stringify( { added : 1 } ));
                                        }
                                        else {
                                            res.status(200).send(JSON.stringify({ added: 0, err:err}));
                                        }
                                    });
                                }
                                else {
                                    res.status(200).send(JSON.stringify({added: 0, err : "käyttäjää ei ole olemassa"}));
                                }
                            });
                        }
                        else {
                            res.status(200).send(JSON.stringify({added: 0, err:err}));
                        }
                    });
                }
            }
            else {
                res.status(200).send(JSON.stringify({added: 0, err : "käyttäjää ei ole olemassa"}));
            }
        });
    }
}

exports.updateAccountDetails = function(req, res) {

    if (req.user !== req.params.user)
    {
        res.status(200).send(JSON.stringify({ added : 0, err: "käyttäjällä ei ole käyttöoikeuksia"}));
    }
    else
    {
        var updatedUser = {};
        
        if (req.param('name'))
            updatedUser.name = req.param('name');
            
        if (req.param('email'))
            updatedUser.email = req.param('email');
            
        if (req.param('password'))
            updatedUser.password = Utils.sha1(req.param('password'));
            
        // update account
        User.findOneAndUpdate({user:req.user}, { $set: updatedUser }, {upsert:true}, function(err, user) {
            if (!err) {
                res.redirect("/users/"+req.user);
            }
            else {
                res.render('error', { reason : 'Virhe päivitettäessä käyttäjän tietoja' } );
            }
        });
    }
}


