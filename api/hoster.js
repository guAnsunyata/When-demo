var mongoose = require('./db');

var hosterSchema = require('./hosterSchema');
var hosterModel = mongoose.model('User_2', hosterSchema);

function Hoster(hoster) {
	this.id = hoster.id;
	this.name = hoster.name;
}

var hosterProto = {
	createHoster: function(id, name){
		var hoster = {
			id: id,
			name: name
		}
		var newHoster = new hosterModel(hoster);
		newHoster.save(function (err, hoster){
			if(err){
				return callback(err);
			}
		});
	},
	getAllHoster: function(callback){
		hosterModel.find({},function (err, hosters){
			callback(hosters);
		});
	},
	getHosterByID: function(hoster_id, callback){
		var query = {'id': hoster_id};
		/* populate */
		hosterModel.find(query, function (err, data){
			if(hoster_id != null){
				if(err){
					callback(err, null);
				}else{
					callback(err, data);
					/* console.log(activity.users); */
				}
			}else{
				console.log('invalid operation');
			}
		});
	},
	cleanAll: function(hoster_id){
		hosterModel.remove({}, function(err){
			return err
		});
	}
}

Hoster.prototype = hosterProto;
module.exports = Hoster;
