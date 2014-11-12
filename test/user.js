var mongoose = require('mongoose');

var assert = require('assert');

var db = mongoose.connection;

db.once('open', function() {
    console.log("Connected to mongodb for user tests");
});

var User = require('../api/users.js').User;
var Utils = require('../api/utils.js');

describe('User', function(){
    describe('#create()', function(){
        it('should create without error', function(done){
            var user = new User( { "user": "testUser", "password": Utils.sha1("testpassword"), "name": "testUser", "email": "test@user.com" });
            user.save(function(err, createdUser) {
                if (!err) {
                    
                    User.find({}, null, null, function (err, users) {
                        if (err) {
                            console.log("error retrieving users " + err);
                        } else {
                            assert.equal(users.length, 1, "one user on db");
                            done();
                        }
                    });
                }
                else {
                    console.log("error creating user");
                }
            });
        })
    })
})

describe('User', function(){
    describe('#read()', function(){
        it('should read without error', function(done){
            User.findOne({user:"testUser"}, function(err, user) {
                if (user) {
                    assert.equal(user.user, "testUser");
                    assert.equal(user.name, "testUser");
                    assert.equal(user.email, "test@user.com");
                    done();
                }
                else {
                    console.log("no user found");
                }
            });
        })
    })
})

describe('User', function(){
    describe('#update()', function(){
        it('should update without error', function(done){
            User.findOneAndUpdate({user:"testUser"}, { "name": "testUserUpdated", "email": "updated@user.com" }, {upsert:true}, function(err, user) {
                if (!err) {
                    User.findOne({user:"testUser"}, function(err, user) {
                        if (user) {
                            assert.equal(user.name, "testUserUpdated");
                            assert.equal(user.email, "updated@user.com");
                            done();
                        }
                        else {
                            console.log("no updated user found");
                        }
                    });
                }
                else {
                    console.log("no original user found");
                }
            });
        })
    })
})

describe('User', function(){
    describe('#delete()', function(){
        it('should delete without error', function(done){
            User.findOneAndUpdate({user:"testUser"}, { enabled : false }, {upsert:true}, function(err, user) {
                if (!err) {
                    User.findOne({user:"testUser"}, function(err, user) {
                        if (!err) {
                            assert.equal(user.enabled, false);
                            done();
                        }
                        else {
                            console.log("no user found");
                        }
                    });
                }
                else {
                    console.log("no original user found");
                }
            });
        })
    })
})

after(function(done) {
    User.findOneAndRemove({user:"testUser"}, function(err) {
        if (err)
            console.log("error reseting db");
        else
            done();
    });
})
