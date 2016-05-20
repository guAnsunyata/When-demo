var express = require('express');
var app = express();
var server = require('http').Server(app);
var path = require('path');
var io = require('socket.io').listen(server);
var mongoose = require('./api/db');
var settings = mongoose.settings;
var morgan = require('morgan');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var flash    = require('connect-flash');

var hosterAPI = require('./api/hoster');
var activityAPI = require('./api/activity');

app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Configuring Passport
var passport = require('passport');
var expressSession = require('express-session');
require('./passport/passport')(passport);

app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));
server.listen(process.env.PORT || 3000, function(){
  console.log('listening on', server.address().port);
});
//server.listen(process.env.PORT || 3000);
//server.listen(3000);

//view engine
var handlebars = require('express3-handlebars').create({defaultLayout: 'main'});
app.engine('hbs', handlebars.engine);
app.set('view engine', 'hbs');

//socket.io
io.sockets.on('connection', function(socket){
	console.log('Socket : a user connected');
});

//route
app.get('/', function (req, res){
	res.render('start', {layout: 'layout'});
});
app.get('/start', function (req, res){
	res.render('user', {layout: null});
});

//REST API for ios
app.post('/api/activity/create', function (req, res){
	var activity = new activityAPI({'name': req.body.name});
	activity.create(function (err, data){
		res.json(data);
	});
});

app.post('/api/activity/createRecord', function (req, res){
	var activity = new activityAPI({});
	activity.createUser(req.body.id, req.body.userName, req.body.events);
	res.json('success');
});

app.get('/api/activity/:id', function (req, res){
	var activity = new activityAPI({});
	activity.get(req.params.id, function (err, data){
		if(!data){
			res.send('404: activity not found', 404);
		}else{
			formatted_date = data.date.toString().substr(0,25);
			res.json(data);
		}
	});
});


//Activity
app.post('/createActivity', function (req, res){
	var activity = new activityAPI({'name': req.body.name});
	activity.create(function (err, data){
		res.json(data);
	});
});

app.post('/createUser', function (req, res){
	var activity = new activityAPI({});
	activity.createUser(req.body._id, req.body.userName, req.body.events);
});

app.get('/section/:hashcode', function (req, res){
	var activity = new activityAPI({});
	activity.get(req.params.hashcode, function (err, data){
		if(!data){
			res.send('404: activity not found', 404);
		}else{
			formatted_date = data.date.toString().substr(0,25);
			res.render('nickname', {layout: 'layout', activity: data, activityDate: formatted_date});
		}
	});
});

app.post('/form/:hashcode', function (req, res){
	var userName = req.body.userName;
	var activity = new activityAPI({});
	activity.get(req.params.hashcode, function (err, data){
		if(!data){
			res.send('404: activity not found', 404);
		}else{
			formatted_date = data.date.toString().substr(0,25);
			res.render('index', {layout: 'layout', userName: userName,activity: data, activityDate: formatted_date});
		}
	});
});

app.get('/result/:hashcode', function (req, res){
	var activity = new activityAPI({});
	activity.get(req.params.hashcode, function (err, data){
		if(!data){
			res.send('404: activity not found', 404);
		}else{
			formatted_date = data.date.toString().substr(0,25);
			res.render('result', {layout: 'layout', activity: data, activityDate: formatted_date});
		}
	});
});

app.post('/getAllUser', function (req, res){
	var activity = new activityAPI({});
	activity.getAllUser(req.body._id, function (err, data){
		res.json(data);
	});
});

app.get('/listActivity', function (req, res){
	var activity = new activityAPI({});
	activity.get('', function (err, data){
		res.json(data);
	});
});

app.get('/listHoster', function (req, res){
	var hoster = new hosterAPI({});
	hoster.getAllHoster(function(hoster){
		res.json(hoster);
	});
});

app.get('/cleanActivity', function (req, res){
	var activity = new activityAPI({});
	activity.cleanAll();
	res.send('done');
});

app.get('/cleanHoster', function (req, res){
	var hoster = new hosterAPI({});
	hoster.cleanAll();
	res.send('done');
});

app.post('/createHoster', function (req, res){
	var hoster = new hosterAPI({});
	hoster.createHoster(req.body.id, req.body.name);
	hoster.getHoster(req.body.id, function (err, data){
		req.session.hoster = data;
	});
});

app.post('/login', checkNotLogin, function (req, res){
	var hoster = new hosterAPI({});
	hoster.getHosterByID(req.body.id, function (err, data){
		req.session.hoster = data;
		console.log('login :',req.session.hoster);
	});
	
});

app.get('/session', function(req, res){
	res.json(req.session.hoster);
});

app.get('/profile', function(req, res) {
	console.log(req.session.hoster);
	res.render('user', {
		layout : null
    });
});

app.post('/getActivityByHoster', checkLogin, function(req, res) {
	var activity = new activityAPI({});
	activity.getActivityByHoster(req.session.hoster.id, function (err, data){
		res.json(data);
	});
});

// global function
function checkLogin(req, res, callback){
	if(!req.session.user)
		res.redirect('/');
	//or Next
	callback();
}

function checkNotLogin(req, res, next){
	if(req.session.hoster){
		console.log('has been login!');
	}else{
		next();
	}
}

function isLoggedIn(req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if(req.isAuthenticated()){
		return next();
	}
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/');
}

var UserTest = require('./api/testUserModel');

app.post('/getUserSession', isLoggedIn, function(req, res){
	res.json(req.user.facebook);
});

app.get('/api/users', function (req, res) {
	UserTest
	.find()
	.select()
	.exec(function (err, data) {
		res.json(data);
	})
});

//user
// app.get('/', function (req, res) {
//  	res.render('index', {layout: 'layout'});
// });

// var userAPI = require('./api/user');
// app.post('/user/signup', function (req, res){
// 	var user = new userAPI({'name': req.body.name, 'password': req.body.password, 'email': req.body.email});
// 	user.get(user.email, function (err, data){
// 		if(data){
// 			res.send('err: user exist!');
// 		}else{
// 			user.save(function(err, data){
// 				req.flash('success', 'login success!');
// 				req.session.user = data; // save to session
// 				res.redirect('/');
// 			});
// 		}
// 	});
// });
// app.post('/user/login', function (req, res){
// 	var user = new userAPI({'password': req.body.password, 'email': req.body.email});
// 	user.get(user.email, function (err, data){
// 		if(data){
// 			if(data.password == user.password){
// 				req.session.user = data;
// 				res.redirect('/');
// 			}else{
// 				res.redirect('/user/login');
// 			}
// 		}else{
// 			res.redirect('user/login');
// 		}
// 	});
// });
// app.get('/user/db', function (req, res){
// 	var user = new userAPI({});
// 	user.get('', function (err, data){
// 		res.json(data);
// 	});
// });
// app.get('/user/find/:email', function (req, res){
// 	var user = new userAPI({});
// 	user.get(req.params.email, function (err, data){
// 		res.json(data);
// 	});
// });

app.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email']}));

app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { successRedirect: '/',
                                      failureRedirect: '/' }));


app.get('*', function (req, res){
	res.render('start', {layout: 'layout'});
});
