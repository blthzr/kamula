var express = require('express');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/kamula');

var db = mongoose.connection;

db.once('open', function() {
  console.log("Connected to mongodb");
});

var User = require('../api/users.js').User;
var Status = require('../api/status.js').Status;
var Comment = require('../api/comment.js').Comment;
var Utils = require('../api/utils.js');

// POST localhost:3000/api/users
function createUser(req, res) {

    if (!Utils.validAccount(req.body))
    {
        res.status(400).send(JSON.stringify({}));
    }
    else
    {
        var user = new User( req.body );
        user.password = Utils.sha1(user.password);
        user.save(function(err, createdUser) {
            if (!err) {
                res.setHeader('Location', '/api/users/'+createdUser.user);
                res.status(201).send(JSON.stringify(createdUser));
            }
            else {
                res.status(500).send(JSON.stringify({}));
            }
        });
    }
}

// GET localhost:3000/api/users/:user
function readUser(req, res) {

    User.findOne({user:req.params.user}, function(err, user) {
        if (user) {
            res.status(200).send(JSON.stringify(user));
        }
        else {
            res.status(404).send(JSON.stringify({err:"Not found"}));
        }
    });
}

// PUT -u ':user:<user_password>' localhost:3000/api/users/:user
function updateUser(req, res) {

    User.findOne({user:req.params.user}, function(err, user) {
        if (user) {
        
            if (req.user != req.params.user)
            {
                res.status(403).send(JSON.stringify({err:"unauthorized user"}));
            }
            else if (!Utils.validAccount(req.body) || req.body.user != req.params.user)
            {
                res.status(400).send(JSON.stringify({err:"invalid details"}));
            }
            else 
            {
                var updated = req.body;
                if (updated.password != undefined)
                    updated.password = Utils.sha1(updated.password);
                
                User.findOneAndUpdate({user:user.user}, req.body, {upsert:true}, function(err, user) {
                    if (!err) {
                        res.status(200).send(JSON.stringify(user));
                    }
                    else {
                        res.status(500).send(JSON.stringify({err:err}));
                    }
                });
            }
        }
        else {
            res.status(404).send(JSON.stringify({err:"Not found"}));
        }
    });
}

// DEETE -u ':user:<user_password>' localhost:3000/api/users/:user
function deleteUser(req, res) {

    User.findOne({user:req.params.user}, function(err, user) {
        if (user) {
        
            if (req.user != req.params.user)
            {
                res.status(403).send(JSON.stringify({err:"unauthorized user"}));
            }
            else
            {
                User.findOneAndUpdate({user:user.user}, { enabled : false }, {upsert:true}, function(err, user) {
                    if (!err) {
                        res.status(200).send(JSON.stringify({}));
                    }
                    else {
                        res.status(500).send(JSON.stringify({err:"Not found"}));
                    }
                });
            }
        }
        else {
            res.status(404).send(JSON.stringify({err:"Not found"}));
        }
    });
}

// POST -u ':user:<user_password>' localhost:3000/api/users/:user
function createStatus(req, res) {

    if (req.user != req.params.user)
    {
        res.status(403).send(JSON.stringify({err:"unauthorized user"}));
    }
    else if (!Utils.validStatusMessage(req.body))
    {
        res.status(400).send(JSON.stringify({}));
    }
    else
    {
        var statusBody = {};
        statusBody.body = req.body.body;
        statusBody.author = req.user;
        var status = new Status( statusBody );
        status.save(function(err, createdStatus) {
            if (!err) {
                res.setHeader('Location', '/api/'+req.params.user+'/'+createdStatus._id);
                res.status(201).send(JSON.stringify(createdStatus));
            }
            else {
                res.status(500).send(JSON.stringify({}));
            }
        });
    }
}

// GET localhost:3000/api/users/:user/:status
function readStatus(req, res) {

    Status.findOne({_id:req.params.status, author:req.params.user}, function(err, status) {
        if (status) {
            res.status(200).send(JSON.stringify(status));
        }
        else {
            res.status(404).send(JSON.stringify({err:"Not found"}));
        }
    });
}

// PUT -u ':user:<user_password>' localhost:3000/api/users/:user/:status
function updateStatus(req, res) {

    Status.findOne({_id:req.params.status}, function(err, status) {
        if (status) {
        
            if (req.user != req.params.user || req.user != status.author)
            {
                res.status(403).send(JSON.stringify({err:"unauthorized user"}));
            }
            else if (!Utils.validStatusMessage(req.body) || status._id != req.params.status)
            {
                res.status(400).send(JSON.stringify({err:"invalid details"}));
            }
            else
            {
                var body = req.body.body;
                Status.findOneAndUpdate({_id:req.params.status}, { body: body }, {upsert:true}, function(err, status) {
                    if (!err) {
                        res.status(200).send(JSON.stringify(status));
                    }
                    else {
                        res.status(500).send(JSON.stringify({err:err}));
                    }
                });
            }
        }
        else {
            res.status(404).send(JSON.stringify({err:"Not found"}));
        }
    });
}

// DELETE -u ':user:<user_password>' localhost:3000/api/users/:user/:status
function deleteStatus(req, res) {

    Status.findOne({_id:req.params.status}, function(err, status) {
        if (status) {
        
            if (req.user != req.params.user || req.user != status.author)
            {
                res.status(403).send(JSON.stringify({err:"unauthorized user"}));
            }
            else
            {
                Status.findOneAndUpdate({_id:req.params.status}, { enabled: false }, function(err, status) {
                    if (!err) {
                        res.status(200).send(JSON.stringify({}));
                    }
                    else {
                        res.status(500).send(JSON.stringify({err:err}));
                    }
                });
            }
        }
        else {
            res.status(404).send(JSON.stringify({err:"Not found"}));
        }
    });
}

// POST -u 'commentAuthor:<commentAuthor_password>' localhost:3000/api/users/:user/:status
function createComment(req, res) {

    User.findOne({user:req.params.user}, function(err, user) {
        if (user) {
        
            if (user.friends.indexOf(req.user) != -1 || req.user == req.params.user) {
            
                if (!Utils.validStatusComment(req.body))
                {
                    res.status(400).send(JSON.stringify({err:"invalid comment"}));
                }
                else
                {
                    var commentBody = {};
                    commentBody.body = req.body.body;
                    commentBody.author = req.user;
                    commentBody.commentTo = req.params.status;
                    
                    var comment = new Comment( commentBody );
                    comment.save(function(err, createdComment) {
                        if (!err) {
                            res.setHeader('Location', '/api/'+req.params.user+'/'+req.params.status+'/'+createdComment._id);
                            res.status(201).send(JSON.stringify(createdComment));
                        }
                        else {
                            res.status(500).send(JSON.stringify({err:err}));
                        }
                    });
                }
            }
            else {
                res.status(403).send(JSON.stringify({err:"unauthorized user"}));
            }
        }
        else {
            res.status(404).send(JSON.stringify({err:"Not found"}));
        }
    });
}

// GET localhost:3000/api/users/:user/:status/:comment
function readComment(req, res) {
    Comment.findOne({_id:req.params.comment, commentTo:req.params.status}, function(err, comment) {
        if (comment) {
            res.status(200).send(JSON.stringify(comment));
        }
        else {
            res.status(404).send(JSON.stringify({err:"Not found"}));
        }
    });
}

// PUT -u 'commentAuthor:<commentAuthor_password>' localhost:3000/api/users/:user/:status/:comment
function updateComment(req, res) {

    Comment.findOne({_id:req.params.comment}, function(err, comment) {
        if (comment) {
        
            if (req.user != comment.author)
            {
                res.status(403).send(JSON.stringify({err:"unauthorized user"}));
            }
            else if (!Utils.validStatusComment(req.body) || comment._id != req.params.comment)
            {
                res.status(400).send(JSON.stringify({err:"invalid details"}));
            }
            else
            {
                var body = req.body.body;
                Comment.findOneAndUpdate({_id:req.params.comment}, { body:body }, {upsert:true}, function(err, comment) {
                    if (!err) {
                        res.status(200).send(JSON.stringify(comment));
                    }
                    else {
                        res.status(500).send(JSON.stringify({err:err}));
                    }
                });
            }
        }
        else {
            res.status(404).send(JSON.stringify({err:"Not found"}));
        }
    });
}

// DELETE -u 'commentAuthor:<commentAuthor_password>' localhost:3000/api/users/:user/:status/:comment
function deleteComment(req, res) {

    Comment.findOne({_id:req.params.comment}, function(err, comment) {
        if (comment) {
        
            if (req.user != comment.author)
            {
                res.status(403).send(JSON.stringify({err:"unauthorized user"}));
            }
            else
            {
                Comment.findOneAndUpdate({_id:req.params.comment}, { enabled: false }, function(err, comment) {
                    if (!err) {
                        res.status(200).send(JSON.stringify({}));
                    }
                    else {
                        res.status(500).send(JSON.stringify({err:err}));
                    }
                });
            }
        }
        else {
            res.status(404).send(JSON.stringify({err:"Not found"}));
        }
    });
}

// Vaaditaan autorisointi PUT:lle ja DELETE:lle.
// Autorisointi tarkistetaan authMiddleware:lla.
module.exports = function(authMiddleware) {

    var app = express();
    
    // Kaikki API:n vastaukset ovat json-tyyppiä
    app.use(function(req, res, next) {
        res.type('application/json; charset=utf-8');
        next();
    });

    app.post('/users', createUser);
    app.get('/users/:user', readUser);
    app.put('/users/:user', authMiddleware, updateUser);
    app.delete('/users/:user', authMiddleware, deleteUser);
    
    app.post('/users/:user', authMiddleware, createStatus);
    app.get('/users/:user/:status', readStatus);
    app.put('/users/:user/:status', authMiddleware, updateStatus);
    app.delete('/users/:user/:status', authMiddleware, deleteStatus);
    
    app.post('/users/:user/:status', authMiddleware, createComment);
    app.get('/users/:user/:status/:comment', readComment);
    app.put('/users/:user/:status/:comment', authMiddleware, updateComment);
    app.delete('/users/:user/:status/:comment', authMiddleware, deleteComment);

    return app;
};
