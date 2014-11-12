var mongoose = require('mongoose');

var trans = function(doc, ret, options) {
    delete ret.id
    delete ret.__v;
}

var options = {toJSON:{transform: trans, virtuals: true}};

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var CommentSchema = new mongoose.Schema({
    commentTo: ObjectId,
    body: String,
    date: { type: Date, default: Date.now },
    author: String,
    enabled: {type: Boolean, default: true},
}, options);

module.exports.Comment = mongoose.model('comment', CommentSchema);
