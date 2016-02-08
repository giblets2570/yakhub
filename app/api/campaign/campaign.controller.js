/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /campaigns              ->  index
 * POST    /campaigns              ->  create
 * GET     /campaigns/:id          ->  show
 * PUT     /campaigns/:id          ->  update
 * DELETE  /campaigns/:id          ->  destroy
 */


/**
 * PUT     /campaigns              ->  change
 */

'use strict';

var _ = require('lodash');
var Campaign = require('./campaign.model');
var Client = require('../client/client.model');
var Agent = require('../agent/agent.model');

var days = ['sun','mon','tues','wed','thurs','fri','sat'];

// Get list of campaigns
exports.index = function(req, res) {
  if(!req.user){
    return res.status(403).send("Unauthorized");
  }else if(req.user.type=='admin'){
    Campaign.find({},req.query.fields, function (err, campaigns) {
      if(err) { return handleError(res, err); }
      return res.status(200).json(campaigns);
    });
  }else if(req.user.type=='client'){
    Campaign.find({client:req.user._id},req.query.fields, function (err, campaigns) {
      if(err) { return handleError(res, err); }
      if(req.query.current != undefined)
        return res.status(200).json({campaigns:campaigns,campaign:req.session.campaign_id});
      return res.status(200).json(campaigns);
    });
  }else if(req.user.type=='agent'){
    var date_now = new Date();
    var hour_now = (new Date()).getHours();
    var today = (new Date()).getDay();
    Campaign.find({live: true, start_date: {$lte: date_now}, end_date: {$gt: date_now}, start_time: {$lte: hour_now}, end_time: {$gt: hour_now}, agents: {$elemMatch: {agent: req.user._id, active: true}}},req.query.fields, function (err, campaigns) {
      for (var i = campaigns.length - 1; i >= 0; i--) {
        if(!campaigns[i].days[days[today]])
          campaigns.splice(i,1);
      };
      if(err) { return handleError(res, err); }
      return res.status(200).json(campaigns);
    });
  }else{
    return res.status(403).send("Unauthorized");
  }
};

// Get a single campaign
exports.show = function(req, res) {
  if(req.params.id == 'mine'){req.params.id = req.session.campaign_id};
  Campaign.findById(req.params.id, req.query.fields, function (err, campaign) {
    if(err) return handleError(res, err);
    if(!campaign) return res.status(404).send('Not Found');
    return res.json(campaign);
  });
};

// Get a single campaign
exports.other = function(req, res) {
  Campaign.findOne({url_name: req.query.url_name}, req.query.fields, function (err, campaign) {
    if(err) return handleError(res, err);
    if(!campaign) return res.status(404).send('Not Found');
    return res.json(campaign);
  });
};

// Creates a new campaign in the DB.
exports.create = function(req, res) {
  Campaign.findOne({name: req.body.name}, function(err, campaign){
    if(err) return handleError(res, err);
    if(campaign) return res.status(406).send('Already a campaign wih that name!');
    var campaign = new Campaign();
    var updated = _.merge(campaign, req.body);
    updated.client = req.user._id;
    updated.client_name = req.user.name;
    updated.name = req.body.name;
    updated.url_name = updated.urlSafeName(req.body.name);
    updated.save(function(err){
      if(err) return handleError(res, err);
      req.session.campaign_id = updated._id;
      req.session.campaign_name = updated.name;
      return res.json(campaign);
    })
  });
};

// Updates an existing campaign in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Campaign.findById(req.params.id, function (err, campaign) {
    if (err) { return handleError(res, err); }
    if(!campaign) { return res.status(404).send('Not Found'); }
    var num_agents = campaign.agents.length;
    var updated = _.merge(campaign, req.body);
    if(req.body.questions)
      updated.questions = req.body.questions;
    if(req.body.agents){
      updated.agents = req.body.agents;
      if(num_agents<req.body.agents){
        notifyAgent(req.body.agents[req.body.agents.length-1]);
      }
    }
    if(req.body.faqs)
      updated.faqs = req.body.faqs;
    updated.save(function (err) {
      if (err) {
        console.log(err);
        return handleError(res, err);
      }
      res.status(200).json(updated);
    });
  });
};

// Deletes a campaign from the DB.
exports.destroy = function(req, res) {
  Campaign.findById(req.params.id, function (err, campaign) {
    if(err) { return handleError(res, err); }
    if(!campaign) { return res.status(404).send('Not Found'); }
    campaign.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

/**
 * Non CRUD routes
 */

<<<<<<< HEAD
function notifyAgent(agent){
  
}

=======
>>>>>>> d0ca265bbcc0767f930e471637fde35591e0eac5
function handleError(res, err) {
  return res.status(500).send(err);
}