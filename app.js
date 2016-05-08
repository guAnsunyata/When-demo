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
var session = require('express-session');
var flash    = require('connect-flash');

var hosterAPI = require('./api/hoster');
var activityAPI = require('./api/activity');

app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(flash()); // use connect-flash for flash messages stored in session

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
	activity.createUser(req.body._id, req.body.userName, req.body.events);
	res.json('success');
});

app.get('/api/activity/:id', function (req, res){
	var activity = new activityAPI({});
	activity.get(req.params.id, function (err, data){
		if(!data){
			res.send('404: activity not found', 404);
		}else{
			formatted_date = data.date.toString().substr(0,25);
			res.data(data);
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

function checkLogin(req, res, next){
	if(!req.session.hoster){
		res.redirect('/');
	}else{
		next();
	}
}

function checkNotLogin(req, res, next){
	if(req.session.hoster){
		console.log('has been login!');
	}else{
		next();
	}
}


app.get('*', function (req, res){
	res.render('start', {layout: 'layout'});
});
