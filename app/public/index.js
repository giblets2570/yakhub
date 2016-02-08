'use strict';

var express = require('express');

var router = express.Router();
var config = require('../config/environment');
var auth = require('../auth/auth.service');
var url = require('url');
var Agent = require('../api/agent/agent.model');
var request = require('request');
var stripe_sercret_key = require('../config/stripe').secretKey;

router.get('/admin/partials/:name', function (req, res) {
  var name = req.params.name;
  console.log(name);
  return res.render('admin/partials/' + name);
});

router.get('/client/partials/:name', function (req, res) {
  var name = req.params.name;
  console.log(name);
  return res.render('client/partials/' + name);
});

router.get('/agent/partials/:name', function (req, res) {
  var name = req.params.name;
  console.log(name);
  return res.render('agent/partials/' + name);
});

router.get('/api/stripe', function(req, res){
  request.post({
    url:'https://connect.stripe.com/oauth/token',
    form: {
      client_secret: stripe_sercret_key,
      code: req.query.code,
      grant_type: 'authorization_code'
    }
  }, function(err,httpResponse,body){
  	console.log(body);
  	body = JSON.parse(body);
  	console.log(body);
    if(err){
      return res.redirect('/agent/dashboard/stripe');
    }
    if(body.error){
    	return res.redirect('/agent/dashboard/stripe');
    }
    if(req.user.type=='agent'){
    	Agent.findById(req.user._id,function(err,agent){
    		if(err){return res.redirect('/agent/dashboard/stripe');}
    		agent.stripe = {};
    		agent.stripe.access_token = body.access_token;
    		agent.stripe.livemode = body.livemode;
    		agent.stripe.refresh_token = body.refresh_token;
    		agent.stripe.token_type = body.token_type;
    		agent.stripe.stripe_publishable_key = body.stripe_publishable_key;
    		agent.stripe.stripe_user_id = body.stripe_user_id;
    		agent.stripe.scope = body.scope;
    		console.log(agent);
    		agent.save(function(err){
    			return res.redirect('/agent/dashboard/setup');
    		})
    	})
    }
    if(req.user.type=='client')
      return res.redirect('/client/dashboard/setup');
  })
});



module.exports = router;