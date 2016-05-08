var mongoose = require('mongoose');


mongoose.settings = {
	cookieSecret: 'when',
	db: 'when',
	host: 'localhost',
	port: 27017
};

//mongodb connection
//mongodb://localhost:27017/when
//mongodb://admin:1291@ds053944.mongolab.com:53944/when
//mongodb://admin:admin@ds041164.mongolab.com:41164/when-beta
mongoose.connect('mongodb://admin:1291@ds053944.mongolab.com:53944/when', function(err){
	if(err){
		console.log(err);
	} else{
		console.log('Connected to mongodb!');
	}
});

module.exports = mongoose;
