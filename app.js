
/**
 * Module dependencies.
 * Modules from npm package manager
 */

var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var BasicStrategy = require('passport-http').BasicStrategy;
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

/**
 * Module dependencies.
 * Modules and components created
 */
var routes = require('./routes');
var user = require('./routes/user');
var register = require('./routes/register');
var login = require('./routes/login');
var logout = require('./routes/logout');
var status = require('./routes/status');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('betterthanslicedbread'));
app.use(express.session());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// set globally viable data
app.set('title', 'Kamula');

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var mongoose = require('mongoose');
var db = mongoose.connection;

db.once('open', function() {
  console.log("Connected to mongodb");
});

var User = require('./api/users.js').User;
var Utils = require('./api/utils.js');

// Lomakekirjautuminen
passport.use(new LocalStrategy(
    {
        // Kenttien nimet HTML-lomakkeessa
        usernameField: 'user',
        passwordField: 'password'
    },
    function(username, password, done) {
    
        authenticateToDatabase(username, function(err, user, pwd) {
                if (username == user && Utils.sha1(password) == pwd) {
                    return done(null, username);
                }
                return done(null, false);
            });
    }
));

// HTTP Basic Auth
passport.use(new BasicStrategy(
    function(username, password, done) {
    
        authenticateToDatabase(username, function(err, user, pwd) {
                if (username == user && Utils.sha1(password) == pwd) {
                    return done(null, username);
                }
                return done(null, false);
            });
    }
));

// Serialisointi session-muuttujaksi
passport.serializeUser(function(user, done) {
    done(null, user);
});

// Deserialisointi session-muuttujasta
passport.deserializeUser(function(user, done) {
    done(null, user);
});

var authenticateToDatabase = function(username, callback) {
    User.findOne({user:username}, function(err, user) {
        if (err) {
            console.log("error " + err);
        } else {
            console.log("found user " + user);
        }

        if (err) {
            callback(err, null, null);
        }
        else if (user == null) {
            callback( err, null, null);
        }
        else {
            if (!user.enabled == true)
                callback(err, null, null);
            else
                callback(err, user.user, user.password);
        }
    });
}

function checkApiAuthentication(req, res, next) {
    if (req.user) { // 1.
        next();
    }
    else { // 2.
        basicAuth(req, res, next);
    }
}

var basicAuth = passport.authenticate('basic', {session: false});

// Kaikki /api/ -alkuiset polut ohjataan rest_api.js:lle.
var restApi = require('./api/handle.js');
app.use('/api/', restApi(checkApiAuthentication));

app.get('/', routes.index);
app.get('/recent', routes.recentStatusMessages);
app.get('/users', routes.userList);
app.get('/users/:user', user.display);
app.post('/users/:user/friends', user.addFriend);
app.post('/users/:user/update', user.updateAccountDetails);
app.post('/users/:user', status.addStatus);
app.post('/users/:user/:status', status.commentStatus);
app.get('/register', register.display);
app.post('/register', register.execute);
app.post('/register/available', register.available);
app.post('/login', passport.authenticate('local', {session: true }), login.execute);
app.get('/login', login.failed);
app.post('/logout', logout.execute);

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
