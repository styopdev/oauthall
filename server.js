var express = require('express');
var passport = require('passport');
var twitterStrategy = require('passport-twitter').Strategy;
var facebookStrategy = require('passport-facebook').Strategy;
var googleStrategy  = require('passport-google-oauth2').Strategy;

// Configure the Twitter strategy for use by Passport.
//
// OAuth 1.0-based strategies require a `verify` function which receives the
// credentials (`token` and `tokenSecret`) for accessing the Twitter API on the
// user's behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.

passport.use(new twitterStrategy({
        consumerKey: "5QUoJc5SW5P5flcf7SA28PS0m",
        consumerSecret: "oa2V4gmlGlhJVih6ZMDEPl0Cu0syJZJvNCqXYWPA2UGfTHcZtw",
        callbackURL: 'http://oauthall.herokuapp.com/login/twitter/return'
    },
    function (token, tokenSecret, profile, cb) {
        // In this example, the user's Twitter profile is supplied as the user
        // record.  In a production-quality application, the Twitter profile should
        // be associated with a user record in the application's database, which
        // allows for account linking
        //
        // and authentication with other identity
        // providers.
        return cb(null, profile);
    }));

passport.use(new facebookStrategy({
        clientID: "866430853477178",
        clientSecret: "20066cefc4ebcc34cccbc667c0f88480",
        callbackURL: "http://oauthall.herokuapp.com/auth/facebook/callback",
        enableProof: false
    },
    function (accessToken, refreshToken, profile, cb) {
        return cb(null, profile);
    }
));



passport.use(new googleStrategy({
        clientID: '745627039266-tbe8rvv1mg34cquv1t4g428fedahnd2k.apps.googleusercontent.com',
        clientSecret: 'piTY8LGCI-JsJQFkoiDp-UHj',
        callbackURL: "http://oauthall.herokuapp.com/auth/google/callback",
        passReqToCallback   : true
    },
    function(request, accessToken, refreshToken, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {

            return done(null, profile);
        });
    }
));

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});


// Create a new Express application.
var app = express();

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({extended: true}));
app.use(require('express-session')({secret: 'keyboard cat', resave: true, saveUninitialized: true}));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());


// Define routes.
app.get('/',
    function (req, res) {
        res.render('home', {user: req.user});
    });

app.get('/profile',
    require('connect-ensure-login').ensureLoggedIn(),
    function (req, res) {
        res.render('profile', {user: req.user});
    });

app.get('/login',
    function (req, res) {
        res.render('login');
    });

// TWITTER METHODS
app.get('/login/twitter',
    passport.authenticate('twitter'));

app.get('/login/twitter/return',
    passport.authenticate('twitter', {failureRedirect: '/login'}),
    function (req, res) {
        res.redirect('/');
    });

// FACEBOOK METHODS
app.get('/auth/facebook',
    passport.authenticate('facebook'),
    function (req, res) {
        // The request will be redirected to Facebook for authentication, so this
        // function will not be called.
    });

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {failureRedirect: '/login'}),
    function (req, res) {
        res.redirect('/');
    });

// GOOGLE PLUS
app.get('/auth/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/',
        failureRedirect: '/login'
    }));

app.get('/auth/google', passport.authenticate('google', { scope: [
    'https://www.googleapis.com/auth/plus.login',
    'https://www.googleapis.com/auth/plus.profile.emails.read']
}));


app.listen(process.env.PORT || 3000);
