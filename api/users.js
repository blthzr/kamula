var mongoose = require('mongoose');

var trans = function(doc, ret, options) {
    delete ret.id
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    delete ret.enabled;
}

var options = {toJSON:{transform: trans, virtuals: true}};

var UserSchema = new mongoose.Schema({
    name: {type: String, required: true},
    user: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    email: {type: String, required: true},
    enabled: {type: Boolean, default: true},
    friends: []
}, options);

module.exports.User = mongoose.model('user', UserSchema);