var mongoose = require('mongoose');
var db = mongoose.connection;

db.once('open', function() {
  console.log("Connected status.js to mongodb");
});

var User = require('../api/users.js').User;
var Status = require('../api/status.js').Status;
var Comment = require('../api/comment.js').Comment;
var Utils = require('../api/utils.js');

exports.addStatus = function(req, res) {

    if (req.user !== req.params.user)
    {
        res.status(200).send(JSON.stringify( { addStatusSuccess : 0, err: "unauthorized"} ));
    }
    else if (req.param('body').length > 200)
    {
        res.status(200).send(JSON.stringify( { addStatusSuccess : 0, err: "status length exceeded" } ));
    }
    else
    {
        var status = new Status( { body: req.body.body, author: req.user } );
        status.save(function(err, createdStatus) {
            if (!err) {
                var visibleStatus = {};
                visibleStatus.id = createdStatus._id;
                visibleStatus.body = createdStatus.body;
                visibleStatus.author = createdStatus.author;
                visibleStatus.date = createdStatus.date.toISOString().replace(/T/, " ").replace(/\..+/, "");
                res.status(201).send(JSON.stringify( { addStatusSuccess: 1, status : visibleStatus } ));
            }
            else {
                res.status(200).send(JSON.stringify( { addStatusSuccess : 0, err:err } ));
            }
        });
    }
}

exports.commentStatus = function(req, res) {

    if (!req.user)
    {
        res.status(200).send(JSON.stringify( { addCommentToStatusSuccess : 0, err: "Tunnistautumaton käyttäjä"} ));
    }
    else if (req.param('body').length > 200)
    {
        res.status(200).send(JSON.stringify( { addCommentToStatusSuccess : 0, err: "Liian pitkä kommentti" } ));
    }
    else if (req.param('body').length == 0)
    {
        res.status(200).send(JSON.stringify( { addCommentToStatusSuccess : 0, err: "Kuulumista ei voi kommentoida tyhjällä kommentilla" } ));
    }
    else
    {
        User.findOne({user:req.params.user}, function(err, user) {
            if (user) {
            
                user.friends.push(req.user);
                
                if (user.friends.indexOf(req.user) == -1)
                {
                    res.status(200).send(JSON.stringify( { addCommentToStatusSuccess : 0, err: "Käyttäjä ei kuulumisen lähettäjän kamu"} ));
                }
                else
                {
                    console.log(req.param);
                
                    var comment = new Comment( { commentTo: req.params.status, body: req.param('body'), author: req.user } );
                    comment.save(function(err, createdComment) {
                        if (!err) {
                            var visibleComment = {};
                            visibleComment.body = createdComment.body;
                            visibleComment.date = createdComment.date.toISOString().replace(/T/, " ").replace(/\..+/, "");
                            visibleComment.author = createdComment.author;
                            res.status(201).send(JSON.stringify( { addCommentToStatusSuccess : 1, comment : visibleComment } ));
                        }
                        else {
                            res.status(200).send(JSON.stringify( { addCommentToStatusSuccess : 0, err: 'Tuntematon virhe' } ));
                        }
                    });
                }
            }
            else {
                res.status(200).send(JSON.stringify( { addCommentToStatusSuccess : 0, err: "Kommentissa määritetty käyttäjä ei kelpaa"} ));
            }
        });
    }
}