var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var config = require('./config/config.js');
var ConnectMongo = require('connect-mongo')(session);
var mongoose = require('mongoose').connect(config.dbURL);
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy

var app = express();
var http = require('http').Server(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('hogan-express'));
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var env = process.env.NODE_ENV || 'development';
if(env==="development"){
  app.use(session({secret:config.sessionsecret, saveUninitialized:true, resave:true}));
}
else{
  app.use(session({
    secret:config.sessionsecret, 
    store: new ConnectMongo({
      mongooseConnection:mongoose.connections[0],
      stringify:true
    }),
    saveUninitialized:true, 
    resave:true}));
}

app.use(passport.initialize());
app.use(passport.session());


app.set('port', (process.env.PORT || 3000));
require('./routes/routes.js')(express,app,passport,config, mongoose);
// var routes = require('./routes/routes')(express,app,passport,config);
// var advances = require('./routes/advances');
// var db = require('./routes/db');

// app.use('/', routes);
// app.use('/advances', advances);
// app.use('/db', db);



require('./auth/passportAuth.js')(passport, FacebookStrategy, config, mongoose);

http.listen(app.get('port'), function(){
  console.log('listening on *:3000');
});
