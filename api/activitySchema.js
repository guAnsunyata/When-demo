var mongoose = require('./db');
var hosterSchema = require('./hosterSchema');

var userSchema = new mongoose.Schema({
	user_id: String,
	userName: String,
	event: []
},{
	_id: false
});

var activitySchema = new mongoose.Schema({
	name: String,
	hoster: String,
	fb_id: String,
	users: [userSchema],
	user_last_id_pointer: Number,
	start: String,
	end: String,
	date: {type:Date, default: Date.now}
}, {
	collection: 'activity',
});

module.exports = activitySchema;