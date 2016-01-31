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

// Get list of campaigns
exports.index = function(req, res) {
  if(!req.user){
    return res.status(403).send("Unauthorized");
  }else if(req.user.type=='client'){
    Campaign.find({client:req.user._id},req.query.fields, function (err, campaigns) {
      if(err) { return handleError(res, err); }
      if(req.query.current != undefined)
        return res.status(200).json({campaigns:campaigns,campaign:req.session.campaign_id});
      return res.status(200).json(campaigns);
    });
  }else if(req.user.type=='agent'){
    Campaign.find({},req.query.fields, function (err, campaigns) {
      if(err) { return handleError(res, err); }
      if(req.query.current != undefined)
        return res.status(200).json({campaigns:campaigns,campaign:req.session.campaign_id});
      return res.status(200).json(campaigns);
    });
    // if(req.query.browse=='true'){
    //   Campaign.find({},req.query.fields, function (err, campaigns){
    //     if(err) { return handleError(res, err); }
    //     return res.json(campaigns);
    //   })
    // }else{
    //   Campaign.find({agents: {$elemMatch: {agent: req.user._id, active: true}}},req.query.fields, function (err, campaigns) {
    //     if(err) { return handleError(res, err); }
    //     console.log(req.query.current, req.query.current != undefined)
    //     if(req.query.current != undefined)
    //       return res.status(200).json({campaigns:campaigns,campaign:req.session.campaign_id});
    //     return res.status(200).json(campaigns);
    //   });
    // }
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

// Get a single campaign
exports.apply = function(req, res) {
  Campaign.findOne({url_name: req.query.url_name}, req.query.fields, function (err, campaign) {
    if(err) return handleError(res, err);
    if(!campaign) return res.status(404).send('Not Found');
    for (var i = campaign.applications.length - 1; i >= 0; i--) {
      if(campaign.applications[i].agent.toString() == req.user._id.toString())
        return res.send('Already applied to this campaign');
    };
    campaign.applications.push({
      agent: req.user._id,
      agent_name: req.user.name,
      created: new Date()
    })
    campaign.save(function(err){
      if(err) return handleError(res, err);
      return res.json(campaign);
    })
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
  if(req.params.id=='mine'){req.params.id=req.session.campaign_id}
  Campaign.findById(req.params.id, function (err, campaign) {
    if (err) { return handleError(res, err); }
    if(!campaign) { return res.status(404).send('Not Found'); }
    var updated = _.merge(campaign, req.body);
    if(req.body.questions)
      updated.questions = req.body.questions;
    if(req.body.agents)
      updated.agents = req.body.agents;
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

// changes the current campaign
exports.session = function(req, res) {
  if(req.body.campaign){
    if(req.body.campaign == req.session.campaign_id)
      return res.status(200).send('0');
    Campaign.findById(req.body.campaign,function(err,campaign){
      if(err){return res.status(200).send('0')};
      req.session.campaign_id = campaign._id;
      req.session.campaign_name = campaign.url_name;
      return res.status(200).json({'campaign':req.session.campaign_name});
    })
  }else{
    return res.status(200).send('0');
  }
};

exports.request = function(req, res) {
  Campaign.findById(req.params.id, function(err, campaign){
    var request = campaign.requested_slots.id(req.body.request_id);
    request.created = new Date();
    if(req.body.type=='approve'){
      request.status = 'Approved';
      notifyAgent(req.body.agent_id);
    }
    if(req.body.type=='decline'){
      request.status = 'Declined';
      notifyAgent(req.body.agent_id);
    }
    if(req.body.type=='undo')
      request.status = '';
    campaign.save(function(err){
      if(err){return res.status(200).send('0')};
      return res.json(request);
    })
  })
}

function notifyClient(client_id,campaign_id){
  Client.findById(client_id, function(err, client){
    if(err) console.log('Error in notifying client');
    if(!client) console.log('Error in notifying client');
    client.notifications.seen_all = false;
    for (var i = client.notifications.length - 1; i >= 0; i--) {
      if(client.notifications[i].campaign.toString() == campaign_id.toString()){
        client.notifications[i].seen_all = false;
        break;
      }
    };
    client.save(function(err){
      if(err) console.log('Error in notifying client');
      console.log('Client notified');
    })
  })
}

function notifyAgent(agent_id){
  Agent.findById(agent_id, function(err, agent){
    if(err) console.log('Error in notifying agent');
    if(!agent) console.log('Error in notifying agent');
    agent.notifications.seen_all = false;
    agent.save(function(err){
      if(err) console.log('Error in notifying agent');
      console.log('Agent notified');
    })
  })
}

function handleError(res, err) {
  return res.status(500).send(err);
}