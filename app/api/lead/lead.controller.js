/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /leads              ->  index
 * POST    /leads              ->  create
 * GET     /leads/:id          ->  show
 * PUT     /leads/:id          ->  update
 * DELETE  /leads/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Lead = require('./lead.model');
var Agent = require('../agent/agent.model');
var Campaign = require('../campaign/campaign.model');
var Client = require('../client/client.model');

var Mailgun = require('mailgun').Mailgun;
var mg = new Mailgun(process.env.MAILGUN_API_KEY);

// Get list of leads
exports.index = function(req, res) {
  if(req.query.campaign_id){
    Lead.find({campaign: req.query.campaign_id}, function (err, leads) {
      if(err) { return handleError(res, err); }
      return res.status(200).json(leads);
    });
  }else{
    Lead.find(function (err, leads) {
      if(err) { return handleError(res, err); }
      return res.status(200).json(leads);
    });
  }
};

// Get a single lead
exports.show = function(req, res) {
  Lead.findById(req.params.id, function (err, lead) {
    if(err) { return handleError(res, err); }
    if(!lead) { return res.status(404).send('Not Found'); }
    return res.json(lead);
  });
};

// Creates a new lead in the DB.
exports.create = function(req, res) {
  Lead.create(req.body, function(err, lead) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(lead);
  });
};

// Updates an existing lead in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Lead.findById(req.params.id, function (err, lead) {
    if (err) { return handleError(res, err); }
    if(!lead) { return res.status(404).send('Not Found'); }
    var updated = _.merge(lead, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(lead);
    });
  });
};

// Deletes a lead from the DB.
exports.destroy = function(req, res) {
  Lead.findById(req.params.id, function (err, lead) {
    if(err) { return handleError(res, err); }
    if(!lead) { return res.status(404).send('Not Found'); }
    lead.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

/*
 *
 *  Non-CRUD methods
 *
 */

// Get a single lead
exports.count = function(req, res) {
  Lead.count({campaign: req.query.campaign_id, called: false}, function (err, num_leads) {
    if(err) { return handleError(res, err); }
    return res.json({num_leads: num_leads});
  });
};

 // Creates a new lead in the DB.
exports.add = function(req, res) {
  var k = 0;
  var num_leads = req.body.leads.length;
  for (var i = req.body.leads.length - 1; i >= 0; i--) {
    var lead = new Lead();
    var updated = _.merge(lead, req.body.leads[i])
    updated.client = req.user._id;
    updated.campaign = req.body.campaign;
    updated.created = new Date();
    updated.save(function(err){
      if (err) { return handleError(res, err); }
      k+=1;
      if(k == num_leads)
        return res.send({'message':'Numbers added'});
    })
  };
};

// Remove all in a campaign
exports.remove = function(req, res) {
  Lead.find({campaign: req.query.campaign_id}).remove(function(err){
    return res.status(200).json({'message':'Numbers deleted'});
  })
};

// Gets the next number
exports.next = function(req, res) {
  var now = new Date();
  // This is meant to get the call back number.
  Lead.findOne({campaign: req.query.campaign_id, called: false, agent: req.user._id, call_back: null},function(err,lead){
    if(err) { return handleError(res, err); }
    if(lead) { return res.status(200).json(lead)};
    Lead.findOne({campaign: req.query.campaign_id, called: false, agent: null},function(err,lead){
      if(err) { return handleError(res, err); }
      if(!lead) {
        Campaign.findById(req.query.campaign_id,function(err,campaign){
          if(err) { return handleError(res, err); }
          if(!campaign) { return handleError(res, err); }
          campaign.live = false;
          campaign.save(function (err) {
            if(err) { return handleError(res, err); }
            notifyClient(campaign);
            return res.status(404).send({error: 'No more leads'});
          })
        })
      }else{
        lead.agent = req.user._id;
        lead.save(function(err){
          if(err) { return handleError(res, err); }
          return res.status(200).json(lead);
        })
      }
    });
  })
};

// Custom number
exports.custom = function(req, res) {
  Lead.findOne({campaign: req.query.campaign_id, called: false, agent: req.user._id},function(err,lead){
    if(err) { return handleError(res, err); }
    if(lead) {
      lead.agent = null;
      lead.save();
    };
    var _lead = new Lead();
    var lead = _.merge(_lead,req.body);
    lead.agent = req.user._id;
    lead.campaign = req.query.campaign_id;
    console.log(lead);
    lead.save(function(err){
      if(err) { return handleError(res, err); }
      return res.status(200).json(lead);
    })
  });
};

exports.call_back = function(req, res) {
  var lead = new Lead();
  var updated = _.merge(lead, req.body);
  updated.agent = req.user._id;
  updated.campaign = req.session.campaign_id;
  updated.call_back = new Date(req.body.call_back);
  console.log(updated);
  updated.save(function(err){
    if(err) { return handleError(res, err); }
    return res.status(201).send('Call back made');
  })
};

// Skips the current number
exports.skip = function(req, res) {
  Lead.findOne({campaign: req.query.campaign_id, called: false, agent: req.user._id},function(err,lead){
    if(err) { return handleError(res, err); }
    if(lead) {
      lead.outcome = "Skipped";
      lead.called = true;
      lead.save(function(err){
        if(err) { return handleError(res, err); }
        Lead.findOne({campaign: req.query.campaign_id, called: false, agent: null},function(err,lead){
          if(err) { return handleError(res, err); }
          return res.status(404).json({error: "No more leads"});
          lead.agent = req.user._id;
          lead.save(function(err){
            if(err) { return handleError(res, err); }
            return res.status(200).json(lead);
          })
        });
      })
    }else{
      return res.status(404).json({error: "No more leads"});
    }
  })
};

function notifyClient(campaign){
  Client.findById(campaign.client,function(err,client){
    if(err || !client){
      console.log("Error notifying the client")
    }
    var email = client.email;
    if(email){
      var text = '<h2>Campaign '+campaign.name+' is no longer live</h2><br/><br/><p> There are no more leads for '+campaign.name
      +' in Yak Hub, so it is longer live. To make the campaign live again, log into <a href="https://app.yakhub.io/client" target="_blank">Yak Hub</a>, upload some new leads and launch your campaign.</p>.';
      mg.sendRaw('admin@yakhub.io',
      [email],
      'From: admin@yakhub.io' +
        '\nTo: '+ email +
        '\nContent-Type: text/html; charset=utf-8' +
        '\nSubject: Yak Hub campaign is no longer live' +
        '\n\n' + text,
        function(err) {
          if(err){
            console.log(err)
          }
          console.log('Message sent');
        }
      );
    }
  })
}


function handleError(res, err) {
  return res.status(500).send(err);
}