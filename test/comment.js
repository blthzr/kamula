var mongoose = require('mongoose');

var assert = require('assert');

var db = mongoose.connection;

db.once('open', function() {
    console.log("Connected to mongodb for comment tests");
});

var Comment = require('../api/comment.js').Comment;

var knownCommentId = "";

describe('Comment', function(){
    describe('#create()', function(){
        it('should create without error', function(done){
            var comment = new Comment( { body: "comment", author: "testUser", commentTo: "534aee20fc7982981ac230d5" } );
            comment.save(function(err, createdComment) {
                if (!err) {
                    
                    knownCommentId = createdComment._id;
                    Comment.find({}, null, null, function (err, comments) {
                        if (err) {
                            console.log("error retrieving comments " + err);
                        } else {
                            assert.equal(comments.length, 1, "one comment on db");
                            done();
                        }
                    });
                }
                else {
                    console.log("error creating comment " + err);
                }
            });
        })
    })
})

describe('Comment', function(){
    describe('#read()', function(){
        it('should read without error', function(done){
            Comment.findOne({_id:knownCommentId}, function(err, comment) {
                if (comment) {
                    assert.equal(comment.body, "comment");
                    assert.equal(comment.author, "testUser");
                    assert.equal(comment.commentTo, "534aee20fc7982981ac230d5");
                    done();
                }
                else {
                    console.log("no comment found");
                }
            });
        })
    })
})

describe('Comment', function(){
    describe('#update()', function(){
        it('should update without error', function(done){
            Comment.findOneAndUpdate( { _id:knownCommentId }, { "body": "updatedComment" }, {upsert:true}, function(err, comment) {
                if (!err) {
                    Comment.findOne( { _id:knownCommentId }, function(err, comment) {
                        if (comment) {
                            assert.equal(comment.body, "updatedComment");
                            done();
                        }
                        else {
                            console.log("no updated comment found");
                        }
                    });
                }
                else {
                    console.log("no original comment found");
                }
            });
        })
    })
})

describe('Comment', function(){
    describe('#delete()', function(){
        it('should delete without error', function(done){
            Comment.findOneAndUpdate( {_id:knownCommentId}, { enabled : false }, {upsert:true}, function(err, comment) {
                if (!err) {
                    Comment.findOne({_id:knownCommentId}, function(err, comment) {
                        if (!err) {
                            assert.equal(comment.enabled, false);
                            done();
                        }
                        else {
                            console.log("no comment found");
                        }
                    });
                }
                else {
                    console.log("no original comment found");
                }
            });
        })
    })
})

after(function(done) {
    Comment.findOneAndRemove({_id:knownCommentId}, function(err) {
        if (err)
            console.log("error reseting db");
        else
            done();
    });
})
