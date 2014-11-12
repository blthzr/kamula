var mongoose = require('mongoose');

var assert = require('assert');

var db = mongoose.connection;

db.once('open', function() {
    console.log("Connected to mongodb for status tests");
});

var Status = require('../api/status.js').Status;

var knownStatusId = "";

describe('Status', function(){
    describe('#create()', function(){
        it('should create without error', function(done){
            var status = new Status( { body: "status", author: "testUser" });
            status.save(function(err, createdStatus) {
                if (!err) {
                    
                    knownStatusId = createdStatus._id;
                    Status.find({}, null, null, function (err, statuses) {
                        if (err) {
                            console.log("error retrieving statuses " + err);
                        } else {
                            assert.equal(statuses.length, 1, "one status on db");
                            done();
                        }
                    });
                }
                else {
                    console.log("error creating status");
                }
            });
        })
    })
})

describe('Status', function(){
    describe('#read()', function(){
        it('should read without error', function(done){
            Status.findOne({_id:knownStatusId}, function(err, status) {
                if (status) {
                    assert.equal(status.body, "status");
                    assert.equal(status.author, "testUser");
                    done();
                }
                else {
                    console.log("no status found");
                }
            });
        })
    })
})

describe('Status', function(){
    describe('#update()', function(){
        it('should update without error', function(done){
            Status.findOneAndUpdate( { _id:knownStatusId }, { "body": "updatedStatus", "author": "testUser2" }, {upsert:true}, function(err, status) {
                if (!err) {
                    Status.findOne( { _id:knownStatusId }, function(err, status) {
                        if (status) {
                            assert.equal(status.body, "updatedStatus");
                            assert.equal(status.author, "testUser2");
                            done();
                        }
                        else {
                            console.log("no updated status found");
                        }
                    });
                }
                else {
                    console.log("no original status found");
                }
            });
        })
    })
})

describe('Status', function(){
    describe('#delete()', function(){
        it('should delete without error', function(done){
            Status.findOneAndUpdate( {_id:knownStatusId}, { enabled : false }, {upsert:true}, function(err, status) {
                if (!err) {
                    Status.findOne({_id:knownStatusId}, function(err, status) {
                        if (!err) {
                            assert.equal(status.enabled, false);
                            done();
                        }
                        else {
                            console.log("no status found");
                        }
                    });
                }
                else {
                    console.log("no original status found");
                }
            });
        })
    })
})

after(function(done) {
    Status.findOneAndRemove({_id:knownStatusId}, function(err) {
        if (err)
            console.log("error reseting db");
        else
            done();
    });
})
