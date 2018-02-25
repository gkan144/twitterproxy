const {URLSearchParams} = require('url');

const express = require('express');
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const fetch = require('node-fetch');
const Twitter = require('twitter');

const {Header, Footer, MainForm, LoginWithTwitter, Profile, BackToMain} = require(`./views`);
const {createAuthorizationHeader} = require('./utils');

/**
 * Client api for Twitter api.
 * @type {Twitter}
 */
const client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_SECRET
});

// Configure passport to use the twitter strategy.
passport.use(new TwitterStrategy({
    consumerKey: process.env.CONSUMER_KEY,
    consumerSecret: process.env.CONSUMER_SECRET,
    callbackURL: `http://${process.env.HOST}:${process.env.PORT}/login/twitter/return`
  },
  function(token, tokenSecret, profile, cb) {
    return cb(null, profile);
  }
));
passport.serializeUser(function(user, cb) {
  cb(null, user);
});
passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

// Initialize Express
const app = express();
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({secret: 'keyboard cat', resave: true, saveUninitialized: true}));
// Configure Express to use passport.
app.use(passport.initialize());
app.use(passport.session());

// Homepage route
app.get('/', function(req, res) {
  res.send(`${Header()}${req.user ? MainForm(req.user) : LoginWithTwitter()}${Footer()}`);
});
// Twitter login page
app.get('/login/twitter', passport.authenticate('twitter'));
app.get('/login/twitter/return', passport.authenticate('twitter', { failureRedirect: '/' }), function(req, res) {
  res.redirect('/');
});
// User data page
app.get('/profile', require('connect-ensure-login').ensureLoggedIn(), function(req, res) {
  res.send(`${Header()}${Profile(req.user)}${Footer()}`);
});
// Api endpoint for creating new tweets.
app.post('/api/v1/tweets', async function(req, res) {
  try {
    if(req.body && req.body.tweet && req.body.tweet.length && req.body.tweet.length > 0 && req.body.tweet.length < 280) {
      await client.post('statuses/update', {status: req.body.tweet});
      res.send(`${Header()}${BackToMain()}${Footer()}`)
    } else {
      res.status(400).send('Bad request');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});
// Api endpoint for getting the recent tweets of a user
app.get('/api/v1/tweets/:user', async function(req, res) {
  const {user} = req.params;
  try {
    const tweets = await client.get('search/tweets', {q: `from:${user}`});
    res.json(tweets);
  } catch(error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});
// Deprecated endpoint that attempted to do the Oauth authorization workflow manually
app.get('/api/v0/tweets/:user', require('connect-ensure-login').ensureLoggedIn(), async function(req, res) {
  const twitterApiUrl = 'https://api.twitter.com/1.1/search/tweets.json';

  const searchParams = new URLSearchParams();
  searchParams.set('q', `from:${req.params.user}`);

  try {
    const headerString = await createAuthorizationHeader({method:'GET', url: twitterApiUrl, searchParams});
    const requestOptions = {
      headers: {
        Authorization: headerString
      }
    };
    console.log(headerString);
    console.log('*');

    const response = await fetch(`${twitterApiUrl}?${searchParams.toString()}`,requestOptions);
    if(response.ok) {
      const jsonResponse = await response.json();
      res.json(jsonResponse);
    } else {
      const body = await response.text();
      res.status(response.status).send(`${response.statusText} - ${body}`);
    }
  } catch(error) {
    console.error(error);
  }
});

app.listen(process.env.PORT, function() {
  console.log(`Server is listening on port ${process.env.PORT}`)
});
