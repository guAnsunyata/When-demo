var mongoose = require('./db');

var activitySchema = require('./activitySchema');
var activityModel = mongoose.model('Activity', activitySchema);

function Activity(activity) {
	this.name = activity.name;
	this.hoster = activity.hoster;
	this.fb_id = activity.fb_id;
}

var ActivityProto = {
	create: function(callback){
		var activity = {
			name: this.name,
			user_last_id_pointer: 0,
			fb_id: this.fb_id
		};
		var newActivity = new activityModel(activity);
		newActivity.save(function (err, activity){
			if(err){
				return callback(err);
			}
			callback(null, activity);
		});
	},
	get: function(code, callback){
		if(code.length <= 0){ //find all
			activityModel.find({}, function (err, activities){
				callback(null, activities);
			});
		}else{ //find one
			activityModel.findOne({'_id': code}, function (err, activity){
				if(err){
					callback(err, null);
				}else{
					callback(null, activity);
				}
			});
		}
	},
	createUser: function(activity_id, userName, events){
		var query = {'_id': activity_id};
		activityModel.findOne(query, function (err, activity){
			if(activity != null){
				var new_user = {
					user_id: activity.user_last_id_pointer,
					userName: userName,
					event: events
				}
				var new_pointer = activity.user_last_id_pointer + 1;
				activityModel.update(query, {$push: {'users': new_user}, 'user_last_id_pointer': new_pointer},function (err){
					if(err) throw err;
				});
			}else{
				console.log('invalid operation');
			}
		});
	},
	getAllUser: function(activity_id, callback){
		var query = {'_id': activity_id};
		activityModel.findOne(query, function (err, activity){
			if(activity != null){
				if(err){
					callback(err, null);
				}else{
					callback(err, activity.users);
					/* console.log(activity.users); */
				}
			}else{
				console.log('invalid operation');
			}
		});
	},
	cleanAll: function(){ /* for testing */
		activityModel.remove({}, function(err){
			return err
		});
	},
	getActivityByHoster: function(id, callback){
		var query = {'hoster': id};
		activityModel.find(query, function (err, activity){
			callback(activity);
		});
	}
};

Activity.prototype = ActivityProto;
module.exports = Activity;
