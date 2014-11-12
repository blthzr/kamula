var mongoose = require('mongoose');

var trans = function(doc, ret, options) {
    delete ret.id
    delete ret.__v;
    delete ret.enabled;
}

var options = {toJSON:{transform: trans, virtuals: true}};

var StatusSchema = new mongoose.Schema({
    body: String,
    date: { type: Date, default: Date.now },
    author: String,
    enabled: {type: Boolean, default: true},
}, options);

module.exports.Status = mongoose.model('status', StatusSchema);
