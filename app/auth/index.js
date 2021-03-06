var express = require('express');
var passport = require('passport');
var Keen = require('keen-js');
var Client = require('../api/client/client.model')
var Agent = require('../api/agent/agent.model')
var Admin = require('../api/admin/admin.model')
var Campaign = require('../api/campaign/campaign.model')
var auth = require('./auth.service');
var keenDetails = require('../config/keen');
var keen = new Keen({
  projectId: keenDetails.projectId,
  writeKey: keenDetails.writeKey,
  readKey: keenDetails.readKey
});
// var names = ['Charlie','Addison','Ainsley','Ash','Aubrey','Bailey','Bobbie',
//             'Brett','Brook','Corey','Dakota','Daryl','Eli','Frankie','Gray',
//             'Harper','Hayden','Jamie','Jesse','Kennedy','Morgan','Peyton',
//             'River','Rudy','Stevie','Tanner','Taylor','Tyler','West','Winter'];


var router = express.Router();


var stripe_client_id = require('../config/stripe').clientId

// route to log in
router.post('/client/login', passport.authenticate('client-login'), function(req, res) {
	Campaign.findOne({client: req.user._id},function(err,campaign){
		if(!campaign){campaign = {}}
		return res.status(200).json({user: req.user, campaign_id: campaign._id});
	})
});


router.get('/client/loggedin', function(req, res){
  if(!req.isAuthenticated()){return res.send('0');}
  auth.hasRole(req.user,'client').then(function(data){
    if(data=='0'){return res.send('0');}
    Campaign.findOne({client: req.user._id},function(err,campaign){
      if(!campaign){campaign = {}}
      return res.status(200).json({user: req.user, campaign_id: campaign._id});
    })
  },function(error){
    return res.send('0');
  });
});

// route to signup
router.post('/client/signup', function(req, res) {
	Client.findOne({'email':req.body.username.email},function(err,client){
    if(err){return res.status(401).json({ message: 'Error in request.' })}
    if(client){return res.status(401).json({ message: 'Email already in use!' })}
    Client.findOne({'name': req.body.username.name}, function(err, client){
      if(err){return res.status(401).json({ message: 'Error in request.' })}
      if(client){return res.status(401).json({ message: 'Name already in use!' })}
      var client = new Client();
      client.name = req.body.username.name;
      client.company_name = req.body.username.company_name;
      client.email = req.body.username.email;
      client.url_name = client.urlSafeName(req.body.username.name);
      client.password = client.generateHash(req.body.password);
      client.created = new Date();
      client.save(function(err){
        if(err){return res.status(401).json({ message: 'Error in request.' })}
        // Bit of a hack :P
        req.body.username = req.body.username.name;
        passport.authenticate('client-login')(req,res,function(){
          return res.status(201).json(req.user);
        })
      })
    })
  })
});

// route to log in
router.post('/agent/login', passport.authenticate('agent-login'), function(req, res) {
	return res.status(200).json({user: req.user});
});

// route to signup
router.post('/agent/signup', function(req, res) {
	Agent.findOne({'email':req.body.username.email},function(err,agent){
    if(err){return res.status(401).json({ message: 'Error in request.' })}
    if(agent){return res.status(401).json({ message: 'Email already in use!' })}
    Agent.findOne({'name': req.body.username.name}, function(err, agent){
      if(err){return res.status(401).json({ message: 'Error in request.' })}
      if(agent){return res.status(401).json({ message: 'Name already in use!' })}
      var agent = new Agent();
      agent.name = req.body.username.name;
      var index = agent.name.indexOf(" ")
      if(index<0){
        agent.alias = agent.name;
      }else{
        agent.alias = agent.name.substring(0,index)
      }
      // var index = randomInt(0,names.length)
      // var alias = names[index];
      agent.company_name = req.body.username.company_name;
      agent.email = req.body.username.email;
      agent.url_name = agent.urlSafeName(req.body.username.name);
      agent.password = agent.generateHash(req.body.password);
      agent.created = new Date();
      agent.save(function(err){
        if(err){return res.status(401).json({ message: 'Error in request.' })}
        // Bit of a hack :P
        req.body.username = req.body.username.name;
        passport.authenticate('agent-login')(req,res,function(){
          return res.status(201).json(req.user);
        })
      })
    })
  })
});

router.get('/agent/loggedin', function(req, res){
  if(!req.isAuthenticated()){return res.send('0');}
  auth.hasRole(req.user,'agent').then(function(data){
    if(data=='0'){return res.send('0');}
    return res.status(200).json({user: req.user})
  },function(error){
    return res.send('0');
  });
});

router.get('/agent/stripe', function(req, res){
  Agent.findById(req.user._id,function(err,agent){
    if(err||!agent||JSON.stringify(agent.stripe)=='{}'){
      return res.json({loaded: false, client_id: stripe_client_id});
    }
    return res.json({loaded: true})
  })
});

// route to log in
router.post('/admin/login', passport.authenticate('admin-login'), function(req, res) {
  return res.status(200).json({user: req.user});
});

router.get('/admin/loggedin', function(req, res){
  if(!req.isAuthenticated()){return res.send('0');}
  auth.hasRole(req.user,'admin').then(function(data){
    if(data=='0'){return res.send('0');}
    return res.status(200).json({user: req.user})
  },function(error){
    return res.send('0');
  });
});

// route to log out
router.get('/logout', function(req, res){
  req.logout();
  return res.redirect('/');
});

module.exports = router;

function randomInt (low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}