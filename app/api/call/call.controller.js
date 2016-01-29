/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /calls              ->  index
 * POST    /calls              ->  create
 * GET     /calls/:id          ->  show
 * PUT     /calls/:id          ->  update
 * DELETE  /calls/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Call = require('./call.model');
var Campaign = require('../campaign/campaign.model');
var Agent = require('../agent/agent.model');
var Lead = require('../lead/lead.model');

var Mailgun = require('mailgun').Mailgun;
var mg = new Mailgun(process.env.MAILGUN_API_KEY);

// var mailgun = require('mailgun-js')({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN });
var mailcomposer = require("mailcomposer");

var twilio = require('twilio');
var outgoingNumber = require('../../config/twilio').outgoingNumber;

// Get list of calls
exports.index = function(req, res) {
  if(req.query.campaign_id){
    if(req.user.type=='agent'){
      Call.find({campaign: req.query.campaign_id, agent: req.user._id}, req.query.fields, function (err, calls) {
        if(err) { return handleError(res, err); }
        if(req.query.sorted == 'true'){
          calls.sort(function(a, b){
            return a.created.valueOf() - b.created.valueOf();
          });
        }
        return res.status(200).json(calls);
      });
    }else{
      Call.find({}, req.query.fields, function (err, calls) {
        if(err) { return handleError(res, err); }
        if(req.query.sorted == 'true'){
          calls.sort(function(a, b){
            return a.created.valueOf() - b.created.valueOf();
          });
        }
        return res.status(200).json(calls);
      });
    }
  }else{
    if(req.user.type=='agent'){
      Call.find({agent: req.user._id}, req.query.fields, function (err, calls) {
        if(err) { return handleError(res, err); }
        if(req.query.sorted == 'true'){
          calls.sort(function(a, b){
            return a.created.valueOf() - b.created.valueOf();
          });
        }
        return res.status(200).json(calls);
      });
    }else{
      Call.find({client: req.user._id}, req.query.fields, function (err, calls) {
        if(err) { return handleError(res, err); }
        if(req.query.sorted == 'true'){
          calls.sort(function(a, b){
            return a.created.valueOf() - b.created.valueOf();
          });
        }
        return res.status(200).json(calls);
      });
    }
  }
};

// Get a single call
exports.show = function(req, res) {
  Call.findById(req.params.id, function (err, call) {
    if(err) { return handleError(res, err); }
    if(!call) { return res.status(404).send('Not Found'); }
    return res.json(call);
  });
};

// Creates a new call in the DB.
exports.create = function(req, res) {

};

// Updates an existing call in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Call.findById(req.params.id, function (err, call) {
    if (err) { return handleError(res, err); }
    if(!call) { return res.status(404).send('Not Found'); }
    var updated = _.merge(call, req.body);
    if(req.body.answers)
      updated.answers = req.body.answers;
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(call);
    });
  });
};

// Deletes a call from the DB.
exports.destroy = function(req, res) {
  Call.findById(req.params.id, function (err, call) {
    if(err) { return handleError(res, err); }
    if(!call) { return res.status(404).send('Not Found'); }
    Call.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

/**
 * App logic routes outside CRUD
 */

// Deletes a call from the DB.
exports.previous = function(req, res) {
  Call.findById(req.user.call_id, function(err, call){
    if(err) { return handleError(res, err); }
    if(!call) { return res.status(404).send('Not Found'); }
    return res.status(200).json(call);
  });
};

exports.makeCall = function(req, res) {
  Agent.findById(req.body.agent,function(err, agent){
    if(err) { return handleError(res, err); }
    if(!agent) { return res.status(401).send('0'); }
    var campaign_id = null;
    var campaign_name = null;
    for (var i = agent.campaigns.length - 1; i >= 0; i--) {
      if(agent.campaigns[i].campaign.toString() == req.body.campaign.toString()){
        campaign_id = agent.campaigns[i].campaign;
        campaign_name = agent.campaigns[i].campaign_name;
        break;
      }
    };
    if(!campaign_id) { return res.status(401).send('0'); }
    Lead.findOne({campaign:campaign_id, agent: agent._id, called: false}, function(err, lead){
      if(err) { return handleError(res, err); }
      if(!lead) { return res.status(401).send('Not Found'); }
      lead.called = true;
      lead.call_timestamp = new Date();
      lead.save(function(err){
        if(err) { return handleError(res, err); }
        var call = new Call();
        call.agent = agent._id
        call.agent_name = agent.name;
        call.lead_info = {
          number: lead.number,
          company: lead.company,
          email: lead.email,
          person: lead.person,
        };
        call.campaign = campaign_id;
        call.campaign_name = campaign_name;
        var actionURL = '/api/calls/recording/' + call._id;
        call.save(function(err){
          if(err) { return handleError(res, err); }
          agent.call_id = call._id;
          agent.save(function(err1){
            if(err) { return handleError(res, err); }
            var resp = new twilio.TwimlResponse();
            resp.dial({
              action: actionURL,
              callerId: outgoingNumber,
              record: true
            },function(node){
              node.number(lead.number,{});
            });
            return res.send(resp.toString());
          });
        });
      });
    });
  });
};

exports.twilioCallback = function(req, res) {
  var resp = twilio.TwimlResponse();
  Call.findById(req.params.call_id,function(err, call){
    if(err) { return handleError(res, err); }
    if(!call) {
      resp.say('Error in the call');
      return res.send(resp.toString());
    }
    if(req.body.RecordingUrl)
      call.recording_url = req.body.RecordingUrl;
    if(req.body.CallStatus)
      call.status = req.body.CallStatus;
    if(req.body.DialCallDuration)
      call.duration = parseInt(req.body.DialCallDuration, 10);

    call.save(function(err){
      if(err) { return handleError(res, err); }

      resp.say('Thanks for calling!');
      return res.send(resp.toString());
    });
  });
};

exports.addCallData = function(req, res) {
  Call.findById(req.user.call_id,function(err, call){
    if(err) { return handleError(res, err); }
    var updated = _.merge(call, req.body);
    if(req.body.answers)
      updated.answers = req.body.answers;
    updated.save(function(err){
      if(err) { return handleError(res, err); }
      if(req.body.send_follow_up){
        sendFollowUp(req);
      }
      if(req.body.outcome){
        console.log(call.lead_info);
        Lead.findOne({
          number: call.lead_info.number,
          company: call.lead_info.company,
          'person.name': call.lead_info.person.name,
          'person.role': call.lead_info.person.role,
          agent: req.user._id},function(err, lead){
          if(err) { return handleError(res, err); }
          if(lead){
            lead.outcome = call.outcome;
            lead.save(function(err){
              if(err) { return handleError(res, err); }
              return res.status(200).json({'message':'Complete, with lead','call':call})
            })
          }else{
            return res.status(200).json({'message':'Complete','call':call})
          }
        })
      }else{
        return res.status(200).json({'message':'Complete','call':call})
      }
    })
  });
};


function sendFollowUp(req){
  Campaign.findById(req.session.campaign_id,function(err,campaign){
    if(err){console.log(err)};
    var data = {
      from: campaign.from_email.email,
      to: req.body.contact_info.email,
      subject: campaign.client_name,
      html: campaign.follow_up_email
    };
    var mail = mailcomposer(data);
    mail.build(function(err, message){
      mg.sendRaw(
        campaign.from_email.email,
        [req.body.contact_info.email],
        message
      , function (err) {
        if (err) {
          console.log(err);
          return;
        }
        console.log('Success');
      });
    });
  })
}

/**
 * Error handling route
 */

function handleError(res, err) {
  return res.status(500).send(err);
}