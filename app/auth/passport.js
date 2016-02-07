// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user models
var Agent            = require('../api/agent/agent.model');
var Client           = require('../api/client/client.model');
var Admin            = require('../api/admin/admin.model');

// expose this function to our app using module.exports
module.exports = function(passport) {

  //==================================================================
  // Define the strategy to be used by PassportJS
  passport.use('admin-login', new LocalStrategy({
      passReqToCallback: true
    },
    function(req, username, password, done) {
      console.log("What the fuck");
      Admin.findOne({'name':username},function(err,admin){
        console.log(admin);
        if(err)
          return done(null, false, { message: 'Error in request.' });
        if(!admin)
          return done(null, false, { message: 'Incorrect username.' });
        if(!admin.validPassword(password))
          return done(null, false, { message: 'Incorrect password.' });
        return done(null, admin);
      })
    }
  ));

  //==================================================================
  // Define the strategy to be used by PassportJS
  passport.use('client-login', new LocalStrategy({
      passReqToCallback: true
    },
    function(req, username, password, done) {
      Client.findOne({'name':username},function(err,client){
        if(err)
          return done(null, false, { message: 'Error in request.' });
        if(!client)
          return done(null, false, { message: 'Incorrect username.' });
        if(!client.validPassword(password))
          return done(null, false, { message: 'Incorrect password.' });
        return done(null, client);
      })
    }
  ));

  passport.use('client-signup', new LocalStrategy(
    function(username, password, done) {
      Client.findOne({'name':username},function(err,client){
        if(err)
          return done(null, false, { message: 'Error in request.' });
        if(client)
          return done(null, false, { message: 'Username already in use.' });
        var client = new Client();
        client.name = username;
        client.password = client.generateHash(password);
        client.url_name = client.urlSafeName(username);
        client.save(function(err){
          if(err)
            return done(null, false, { message: 'Error in request.' });
          return done(null, client);
        })
      });
    }
  ));

  //==================================================================
  // Define the strategy to be used by PassportJS
  passport.use('agent-login', new LocalStrategy({
      passReqToCallback: true
    },
    function(req, username, password, done) {
      Agent.findOne({'name':username},function(err,agent){
        console.log(agent);
        if(err)
          return done(null, false, { message: 'Error in request.' })
        if(!agent)
          return done(null, false, { message: 'Incorrect username.' })
        if(!agent.validPassword(password))
          return done(null, false, { message: 'Incorrect password.' })
        return done(null, agent);
      })
    }
  ));

  passport.use('agent-signup', new LocalStrategy(
    function(username, password, done) {
      Agent.findOne({'name':username},function(err,agent){
        console.log(agent);
        if(err)
          return done(null, false, { message: 'Error in request.' });
        if(agent)
          return done(null, false, { message: 'Username already in use.' });
        var agent = new Agent();
        agent.name = username;
        agent.password = agent.generateHash(password);
        agent.url_name = agent.urlSafeName(username);
        agent.save(function(err){
          if(err)
            return done(null, false, { message: 'Error in request.' });
          return done(null, agent);
        })
      });
    }
  ));
  //==================================================================
  // Define the strategy to be used by PassportJS
  passport.use('login', new LocalStrategy({
      passReqToCallback: true
    },
    function(req, username, password, done) {
      Agent.findOne({'name':username},function(err,agent){
        if(err){return done(null, false, { message: 'Error in request.' })};
        if(!agent){
          Client.findOne({'name':username},function(err,client){
            if(err){return done(null, false, { message: 'Error in request.' })}
            if(!client){return done(null, false, { message: 'Incorrect username.' })}
            if(!client.validPassword(password)){return done(null, false, { message: 'Incorrect password.' })}
            return done(null, client);
          })
        }else{
          if(!agent.validPassword(password)){return done(null, false, { message: 'Incorrect password.' })}
          return done(null, agent);
        }
      })
    }
  ));

  // Serialized and deserialized methods when got from session
  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    Client.findById(id, function(err, client) {
      if(client){done(err, client)}
    });
    Agent.findById(id, function(err, agent) {
      if(agent){done(err, agent)}
    });
    Admin.findById(id, function(err, admin) {
      if(admin){done(err, admin)}
    });
  });

};