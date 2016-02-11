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
var Client = require('../client/client.model');
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
      Call.find({campaign: req.query.campaign_id}, req.query.fields, function (err, calls) {
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
    var campaign_id = req.body.campaign;
    var campaign_name = null;
    Campaign.findById(campaign_id,function(err,campaign){
      if(err) { return handleError(res, err); }
      if(!campaign) { return res.status(401).send('Not Found'); }
      campaign_name = campaign.name;
      Lead.findOne({campaign:campaign_id, agent: agent._id, called: false}, function(err, lead){
        if(err) { return handleError(res, err); }
        if(!lead) { return res.status(401).send('Not Found'); }
        lead.called = true;
        lead.call_timestamp = new Date();
        lead.save(function(err){
          if(err) { return handleError(res, err); }
          var call = new Call();
          call.agent = agent._id
          call.fee = campaign.fee;
          call.agent_name = agent.name;
          call.agent_alias = agent.alias;
          call.created = new Date();
          call.lead_info = {
            number: lead.number,
            company: lead.company,
            email: lead.email,
            person: lead.person,
          };
          call.campaign = campaign_id;
          call.campaign_name = campaign_name;
          call.client = campaign.client;
          call.client_name = campaign.client_name;
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
      Agent.findById(call.agent,function(err,agent){
        if(err) { return handleError(res, err); }
        if(!agent) {
          resp.say('Error in the call');
          return res.send(resp.toString());
        }
        agent.earned = agent.earned + call.duration*agent.pay/60;
        agent.save(function(err){
          if(err) { return handleError(res, err); }
          Client.findById(call.client,function(err,client){
            if(err) { return handleError(res, err); }
            if(!client) {
              resp.say('Could not find the client, '+call.client);
              return res.send(resp.toString());
            }
            console.log(client.funds_used,call.duration,call.fee);
            client.funds_used = client.funds_used + call.duration*call.fee/60;
            console.log(client.funds_used);
            client.markModified('funds_used');
            client.save(function(err){
              if(err) { return handleError(res, err); }
              resp.say('Thanks for calling!');
              return res.send(resp.toString());
            })
          });
        })
      });
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
      Lead.findOne({
        number: call.lead_info.number,
        company: call.lead_info.company,
        'person.name': call.lead_info.person.name,
        'person.role': call.lead_info.person.role,
        agent: req.user._id},function(err, lead){
        if(err) { return handleError(res, err); }
        if(lead){
          lead.outcome = call.outcome;
          lead.rating = call.rating;
          lead.save(function(err){
            if(err) { return handleError(res, err); }
            Client.findById(call.client,function(err,client){
              if(err) { return handleError(res, err); }
              if(client.funds<client.funds_used){
                Campaign.findById(call.campaign,function(err,campaign){
                  if(err) {return handleError(res, err); }
                  campaign.live = false;
                  notifyClient(campaign);
                  campaign.save(function(err){
                    if(err){handleError(res,err);}
                    return res.status(200).json({'message':'Complete, with lead','call':call,'campaign':'Over'})
                  })
                })
              }else{
                return res.status(200).json({'message':'Complete, with lead','call':call})
              }
            })
          })
        }else{
          Client.findById(call.client,function(err,client){
            if(err) { return handleError(res, err); }
            if(client.funds<client.funds_used){
              Campaign.findById(call.campaign,function(err,campaign){
                if(err) {return handleError(res, err); }
                campaign.live = false;
                campaign.save(function(err){
                  if(err){handleError(res,err);}
                  return res.status(200).json({'message':'Complete','call':call,'campaign':'Over'});
                })
              })
            }else{
              return res.status(200).json({'message':'Complete','call':call});
            }
          })
        }
      })
    })
  });
};

function notifyClient(campaign){
  Client.findById(campaign.client,function(err,client){
    if(err || !client){
      console.log("Error notifying the client")
    }
    var email = client.email;
    if(email){
      var text = '<h2>Campaign '+campaign.name
      +' is no longer live</h2><br/><br/><p> Your campaigns have been stopped, as there is no more funds in your Yak Hub account.To start your campaigns live again, log into <a href="https://app.yakhub.io/client" target="_blank">Yak Hub</a>, add some more funds and launch your campaigns.</p>.';
      mg.sendRaw('admin@yakhub.io',
      [email],
      'From: admin@yakhub.io' +
        '\nTo: '+ email +
        '\nContent-Type: text/html; charset=utf-8' +
        '\nSubject: Yak Hub campaigns are no longer live' +
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

/**
 * Error handling route
 */

function handleError(res, err) {
  return res.status(500).send(err);
}