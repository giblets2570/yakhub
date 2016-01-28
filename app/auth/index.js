var express = require('express');
var passport = require('passport');
var Keen = require('keen-js');
var Client = require('../api/client/client.model')
var Campaign = require('../api/campaign/campaign.model')
var auth = require('./auth.service');
var keenDetails = require('../config/keen');
var keen = new Keen({
  projectId: keenDetails.projectId,
  writeKey: keenDetails.writeKey,
  readKey: keenDetails.readKey
});

var router = express.Router();

// route to log in
router.post('/client/login', passport.authenticate('client-login'), function(req, res) {
	Campaign.findOne({client: req.user._id},function(err,campaign){
		if(!campaign){campaign = {}}
		return res.status(200).json({user: req.user, campaign_id: campaign._id});
	})
});

router.get('/client/loggedin', function(req, res){
	if(!req.isAuthenticated()) {return res.send('0');}
	Campaign.findOne({client: req.user._id},function(err,campaign){
		if(!campaign){campaign = {}}
		return res.status(200).json({user: req.user, campaign_id: campaign._id});
	})
});

// route to log out
router.get('/logout', function(req, res){
  req.logout();
  return res.redirect('/');
});

module.exports = router;